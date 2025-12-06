// app/clinic/[slug]/inquiry/page.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { clinicPath } from '@/lib/clinic-url';

import { fetchClinicBySlug } from '@/lib/db/clinics';
import ClinicInquiryForm from '@/components/clinic/ClinicInquiryForm';
import ClinicInquirySidebar from '@/components/clinic/ClinicInquirySidebar';

type Params = { slug: string };

export async function generateMetadata(
  { params }: { params: Promise<Params> }
): Promise<Metadata> {
  const { slug } = await params;
  const clinic = await fetchClinicBySlug(slug);

  const title = clinic ? `Contact ${clinic.name}` : 'Contact clinic';
  const canonical = clinic
    ? `${clinicPath({
        slug: clinic.slug,
        country: clinic.country,
        province: clinic.province,
        city: clinic.city,
        district: clinic.district,
      })}/inquiry`
    : `/clinic/${slug}/inquiry`;

  return {
    title,
    alternates: { canonical },
    openGraph: { title },
  };
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const clinic = await fetchClinicBySlug(slug);
  if (!clinic) return notFound();

  const locationLine = [clinic.country, clinic.city, clinic.district]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
      {/* HEADER */}
      <header className="mb-6 md:mb-8 space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
          Contact clinic
        </p>
        <h1 className="text-2xl font-semibold leading-snug md:text-3xl">
          Send an enquiry to {clinic.name}
        </h1>
        {locationLine && (
          <p className="text-sm text-gray-500">
            {locationLine}
          </p>
        )}
        <p className="text-sm text-gray-500">
          Share your contact details and a short message. We’ll forward your enquiry to the
          clinic and help you get a response as soon as possible.
        </p>
      </header>

      {/* CONTENT GRID */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.9fr)]">
        {/* FORM */}
        <main className="min-w-0">
          <ClinicInquiryForm
            clinicId={clinic.id}
            clinicSlug={clinic.slug}
            clinicName={clinic.name}
          />
        </main>

        {/* SIDEBAR */}
        <aside className="min-w-0">
          <ClinicInquirySidebar clinic={clinic} />
        </aside>
      </div>
    </div>
  );
}
