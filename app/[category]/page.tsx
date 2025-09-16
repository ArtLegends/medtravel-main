// app/[category]/page.tsx
import type { Metadata } from 'next'
import { getClinicsByCategory } from '@/lib/mock/clinic'
import CategoryHero from '@/components/CategoryHero'
import CategoryWhy from '@/components/CategoryWhy'
import CategoryGrid from '@/components/CategoryGrid'
import { createServerClient } from '@/lib/supabase/serverClient'

export const revalidate = 60

type Params = { category: string }

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

// ----------- metadata -----------
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

// ----------- page -----------
export default async function Page(
  { params }: { params: Promise<Params> }
) {
  const { category } = await params
  const slug = decodeURIComponent(category).toLowerCase()

  // Мок-данные всегда доступны
  const mockItems = getClinicsByCategory(slug)

  // По умолчанию — название из slug
  let titleName = cap(slug)

  // Пытаемся подтянуть красивое имя из Supabase, но не падаем, если что-то не так
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = createServerClient()
      const { data: cat, error } = await supabase
        .from('categories')
        .select('name')
        .eq('slug', slug)
        .maybeSingle()
      if (!error && cat?.name) titleName = cat.name
    }
  } catch (e) {
    // Не шумим в UI — просто используем фолбэк
    console.error('[category] supabase lookup failed:', e)
  }

  return (
    <>
      <CategoryHero title={`Best ${titleName} Clinics in Popular Destinations`} />
      <CategoryWhy />
      {/* Компонент сам рисует карточки на клиенте по slug (или передайте mockItems, если нужно SSR) */}
      <CategoryGrid categorySlug={slug} />
    </>
  )
}
