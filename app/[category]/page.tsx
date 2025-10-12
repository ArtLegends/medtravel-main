// app/[category]/page.tsx
import type { Metadata } from 'next'
import CategoryHero from '@/components/category/CategoryHero'
import CategoryWhy from '@/components/category/CategoryWhy'
import CategoryGrid from '@/components/category/CategoryGrid'
import { createServerClient } from '@/lib/supabase/serverClient'

export const revalidate = 60

type Params = { category: string }
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export async function generateMetadata(
  { params }: { params: Promise<Params> }
): Promise<Metadata> {
  const { category } = await params
  const title = `${cap(category)} Clinics | MedTravel`
  return {
    title,
    description: `Best ${category} clinics in popular destinations. Compare prices, read reviews and book a consultation.`,
    alternates: { canonical: `/${category}` },
    openGraph: { title, description: `Top ${category} clinics worldwide` },
  }
}

export default async function Page(
  { params }: { params: Promise<Params> }
) {
  const { category } = await params
  const slug = decodeURIComponent(category).toLowerCase()

  let titleName = cap(slug)
  try {
    const supabase = createServerClient()
    const { data: cat } = await supabase
      .from('categories')
      .select('name')
      .eq('slug', slug)
      .maybeSingle()
    if (cat?.name) titleName = cat.name
  } catch {}

  return (
    <>
      <CategoryHero title={`Best ${titleName} Clinics in Popular Destinations`} />
      <CategoryWhy />
      <CategoryGrid categorySlug={slug} />
    </>
  )
}
