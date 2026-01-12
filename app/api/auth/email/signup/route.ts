import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function sha256(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function makeCode6() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function isValidEmail(email: unknown) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");
    const as = String(body?.as || "").trim().toUpperCase();
    const next = String(body?.next || "/");

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

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(url, serviceKey);

    // 1) create user (НЕ отправляет письма)
    const { data: created, error: createErr } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: false,
        user_metadata: { requested_role: as },
      });

    // если пользователь уже существует — это не критично для UX:
    // мы просто отправим OTP ещё раз (но при login он пойдёт в Sign in)
    if (createErr && !String(createErr.message).toLowerCase().includes("already")) {
      return NextResponse.json({ error: createErr.message }, { status: 400 });
    }

    // 2) гарантируем profiles.email_verified=false
    // (если у тебя есть триггер on auth.users -> profiles, он уже вставит строку; здесь просто upsert)
    await supabase
      .from("profiles")
      .upsert({ id: created?.user?.id, email_verified: false }, { onConflict: "id" });

    // 3) генерим OTP + сохраняем hash
    const code = makeCode6();
    const otpSecret = process.env.OTP_SECRET || "dev-secret";
    const purpose = "verify_email";
    const codeHash = sha256(`${email}:${purpose}:${code}:${otpSecret}`);

    // защита от спама: удаляем старые и создаём новый
    await supabase.from("email_otps").delete().eq("email", email).eq("purpose", purpose);

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    const { error: insErr } = await supabase.from("email_otps").insert({
      email,
      purpose,
      code_hash: codeHash,
      expires_at: expiresAt.toISOString(),
    });

    if (insErr) {
      return NextResponse.json({ error: insErr.message }, { status: 500 });
    }

    // 4) отправляем письмо через Resend (без SDK, просто fetch)
    const from = process.env.RESEND_FROM!;
    const apiKey = process.env.RESEND_API_KEY!;

    const subject = "Your MedTravel verification code";
    const html = `
      <div style="font-family: Inter, Arial, sans-serif; line-height: 1.5">
        <h2 style="margin:0 0 12px">Confirm your email</h2>
        <p style="margin:0 0 16px">Use this code to finish signup:</p>
        <div style="font-size:28px; font-weight:700; letter-spacing:6px; padding:12px 16px; background:#f2f4f7; display:inline-block; border-radius:10px">
          ${code}
        </div>
        <p style="margin:16px 0 0; color:#667085">Code expires in 10 minutes.</p>
      </div>
    `;

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject,
        html,
      }),
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text().catch(() => "");
      return NextResponse.json(
        { error: `Resend error: ${errText || resendRes.statusText}` },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, email, as, next });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
