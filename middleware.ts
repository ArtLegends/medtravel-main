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
        getAll: () => req.cookies.getAll().map((c) => ({ name: c.name, value: c.value })),
        setAll: (all) => all.forEach((cookie) => res.cookies.set(cookie.name, cookie.value, cookie.options)),
      },
    }
  );

  const { data } = await supabase.auth.getUser();
  const user = data.user;

  const { pathname, searchParams } = req.nextUrl;
  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/auth");
  const isAdmin = pathname.startsWith("/admin");

  // если уже вошёл и идёт на /login — отправим на next или домой
  if (isAuthRoute && user) {
    const next = searchParams.get("next") || "/";
    return NextResponse.redirect(new URL(next, req.url));
  }

  // простая защита /admin: если не авторизован — на /login?next=<path>
  if (isAdmin && !user) {
    const login = new URL("/login", req.url);
    login.searchParams.set("next", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(login);
  }

  return res;
}

export const config = {
  matcher: ["/login", "/auth/:path*", "/admin/:path*"],
};
