// app/clinic/[slug]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ClinicDetailPage from '@/components/clinic/ClinicDetailPage'
import { fetchClinicBySlug } from '@/lib/db/clinics'
import { buildClinicMetadata } from '@/lib/seo/meta'
import { createServerClient } from '@/lib/supabase/serverClient'
import type { SeoClinicMeta } from '@/lib/db/types'
import { clinicPath } from '@/lib/clinic-url'

type Params = { slug: string }

export async function generateMetadata(
  { params }: { params: Promise<Params> }
): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createServerClient()

  // читаем легковесные поля из представления
  const { data: clinic } = await supabase
    .from('mv_catalog_clinics')
    .select('slug,name,country,province,city,district,address,min_price,min_price_currency')
    .eq('slug', slug)
    .maybeSingle<SeoClinicMeta>()

  // формируем канонический URL
  const canonical = clinic
    ? clinicPath({
        slug: clinic.slug,
        country: clinic.country,
        province: clinic.province || undefined,
        city: clinic.city || undefined,
        district: clinic.district || undefined,
      })
    : `/clinic/${slug}`

  const meta = buildClinicMetadata(canonical, {
    clinicName: clinic?.name ?? 'Clinic',
    location: {
      country: clinic?.country ?? undefined,
      city: clinic?.city ?? undefined,
      district: clinic?.district ?? undefined,
    },
    minPrice: clinic?.min_price ?? null,
    address: clinic?.address ?? null,
  })

  // дублируем canonical
  const site =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '') ?? 'https://medtravel.me'

  return {
    ...meta,
    alternates: { canonical: `${site}${canonical}` },
  }
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const clinic = await fetchClinicBySlug(slug) // твоя полная карточка для рендера
  if (!clinic) return notFound()
  return <ClinicDetailPage clinic={clinic} />
}
