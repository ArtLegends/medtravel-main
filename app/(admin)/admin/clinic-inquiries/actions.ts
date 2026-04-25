'use server';

import { revalidatePath } from 'next/cache';
import { supabaseServer } from '@/lib/supabase/server';

export async function updateClinicInquiryStatusAction(id: string, status: string) {
  const sb = supabaseServer;
  const { error } = await sb.from('clinic_inquiries' as any)
    .update({ status } as any)
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/admin/clinic-inquiries');
}

export async function deleteClinicInquiryAction(id: string) {
  const sb = supabaseServer;
  const { error } = await sb.from('clinic_inquiries').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/clinic-inquiries');
}

export async function deleteAllClinicInquiriesAction(params?: { start?: string; end?: string }) {
  const sb = supabaseServer;
  let q = sb.from('clinic_inquiries').delete();
  if (params?.start) q = q.gte('created_at', params.start);
  if (params?.end)   q = q.lte('created_at', params.end);

  const { error } = await q;
  if (error) throw new Error(error.message);
  revalidatePath('/admin/clinic-inquiries');
}
