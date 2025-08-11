// app/[category]/page.tsx
import { notFound } from 'next/navigation'
import CategoryClient from '@/components/CategoryClient'
import { getPublicClient } from '@/lib/supabase/publicClient'

type PageProps = {
  params: Promise<{ category: string }>
}

export const revalidate = 600

export default async function CategoryPage({ params }: PageProps) {
  const { category: slug } = await params
  const supabase = getPublicClient()

  // 1) категория по slug
  const { data: cat, error: catErr } = await supabase
    .from('categories')
    .select('id,name,slug')
    .eq('slug', slug)
    .maybeSingle()

  if (catErr) console.error('category by slug error', catErr)
  if (!cat) return notFound()

  // 2) клиники через inner join со связкой clinic_categories
  const { data: clinicsRaw, error: clErr } = await supabase
    .from('clinics')
    .select(`
      id, name, slug, country, province, city, district, cover_url,
      clinic_categories!inner(category_id)
    `)
    .eq('clinic_categories.category_id', cat.id)
    .order('name', { ascending: true })
    .limit(60)

  if (clErr) console.error('clinics by category error', clErr)

  // 3) приведение к формату CategoryClient
  const clinics = (clinicsRaw ?? []).map((c: any) => ({
    id: c.id,
    name: c.name,
    description: c.about ?? null,
    slug: c.slug,
    country: c.country ?? '',
    province: c.province ?? '',
    city: c.city ?? '',
    district: c.district ?? '',
    cover_url: c.cover_url ?? null,
    services: [],
  }))

  return <CategoryClient cat={cat} clinics={clinics} />
}
