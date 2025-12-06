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
    .select('id, name, slug, country, province, city, district')
    .eq('slug', slug)
    .maybeSingle();

  if (error || !clinic) {
    return notFound();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
      <ReviewForm
        clinicId={clinic.id}
        clinicName={clinic.name}
        clinicSlug={clinic.slug}
        clinicCountry={clinic.country}
        clinicProvince={clinic.province}
        clinicCity={clinic.city}
        clinicDistrict={clinic.district}
      />
    </div>
  );
}
