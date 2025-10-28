// app/clinic/[slug]/inquiry/page.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { clinicPath } from '@/lib/clinic-url'

import { fetchClinicBySlug } from '@/lib/db/clinics';
import ClinicInquiryForm from '@/components/clinic/ClinicInquiryForm';
import ClinicInquirySidebar from '@/components/clinic/ClinicInquirySidebar';

type Params = { slug: string };

export async function generateMetadata(
  { params }: { params: Promise<Params> }
): Promise<Metadata> {
  const { slug } = await params
  const clinic = await fetchClinicBySlug(slug) // убедись, что вытягивает country, province, city, district, slug

  const title = clinic ? `Contact ${clinic.name}` : 'Contact clinic'
  const canonical = clinic
    ? `${clinicPath({
        slug: clinic.slug,
        country: clinic.country,
        province: clinic.province,   // опц.
        city: clinic.city,
        district: clinic.district,   // опц.
      })}/inquiry`
    : `/clinic/${slug}/inquiry` // фолбэк, если локации нет

  return { title, alternates: { canonical }, openGraph: { title } }
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const clinic = await fetchClinicBySlug(slug);
  if (!clinic) return notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* FORM */}
        <main className="min-w-0">
          <ClinicInquiryForm
            clinicId={clinic.id}
            clinicSlug={clinic.slug}
            clinicName={clinic.name}
          />
        </main>

        {/* SIDEBAR */}
        <aside>
          <ClinicInquirySidebar clinic={clinic} />
        </aside>
      </div>
    </div>
  );
}
