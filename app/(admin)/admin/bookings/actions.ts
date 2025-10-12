'use server'

import { revalidatePath } from 'next/cache'
import { supabaseServer } from '@/lib/supabase/server'

export async function updateBookingStatusAction(id: string, status: string) {
  const { error } = await supabaseServer
    .from('bookings')
    .update({ status })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/bookings')
}

export async function deleteBookingAction(id: string) {
  const { error } = await supabaseServer
    .from('bookings')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/bookings')
}

/** Удалить ВСЕ заявки (без фильтров). */
export async function deleteAllBookingsAction() {
  // Supabase не позволяет .delete() без условия — используем «всегда true»:
  const { error } = await supabaseServer
    .from('bookings')
    .delete()
    .not('id', 'is', null)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/bookings')
}
