// app/auth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/serverClient'

export async function GET(req: NextRequest) {
  const supabase = createServerClient()

  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next') || '/admin'

  if (code) {
    // обмен кода на сессию
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      // не роняем — просто на логин
      // return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  // возвращаем туда, куда просили
  return NextResponse.redirect(new URL(next, req.url))
}
