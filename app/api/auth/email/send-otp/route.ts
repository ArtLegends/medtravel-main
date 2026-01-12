import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export const runtime = "nodejs";

function normalizeEmail(v: any): string {
  return String(v || "").trim().toLowerCase();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function safePurpose(v: any): string {
  const p = String(v || "verify_email").trim();
  // лучше жёстко разрешить только verify_email, чтобы не плодить мусор:
  return p === "verify_email" ? "verify_email" : "verify_email";
}

function generateOtp6(): string {
  const n = crypto.randomInt(0, 1_000_000);
  return String(n).padStart(6, "0");
}

function sha256(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

async function sendViaResend(params: { to: string; subject: string; html: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM ?? process.env.EMAIL_FROM;

  if (!apiKey) throw new Error("Missing RESEND_API_KEY");
  if (!from) throw new Error("Missing RESEND_FROM (or EMAIL_FROM)");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [params.to],
      subject: params.subject,
      html: params.html,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Resend: failed to send email");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const email = normalizeEmail(body.email);
    const purpose = safePurpose(body.purpose);

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
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

    // ✅ ВАЖНО: НЕ schema("auth"). Только Admin API.
    const { data: userRes, error: userErr } = await supabase.auth.admin.getUserById(email);
    if (userErr) return NextResponse.json({ error: userErr.message }, { status: 500 });

    const user = userRes?.user;
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 1) генерим OTP + hash (как у тебя в verify-otp)
    const code = generateOtp6();
    const otpSecret = process.env.OTP_SECRET || "dev-secret-change-me";
    const codeHash = sha256(`${email}:${purpose}:${code}:${otpSecret}`);

    const expiresInMinutes = 10;
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000).toISOString();

    // 2) удаляем старые и вставляем новый
    const del = await supabase
      .from("email_otps")
      .delete()
      .eq("email", email)
      .eq("purpose", purpose);

    if (del.error) return NextResponse.json({ error: del.error.message }, { status: 500 });

    const ins = await supabase.from("email_otps").insert({
      email,
      purpose,
      code_hash: codeHash,
      expires_at: expiresAt,
      attempts: 0,
    });

    if (ins.error) {
      return NextResponse.json({ error: ins.error.message }, { status: 500 });
    }

    // 3) письмо
    const subject = "Your MedTravel verification code";
    const html = `
      <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial; line-height:1.5">
        <h2 style="margin:0 0 12px">Your verification code</h2>
        <p style="margin:0 0 16px">Enter this 6-digit code to confirm your email:</p>
        <div style="font-size:28px; font-weight:700; letter-spacing:6px; padding:14px 16px; background:#f4f4f5; border-radius:12px; display:inline-block">
          ${code}
        </div>
        <p style="margin:16px 0 0; color:#71717a">This code expires in ${expiresInMinutes} minutes.</p>
      </div>
    `;

    await sendViaResend({ to: email, subject, html });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal Server Error" }, { status: 500 });
  }
}
