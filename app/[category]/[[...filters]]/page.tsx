import type { Metadata } from "next";

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
  // ВАЖНО: filters может прийти как string (если 1 сегмент), либо как string[]
  params: { category: string; filters?: string | string[] };
}): Promise<Metadata> {
  const { category, filters } = params;

  const slug = decodeURIComponent(category).toLowerCase();

  // ✅ Нормализуем filters к массиву ВСЕГДА
  const raw = filters == null ? [] : Array.isArray(filters) ? filters : [filters];
  const segments = raw.map((s) => decodeURIComponent(s).toLowerCase());

  const sb = await createServerClient();

  const { data: cat } = await sb
    .from("categories")
    .select("id,name,name_ru,name_pl")
    .eq("slug", slug)
    .maybeSingle();

  const urlPath = "/" + [slug, ...segments].filter(Boolean).join("/");

  // если категории нет — дефолт
  if (!cat) {
    const base = buildCategoryMetadata(urlPath, { categoryLabelEn: cap(slug) });
    return {
      ...base,
      alternates: { canonical: urlPath },
      openGraph: { ...(base.openGraph as any), url: urlPath },
    };
  }

  // ✅ Факт фильтров берём строго по URL (а не по resolver)
  const hasUrlFilters = segments.length > 0;

  // resolver — чтобы получить location + treatmentLabel + canonical без мусора
  let resolved: any = {
    location: null,
    treatmentLabel: null,
    locationSlugs: [],
    subcatSlugs: [],
    hasExtraSegments: false,
  };

  let consumedPath = urlPath;

  try {
    resolved = await resolveCategoryRouteOnServer(sb, {
      categoryId: cat.id,
      categorySlug: slug,
      segments,
    });

    consumedPath =
      "/" +
      [slug, ...(resolved.locationSlugs ?? []), ...(resolved.subcatSlugs ?? [])]
        .filter(Boolean)
        .join("/");
  } catch {
    // если resolver упал — не ломаем SEO, оставляем urlPath
    consumedPath = urlPath;
  }

  const hasExtra = Boolean(resolved?.hasExtraSegments);

  // subject:
  // - если есть subcategory -> treatmentLabel
  // - если есть только location -> используем cat.name
  const subjectLabel = (resolved?.treatmentLabel || cat.name || cap(slug)) as string;

  const base = hasUrlFilters
    ? buildTreatmentMetadata(consumedPath, {
        treatmentLabel: subjectLabel,
        location: resolved?.location ?? null,
      })
    : buildCategoryMetadata(consumedPath, {
        categoryLabelEn: cat.name ?? cap(slug),
        categoryLabelRu: (cat as any).name_ru ?? cat.name ?? cap(slug),
        categoryLabelPl: (cat as any).name_pl ?? cat.name ?? cap(slug),
        location: resolved?.location ?? null,
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
