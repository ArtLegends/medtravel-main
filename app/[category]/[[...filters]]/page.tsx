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

type Params = {
  category: string;
  filters?: string[];
};

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/* ---------------- METADATA ---------------- */

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { category, filters } = await params;

  const slug = decodeURIComponent(category).toLowerCase();
  const segments = Array.isArray(filters) ? filters.map(decodeURIComponent) : [];

  const sb = await createServerClient();

  const { data: cat } = await sb
    .from("categories")
    .select("id,name,name_ru,name_pl")
    .eq("slug", slug)
    .maybeSingle();

  const urlPath = "/" + [slug, ...segments].filter(Boolean).join("/");

  if (!cat) {
    const base = buildCategoryMetadata(urlPath, { categoryLabelEn: cap(slug) });
    return {
      ...base,
      alternates: { canonical: urlPath },
      openGraph: { ...(base.openGraph as any), url: urlPath },
    };
  }

  let resolved: any = {
    location: null,
    treatmentLabel: null,
    matchedServiceSlugs: [],
    locationSlugs: [],
    subcatSlugs: [],
    hasExtraSegments: false,
  };

  try {
    resolved = await resolveCategoryRouteOnServer(sb, {
      categoryId: cat.id,
      categorySlug: slug,
      segments,
    });
  } catch {}

  // если в URL есть хвост, который не распарсили — noindex (SEO-чистота)
  const consumedPath = "/" + [slug, ...(resolved.locationSlugs ?? []), ...(resolved.subcatSlugs ?? [])].join("/");
  const hasExtra = Boolean(resolved.hasExtraSegments);

  const base = resolved.treatmentLabel
    ? buildTreatmentMetadata(consumedPath, {
        treatmentLabel: resolved.treatmentLabel,
        location: resolved.location,
      })
    : buildCategoryMetadata(consumedPath, {
        categoryLabelEn: cat.name ?? cap(slug),
        categoryLabelRu: (cat as any).name_ru ?? cat.name ?? cap(slug),
        categoryLabelPl: (cat as any).name_pl ?? cat.name ?? cap(slug),
        location: resolved.location,
      });

  return {
    ...base,
    alternates: { canonical: consumedPath },
    robots: hasExtra ? { index: false, follow: true } : undefined,
    openGraph: { ...(base.openGraph as any), url: consumedPath },
  };
}


/* ---------------- PAGE ---------------- */

export default async function Page({
  params,
}: {
  params: Promise<Params>;
}) {
  const { category, filters } = await params;

  const slug = decodeURIComponent(category).toLowerCase();
  const initialPath = Array.isArray(filters) ? filters : [];

  const sb = await createServerClient();
  const { data: cat, error } = await sb
  .from("categories")
  .select("id,name")
  .eq("slug", slug)
  .maybeSingle();

  if (error) {
  return (
    <pre style={{ padding: 16, whiteSpace: "pre-wrap" }}>
      categories query error: {JSON.stringify(error, null, 2)}
    </pre>
  );
}

if (!cat) {
  return (
    <pre style={{ padding: 16, whiteSpace: "pre-wrap" }}>
      category not found by slug="{slug}"
    </pre>
  );
}

  const titleName = cat.name || cap(slug);

  return (
    <>
      <CategoryHero
        title={`Best ${titleName} Clinics in Popular Destinations`}
        categoryName={titleName}
      />
      <CategoryWhy />
      <CategoryGrid
        categorySlug={slug}
        categoryName={titleName}
        initialPath={initialPath}
      />
    </>
  );
}
