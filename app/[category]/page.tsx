// app/[category]/page.tsx

import HeroCategory from "@/components/HeroCategory"
import WhyChooseUsCategory from "@/components/WhyChooseUsCategory"
import ClinicList from "@/components/ClinicList"
import { createServerClient } from "@/lib/supabase/serverClient"
import type { Clinic } from "@/lib/supabase/requests"
import CategoryContent from "@/components/CategoryContent"

export const revalidate = 3600

/**
 * Next.js 15: и params, и searchParams приходят в виде Promise
 */
type CategoryPageProps = {
  params: Promise<{ category: string }>
  searchParams: Promise<Record<string, string | string[]>>
}

export default async function CategoryPage({
  params,
  searchParams, // пусть висит, даже если не используешь
}: CategoryPageProps) {
  // распаковываем настоящий slug
  const { category: slug } = await params
  // если понадобятся query-параметры:
  // const qs = await searchParams

  const supabase = createServerClient()

  // 1) получаем саму категорию
  const { data: cat, error: catErr } = await supabase
    .from("categories")
    .select("id, name")
    .eq("slug", slug)
    .single()

  if (catErr || !cat) {
    return (
      <p className="container mx-auto py-20 text-center">
        Category not found
      </p>
    )
  }

  // 2) все клиники в этой категории
  const { data: rows, error: rowsErr } = await supabase
    .from("clinic_categories")
    .select(
      `
      clinic:clinic_id (
        id,
        name,
        slug,
        about,
        address,
        country,
        city,
        province,
        district
      )
    `
    )
    .eq("category_id", cat.id)

  if (rowsErr) {
    console.error(rowsErr)
    return (
      <p className="container mx-auto py-20 text-center">
        Error loading clinics
      </p>
    )
  }

  // 3) приводим к нашему типу Clinic
  function isClinic(obj: any): obj is Clinic {
    return (
      obj &&
      typeof obj.id === "string" &&
      typeof obj.name === "string" &&
      typeof obj.slug === "string" &&
      typeof obj.country === "string" &&
      typeof obj.province === "string" &&
      typeof obj.city === "string" &&
      typeof obj.district === "string"
    )
  }

  const clinicList: Clinic[] = Array.isArray(rows)
    ? rows
        .map((r) => r.clinic as any)
        .filter((c) => c && !Array.isArray(c) && isClinic(c))
        .map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          about: c.about,
          country: c.country,
          city: c.city,
          province: c.province,
          district: c.district,
          services: [],
        }))
    : []

  return (
    <>
      <HeroCategory
        title={`Best Treatments Clinics in ${cat.name}`}
        buttonLabel="Receive a Personalized Offer on Us"
        buttonHref="#contact-form"
        backgroundUrl="https://your.cdn.example.com/category-bg.jpg"
      />

      <WhyChooseUsCategory />

      <section className="container mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <h2 className="text-3xl lg:text-4xl font-bold mb-2">
            Best Treatments Clinics in {cat.name}
          </h2>
          <p className="text-gray-600 mb-8 max-w-prose">
            MedTravel.me’s clinic rating is shaped by various factors…
          </p>

          <CategoryContent categoryId={cat.id} />
        </div>

        <aside className="lg:col-span-1 space-y-8">
          {/* сюда можно вставить SearchSection и пр. */}
          <ClinicList clinics={clinicList} />
        </aside>
      </section>
    </>
  )
}
