// app/api/auth/email/send-otp/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

type AllowedRole = "PATIENT" | "PARTNER" | "CUSTOMER" | "ADMIN";

function isAllowedRole(v: any): v is AllowedRole {
  return v === "PATIENT" || v === "PARTNER" || v === "CUSTOMER" || v === "ADMIN";
}

function safeNext(v: any): string {
  const s = String(v || "/");
  return s.startsWith("/") ? s : "/";
}

function normalizeEmail(v: any): string {
  return String(v || "").trim().toLowerCase();
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
  const from = process.env.EMAIL_FROM;

  if (!apiKey) throw new Error("Missing RESEND_API_KEY");
  if (!from) throw new Error("Missing EMAIL_FROM (e.g. no-reply@medtravel.me)");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: params.to,
      subject: params.subject,
      html: params.html,
    }),
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(json?.message || "Resend: failed to send email");
  }

  return json;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const email = normalizeEmail(body.email);
    const roleRaw = String(body.as ?? body.role ?? "").trim().toUpperCase();
    const role = isAllowedRole(roleRaw) ? roleRaw : null;

    // В signup-флоу пароль обязателен (по твоим требованиям)
    const password = String(body.password ?? "").trim();

    const next = safeNext(body.next);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // В модалке ты используешь только PATIENT/PARTNER/CUSTOMER,
    // но на всякий случай разрешаем ADMIN если надо.
    if (!role || role === "ADMIN") {
      // если ADMIN не нужен для email signup — просто запрети:
      // return NextResponse.json({ error: "Invalid role" }, { status: 400 });
      // пока оставлю мягко:
    }

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
      return NextResponse.json(
        { error: "Server auth is not configured (missing Supabase envs)" },
        { status: 500 },
      );
    }

    const supabaseAdmin = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // 1) Проверим существует ли уже пользователь
    const { data: existingList, error: listErr } =
      await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });

    if (listErr) {
      return NextResponse.json({ error: listErr.message }, { status: 500 });
    }

    const exists = (existingList?.users || []).some(
      (u) => (u.email || "").toLowerCase() === email,
    );

    if (exists) {
      return NextResponse.json(
        { error: "Account already exists. Please sign in." },
        { status: 409 },
      );
    }

    // 2) Создаём пользователя без подтверждения email (подтвердим после verify-otp)
    const { data: created, error: createErr } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: false,
        user_metadata: {
          requested_role: role ?? "CUSTOMER",
        },
      });

    if (createErr || !created?.user) {
      return NextResponse.json(
        { error: createErr?.message || "Failed to create user" },
        { status: 500 },
      );
    }

    const userId = created.user.id;

    // 3) Генерим OTP, сохраняем HASH в public.email_otps
    const otp = generateOtp6();
    const expiresInMinutes = 10;
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000).toISOString();

    const otpSecret = process.env.OTP_SECRET || "dev-secret-change-me";
    const tokenHash = sha256(`${email}:${otp}:${otpSecret}`);

    // удаляем предыдущие незавершённые для email (на всякий)
    await supabaseAdmin.from("email_otps").delete().eq("email", email);

    const { error: insErr } = await supabaseAdmin.from("email_otps").insert({
      email,
      user_id: userId,
      role: role ?? "CUSTOMER",
      next,
      token_hash: tokenHash,
      expires_at: expiresAt,
    });

    if (insErr) {
      return NextResponse.json({ error: insErr.message }, { status: 500 });
    }

    // 4) Отправка письма через Resend API
    const subject = "Your MedTravel verification code";
    const html = `
      <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial; line-height:1.5">
        <h2 style="margin:0 0 12px">Your verification code</h2>
        <p style="margin:0 0 16px">Enter this 6-digit code to confirm your email:</p>
        <div style="font-size:28px; font-weight:700; letter-spacing:6px; padding:14px 16px; background:#f4f4f5; border-radius:12px; display:inline-block">
          ${otp}
        </div>
        <p style="margin:16px 0 0; color:#71717a">This code expires in ${expiresInMinutes} minutes.</p>
        <p style="margin:8px 0 0; color:#71717a">If you didn’t request this, you can ignore this email.</p>
      </div>
    `;

    await sendViaResend({ to: email, subject, html });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
