// app/(customer)/customer/_utils/getCurrentClinicId.ts
import { cookies } from 'next/headers';
import { supabaseServer } from '@/lib/supabase/server';

/**
 * Возвращает clinic_id, привязанный к текущему пользователю.
 *
 * 1) Нормальный путь: auth → clinic_members.clinic_id
 * 2) Legacy-fallback: mt_customer_clinic_id из cookie (для отладки / старых ссылок)
 */
export async function getCurrentClinicId(): Promise<string | null> {
  // 1) Пробуем по авторизации
  const {
    data: { user },
    error: userErr,
  } = await supabaseServer.auth.getUser();

  if (userErr) {
    console.error('getCurrentClinicId: auth error', userErr);
  }

  if (user) {
    const { data: membership, error: mErr } = await supabaseServer
      .from('clinic_members')
      .select('clinic_id, role')
      .eq('user_id', user.id)
      .order('role', { ascending: true }) // owner / manager / staff — неважно, берём первую
      .limit(1)
      .maybeSingle();

    if (mErr) {
      console.error('getCurrentClinicId: clinic_members error', mErr);
    }

    if (membership?.clinic_id) {
      return membership.clinic_id;
    }
  }

  // 2) fallback для старых dev-куки (можно убрать, если совсем не нужен)
  const jar = await cookies();
  const fromCookie = jar.get('mt_customer_clinic_id')?.value ?? null;
  if (fromCookie) return fromCookie;

  return null;
}
