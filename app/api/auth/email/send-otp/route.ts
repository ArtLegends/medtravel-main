import { NextRequest, NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/routeClient";

export const dynamic = "force-dynamic";

function normEmail(v: unknown) {
  return String(v ?? "").trim().toLowerCase();
}

export async function POST(req: NextRequest) {
  const supabase = await createRouteClient();

  const body = await req.json().catch(() => ({}));
  const email = normEmail(body?.email);

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      // не нужен magiclink redirect, мы подтверждаем кодом
      // emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
