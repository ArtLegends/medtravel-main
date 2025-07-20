// app/[clinic]/page.tsx
import { createServerClient } from '@/lib/supabase/serverClient'
import ClinicDetail from '@/components/ClinicDetail'
import type { Category } from '@/lib/supabase/requests'

interface Props {
   params: {
     category: string;
     country:  string;
     province: string;
     city:     string;
     district: string;
     clinic:   string;
   };
}

export const revalidate = 3600

export default async function ClinicPage({ params }: Props) {
  const supabase = createServerClient()

  // 1) Основные данные
  const { data: clinic, error: clinicErr } = await supabase
    .from('clinics')
    .select(`
  id,
  name,
  slug,
  about,
  country,
  city,
  province,
  district,
  cover_url,
  services,
  websites,
  phone,
  email
`)
    .eq('slug', params.clinic)
    .single()
  if (clinicErr || !clinic) return <p>Клиника не найдена</p>

  // 2) Категории
  interface ClinicCategory { categories: Category[] }

  // не указываем дженерик в .from(), получаем data с типом any[]
  const { data: rawCcats } = await supabase
    .from('clinic_categories')
    .select('categories(id, name, slug)')
    .eq('clinic_id', clinic.id)

  // приводим результат к нужной нам форме
  const ccats = (rawCcats ?? []) as ClinicCategory[]

  // расплющиваем вложенные массивы в один
  const categories = ccats.flatMap(c => c.categories)

  // 3) Языки
  const { data: langs } = await supabase
    .from('clinic_languages')
    .select('language')
    .eq('clinic_id', clinic.id)

  // 4) Аккредитации
  const { data: accs } = await supabase
    .from('clinic_accreditations')
    .select('accreditation')
    .eq('clinic_id', clinic.id)

  // 5) Отзывы
  const { data: reviews } = await supabase
    .from('reviews')
    .select('id, author_name, rating, text, created_at')
    .eq('clinic_id', clinic.id)
    .order('created_at', { ascending: false })

  return (
    <ClinicDetail
      clinic={clinic}
      categories={categories}
      languages={langs?.map(l => l.language) ?? []}
      accreditations={accs?.map(a => a.accreditation) ?? []}
      reviews={reviews ?? []}
    />
  )
}
