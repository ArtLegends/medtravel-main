'use server'

import { revalidatePath } from 'next/cache'
import { supabaseServer } from '@/lib/supabase/server'

export async function updateReportStatusAction(id: string, status: string) {
  const { error } = await supabaseServer
    .from('reports')
    .update({ status })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/reports')
}

export async function deleteReportAction(id: string) {
  const { error } = await supabaseServer
    .from('reports')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/reports')
}

/** Удалить ВСЕ репорты (без фильтров). */
export async function deleteAllReportsAction() {
  const { error } = await supabaseServer
    .from('reports')
    .delete()
    .not('id', 'is', null)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/reports')
}
