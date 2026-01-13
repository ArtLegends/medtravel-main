import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function sha256(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body?.email || "").trim().toLowerCase();
    const token = String(body?.token || "").trim();
    const purpose = String(body?.purpose || "verify_email").trim() || "verify_email";

    if (!email || !/^[0-9]{6}$/.test(token)) {
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: rows, error: selErr } = await supabase
      .from("email_otps")
      .select("*")
      .eq("email", email)
      .eq("purpose", purpose)
      .order("created_at", { ascending: false })
      .limit(1);

    if (selErr) return NextResponse.json({ error: selErr.message }, { status: 500 });

    const row = rows?.[0];
    if (!row) return NextResponse.json({ error: "Code not found" }, { status: 400 });

    const expired = new Date(row.expires_at).getTime() < Date.now();
    if (expired) {
      await supabase.from("email_otps").delete().eq("id", row.id);
      return NextResponse.json({ error: "Code expired" }, { status: 400 });
    }

    const otpSecret = process.env.OTP_SECRET || "dev-secret-change-me";
    const expected = sha256(`${email}:${purpose}:${token}:${otpSecret}`);

    if (expected !== row.code_hash) {
      const attempts = Number(row.attempts || 0) + 1;
      await supabase.from("email_otps").update({ attempts }).eq("id", row.id);

      if (attempts >= 5) {
        await supabase.from("email_otps").delete().eq("id", row.id);
        return NextResponse.json(
          { error: "Too many attempts. Request new code." },
          { status: 400 },
        );
      }

      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }

    // валидно → удаляем OTP
    await supabase.from("email_otps").delete().eq("id", row.id);

    const { data: profile, error: profErr } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (profErr) return NextResponse.json({ error: profErr.message }, { status: 500 });
    if (!profile?.id) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const userId = profile.id;

    // подтверждаем email в Supabase Auth
    const { error: updErr } = await supabase.auth.admin.updateUserById(userId, {
      email_confirm: true,
    });
    if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

    // ставим флаг в profiles
    await supabase.from("profiles").update({ email_verified: true }).eq("id", userId);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
