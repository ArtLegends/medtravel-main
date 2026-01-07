import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteClient } from "@/lib/supabase/routeClient";

export const dynamic = "force-dynamic";

function normCode(v: string) {
  return String(v || "").trim().toUpperCase();
}

export async function POST(req: Request) {
  const supabase = await createRouteClient();

  // session обязателен
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

  const cookieCode = (await cookies()).get("mt_ref_code")?.value ?? "";
  const refCode = normCode(bodyCode || cookieCode);

  if (!refCode) {
    return NextResponse.json({ ok: true, attached: false });
  }

  // узнаём владельца кода через RPC
  const { data: rows, error: lookupErr } = await supabase.rpc("partner_referral_code_lookup", {
    p_ref_code: refCode,
  });

  if (lookupErr || !rows?.length) {
    // код невалидный — чистим cookie, чтобы не мешал
    (await
          // код невалидный — чистим cookie, чтобы не мешал
          cookies()).set("mt_ref_code", "", { path: "/", maxAge: 0 });
    return NextResponse.json({ ok: true, attached: false });
  }

  const owner = rows[0] as { partner_user_id: string; program_key: string };

  // пишем реферала (первый wins)
  const { error: insErr } = await supabase
    .from("partner_referrals")
    .insert({
      ref_code: refCode,
      partner_user_id: owner.partner_user_id,
      program_key: owner.program_key,
      patient_user_id: user.id,
    } as any);

  // если уже был реферал (unique patient_user_id) — просто ок
  // (supabase обычно вернёт ошибку 23505)
  if (insErr && !String(insErr.message || "").includes("duplicate")) {
    return NextResponse.json({ error: insErr.message }, { status: 500 });
  }

  // чистим cookie после успешной (или повторной) привязки
  (await
        // чистим cookie после успешной (или повторной) привязки
        cookies()).set("mt_ref_code", "", { path: "/", maxAge: 0 });

  return NextResponse.json({ ok: true, attached: true });
}
