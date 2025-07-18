// app/page.tsx
import Hero from '@/components/Hero'
import WhyChooseUs from '@/components/WhyChooseUs'
import Process from '@/components/Process'
import ReviewsSection from '@/components/ReviewsSection'
import ContactFormSection from '@/components/ContactFormSection'
import { getAllCategories } from '@/lib/supabase/requests'
import CategoryCard from '@/components/CategoryCard'
import SearchSection from "@/components/SearchSection"


export const revalidate = 3600

export default async function HomePage() {
  // получаем список категорий
  const categories = await getAllCategories()

  return (
    <>
      {/* 1. Hero */}
      <Hero />

      {/* Секция Why Choose Us */}
      <WhyChooseUs categories={categories} />

      {/* 2. Ниже идёт SearchSection,
             которая при пустом query выдаёт карточки категорий */}
      {/* <SearchSection categories={categories} /> */}

      {/* 3. Компонент Process */}
      <Process />

      {/* 4. Секция с карточками категорий */}        
      <ReviewsSection />

      <ContactFormSection />
    </>
  )
}