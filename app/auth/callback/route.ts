// app/auth/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type RoleName = "CUSTOMER" | "PARTNER" | "PATIENT" | "ADMIN" | "GUEST";

function normalizeRole(asParam?: string | null): RoleName {
  const as = (asParam ?? "").toUpperCase();
  if (as === "CUSTOMER") return "CUSTOMER";
  if (as === "PARTNER") return "PARTNER";
  if (as === "PATIENT") return "PATIENT";
  if (as === "ADMIN") return "ADMIN";
  return "GUEST";
}

function normCode(v: string) {
  return String(v || "").trim().toUpperCase();
}

async function ensureProfileAndRole(supabase: any, asParam: string | null) {
  const { data: u } = await supabase.auth.getUser();
  const user = u?.user;
  if (!user) return;

  const userId = user.id;
  const email = user.email ?? null;
  const meta: any = user.user_metadata ?? {};

  const fromAs = normalizeRole(asParam);

  const metaRoleRaw = (meta.requested_role as string | undefined)?.toUpperCase();
  const metaRole: RoleName =
    metaRoleRaw === "ADMIN" ||
    metaRoleRaw === "CUSTOMER" ||
    metaRoleRaw === "PARTNER" ||
    metaRoleRaw === "PATIENT"
      ? (metaRoleRaw as RoleName)
      : "GUEST";

  const finalRole: RoleName = fromAs !== "GUEST" ? fromAs : metaRole;

  await supabase
    .from("profiles")
    .upsert(
      { id: userId, email, role: finalRole.toLowerCase() },
      { onConflict: "id" }
    );

  if (finalRole !== "GUEST") {
    await supabase
      .from("user_roles")
      .upsert(
        { user_id: userId, role: finalRole } as any,
        { onConflict: "user_id,role" } as any
      );
  }
}

async function attachReferralIfAny(
  supabase: any,
  res: NextResponse,
  asParam: string | null,
  store: Awaited<ReturnType<typeof cookies>>,
  userId?: string | null
) {
  // прикрепляем рефералку ТОЛЬКО при входе как PATIENT
  if (normalizeRole(asParam) !== "PATIENT") return;

  const cookieCode = store.get("mt_ref_code")?.value ?? "";
  const refCode = normCode(cookieCode);
  if (!refCode) return;

  // userId лучше взять из exchangeCodeForSession, но на всякий случай можно добрать
  let uid = userId ?? null;
  if (!uid) {
    const { data: u } = await supabase.auth.getUser();
    uid = u?.user?.id ?? null;
  }
  if (!uid) return;

  // lookup владельца реф.кода через RPC
  const { data: rows, error: lookupErr } = await supabase.rpc(
    "partner_referral_code_lookup",
    { p_ref_code: refCode }
  );

  // чистим cookie в любом случае, чтобы не висело
  const clear = () => {
    res.cookies.set("mt_ref_code", "", {
      path: "/",
      maxAge: 0,
    });
  };

  if (lookupErr || !rows?.length) {
    clear();
    return;
  }

  const owner = rows[0] as { partner_user_id: string; program_key: string };

  const { error: insErr } = await supabase.from("partner_referrals").insert({
    ref_code: refCode,
    partner_user_id: owner.partner_user_id,
    program_key: owner.program_key,
    patient_user_id: uid,
  } as any);

  // если дубль — это ок (у тебя unique на patient_user_id)
  if (insErr && !String(insErr.message || "").toLowerCase().includes("duplicate")) {
    // можно логировать, но не ломаем логин
    // console.error("attachReferral error:", insErr);
  }

  clear();
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";
  const asParam = url.searchParams.get("as"); // ADMIN / CUSTOMER / PARTNER / PATIENT

  // редиректим туда, куда просили
  const res = NextResponse.redirect(new URL(next, req.url));

  const store = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () =>
          store.getAll().map((c) => ({ name: c.name, value: c.value })),
        setAll: (all) => {
          all.forEach((cookie) => {
            res.cookies.set(cookie.name, cookie.value, cookie.options);
          });
        },
      },
    }
  );

  if (!code) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    // важно: редирект на /auth/login (а не /login)
    const eurl = new URL("/auth/login", req.url);
    eurl.searchParams.set("error", "oauth");
    eurl.searchParams.set("message", error.message);
    return NextResponse.redirect(eurl);
  }

  // гарантируем profile + user_roles
  await ensureProfileAndRole(supabase, asParam);

  // гарантируем referral registration (на callback)
  await attachReferralIfAny(supabase, res, asParam, store, data?.user?.id ?? null);

  return res;
}
