import { NextResponse } from 'next/server';
import { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_COOKIE } from '@/lib/admin/auth';

export async function POST(req: Request) {
  const { email, password } = await req.json();
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_COOKIE, '1', { httpOnly: true, sameSite: 'lax', path: '/' });
    return res;
  }
  return NextResponse.json({ ok: false, error: 'Invalid credentials' }, { status: 401 });
}
