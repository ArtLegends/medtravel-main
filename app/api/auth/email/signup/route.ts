import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function isValidEmail(email: unknown) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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

    // 1) создаём пользователя (НЕ шлём письма)
    const { data: created, error: createErr } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: false,
        user_metadata: { requested_role: as },
      });

    // если пользователь уже есть — сообщаем корректно
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

    if (!created?.user?.id) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }

    // 2) гарантируем profiles.email_verified=false (опционально)
    // если у тебя автосоздание профиля через trigger — эта строка просто обновит
    await supabase
      .from("profiles")
      .upsert(
        { id: created.user.id, email_verified: false },
        { onConflict: "id" },
      );

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
