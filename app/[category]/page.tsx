// app/[category]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import CategoryHero from '@/components/category/CategoryHero'
import CategoryWhy from '@/components/category/CategoryWhy'
import CategoryGrid from '@/components/category/CategoryGrid'
import { createServerClient } from '@/lib/supabase/serverClient'
import { buildCategoryMetadata, buildTreatmentMetadata } from '@/lib/seo/meta'

export const revalidate = 60

type Params = { category: string }
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

// helper: вытянуть популярные фасеты по категории
async function popularLocationForCategory(slug: string) {
  const sb = await createServerClient()
  const { data } = await sb.rpc('catalog_browse_basic', {
    p_category_slug: slug,
    p_country: null,
    p_province: null,
    p_city: null,
    p_district: null,
    p_service_slugs: null,
    p_sort: 'name_asc',
    p_limit: 0,
    p_offset: 0,
  })

  const row = Array.isArray(data) ? data[0] : data
  const cities = (row?.facets?.cities ?? []) as string[]
  const countries = (row?.facets?.countries ?? []) as string[]
  return {
    country: countries?.[0],
    city: cities?.[0],
    district: undefined as string | undefined,
  }
}

async function serviceLabels(
  sb: Awaited<ReturnType<typeof createServerClient>>,
  slugs: string[],
) {
  if (slugs.length === 0) return {}
  const { data } = await sb.from('services').select('slug,name').in('slug', slugs)
  const map: Record<string, string> = {}
  for (const row of data ?? []) map[row.slug] = row.name
  return map
}

export async function generateMetadata(
  { params, searchParams }: {
    params: Promise<Params>;
    searchParams: Promise<Record<string, string | string[]>>;
  },
): Promise<Metadata> {
  const { category } = await params
  const sp = await searchParams
  const slug = decodeURIComponent(category).toLowerCase()

  const sb = await createServerClient()
  const { data: cat } = await sb
    .from('categories')
    .select('name, name_ru, name_pl')
    .eq('slug', slug)
    .maybeSingle()

  // 👇 если категории нет — это 404
  if (!cat) {
    notFound()
  }

  let nameEn = cat.name || cap(slug)
  let nameRu = cat.name_ru || nameEn
  let namePl = cat.name_pl || nameEn

  // фильтры из URL
  const city = typeof sp.city === 'string' ? sp.city : undefined
  const country = typeof sp.country === 'string' ? sp.country : undefined
  const district = typeof sp.district === 'string' ? sp.district : undefined

  const hasAnyLocation = !!(country || city || district)
  const rawServices = Array.isArray(sp.service)
    ? sp.service.join(',').split(',').filter(Boolean)
    : (typeof sp.service === 'string'
      ? sp.service.split(',').filter(Boolean)
      : [])

  const fallbackLoc = await popularLocationForCategory(slug)
  const effLoc = hasAnyLocation ? { country, city, district } : fallbackLoc

  // --------------------- чистая категория, без service ---------------------
  if (rawServices.length === 0) {
    return buildCategoryMetadata(`/${slug}`, {
      categoryLabelEn: nameEn,
      categoryLabelRu: nameRu,
      categoryLabelPl: namePl,
      location: hasAnyLocation ? effLoc : undefined,
    })
  }

  // --------------------- есть конкретная процедура(ы) ---------------------
  const dict = await serviceLabels(sb, rawServices)
  const labels = rawServices.map((s) => dict[s] ?? s.replace(/-/g, ' '))
  const treatmentLabel =
    labels.length === 1 ? labels[0] : `${labels[0]} + ${labels.length - 1} more`

  let min: number | null = null
  let max: number | null = null
  let currency: string | undefined

  try {
    const { data } = await sb.rpc('seo_treatment_price_range', {
      p_category_slug: slug,
      p_service_slugs: rawServices.length ? rawServices : null,
      p_city: null,
      p_country: null,
      p_district: null,
    })

    const row = Array.isArray(data) ? data[0] : data
    if (row?.min != null) min = Math.round(Number(row.min))
    if (row?.max != null) max = Math.round(Number(row.max))

    currency =
      (row &&
        (row.currency ??
          row.currency_code ??
          row.min_currency ??
          row.max_currency)) || undefined

    if (!currency && rawServices.length > 0) {
      const firstSlug = rawServices[0]

      const { data: serviceRow } = await sb
        .from('services')
        .select('id')
        .eq('slug', firstSlug)
        .maybeSingle()

      if (serviceRow?.id) {
        const { data: csRow } = await sb
          .from('clinic_services')
          .select('currency')
          .eq('service_id', serviceRow.id)
          .not('currency', 'is', null)
          .limit(1)
          .maybeSingle()

        if (csRow?.currency) {
          currency = String(csRow.currency)
        }
      }
    }
  } catch {
    // оставляем min/max/currency как есть
  }

  return buildTreatmentMetadata(`/${slug}`, {
    treatmentLabel,
    location: effLoc,
    minPrice: min,
    maxPrice: max,
    currency,
  })
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { category } = await params
  const slug = decodeURIComponent(category).toLowerCase()

  const sb = await createServerClient()
  const { data: cat } = await sb
    .from('categories')
    .select('name')
    .eq('slug', slug)
    .maybeSingle()

  // 👇 ещё одна защита: если нет категории — 404
  if (!cat) {
    notFound()
  }

  const titleName = cat.name || cap(slug)

  return (
    <>
      <CategoryHero
        title={`Best ${titleName} Clinics in Popular Destinations`}
        categoryName={titleName}
      />
      <CategoryWhy />
      <CategoryGrid categorySlug={slug} categoryName={titleName} />
    </>
  )
}
