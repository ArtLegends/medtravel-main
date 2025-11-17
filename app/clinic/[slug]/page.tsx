// app/clinic/[slug]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ClinicDetailPage from '@/components/clinic/ClinicDetailPage'
import { fetchClinicBySlug } from '@/lib/db/clinics'
import { buildClinicMetadata } from '@/lib/seo/meta'
// import { createServerClient } from '@/lib/supabase/serverClient'
// import type { SeoClinicMeta } from '@/lib/db/types'
import { clinicPath } from '@/lib/clinic-url'
// import { createServiceClient } from '@/lib/supabase/serviceClient'

type Params = { slug: string }

export async function generateMetadata(
  { params }: { params: Promise<Params> }
): Promise<Metadata> {
  const { slug } = await params

  // 1) та же сущность, которой рендеришь страницу
  const clinic = await fetchClinicBySlug(slug)

  // 2) добираем minPrice и адрес из доступных источников
  const sb = await (await import('@/lib/supabase/serverClient')).createServerClient()

  // 2.1 min(price) из clinic_services
  let minPrice: number | null = null
  if (clinic?.id) {
    const { data: minRow } = await sb
      .from('clinic_services')
      .select('price')
      .eq('clinic_id', clinic.id)
      .not('price', 'is', null)
      .order('price', { ascending: true })
      .limit(1)
      .maybeSingle()
    if (minRow?.price != null) minPrice = Math.round(Number(minRow.price))
  }

  // 2.2 адрес: пробуем набор возможных полей + профили
  const pick = (v?: string | null) => (v && v.trim() ? v.trim() : null);

  let addr: string | null =
    pick((clinic as any)?.address) ??
    pick((clinic as any)?.full_address) ??
    pick((clinic as any)?.address_en) ??
    pick((clinic as any)?.address_ru) ??
    pick((clinic as any)?.street_address) ??
    pick((clinic as any)?.location?.address) ?? // <-- берём адрес из JSON location, если есть
    null;

  // живой профиль
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

  // черновик профиля (если есть)
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

  // view как запасной вариант
  if (!addr && clinic?.slug) {
    const { data: row } = await sb
      .from('mv_catalog_clinics')
      .select('address')
      .eq('slug', clinic.slug)
      .maybeSingle();
    addr = pick(row?.address) ?? addr;
  }

  // самый последний fallback — только когда реального строки адреса нет
  if (!addr && clinic) {
    const parts = [
      pick((clinic as any)?.address), // вдруг строкой вернётся
      pick(clinic.district),
      pick(clinic.city),
      pick(clinic.province),
      pick(clinic.country),
    ].filter(Boolean) as string[];
    if (parts.length) addr = parts.join(', ');
  }

  // 3) каноникал из реальной локации
  const canonical = clinic
    ? clinicPath({
        slug: clinic.slug,
        country: clinic.country,
        province: clinic.province ?? undefined,
        city: clinic.city ?? undefined,
        district: clinic.district ?? undefined,
      })
    : `/clinic/${encodeURIComponent(slug)}`

  // 4) SEO
  const meta = buildClinicMetadata(canonical, {
    clinicName: clinic?.name ?? 'Clinic',
    location: {
      country: clinic?.country ?? undefined,
      city: clinic?.city ?? undefined,
      district: clinic?.district ?? undefined,
    },
    minPrice,
    address: addr, // ← теперь гарантированно пробуем вывести
  })

  const site = (process.env.NEXT_PUBLIC_SITE_URL || 'https://medtravel.me').replace(/\/+$/, '')
  return { ...meta, alternates: { canonical: `${site}${canonical}` } }
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const clinic = await fetchClinicBySlug(slug)
  if (!clinic) return notFound()
  return <ClinicDetailPage clinic={clinic} />
}