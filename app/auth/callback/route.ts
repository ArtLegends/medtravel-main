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

async function createCustomerRequestIfNeeded(userId: string, email: string | null) {
  if (!email) return;
  const sb = createServiceClient();
  await sb
    .from("customer_registration_requests")
    .upsert({ user_id: userId, email, status: "pending" }, { onConflict: "user_id" });
}

async function createPartnerRequestIfNeeded(userId: string, email: string | null) {
  if (!email) return;
  const sb = createServiceClient();
  await sb
    .from("partner_registration_requests")
    .upsert({ user_id: userId, email, status: "pending" }, { onConflict: "user_id" });
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

  // ✅ CUSTOMER gating
  if (finalRole === "CUSTOMER") {
    const sb = createServiceClient();

    const { data: reqRow, error: reqErr } = await sb
      .from("customer_registration_requests")
      .select("status")
      .eq("user_id", userId)
      .maybeSingle();

    const st = String(reqRow?.status ?? "").toLowerCase();

    if (!reqErr && st === "approved") {
      await supabase
        .from("profiles")
        .upsert({ id: userId, email, role: "customer" }, { onConflict: "id" });

      await supabase
        .from("user_roles")
        .upsert({ user_id: userId, role: "customer" } as any, { onConflict: "user_id,role" } as any);

      return { finalRole, pendingKind: null as null | "CUSTOMER" | "PARTNER" };
    }

    await supabase
      .from("profiles")
      .upsert({ id: userId, email, role: "guest" }, { onConflict: "id" });

    await createCustomerRequestIfNeeded(userId, email);

    return { finalRole, pendingKind: "CUSTOMER" as const };
  }

  // ✅ PARTNER gating (новое)
  if (finalRole === "PARTNER") {
    const sb = createServiceClient();

    const { data: reqRow, error: reqErr } = await sb
      .from("partner_registration_requests")
      .select("status")
      .eq("user_id", userId)
      .maybeSingle();

    const st = String(reqRow?.status ?? "").toLowerCase();

    if (!reqErr && st === "approved") {
      await supabase
        .from("profiles")
        .upsert({ id: userId, email, role: "partner" }, { onConflict: "id" });

      await supabase
        .from("user_roles")
        .upsert({ user_id: userId, role: "partner" } as any, { onConflict: "user_id,role" } as any);

      return { finalRole, pendingKind: null as null | "CUSTOMER" | "PARTNER" };
    }

    await supabase
      .from("profiles")
      .upsert({ id: userId, email, role: "guest" }, { onConflict: "id" });

    await createPartnerRequestIfNeeded(userId, email);

    return { finalRole, pendingKind: "PARTNER" as const };
  }

  // ✅ остальные роли — как раньше
  await supabase
    .from("profiles")
    .upsert({ id: userId, email, role: finalRole.toLowerCase() }, { onConflict: "id" });

  if (finalRole !== "GUEST") {
    await supabase
      .from("user_roles")
      .upsert({ user_id: userId, role: finalRole.toLowerCase() } as any, { onConflict: "user_id,role" } as any);
  }

  return { finalRole, pendingKind: null as null | "CUSTOMER" | "PARTNER" };
}

/**
 * IMPORTANT:
 * - attach делаем через SERVICE ROLE (RLS не мешает)
 * - cookie очищаем всегда, чтобы не висела
 */
async function attachReferralIfAny(
  res: NextResponse,
  asParam: string | null,
  store: Awaited<ReturnType<typeof cookies>>,
  patientUserId: string | null,
) {
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

  const { error: insErr } = await sb.from("partner_referrals").upsert(
    {
      ref_code: refCode,
      partner_user_id: owner.user_id,
      program_key: owner.program_key,
      patient_user_id: patientUserId,
    } as any,
    { onConflict: "patient_user_id" },
  );

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
          all.forEach((cookie) => res.cookies.set(cookie.name, cookie.value, cookie.options));
        },
      },
    },
  );

  if (!code) return NextResponse.redirect(new URL("/", req.url));

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL("/", req.url));

  const result = await ensureProfileAndRole(supabase, asParam);

  // CUSTOMER/PARTNER pending: разлогинить и показать сообщение
  if (result?.pendingKind) {
    await supabase.auth.signOut();

    const pendingUrl = new URL("/auth/login", req.url);
    pendingUrl.searchParams.set("as", result.pendingKind);
    pendingUrl.searchParams.set("pending", "1");
    pendingUrl.searchParams.set("next", result.pendingKind === "CUSTOMER" ? "/customer" : "/partner");
    return NextResponse.redirect(pendingUrl);
  }

  await attachReferralIfAny(res, asParam, store, data?.user?.id ?? null);
  return res;
}