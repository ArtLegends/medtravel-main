import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export const runtime = "nodejs";

function isValidEmail(email: unknown) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normRefCode(v: unknown) {
  const s = String(v ?? "").trim().toUpperCase();
  return s.length >= 6 ? s : "";
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");
    const as = String(body?.as || "").trim().toUpperCase();

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }
    if (!["PATIENT", "PARTNER", "CUSTOMER"].includes(as)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
      return NextResponse.json(
        { error: "Server auth is not configured (missing Supabase envs)" },
        { status: 500 },
      );
    }

    const supabase = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // ✅ refCode берём либо из body.ref (если ты когда-то начнёшь слать),
    // ✅ либо из httpOnly cookie mt_ref_code, которую ставит /ref/[code]
    const store = await cookies();
    const refFromCookie = store.get("mt_ref_code")?.value;
    const refCode = normRefCode(body?.ref || refFromCookie);

    // 1) создаём пользователя (НЕ шлём письма)
    const { data: created, error: createErr } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: false,
        user_metadata: {
          requested_role: as,
          // можно сохранить ref в метадате на будущее (не обязательно)
          ...(refCode ? { ref_code: refCode } : {}),
        },
      });

    if (createErr) {
      const msg = String(createErr.message || "");
      if (msg.toLowerCase().includes("already")) {
        return NextResponse.json(
          { error: "Account already exists. Please sign in." },
          { status: 409 },
        );
      }
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const userId = created?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }

    // 2) profiles (+ user_roles только для PATIENT сразу)
    if (as === "CUSTOMER" || as === "PARTNER") {
      // customer/partner: НЕ выдаём роль сразу
      await supabase.from("profiles").upsert(
        { id: userId, email, role: "guest", email_verified: false },
        { onConflict: "id" }
      );

      // ✅ создаём pending request
      if (as === "CUSTOMER") {
        await supabase
          .from("customer_registration_requests")
          .upsert({ user_id: userId, email, status: "pending" }, { onConflict: "user_id" });
      } else {
        await supabase
          .from("partner_registration_requests")
          .upsert({ user_id: userId, email, status: "pending" }, { onConflict: "user_id" });
      }

      // ❌ НЕ вставляем user_roles здесь
    } else {
      // PATIENT: как раньше
      await supabase.from("profiles").upsert(
        { id: userId, email, role: "patient", email_verified: false },
        { onConflict: "id" }
      );

      await supabase.from("user_roles").upsert(
        { user_id: userId, role: "patient" },
        { onConflict: "user_id,role" }
      );
    }

    // 3) ✅ если это PATIENT и есть refCode — пишем регистрацию в partner_referrals
    if (as === "PATIENT" && refCode) {
      const { data: rows, error: lookupErr } = await supabase.rpc(
        "partner_referral_code_lookup",
        { p_ref_code: refCode }
      );

      const owner = Array.isArray(rows) ? rows[0] : rows;
      const partner_user_id = owner?.partner_user_id;
      const program_key = owner?.program_key;

      if (!lookupErr && partner_user_id && program_key) {
        // вставляем (если у тебя есть unique constraint — лучше сделать upsert)
        await supabase.from("partner_referrals").upsert(
          {
            ref_code: refCode,
            partner_user_id,
            program_key,
            patient_user_id: userId,
          } as any,
          { onConflict: "patient_user_id" }
        );
      }
    }

    const res = NextResponse.json({ ok: true });

    // (опционально) очищаем cookie, чтобы не засчитывать повторно
    res.cookies.set("mt_ref_code", "", { path: "/", maxAge: 0 });

    return res;
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
