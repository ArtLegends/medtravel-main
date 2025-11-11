// app/[category]/page.tsx
import type { Metadata } from 'next'
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
    p_country: null, p_province: null, p_city: null, p_district: null,
    p_service_slugs: null, p_sort: 'name_asc', p_limit: 0, p_offset: 0,
  })

  const row = Array.isArray(data) ? data[0] : data
  const cities = (row?.facets?.cities ?? []) as string[]
  const countries = (row?.facets?.countries ?? []) as string[]
  return {
    country: countries?.[0], // напр. 'Turkey'
    city: cities?.[0],       // напр. 'Istanbul'
    district: undefined as string | undefined,
  }
}

async function serviceLabels(sb: Awaited<ReturnType<typeof createServerClient>>, slugs: string[]) {
  if (slugs.length === 0) return {}
  const { data } = await sb.from('services').select('slug,name').in('slug', slugs)
  const map: Record<string,string> = {}
  for (const row of (data ?? [])) map[row.slug] = row.name
  return map
}

export async function generateMetadata(
  { params, searchParams }: { params: Promise<Params>; searchParams: Promise<Record<string, string | string[]>> }
): Promise<Metadata> {
  const { category } = await params
  const sp = await searchParams
  const slug = decodeURIComponent(category).toLowerCase()

  // читаем ярлыки категории
  let nameEn = cap(slug), nameRu = cap(slug), namePl = cap(slug)
  try {
    const sb = await createServerClient()
    const { data: cat } = await sb
      .from('categories')
      .select('name, name_ru, name_pl')
      .eq('slug', slug)
      .maybeSingle()
    if (cat?.name)    nameEn = cat.name
    if (cat?.name_ru) nameRu = cat.name_ru
    if (cat?.name_pl) namePl = cat.name_pl
  } catch {}

  // фильтры из URL
  const city = typeof sp.city === 'string' ? sp.city : undefined
  const country = typeof sp.country === 'string' ? sp.country : undefined
  const district = typeof sp.district === 'string' ? sp.district : undefined
  const loc = { country, city, district }

  const hasAnyLocation = !!(country || city || district)
  const rawServices = Array.isArray(sp.service)
    ? sp.service.join(',').split(',').filter(Boolean)
    : (typeof sp.service === 'string' ? sp.service.split(',').filter(Boolean) : [])

  // если нет локации — берём популярную по категории (для стабильных цен/локали)
  const fallbackLoc = await popularLocationForCategory(slug)
  const effLoc = hasAnyLocation ? { country, city, district } : fallbackLoc

  if (rawServices.length === 0) {
    return buildCategoryMetadata(`/${slug}`, {
      categoryLabelEn: nameEn,
      categoryLabelRu: nameRu,
      categoryLabelPl: namePl,
      location: effLoc,
    })
  }

  // есть конкретная процедура(ы)
  const sb = await createServerClient()
  const dict = await serviceLabels(sb, rawServices)
  const labels = rawServices.map(s => dict[s] ?? s.replace(/-/g, ' '))
  const treatmentLabel = labels.length === 1 ? labels[0] : `${labels[0]} + ${labels.length - 1} more`

  // диапазон цен для выбранной/подставленной локации
  let min: number | null = null
  let max: number | null = null
  try {
    const { data } = await (await createServerClient())
      .rpc('seo_treatment_price_range', {
        p_category_slug: slug,             // по сигнатуре, но игнорится
        p_service_slugs: rawServices.length ? rawServices : null,
        p_city:     null,
        p_country:  null,
        p_district: null,
      })

    const row = Array.isArray(data) ? data[0] : data
    if (row?.min != null) min = Math.round(Number(row.min))
    if (row?.max != null) max = Math.round(Number(row.max))
  } catch {}

  return buildTreatmentMetadata(`/${slug}`, {
    treatmentLabel,
    location: effLoc,   // ← благодаря effLoc в title/desc не будет "Popular Destinations"
    minPrice: min,
    maxPrice: max,
    currency: '€',
  })
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { category } = await params
  const slug = decodeURIComponent(category).toLowerCase()

  let titleName = cap(slug)
  try {
    const sb = await createServerClient()
    const { data: cat } = await sb.from('categories').select('name').eq('slug', slug).maybeSingle()
    if (cat?.name) titleName = cat.name
  } catch {}

  return (
    <>
      <CategoryHero title={`Best ${titleName} Clinics in Popular Destinations`} categoryName={titleName} />
      <CategoryWhy />
      <CategoryGrid categorySlug={slug} />
    </>
  )
}
