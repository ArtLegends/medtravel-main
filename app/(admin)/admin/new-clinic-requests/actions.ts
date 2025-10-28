'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/serviceClient'

export async function updateNcrStatusAction(id: string, status: 'new'|'in_progress'|'approved'|'rejected') {
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('new_clinic_requests')
    .update({ status })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/new-clinic-requests')
}

export async function deleteNcrAction(id: string) {
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('new_clinic_requests')
    .delete()
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/new-clinic-requests')
}

export async function deleteAllNcrAction() {
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('new_clinic_requests')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000') // чтобы .delete() не ругался на «всё»
  if (error) throw new Error(error.message)
  revalidatePath('/admin/new-clinic-requests')
}
