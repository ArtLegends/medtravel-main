import { NextResponse } from "next/server";
import crypto from "crypto";
import { createServiceClient } from "@/lib/supabase/serviceClient";

export const dynamic = "force-dynamic";

function normCode(v: string) {
  return String(v || "").trim().toUpperCase();
}

function sha256(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export async function GET(req: Request, ctx: { params: { code: string } }) {
  const code = normCode(ctx.params.code);

  // если мусор — просто на логин пациента
  if (!code || code.length < 6) {
    const to = new URL("/auth/login?as=PATIENT", req.url);
    return NextResponse.redirect(to);
  }

  const sb = createServiceClient();

  // находим владельца кода (только approved)
  const { data: owner, error } = await sb
    .from("partner_program_requests")
    .select("user_id, program_key, ref_code, status")
    .eq("ref_code", code)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // если код невалидный — тоже на логин, но без трекинга
  if (error || !owner?.user_id) {
    const to = new URL("/auth/login?as=PATIENT", req.url);
    return NextResponse.redirect(to);
  }

  // фиксируем клик
  const xff = req.headers.get("x-forwarded-for") || "";
  const ip = xff.split(",")[0]?.trim() || "";
  const ua = req.headers.get("user-agent") || "";

  await sb.from("partner_referral_clicks").insert({
    ref_code: code,
    partner_user_id: owner.user_id,
    program_key: owner.program_key,
    ip_hash: ip ? sha256(ip) : null,
    user_agent: ua || null,
  } as any);

  // ставим cookie (90 дней)
  const res = NextResponse.redirect(new URL(`/auth/login?as=PATIENT&ref=${encodeURIComponent(code)}`, req.url));
  res.cookies.set("mt_ref_code", code, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    maxAge: 60 * 60 * 24 * 90,
  });

  return res;
}
