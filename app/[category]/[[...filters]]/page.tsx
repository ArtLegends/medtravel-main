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

function cleanSeg(v: string) {
  return decodeURIComponent(v).trim().toLowerCase();
}

/* ---------------- METADATA ---------------- */

export async function generateMetadata(
  { params }: { params: Promise<Params> }
): Promise<Metadata> {
  const { category, filters } = await params;

  const slug = cleanSeg(category);

  const segments = Array.isArray(filters)
    ? filters.map(cleanSeg).filter(Boolean)
    : [];

  const sb = await createServerClient();

  const { data: cat, error: catErr } = await sb
    .from("categories")
    .select("id,name,name_ru,name_pl")
    .eq("slug", slug)
    .maybeSingle();

  const urlPath = "/" + [slug, ...segments].filter(Boolean).join("/");

  // 0) если категорию не нашли — всё равно отдаём meta (и ДИАГНОСТИКУ)
  // НО: если URL содержит сегменты — это treatment-страница, даже без категории.
  if (catErr || !cat) {
    const hasUrlFilters = segments.length > 0;

    // пробуем назвать treatment по последнему сегменту через services.slug
    let fallbackTreatmentLabel = cap(slug);
    const lastSeg = segments.length ? segments[segments.length - 1] : null;

    if (lastSeg) {
      const { data: svc } = await sb
        .from("services")
        .select("name")
        .eq("slug", lastSeg)
        .maybeSingle();

      if (svc?.name) fallbackTreatmentLabel = String(svc.name);
      else fallbackTreatmentLabel = cap(lastSeg); // хотя бы красивый fallback
    }

    const base = hasUrlFilters
      ? buildTreatmentMetadata(urlPath, {
        treatmentLabel: fallbackTreatmentLabel,
        location: undefined, // НЕ null
      })
      : buildCategoryMetadata(urlPath, { categoryLabelEn: cap(slug) });

    return {
      ...base,
      alternates: { canonical: urlPath },
      openGraph: { ...(base.openGraph as any), url: urlPath },
      other: {
        "x-mt-meta-source": hasUrlFilters
          ? "FALLBACK_TREATMENT_NO_CATEGORY"
          : "FALLBACK_CATEGORY_NO_CATEGORY",
        "x-mt-meta-path": urlPath,
        "x-mt-meta-segments": segments.join("|"),
        "x-mt-meta-lastseg": String(lastSeg ?? ""),
        "x-mt-meta-treatment-label": String(fallbackTreatmentLabel),
        "x-mt-meta-caterr": String(catErr ? JSON.stringify(catErr) : ""),
      },
    };
  }

  // 1) Если в URL есть сегменты — это всегда “treatment-режим”
  const hasUrlFilters = segments.length > 0;

  // 2) Пробуем распарсить сегменты в location/subcategory через твой resolver
  let resolved: any = {
    location: undefined,
    treatmentLabel: null,
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
    // resolver не должен валить мету
  }

  // 3) Каноникал:
  // - если resolver что-то распознал → canonical по распознанным кускам
  // - если resolver НИЧЕГО не распознал → canonical = исходный urlPath (чтобы не “уплывал”)
  const hasAnyResolved =
    (resolved?.locationSlugs?.length ?? 0) > 0 ||
    (resolved?.subcatSlugs?.length ?? 0) > 0;

  const consumedPath = hasAnyResolved
    ? "/" + [slug, ...(resolved.locationSlugs ?? []), ...(resolved.subcatSlugs ?? [])].join("/")
    : urlPath;

  const hasExtra = Boolean(resolved?.hasExtraSegments);

  // 4) treatmentLabel:
  // - сначала из resolver
  // - если пусто → пробуем взять по slug из services (это очень частый кейс all-on-4)
  // - если всё равно пусто → fallback на имя категории
  let treatmentLabel: string | null = resolved?.treatmentLabel ?? null;

  const lastSeg = segments.length ? segments[segments.length - 1] : null;

  if (!treatmentLabel && lastSeg) {
    const { data: svc } = await sb
      .from("services")
      .select("name")
      .eq("slug", lastSeg)
      .maybeSingle();

    if (svc?.name) treatmentLabel = String(svc.name);
  }

  if (!treatmentLabel) {
    treatmentLabel = cat.name ?? cap(slug);
  }

  // location: в meta.ts ожидается LocationParts | undefined (НЕ null)
  const locationForMeta = resolved?.location ?? undefined;

  const base = hasUrlFilters
    ? buildTreatmentMetadata(consumedPath, {
        treatmentLabel: treatmentLabel ?? cat.name ?? cap(slug),  // строго string
        location: locationForMeta,  // строго undefined или объект
      })
    : buildCategoryMetadata(consumedPath, {
        categoryLabelEn: cat.name ?? cap(slug),
        categoryLabelRu: (cat as any).name_ru ?? cat.name ?? cap(slug),
        categoryLabelPl: (cat as any).name_pl ?? cat.name ?? cap(slug),
        location: locationForMeta,
      });

  return {
    ...base,
    alternates: { canonical: consumedPath },
    robots: hasExtra ? { index: false, follow: true } : undefined,
    openGraph: { ...(base.openGraph as any), url: consumedPath },

    // ✅ ДИАГНОСТИКА (ДОЛЖНА БЫТЬ В view-source)
    other: {
      "x-mt-meta-source": hasUrlFilters ? "TREATMENT" : "CATEGORY",
      "x-mt-meta-path": consumedPath,
      "x-mt-meta-urlpath": urlPath,
      "x-mt-meta-segments": segments.join("|"),
      "x-mt-meta-has-extra": String(hasExtra),
      "x-mt-meta-treatment-label": String(treatmentLabel),
      "x-mt-meta-location": locationForMeta ? "1" : "0",
    },
  };
}

/* ---------------- PAGE ---------------- */

export default async function Page(
  { params }: { params: Promise<Params> }
) {
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
