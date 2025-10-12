'use server';

import { revalidatePath } from 'next/cache';
import { supabaseServer } from '@/lib/supabase/server';

export async function updateContactStatusAction(id: string, status: string) {
  const sb = supabaseServer;
  const { error } = await sb.from('contact_messages' as any).update({ status } as any).eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/contacts');
}

export async function deleteContactAction(id: string) {
  const sb = supabaseServer;
  const { error } = await sb.from('contact_messages').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/contacts');
}

export async function deleteAllContactsAction(params?: { start?: string; end?: string }) {
  const sb = supabaseServer;
  let q = sb.from('contact_messages').delete();
  if (params?.start) q = q.gte('created_at', params.start);
  if (params?.end)   q = q.lte('created_at', params.end);
  const { error } = await q;
  if (error) throw new Error(error.message);
  revalidatePath('/admin/contacts');
}
