import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Cache for user roles to reduce database calls
const roleCache = new Map<string, { role: string; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    {
      cookies: {
        getAll: () =>
          req.cookies.getAll().map((c) => ({ name: c.name, value: c.value })),
        setAll: (cookies: { name: string; value: string; options?: any }[]) => {
          cookies.forEach((cookie) => {
            res.cookies.set(cookie.name, cookie.value, cookie.options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = req.nextUrl.pathname;
  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/auth");

  // Role-based guard with caching
  let userRole: string | null = null;

  if (user) {
    const cacheKey = user.id;
    const cached = roleCache.get(cacheKey);
    const now = Date.now();

    // Check cache first
    if (cached && now - cached.timestamp < CACHE_TTL) {
      userRole = cached.role;
    } else {
      // Fetch from database if not cached or expired
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      userRole = (data as any)?.role ?? "USER";

      // Update cache
      if (userRole) {
        roleCache.set(cacheKey, { role: userRole, timestamp: now });
      }

      // Clean old cache entries periodically
      if (roleCache.size > 1000) {
        const entries = Array.from(roleCache.entries());

        for (const [key, value] of entries) {
          if (now - value.timestamp > CACHE_TTL) {
            roleCache.delete(key);
          }
        }
      }
    }

    // Set role in response headers for client-side access
    if (userRole) {
      res.headers.set("x-user-role", userRole);
    }
  }

  const needCreator = pathname.startsWith("/labs");
  const needAdmin = pathname.startsWith("/admin");

  if (user) {
    if (needAdmin && !(userRole === "ADMIN" || userRole === "SUPER_ADMIN")) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    if (needCreator && userRole === "USER") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  if (!user && !isAuthRoute) {
    const loginUrl = new URL("/login", req.url);

    return NextResponse.redirect(loginUrl);
  }

  if (user && isAuthRoute) {
    const homeUrl = new URL("/", req.url);

    return NextResponse.redirect(homeUrl);
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
  // runtime: "experimental-edge", // Use experimental-edge runtime for Next.js 15
};
