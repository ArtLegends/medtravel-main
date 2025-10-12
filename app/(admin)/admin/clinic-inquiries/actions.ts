'use server';

import { revalidatePath } from 'next/cache';
import { supabaseServer } from '@/lib/supabase/server';

// обновление статуса
export async function updateClinicInquiryStatusAction(id: string, status: string) {
  const sb = supabaseServer;
  // cast к any из-за неактуальных supabase-типов
  const { error } = await sb.from('clinic_inquiries' as any)
    .update({ status } as any)
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/admin/clinic-inquiries');
}

// удаление одной
export async function deleteClinicInquiryAction(id: string) {
  const sb = supabaseServer;
  const { error } = await sb.from('clinic_inquiries').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/clinic-inquiries');
}

// массовое удаление c учётом активного фильтра дат
export async function deleteAllClinicInquiriesAction(params?: { start?: string; end?: string }) {
  const sb = supabaseServer;
  let q = sb.from('clinic_inquiries').delete();
  if (params?.start) q = q.gte('created_at', params.start);
  if (params?.end)   q = q.lte('created_at', params.end);

  const { error } = await q;
  if (error) throw new Error(error.message);
  revalidatePath('/admin/clinic-inquiries');
}
