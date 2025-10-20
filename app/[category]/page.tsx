// app/[category]/page.tsx
import type { Metadata } from 'next'
import CategoryHero from '@/components/category/CategoryHero'
import CategoryWhy from '@/components/category/CategoryWhy'
import CategoryGrid from '@/components/category/CategoryGrid'
import { createClient } from '@/lib/supabase/serverClient'
import { buildCategoryMetadata } from '@/lib/seo/meta'

export const revalidate = 60

type Params = { category: string }
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export async function generateMetadata(
  { params }: { params: Promise<Params> }
): Promise<Metadata> {
  const { category } = await params
  const slug = decodeURIComponent(category).toLowerCase()

  // Пытаемся достать мультиязычное имя категории (если есть колонки name_en/name_ru/name_pl)
  let nameEn = cap(slug)
  let nameRu = cap(slug)
  let namePl = cap(slug)

  try {
    const supabase = createClient()
    const { data: cat } = await supabase
      .from('categories')
      .select('name, name_ru, name_pl')
      .eq('slug', slug)
      .maybeSingle()

    if (cat?.name)   nameEn = cat.name
    if (cat?.name_ru) nameRu = cat.name_ru
    if (cat?.name_pl) namePl = cat.name_pl
  } catch {}

  // Локация — если есть у тебя «текущий фильтр», можно подставлять
  const location = { country: 'Turkey', city: 'Istanbul', district: undefined } // <- пример, подставляй реальные данные

  return buildCategoryMetadata(`/${slug}`, {
    categoryLabelEn: nameEn,
    categoryLabelRu: nameRu,
    categoryLabelPl: namePl,
    location,
  })
}

export default async function Page(
  { params }: { params: Promise<Params> }
) {
  const { category } = await params
  const slug = decodeURIComponent(category).toLowerCase()

  let titleName = cap(slug);
  try {
    const supabase = createClient()
    const { data: cat } = await supabase
      .from('categories')
      .select('name')
      .eq('slug', slug)
      .maybeSingle()
    if (cat?.name) titleName = cat.name
  } catch {}

  return (
    <>
      <CategoryHero
        title={`Best ${titleName} Clinics in Popular Destinations`}
        categoryName={titleName}
      />
      <CategoryWhy />
      <CategoryGrid categorySlug={slug} />
    </>
  )
}
