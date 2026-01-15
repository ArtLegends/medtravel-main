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

  // фактический URL как в браузере
  const urlPath = "/" + [slug, ...segments].filter(Boolean).join("/");

  // если категории нет — даём хоть какую-то мету
  if (!cat) {
    const base = buildCategoryMetadata(urlPath, { categoryLabelEn: cap(slug) });
    return {
      ...base,
      alternates: { canonical: urlPath },
      openGraph: { ...(base.openGraph as any), url: urlPath },
    };
  }

  // пытаемся распарсить сегменты в локацию/подкатегорию
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
  } catch (e) {
    console.error("resolveCategoryRouteOnServer failed:", e);
  }

  const resolvedLocLen = resolved?.locationSlugs?.length ?? 0;
  const resolvedSubLen = resolved?.subcatSlugs?.length ?? 0;
  const resolvedLen = resolvedLocLen + resolvedSubLen;

  /**
   * ВАЖНО:
   * - если segments есть, но resolver ничего не распарсил,
   *   НЕ схлопываем canonical в /{category}. Оставляем urlPath.
   */
  const consumedPath =
    resolvedLen > 0
      ? "/" + [slug, ...(resolved.locationSlugs ?? []), ...(resolved.subcatSlugs ?? [])].join("/")
      : urlPath;

  /**
   * "Фильтровая страница" = наличие segments в URL.
   * Не зависим от resolver, иначе снова будет category-шаблон.
   */
  const hasAnyFilter = segments.length > 0;

  /**
   * extra сегменты:
   * - либо resolver явно сказал hasExtraSegments
   * - либо segments есть, но ничего не распарсили (мусорный URL)
   */
  const hasExtra = Boolean(resolved?.hasExtraSegments) || (segments.length > 0 && resolvedLen === 0);

  // фолбэк для subject, если подкатегория не распознана
  const fallbackFromLastSeg = segments.length
    ? segments[segments.length - 1]
        .split("-")
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    : (cat.name ?? cap(slug));

  /**
   * subjectLabel:
   * - если есть подкатегория: берём её name (treatmentLabel)
   * - если только локация: subject = имя категории (Dentistry)
   * - если вообще ничего не распарсили: subject = последний сегмент (All on 4)
   */
  const subjectLabel =
    resolvedSubLen > 0
      ? (resolved.treatmentLabel || fallbackFromLastSeg)
      : resolvedLocLen > 0
        ? (cat.name ?? cap(slug))
        : fallbackFromLastSeg;

  const base = hasAnyFilter
    ? buildTreatmentMetadata(consumedPath, {
        treatmentLabel: subjectLabel,
        location: resolved.location,
        // minPrice/maxPrice/currency позже
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

    // ✅ ДИАГНОСТИКА: временно
    other: {
      "x-mt-meta-source": hasAnyFilter ? "TREATMENT" : "CATEGORY",
      "x-mt-meta-path": consumedPath,
      "x-mt-meta-subject": subjectLabel,
      "x-mt-meta-hasAnyFilter": String(hasAnyFilter),
      "x-mt-meta-segments": segments.join("|"),
    },
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
