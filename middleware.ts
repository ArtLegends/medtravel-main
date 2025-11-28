// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () =>
          req.cookies.getAll().map((c) => ({
            name: c.name,
            value: c.value,
          })),
        setAll: (all) =>
          all.forEach((cookie) =>
            res.cookies.set(
              cookie.name,
              cookie.value,
              cookie.options,
            ),
          ),
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, searchParams } = req.nextUrl;

  const isAuthRoute = pathname.startsWith("/auth");
  const isAdminRoute = pathname.startsWith("/admin");
  const isCustomerRoute = pathname.startsWith("/customer");
  const isPartnerRoute = pathname.startsWith("/partner");

  // ---- собираем роли пользователя ----
  let roles: string[] = [];

  if (user) {
    // 1) из app_metadata.roles
    const metaRoles =
      ((user.app_metadata?.roles as string[] | undefined) ??
        []).map((r) => String(r).toUpperCase());
    roles.push(...metaRoles);

    // 2) из public.user_roles
    const { data: rows, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    if (!error && rows) {
      for (const r of rows) {
        if (r.role) roles.push(String(r.role).toUpperCase());
      }
    }

    roles = Array.from(new Set(roles));
  }

  const isAdmin =
    roles.includes("ADMIN") || roles.includes("SUPER_ADMIN");
  const isCustomer = roles.includes("CUSTOMER");
  const isPartner = roles.includes("PARTNER");

  // Уже залогинен и идёт на /auth/... → отправляем на next или дефолт
  if (isAuthRoute && user) {
    const next =
      searchParams.get("next") ||
      (isAdmin
        ? "/admin"
        : isPartner
        ? "/partner"
        : isCustomer
        ? "/customer"
        : "/");
    return NextResponse.redirect(new URL(next, req.url));
  }

  const needsAuth =
    isAdminRoute || isCustomerRoute || isPartnerRoute;

  // Гость пытается в /admin /customer /partner → на логин с нужной ролью
  if (!user && needsAuth) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set(
      "next",
      req.nextUrl.pathname + req.nextUrl.search,
    );
    loginUrl.searchParams.set(
      "as",
      isAdminRoute
        ? "ADMIN"
        : isPartnerRoute
        ? "PARTNER"
        : "CUSTOMER",
    );
    return NextResponse.redirect(loginUrl);
  }

  // Юзер есть, но не админ → не пускаем на /admin
  if (isAdminRoute && !isAdmin) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Юзер есть, но не партнёр → не пускаем на /partner
  if (isPartnerRoute && !isPartner) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // /customer пока оставляем как есть (любая авторизованная роль может зайти).
  return res;
}

export const config = {
  matcher: ["/auth/:path*", "/admin/:path*", "/customer/:path*", "/partner/:path*"],
};
