// app/(customer)/customer/_utils/getCurrentClinicId.ts
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/serverClient';

/**
 * Возвращает clinic_id, привязанный к текущему пользователю.
 *
 * 1) Нормальный путь: Supabase auth → clinic_members.clinic_id
 * 2) Fallback: mt_customer_clinic_id из cookie (для старых/dev-сценариев)
 */
export async function getCurrentClinicId(): Promise<string | null> {
  // 1) Путь через авторизацию
  try {
    const sb = await createServerClient();

    const {
      data: { user },
      error: userErr,
    } = await sb.auth.getUser();

    if (userErr) {
      console.error('getCurrentClinicId: auth error', userErr);
    }

    if (user) {
      const { data: membership, error: mErr } = await sb
        .from('clinic_members')
        .select('clinic_id')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();

      if (mErr) {
        console.error('getCurrentClinicId: clinic_members error', mErr);
      }

      if (membership?.clinic_id) {
        return membership.clinic_id;
      }
    }
  } catch (e) {
    console.error('getCurrentClinicId: auth branch failed', e);
  }

  // 2) Fallback по куке (для legacy/dev, можно потом убрать совсем)
  try {
    const jar = await cookies();
    const fromCookie = jar.get('mt_customer_clinic_id')?.value ?? null;
    if (fromCookie) return fromCookie;
  } catch (e) {
    console.error('getCurrentClinicId: cookie branch failed', e);
  }

  return null;
}
