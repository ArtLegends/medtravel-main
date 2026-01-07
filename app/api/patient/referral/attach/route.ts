import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createRouteClient } from "@/lib/supabase/routeClient";

export const dynamic = "force-dynamic";

function normCode(v: string) {
  return String(v || "").trim().toUpperCase();
}

export async function POST(req: NextRequest) {
  const supabase = await createRouteClient();

  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ref_code берём из body или cookie
  let bodyCode: string | null = null;
  try {
    const body = await req.json().catch(() => null);
    bodyCode = body?.refCode ?? null;
  } catch {}

  const cookieStore = await cookies();
  const cookieCode = cookieStore.get("mt_ref_code")?.value ?? "";
  const refCode = normCode(bodyCode || cookieCode);

  if (!refCode) {
    return NextResponse.json({ ok: true, attached: false });
  }

  // узнаём владельца кода через RPC
  const { data: rows, error: lookupErr } = await supabase.rpc(
    "partner_referral_code_lookup",
    { p_ref_code: refCode },
  );

  // helper для очистки cookie
  const clearCookie = (res: NextResponse) => {
    res.cookies.set("mt_ref_code", "", { path: "/", maxAge: 0 });
    return res;
  };

  if (lookupErr || !rows?.length) {
    return clearCookie(NextResponse.json({ ok: true, attached: false }));
  }

  const owner = rows[0] as { partner_user_id: string; program_key: string };

  const { error: insErr } = await supabase.from("partner_referrals").insert({
    ref_code: refCode,
    partner_user_id: owner.partner_user_id,
    program_key: owner.program_key,
    patient_user_id: user.id,
  } as any);

  // если уже был реферал — ок
  if (insErr && !String(insErr.message || "").toLowerCase().includes("duplicate")) {
    return NextResponse.json({ error: insErr.message }, { status: 500 });
  }

  return clearCookie(NextResponse.json({ ok: true, attached: true }));
}
