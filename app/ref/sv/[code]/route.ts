// app/ref/sv/[code]/route.ts
// Supervisor referral link handler
// When a potential affiliate partner visits this link,
// they get redirected to register as PARTNER with the supervisor's ref_code attached

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
  { params }: { params: Promise<{ code: string }> },
) {
  const { code: rawCode } = await params;
  const code = normCode(rawCode);

  // If invalid code — redirect to partner registration
  if (!code || code.length < 6) {
    return NextResponse.redirect(new URL("/auth/login?as=PARTNER", req.url));
  }

  // Verify the supervisor ref_code exists
  const sb = createServiceClient();

  const { data: svReq } = await sb
    .from("supervisor_registration_requests")
    .select("user_id, admin_note")
    .eq("status", "approved")
    .like("admin_note", `%ref_code: ${code}%`)
    .limit(1)
    .maybeSingle();

  if (!svReq?.user_id) {
    // Invalid supervisor code — just redirect to partner registration
    return NextResponse.redirect(new URL("/auth/login?as=PARTNER", req.url));
  }

  // Set cookie with supervisor ref code (different cookie name to distinguish)
  const url = new URL("/auth/login", req.url);
  url.searchParams.set("as", "PARTNER");
  url.searchParams.set("next", "/partner");
  url.searchParams.set("sv_ref", code);

  const res = NextResponse.redirect(url);

  // Store supervisor ref code in cookie
  res.cookies.set("mt_sv_ref_code", code, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 90, // 90 days
  });

  return res;
}