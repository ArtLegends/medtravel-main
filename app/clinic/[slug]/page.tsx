// app/clinic/[slug]/page.tsx
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import ClinicDetailPage from '@/components/clinic/ClinicDetailPage'
import { fetchClinicBySlug } from '@/lib/db/clinics'
import { buildCategoryMetadata, buildClinicMetadata } from '@/lib/seo/meta'
import { createServerClient } from '@/lib/supabase/serverClient'

type Params = { slug: string }

export async function generateMetadata(
  { params }: { params: Promise<Params> }
): Promise<Metadata> {
  const { slug } = await params
  const sb = createServerClient()

  const { data: clinic } = await sb
    .from('mv_catalog_clinics') // или твоя таблица/вью
    .select('name, country, city, district, address, min_price')
    .eq('slug', slug)
    .maybeSingle()

  return buildClinicMetadata(`/clinic/${slug}`, {
    clinicName: clinic?.name ?? 'Clinic',
    location: { country: clinic?.country, city: clinic?.city, district: clinic?.district },
    minPrice: clinic?.min_price ?? null,
    address: clinic?.address ?? null,
  })
}

export default async function Page(
  { params }: { params: Promise<Params> }
) {
  const { slug } = await params
  const clinic = await fetchClinicBySlug(slug)
  if (!clinic) return notFound()
  return <ClinicDetailPage clinic={clinic} />
}
