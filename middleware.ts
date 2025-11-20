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
            res.cookies.set(cookie.name, cookie.value, cookie.options),
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

  // --- определяем isAdmin ---
  let isAdmin = false;

  if (user) {
    // 1) из app_metadata.roles (если мы туда пишем)
    const metaRoles =
      ((user.app_metadata?.roles as string[] | undefined) ?? []).map((r) =>
        String(r).toUpperCase(),
      );
    if (metaRoles.includes("ADMIN")) {
      isAdmin = true;
    }

    // 2) при необходимости — дёргаем public.user_roles
    if (!isAdmin) {
      const { data: rows, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (!error && rows?.length) {
        if (rows.some((r) => r.role?.toUpperCase() === "ADMIN")) {
          isAdmin = true;
        }
      }
    }
  }

  // Уже залогинен и идёт на /auth/... → отправляем на next или дефолт
  if (isAuthRoute && user) {
    const next = searchParams.get("next") || (isAdmin ? "/admin" : "/customer");
    return NextResponse.redirect(new URL(next, req.url));
  }

  // Гость пытается в /admin или /customer → на логин
  if (!user && (isAdminRoute || isCustomerRoute)) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set(
      "next",
      req.nextUrl.pathname + req.nextUrl.search,
    );
    loginUrl.searchParams.set(isAdminRoute ? "as" : "as", isAdminRoute ? "ADMIN" : "CUSTOMER");
    return NextResponse.redirect(loginUrl);
  }

  // Юзер есть, но не админ → не пускаем на /admin
  if (isAdminRoute && !isAdmin) {
    // можешь поменять на /customer или /403
    return NextResponse.redirect(new URL("/", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/auth/:path*", "/admin/:path*", "/customer/:path*"],
};
