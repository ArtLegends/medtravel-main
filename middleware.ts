// middleware.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const roleCache = new Map<string, { role: string; ts: number }>();
const TTL = 5 * 60 * 1000; // 5 минут

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // ⚠️ временно делаем админку общедоступной
  if (req.nextUrl.pathname.startsWith('/admin')) {
    return res;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll().map(c => ({ name: c.name, value: c.value })),
        setAll: (cookies) => cookies.forEach(c => res.cookies.set(c.name, c.value, c.options)),
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const pathname = req.nextUrl.pathname;
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/auth');
  const needAdmin   = pathname.startsWith('/admin');    // уже не влияет из-за раннего return
  const needCreator = pathname.startsWith('/labs');
  const needsProfile = pathname === '/settings';

  let role: string = 'USER';

  try {
    if (user) {
      const cached = roleCache.get(user.id);
      const now = Date.now();

      if (cached && now - cached.ts < TTL) {
        role = cached.role;
      } else {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (!error) {
          role = data?.role ?? 'USER';
          roleCache.set(user.id, { role, ts: now });
        } else {
          console.error('profiles SELECT error', error);
        }
      }
      res.headers.set('x-user-role', role);
    }

    // 🔒 всё, что ниже, временно выключено
    // if (!user && (needAdmin || needCreator || needsProfile)) {
    //   return NextResponse.redirect(new URL('/login', req.url));
    // }
    // if (user) {
    //   if (needAdmin && !(role === 'ADMIN' || role === 'SUPER_ADMIN')) {
    //     return NextResponse.redirect(new URL('/', req.url));
    //   }
    //   if (needCreator && role === 'USER') {
    //     return NextResponse.redirect(new URL('/', req.url));
    //   }
    //   if (isAuthRoute) {
    //     return NextResponse.redirect(new URL('/', req.url));
    //   }
    // }
  } catch (e) {
    console.error('middleware fatal', e);
  }

  return res;
}

export const config = {
  matcher: [
    // '/admin/:path*', // ← оставляем отключённым
    '/labs/:path*',
    '/settings',
    '/login',
    '/auth/:path*',
  ],
};
