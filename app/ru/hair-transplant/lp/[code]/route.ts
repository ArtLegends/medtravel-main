import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createServiceClient } from "@/lib/supabase/serviceClient";

export const dynamic = "force-dynamic";

function normCode(v: string) {
  return String(v || "").trim().toUpperCase();
}

function sha256(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code: rawCode } = await params;
  const code = normCode(rawCode);

  // если мусор — просто редирект на лендинг без кода
  if (!code || code.length < 6) {
    return NextResponse.redirect(new URL("/ru/hair-transplant/lp", req.url));
  }

  const sb = createServiceClient();

  // убедимся что код валиден и относится к approved программе
  const { data: owner, error } = await sb
    .from("partner_program_requests")
    .select("user_id, program_key")
    .eq("ref_code", code)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // если код невалидный — на лендинг без кода
  if (error || !owner?.user_id) {
    return NextResponse.redirect(new URL("/ru/hair-transplant/lp", req.url));
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

  // ставим cookie на 90 дней и ведём на сам лендинг
  const res = NextResponse.redirect(new URL("/ru/hair-transplant/lp", req.url));

  res.cookies.set("mt_ref_code", code, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 90,
  });

  return res;
}