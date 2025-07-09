// app/page.tsx
import { getAllCategories } from '@/lib/supabase/requests'
import CategoryCard from '@/components/CategoryCard'
import SearchSection from "@/components/SearchSection"


export const revalidate = 3600

export default async function HomePage() {
  const categories = await getAllCategories()
  return <SearchSection categories={categories} />
}