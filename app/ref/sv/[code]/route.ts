// app/ref/sv/[code]/route.ts
// Supervisor referral link handler
// Redirects to PARTNER registration with supervisor ref_code in cookie

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/serviceClient";

export const dynamic = "force-dynamic";

function normCode(v: string) {
  return String(v || "").trim().toUpperCase();
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code: rawCode } = await params;
  const code = normCode(rawCode);

  if (!code || code.length < 6) {
    return NextResponse.redirect(new URL("/auth/login?as=PARTNER", req.url));
  }

  const sb = createServiceClient();

  // Verify supervisor ref_code exists via dedicated column
  const { data: svReq } = await sb
    .from("supervisor_registration_requests")
    .select("user_id")
    .eq("ref_code", code)
    .eq("status", "approved")
    .limit(1)
    .maybeSingle();

  if (!svReq?.user_id) {
    return NextResponse.redirect(new URL("/auth/login?as=PARTNER", req.url));
  }

  // Redirect to partner SIGN UP specifically
  const url = new URL("/auth/login", req.url);
  url.searchParams.set("as", "PARTNER");
  url.searchParams.set("next", "/partner");
  url.searchParams.set("sv_ref", code);
  url.searchParams.set("mode", "signup"); // signal to open signup tab

  const res = NextResponse.redirect(url);

  res.cookies.set("mt_sv_ref_code", code, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 90,
  });

  return res;
}