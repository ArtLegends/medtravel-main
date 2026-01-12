import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteClient } from "@/lib/supabase/routeClient";

export const dynamic = "force-dynamic";

type RoleName = "CUSTOMER" | "PARTNER" | "PATIENT" | "ADMIN" | "GUEST";

function normalizeRole(asParam?: string | null): RoleName {
  const as = (asParam ?? "").toUpperCase();
  if (as === "CUSTOMER") return "CUSTOMER";
  if (as === "PARTNER") return "PARTNER";
  if (as === "PATIENT") return "PATIENT";
  if (as === "ADMIN") return "ADMIN";
  return "GUEST";
}

function normEmail(v: unknown) {
  return String(v ?? "").trim().toLowerCase();
}

function normCode(v: unknown) {
  return String(v ?? "").trim().toUpperCase();
}

async function ensureProfileAndRole(supabase: any, userId: string, email: string | null, asParam: string | null) {
  const finalRole = normalizeRole(asParam);

  // profiles
  await supabase
    .from("profiles")
    .upsert(
      {
        id: userId,
        email,
        role: finalRole.toLowerCase(),
        email_verified: true,
      },
      { onConflict: "id" }
    );

  // user_roles (кроме guest)
  if (finalRole !== "GUEST") {
    await supabase
      .from("user_roles")
      .upsert(
        { user_id: userId, role: finalRole } as any,
        { onConflict: "user_id,role" } as any
      );
  }
}

async function attachReferralIfAny(supabase: any, userId: string, asParam: string | null) {
  if (normalizeRole(asParam) !== "PATIENT") return;

  const store = await cookies();
  const cookieCode = store.get("mt_ref_code")?.value ?? "";
  const refCode = normCode(cookieCode);
  if (!refCode) return;

  // lookup владельца кода через RPC
  const { data: rows, error: lookupErr } = await supabase.rpc(
    "partner_referral_code_lookup",
    { p_ref_code: refCode }
  );

  // чистим cookie в любом случае
  store.set("mt_ref_code", "", { path: "/", maxAge: 0 });

  if (lookupErr || !rows?.length) return;

  const owner = rows[0] as { partner_user_id: string; program_key: string };

  const { error: insErr } = await supabase.from("partner_referrals").insert({
    ref_code: refCode,
    partner_user_id: owner.partner_user_id,
    program_key: owner.program_key,
    patient_user_id: userId,
  } as any);

  // дубль — ок
  if (insErr && !String(insErr.message || "").toLowerCase().includes("duplicate")) {
    // не ломаем логин
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createRouteClient();

  const body = await req.json().catch(() => ({}));
  const email = normEmail(body?.email);
  const token = String(body?.token ?? "").trim();
  const asParam = String(body?.as ?? "").trim() || null;

  if (!email || !token) {
    return NextResponse.json({ error: "Missing email or token" }, { status: 400 });
  }

  // ВАЖНО: type: "email" для email OTP
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const user = data?.user;
  if (!user?.id) {
    return NextResponse.json({ error: "No user in session" }, { status: 400 });
  }

  // profiles + role + email_verified
  await ensureProfileAndRole(supabase, user.id, user.email ?? null, asParam);

  // referral attach (если есть cookie и вход как PATIENT)
  await attachReferralIfAny(supabase, user.id, asParam);

  return NextResponse.json({ ok: true, userId: user.id });
}
