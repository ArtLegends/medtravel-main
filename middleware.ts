// middleware.ts
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const roleCache = new Map<string, { role: string; ts: number }>()
const TTL = 5 * 60 * 1000

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // подключаем Supabase к middleware через cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll().map(c => ({ name: c.name, value: c.value })),
        setAll: cookies => cookies.forEach(c => res.cookies.set(c.name, c.value, c.options)),
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = req.nextUrl.pathname

  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/auth')
  const needAdmin   = pathname.startsWith('/admin')
  const needCreator = pathname.startsWith('/labs')

  let role: string | null = null

  try {
    if (user) {
      const cached = roleCache.get(user.id)
      const now = Date.now()
      if (cached && now - cached.ts < TTL) {
        role = cached.role
      } else {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle()
        if (!error) {
          role = data?.role ?? 'USER'
          roleCache.set(user.id, { role: role ?? 'USER', ts: now })
        } else {
          console.error('profiles SELECT error', error)
        }
      }
      if (role) res.headers.set('x-user-role', role)
    }

    // Доступ
    if (!user && (needAdmin || needCreator || pathname === '/settings')) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    if (user) {
      if (needAdmin && !(role === 'ADMIN' || role === 'SUPER_ADMIN')) {
        return NextResponse.redirect(new URL('/', req.url))
      }
      if (needCreator && role === 'USER') {
        return NextResponse.redirect(new URL('/', req.url))
      }
      if (isAuthRoute) {
        return NextResponse.redirect(new URL('/', req.url))
      }
    }
  } catch (e) {
    console.error('middleware fatal', e)
    // НИКОГДА не роняем публичные страницы
  }

  return res
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/labs/:path*',
    '/settings',
    '/login',
    '/auth/:path*',
  ],
}