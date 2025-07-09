// app/[category]/page.tsx
import { createServerClient } from '@/lib/supabase/serverClient'
import CategoryClient from '@/components/CategoryClient'
import CategoryFilters from '@/components/CategoryFilters'

export const revalidate = 3600

interface Props {
  params: {
    category: string
    country: string
    province: string
    city: string
    district: string
  }
}

export default async function CategoryPage({ params }: Props) {
  // асинхронно распаковываем slug
  const { category: slug } = await params

  const supabase = createServerClient()

  // 0) находим саму категорию по slug
  const { data: cat, error: catErr } = await supabase
    .from('categories')
    .select('id, name')
    .eq('slug', slug)
    .single()
  if (catErr) throw catErr

  // 1) вытягиваем связи clinic_categories → получаем список numeric ID клиник
  const { data: links, error: linkErr } = await supabase
    .from('clinic_categories')
    .select('clinic_id')
    .eq('category_id', cat.id)      // здесь именно numeric ID
  if (linkErr) throw linkErr

  const clinicIds = (links || []).map(l => l.clinic_id)
  if (clinicIds.length === 0) {
    return <p>Нет клиник в этой категории</p>
  }

  // 2) вытягиваем сами клиники по списку ID
  const { data: clinics, error: clinicsErr } = await supabase
    .from('clinics')
    .select(`
      id, name, slug, country, province, city, district, cover_url, services
    `)
    .in('id', clinicIds)
    .eq('published', true)
  if (clinicsErr) throw clinicsErr

  // 3) рендерим клиентскую часть
  return <CategoryClient cat={cat} clinics={clinics || []} />
}
