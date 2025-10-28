'use server';

import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/serviceClient';

const supabase = createServiceClient();

export type ListInput = {
  page?: number;                // 1-based
  start?: string | null;        // 'YYYY-MM-DD'
  end?: string | null;          // 'YYYY-MM-DD'
};

export async function listReviews(input: ListInput) {
  const page = Math.max(1, input.page ?? 1);
  const limit = 15;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // читаем из вьюхи, чтобы сразу иметь clinic_name
  const q = supabase
    .from('mv_admin_reviews')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (input.start) q.gte('created_at', `${input.start}T00:00:00+00:00`);
  if (input.end)   q.lte('created_at',   `${input.end}T23:59:59.999+00:00`);

  const { data, error, count } = await q;
  if (error) throw new Error(error.message);

  return { rows: data ?? [], count: count ?? 0, page, limit };
}

const UpdateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['new','published','rejected'])
});
export async function updateReviewStatus(payload: z.infer<typeof UpdateSchema>) {
  const parsed = UpdateSchema.parse(payload);
  const { error } = await supabase
    .from('reviews')
    .update({ status: parsed.status })
    .eq('id', parsed.id);
  if (error) throw new Error(error.message);
}

export async function deleteReview(id: string) {
  const { error } = await supabase.from('reviews').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteAllReviews(filter: { start?: string|null; end?: string|null }) {
  // удаляем по текущему фильтру (все совпадающие)
  let q = supabase.from('reviews').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (filter.start) q = q.gte('created_at', `${filter.start}T00:00:00+00:00`);
  if (filter.end)   q = q.lte('created_at',   `${filter.end}T23:59:59.999+00:00`);
  const { error } = await q;
  if (error) throw new Error(error.message);
}
