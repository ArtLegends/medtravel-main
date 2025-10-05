// lib/admin/auth.ts
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@medtravel.com';
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'admin123';

export const ADMIN_COOKIE = 'mt_admin';

export function isAuthed(cookies: { get(name: string): { value?: string } | undefined }) {
  return cookies.get(ADMIN_COOKIE)?.value === '1';
}
