// app/[category]/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { clinics as ALL_CLINICS, getClinicsByCategory } from '@/lib/mock/clinic'

import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase/serverClient";
import CategoryHero from "@/components/CategoryHero";
import CategoryWhy from "@/components/CategoryWhy";
import CategoryGrid from "@/components/CategoryGrid";

export const revalidate = 60;

// вспомогалки
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

type Params = { category: string }

// ----------- metadata -----------
export async function generateMetadata(
  { params }: { params: Promise<Params> }
): Promise<Metadata> {
  const { category } = await params
  const title = `${capitalize(category)} Clinics | MedTravel`
  return {
    title,
    description: `Best ${category} clinics in popular destinations. Compare prices, read reviews and book a consultation.`,
    alternates: { canonical: `/${category}` },
    openGraph: {
      title,
      description: `Top ${category} clinics worldwide`,
    },
  }
}

// ----------- page -----------
export default async function Page(
  { params }: { params: Promise<{ category: string }> }
) {
  const { category } = await params
  const items = getClinicsByCategory(category)
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
  )
}



