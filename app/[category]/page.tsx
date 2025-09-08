// app/[category]/page.tsx
import { notFound } from 'next/navigation'
import CategoryClient from '@/components/CategoryClient'
import { createServerClient } from '@/lib/supabase/serverClient'
import CategoryHero from "@/components/CategoryHero";
import CategoryWhy from "@/components/CategoryWhy";
import CategoryGrid from "@/components/CategoryGrid";

export const revalidate = 60
// при необходимости можно принудительно отключить кэширование:
// export const dynamic = 'force-dynamic'

// type Params = { params: { category: string } }

// export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
//   const { category } = await params;                     // <-- await params
//   const slug = decodeURIComponent(category);
//   const supabase = createServerClient()

//   // 1) Категория по slug
//   const { data: cat, error: catErr } = await supabase
//     .from('categories')
//     .select('id, name, slug')
//     .eq('slug', slug)
//     .maybeSingle()

//   if (catErr || !cat) {
//     console.error('category load error', catErr)
//     return notFound()
//   }

//   // 2) Клиники через таблицу-связку clinic_categories
//   const { data: rows, error: joinErr } = await supabase
//     .from('clinic_categories')
//     .select(`
//       clinics (
//         id,
//         name,
//         slug,
//         country,
//         province,
//         city,
//         district,
//         cover_url
//       )
//     `)
//     .eq('category_id', cat.id)

//   if (joinErr) {
//     console.error('clinic_categories join error', joinErr)
//   }

//   const clinics =
//     (rows ?? [])
//       .map((r: any) => r.clinics)
//       .filter(Boolean)
//       // наш ClinicCard ждёт services; подставим пустой массив, если его нет
//       .map((c: any) => ({ ...c, services: Array.isArray(c.services) ? c.services : [] }))

//   return <CategoryClient categorySlug={category} />;
// }



export default async function CategoryPage(
  { params }: { params: Promise<{ category: string }> }
) {
  const { category } = await params;
  const slug = decodeURIComponent(category);

  const supabase = createServerClient();
  const { data: cat } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("slug", slug)
    .maybeSingle();

  if (!cat) return notFound();

  return (
    <>
      <CategoryHero title={`Best ${cat.name} Clinics in Popular Destinations`} />
      <CategoryWhy />
      <CategoryGrid categorySlug={slug} />
    </>
  );
}