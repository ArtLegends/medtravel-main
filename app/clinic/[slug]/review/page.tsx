// app/clinic/[slug]/review/page.tsx
import { notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/serverClient';
import ReviewForm from '@/components/reviews/ReviewForm';

type Params = { slug: string };

export default async function Page(
  { params }: { params: Promise<Params> }
) {
  const { slug } = await params;

  const sb = await createServerClient();
  const { data: clinic, error } = await sb
    .from('clinics')
    .select('id, name')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    // можно залогировать, но для страницы — 404
    return notFound();
  }
  if (!clinic) return notFound();

  return <ReviewForm clinicId={clinic.id} clinicName={clinic.name} />;
}
