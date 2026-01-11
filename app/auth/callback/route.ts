// app/auth/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createServiceClient } from "@/lib/supabase/serviceClient";

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
    .upsert({ id: userId, email, role: finalRole.toLowerCase() }, { onConflict: "id" });

  if (finalRole !== "GUEST") {
    await supabase
      .from("user_roles")
      .upsert({ user_id: userId, role: finalRole } as any, { onConflict: "user_id,role" } as any);
  }
}

/**
 * IMPORTANT:
 * - делаем attach через SERVICE ROLE (RLS не мешает)
 * - cookie очищаем всегда, чтобы не висела
 */
async function attachReferralIfAny(
  res: NextResponse,
  asParam: string | null,
  store: Awaited<ReturnType<typeof cookies>>,
  patientUserId: string | null,
) {
  // прикрепляем только при входе как PATIENT
  if (normalizeRole(asParam) !== "PATIENT") return;

  const refCode = normCode(store.get("mt_ref_code")?.value ?? "");
  if (!refCode) return;

  const clear = () => {
    res.cookies.set("mt_ref_code", "", { path: "/", maxAge: 0 });
  };

  if (!patientUserId) {
    clear();
    return;
  }

  const sb = createServiceClient();

  // 1) найдём владельца кода (approved)
  const { data: owner, error: ownerErr } = await sb
    .from("partner_program_requests")
    .select("user_id, program_key")
    .eq("ref_code", refCode)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (ownerErr || !owner?.user_id) {
    clear();
    return;
  }

  // 2) пишем регистрацию (на дубль — ок)
  // если у тебя unique на patient_user_id или на (patient_user_id, partner_user_id) — upsert/ignore must be safe
  const { error: insErr } = await sb.from("partner_referrals").upsert(
    {
      ref_code: refCode,
      partner_user_id: owner.user_id,
      program_key: owner.program_key,
      patient_user_id: patientUserId,
    } as any,
    { onConflict: "patient_user_id" }, // <-- если у тебя уникальность другая — скажешь, поправим
  );

  // если конфликт/дубль — не ломаем логин
  // если ошибка реальная — тоже не ломаем, но можно поставить debug-cookie
  if (insErr) {
    res.cookies.set("mt_ref_attach_error", encodeURIComponent(insErr.message), {
      path: "/",
      httpOnly: false,
      maxAge: 60,
    });
  }

  clear();
}

type CookieToSet = { name: string; value: string; options?: any };

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";
  const asParam = url.searchParams.get("as");

  const res = NextResponse.redirect(new URL(next, req.url));
  const store = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => store.getAll().map((c) => ({ name: c.name, value: c.value })),
        setAll: (all: CookieToSet[]) => {
          all.forEach((cookie) => {
            res.cookies.set(cookie.name, cookie.value, cookie.options);
          });
        },
      },
    },
  );

  if (!code) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const eurl = new URL("/auth/login", req.url);
    eurl.searchParams.set("error", "oauth");
    eurl.searchParams.set("message", error.message);
    return NextResponse.redirect(eurl);
  }

  await ensureProfileAndRole(supabase, asParam);

  await attachReferralIfAny(res, asParam, store, data?.user?.id ?? null);

  return res;
}
