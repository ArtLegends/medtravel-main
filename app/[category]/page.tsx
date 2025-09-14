// app/[category]/page.tsx
import type { Metadata } from 'next'

// ⛔ снимаем Edge во избежание несовместимостей
export const runtime = 'nodejs'
// если у тебя мок/статичные данные — оставь static; если Supabase/живые запросы — поставь 'force-dynamic'
export const dynamic = 'force-static'

type Params = { category: string }

// ---------- безопасная загрузка данных ----------
async function getClinicsByCategorySafe(category: string) {
  // TODO: замени на свой реальный источник данных
  // Например, если у тебя мок:
  // const { clinicsByCategory } = await import('@/lib/mock/clinics')
  // return clinicsByCategory(category)

  // ВРЕМЕННО: проверим, что страница вообще живёт
  return { category, clinics: [] as any[] }
}

// ---------- SEO ----------
export async function generateMetadata(
  { params }: { params: Promise<Params> }
): Promise<Metadata> {
  const { category } = await params
  return {
    title: `MedTravel — ${category}`,
    description: `Clinics for ${category} on MedTravel`,
  }
}

// ---------- PAGE ----------
export default async function Page(
  { params }: { params: Promise<Params> }
) {
  try {
    const { category } = await params
    const data = await getClinicsByCategorySafe(category)

    // подставь свой компонент
    return (
      <main className="container mx-auto py-8">
        <h1 className="text-2xl font-semibold capitalize">{category}</h1>
        {/* твой контент с data.clinics */}
        <p className="text-gray-500 mt-2">Category page OK (SSR succeeded)</p>
      </main>
    )
  } catch (e) {
    // это уйдёт в Vercel -> Deployments -> Logs
    console.error('CATEGORY PAGE FATAL', e)
    // Пробросим ошибку, чтобы отрендерился app/error.tsx
    throw e
  }
}
