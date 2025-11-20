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
            res.cookies.set(cookie.name, cookie.value, cookie.options)
          ),
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, searchParams } = req.nextUrl;

  const isAuthRoute =
    pathname === "/login" || pathname.startsWith("/auth");
  const isAdminRoute = pathname.startsWith("/admin");
  const isCustomerRoute = pathname.startsWith("/customer");

  const roles = ((user?.app_metadata?.roles as string[]) || []).map((r) =>
    String(r).toUpperCase()
  );
  const isAdmin = roles.includes("ADMIN");

  // Уже залогинен и идёт на /auth/... → отправляем на next или домой
  if (isAuthRoute && user) {
    const next = searchParams.get("next") || "/";
    return NextResponse.redirect(new URL(next, req.url));
  }

  // Гости не могут в /admin и /customer
  if (!user && (isAdminRoute || isCustomerRoute)) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set(
      "next",
      req.nextUrl.pathname + req.nextUrl.search
    );

    // Для красоты можно проставить as для логина
    loginUrl.searchParams.set(isAdminRoute ? "as" : "as", isAdminRoute ? "ADMIN" : "CUSTOMER");

    return NextResponse.redirect(loginUrl);
  }

  // Пользователь есть, но не админ → не пускаем в /admin
  if (isAdminRoute && !isAdmin) {
    // можешь сделать отдельную страницу /403
    return NextResponse.redirect(new URL("/customer", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/login", "/auth/:path*", "/admin/:path*", "/customer/:path*"],
};
