'use server';

import { revalidatePath } from 'next/cache';
import { supabaseServer } from '@/lib/supabase/server';

export async function updateClinicRequestStatusAction(id: string, status: string) {
  const sb = supabaseServer;
  const { error } = await sb.from('clinic_requests' as any)
    .update({ status } as any)
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/clinic-requests');
}

export async function deleteClinicRequestAction(id: string) {
  const sb = supabaseServer;
  const { error } = await sb.from('clinic_requests' as any)
    .delete()
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/clinic-requests');
}

export async function deleteAllClinicRequestsAction(params?: { start?: string; end?: string }) {
  const sb = supabaseServer;
  let q = sb.from('clinic_requests' as any).delete();
  if (params?.start) q = q.gte('created_at', params.start);
  if (params?.end)   q = q.lte('created_at', params.end);
  const { error } = await q;
  if (error) throw new Error(error.message);
  revalidatePath('/admin/clinic-requests');
}
