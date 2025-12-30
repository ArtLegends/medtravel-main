// app/[category]/[[...filters]]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import CategoryHero from "@/components/category/CategoryHero";
import CategoryWhy from "@/components/category/CategoryWhy";
import CategoryGrid from "@/components/category/CategoryGrid";
import { createServerClient } from "@/lib/supabase/serverClient";
import { buildCategoryMetadata, buildTreatmentMetadata } from "@/lib/seo/meta";
import { resolveCategoryRouteOnServer } from "@/lib/category-route/resolve";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Params = { category: string; filters?: string[] };

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { category, filters } = await params;
  const slug = decodeURIComponent(category).toLowerCase();
  const segments = Array.isArray(filters) ? filters : [];

  const sb = await createServerClient();

  const { data: cat } = await sb
    .from("categories")
    .select("id,name,name_ru,name_pl")
    .eq("slug", slug)
    .maybeSingle();

  if (!cat) return buildCategoryMetadata(`/${slug}`, { categoryLabelEn: cap(slug) });

  // resolve: location + chosen subcategory label + matched service slugs
  const resolved = await resolveCategoryRouteOnServer(sb, {
    categoryId: cat.id,
    categorySlug: slug,
    segments,
  });

  // если выбрана подкатегория (любая глубина) — считаем это Treatment meta
  if (resolved.treatmentLabel) {
    // при желании можно посчитать min/max price range по matchedServiceSlugs + loc
    return buildTreatmentMetadata(`/${slug}`, {
      treatmentLabel: resolved.treatmentLabel,
      location: resolved.location,
      // minPrice/maxPrice/currency можно подтянуть как раньше (по rpc), но уже с province/district
    });
  }

  return buildCategoryMetadata(`/${slug}`, {
    categoryLabelEn: cat.name ?? cap(slug),
    categoryLabelRu: (cat as any).name_ru ?? cat.name ?? cap(slug),
    categoryLabelPl: (cat as any).name_pl ?? cat.name ?? cap(slug),
    location: resolved.location,
  });
}

export default async function Page({
  params,
}: {
  params: Promise<Params>;
}) {
  const { category } = await params;
  const slug = decodeURIComponent(category).toLowerCase();

  const sb = await createServerClient();
  const { data: cat } = await sb
    .from("categories")
    .select("id,name")
    .eq("slug", slug)
    .maybeSingle();

  if (!cat) notFound();

  const titleName = cat.name || cap(slug);

  return (
    <>
      <CategoryHero
        title={`Best ${titleName} Clinics in Popular Destinations`}
        categoryName={titleName}
      />
      <CategoryWhy />
      <CategoryGrid categorySlug={slug} categoryName={titleName} />
    </>
  );
}
