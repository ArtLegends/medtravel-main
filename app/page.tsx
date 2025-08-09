// app/page.tsx
import Hero from '@/components/Hero'
import WhyChooseUs from '@/components/WhyChooseUs'
import Process from '@/components/Process'
import ReviewsSection from '@/components/ReviewsSection'
import ContactFormSection from '@/components/ContactFormSection'
import { Category, getAllCategories } from '@/lib/supabase/requests'

export const revalidate = 3600

export default async function HomePage() {
  let categories: Category[] = []
  try {
    categories = await getAllCategories()   // внутри — select id,name,slug order by name
  } catch (e) {
    console.error('getAllCategories()', e)
  }

  return (
    <>
      <Hero />
      <p className="text-center text-sm text-gray-500">
        categories: {categories.length}
      </p>
      <WhyChooseUs categories={categories} />
      {/* Если нужна поисковая секция — раскомментируй */}
      {/* <SearchSection categories={categories} /> */}
      <Process />
      <ReviewsSection />
      <ContactFormSection />
    </>
  )
}