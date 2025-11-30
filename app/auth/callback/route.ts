// app/auth/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type RoleName = "CUSTOMER" | "PARTNER" | "ADMIN" | "GUEST";

function normalizeRole(asParam?: string | null): RoleName {
  const as = (asParam ?? "").toUpperCase();
  if (as === "CUSTOMER") return "CUSTOMER";
  if (as === "PARTNER") return "PARTNER";
  if (as === "ADMIN") return "ADMIN";
  return "GUEST";
}

async function ensureProfileAndRole(
  supabase: any,
  asParam: string | null,
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const userId = user.id;
  const email = user.email ?? null;
  const meta: any = user.user_metadata ?? {};

  // 1) роль из ?as=... (login as=PARTNER / CUSTOMER / ADMIN)
  const fromAs = normalizeRole(asParam);

  // 2) роль из user_metadata.requested_role (на всякий случай)
  const metaRoleRaw = (meta.requested_role as string | undefined)?.toUpperCase();
  const metaRole: RoleName =
    metaRoleRaw === "ADMIN" ||
    metaRoleRaw === "CUSTOMER" ||
    metaRoleRaw === "PARTNER"
      ? (metaRoleRaw as RoleName)
      : "GUEST";

  // приоритет: ?as=... > metadata
  const finalRole: RoleName = fromAs !== "GUEST" ? fromAs : metaRole;

  // --- upsert в public.profiles ---
  await supabase
    .from("profiles")
    .upsert(
      {
        id: userId,
        email,
        role: finalRole.toLowerCase(), // admin / customer / partner / guest
      },
      { onConflict: "id" },
    );

  // --- upsert в public.user_roles только для "настоящих" ролей ---
  if (finalRole === "ADMIN" || finalRole === "CUSTOMER" || finalRole === "PARTNER") {
    await supabase
      .from("user_roles")
      .upsert(
        {
          user_id: userId,
          role: finalRole,
        } as any,
        { onConflict: "user_id,role" } as any,
      );
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";
  const asParam = url.searchParams.get("as"); // ADMIN / CUSTOMER / PARTNER

  const res = NextResponse.redirect(new URL(next, req.url));

  const store = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () =>
          store.getAll().map((c) => ({
            name: c.name,
            value: c.value,
          })),
        setAll: (all) =>
          all.forEach((cookie) =>
            res.cookies.set(cookie.name, cookie.value, cookie.options),
          ),
      },
    },
  );

  if (!code) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    res.cookies.set(
      "mt_auth_error",
      encodeURIComponent(error.message),
      {
        path: "/",
        httpOnly: false,
        maxAge: 60,
      },
    );
    return NextResponse.redirect(new URL("/login?error=oauth", req.url));
  }

  // здесь гарантируем profile + user_roles
  await ensureProfileAndRole(supabase, asParam);

  return res;
}
