// app/clinic/[slug]/page.tsx
import { notFound } from 'next/navigation';
import ClinicDetailPage from '@/components/ClinicDetailPage';
import { getClinicViewBySlug } from '@/lib/supabase/clinic';

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 60;

export default async function Page({ params }: Props) {
  const { slug } = await params;              // <-- важно
  const clinic = await getClinicViewBySlug(slug);
  if (!clinic) return notFound();
  return <ClinicDetailPage clinic={clinic as any} />;
}
