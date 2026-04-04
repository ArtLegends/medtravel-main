// app/clinic/[slug]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ClinicDetailPage from '@/components/clinic/ClinicDetailPage'
import { fetchClinicBySlug } from '@/lib/db/clinics'
import { buildClinicMetadata } from '@/lib/seo/meta'
import { clinicPath } from '@/lib/clinic-url'
import Script from 'next/script';

type Params = { slug: string }

const site = (process.env.NEXT_PUBLIC_SITE_URL || 'https://medtravel.me').replace(/\/+$/, '')

export async function generateMetadata(
  { params }: { params: Promise<Params> }
): Promise<Metadata> {
  const { slug } = await params
  const clinic = await fetchClinicBySlug(slug)
  const sb = await (await import('@/lib/supabase/serverClient')).createServerClient()

  let minPrice: number | null = null
  let minCurrency: string | null = null

  if (clinic?.id) {
    const { data: minRow } = await sb
      .from('clinic_services')
      .select('price, currency')
      .eq('clinic_id', clinic.id)
      .not('price', 'is', null)
      .order('price', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (minRow?.price != null)    minPrice = Math.round(Number(minRow.price))
    if (minRow?.currency != null) minCurrency = String(minRow.currency)
  }

  const pick = (v?: string | null) => (v && v.trim() ? v.trim() : null);

  let addr: string | null =
    pick((clinic as any)?.address) ??
    pick((clinic as any)?.full_address) ??
    pick((clinic as any)?.address_en) ??
    pick((clinic as any)?.address_ru) ??
    pick((clinic as any)?.street_address) ??
    pick((clinic as any)?.location?.address) ??
    null;

  if (!addr && clinic?.id) {
    const { data: prof } = await sb
      .from('clinic_profiles')
      .select('address, address_en, address_ru, full_address, street')
      .eq('clinic_id', clinic.id)
      .maybeSingle();
    addr =
      pick(prof?.address) ??
      pick(prof?.full_address) ??
      pick(prof?.address_en) ??
      pick(prof?.address_ru) ??
      pick(prof?.street) ??
      addr;
  }

  if (!addr && clinic?.id) {
    const { data: draft } = await sb
      .from('clinic_profile_draft')
      .select('address, address_en, address_ru, full_address, street')
      .eq('clinic_id', clinic.id)
      .maybeSingle();
    addr =
      pick(draft?.address) ??
      pick(draft?.full_address) ??
      pick(draft?.address_en) ??
      pick(draft?.address_ru) ??
      pick(draft?.street) ??
      addr;
  }

  if (!addr && clinic?.slug) {
    const { data: row } = await sb
      .from('mv_catalog_clinics')
      .select('address')
      .eq('slug', clinic.slug)
      .maybeSingle();
    addr = pick(row?.address) ?? addr;
  }

  if (!addr && clinic) {
    const parts = [
      pick((clinic as any)?.address),
      pick(clinic.district),
      pick(clinic.city),
      pick(clinic.province),
      pick(clinic.country),
    ].filter(Boolean) as string[];
    if (parts.length) addr = parts.join(', ');
  }

  const canonical = clinic
    ? clinicPath({
        slug: clinic.slug,
        country: clinic.country,
        province: clinic.province ?? undefined,
        city: clinic.city ?? undefined,
        district: clinic.district ?? undefined,
      })
    : `/clinic/${encodeURIComponent(slug)}`

  const meta = buildClinicMetadata(canonical, {
    clinicName: clinic?.name ?? 'Clinic',
    location: {
      country: clinic?.country ?? undefined,
      city: clinic?.city ?? undefined,
      district: clinic?.district ?? undefined,
    },
    minPrice,
    address: addr,
    currency: minCurrency ?? undefined,
  })

  return { ...meta, alternates: { canonical: `${site}${canonical}` } }
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const clinic = await fetchClinicBySlug(slug)
  if (!clinic) return notFound()

  // Build canonical for JSON-LD
  const canonical = clinicPath({
    slug: clinic.slug,
    country: clinic.country,
    province: clinic.province ?? undefined,
    city: clinic.city ?? undefined,
    district: clinic.district ?? undefined,
  }) || `/clinic/${clinic.slug}`

  // Fetch combined rating for JSON-LD
  let combinedRating: number | null = null;
  let totalReviewCount: number | null = null;

  try {
    const sb = await (await import('@/lib/supabase/serverClient')).createServerClient()
    const { data: ratingRow } = await sb
      .from('v_clinic_rating')
      .select('combined_rating, total_review_count')
      .eq('clinic_id', clinic.id)
      .maybeSingle();

    combinedRating = ratingRow?.combined_rating ?? null;
    totalReviewCount = ratingRow?.total_review_count ?? null;
  } catch {
    // no-op — rating is optional for SEO
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalOrganization",
    name: clinic.name,
    url: `${site}${canonical}`,
    ...(combinedRating && totalReviewCount && totalReviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: combinedRating,
            bestRating: 5,
            ratingCount: totalReviewCount,
          },
        }
      : {}),
  };

  return (
    <>
      <Script
        id="clinic-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ClinicDetailPage clinic={clinic} />
    </>
  );
}