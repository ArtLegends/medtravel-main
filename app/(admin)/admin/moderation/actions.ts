// app/(admin)/admin/moderation/actions.ts
'use server';

import { createAdminClient } from '@/lib/supabase/adminClient'; // 👈 сервис-ключ

export async function approveClinic(formData: FormData) {
  const clinicId = String(formData.get('clinicId'));
  const supabase = createAdminClient(); // 👈 было createServerClient()

  // (опционально) можно оставить мягкую проверку через VIEW, но безопаснее доверять функции
  // const { data: v } = await supabase.from('moderation_queue_v2')
  //   .select('draft_status').eq('clinic_id', clinicId).maybeSingle();
  // if (v?.draft_status !== 'pending') throw new Error('Draft is not pending');

  const { error } = await supabase.rpc('publish_clinic_from_draft', { p_clinic_id: clinicId });
  if (error) throw error;
}

export async function rejectClinic(formData: FormData) {
  const clinicId = String(formData.get('clinicId'));
  const reason   = String(formData.get('reason') || '');
  const supabase = createAdminClient(); // 👈 тоже сервис-ключ

  const { error } = await supabase.rpc('reject_clinic_draft', {
    p_clinic_id: clinicId,
    p_reason: reason,
  });
  if (error) throw error;
}
