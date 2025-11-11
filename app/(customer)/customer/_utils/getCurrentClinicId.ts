// app/(customer)/customer/_utils/getCurrentClinicId.ts
'use server';

import { cookies } from 'next/headers';

const CANDIDATE_COOKIE_KEYS = [
  'mt_demo_clinic_id',   // как в твоём скрине
  'mt_dev_clinic_id',
  'clinic_id',
  'customer_clinic_id',
];

const UUID_RX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function getCurrentClinicId(): Promise<string> {
  const jar = await cookies();
  for (const k of CANDIDATE_COOKIE_KEYS) {
    const val = jar.get(k)?.value?.trim();
    if (val && UUID_RX.test(val)) return val;
  }
  return '';
}


// /** Пытается получить clinic_id из supabase membership или из куки (dev-режим) */
// export async function getCurrentClinicId() {
//   // 1) попробовать через supabase (когда появится auth)
//   try {
//     const sb = await createServerClient();
//     const { data: me } = await sb.auth.getUser();
//     if (me?.user?.id) {
//       const { data: membership } = await sb
//         .from('clinic_members')
//         .select('clinic_id')
//         .eq('user_id', me.user.id)
//         .limit(1)
//         .maybeSingle();
//       if (membership?.clinic_id && UUID_RX.test(membership.clinic_id)) {
//         return membership.clinic_id as string;
//       }
//     }
//   } catch {
//     // молча падаем в dev-режим
//   }

//   // 2) dev: взять из куки
//   const jar = cookies();
//   for (const key of CANDIDATE_COOKIE_KEYS) {
//     const val = (await jar).get(key)?.value?.trim();
//     if (val && UUID_RX.test(val)) return val;
//   }

//   // 3) dev: попытка найти «похожую» куку с uuid (на всякий случай)
//   for (const c of (await jar).getAll()) {
//     const val = c.value?.trim();
//     if (val && UUID_RX.test(val)) return val;
//   }

//   throw new Error('No clinic_id: sign in or set mt_dev_clinic_id cookie.');
// }
