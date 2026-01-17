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
  params: Promise<Params>;
}): Promise<Metadata> {
  const { category, filters } = await params;

  const slug = decodeURIComponent(category).toLowerCase();

  // ВАЖНО: сегменты приводим к lowerCase, чтобы матчи по slug были гарантированы
  const segments = Array.isArray(filters)
    ? filters.map((s) => decodeURIComponent(s).toLowerCase())
    : [];

  const sb = await createServerClient();

  const { data: cat, error: catErr } = await sb
    .from("categories")
    .select("id,name,name_ru,name_pl")
    .eq("slug", slug)
    .maybeSingle();

  const urlPath = "/" + [slug, ...segments].filter(Boolean).join("/");

  // если категории нет — отдадим дефолт по slug
  if (catErr || !cat) {
    const base = buildCategoryMetadata(urlPath, { categoryLabelEn: cap(slug) });
    return {
      ...base,
      alternates: { canonical: urlPath },
      openGraph: { ...(base.openGraph as any), url: urlPath },
    };
  }

  // ✅ ФАКТ наличия фильтров определяем НЕ через resolver,
  // а напрямую по URL. Это “железно”.
  const hasUrlFilters = segments.length > 0;

  // по умолчанию считаем, что consumedPath = urlPath
  let consumedPath = urlPath;

  // resolved может упасть / вернуть пусто — не ломаем мету
  let resolved: any = {
    location: null,
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

    // canonical строим из реально распарсенных частей
    consumedPath =
      "/" +
      [
        slug,
        ...(resolved.locationSlugs ?? []),
        ...(resolved.subcatSlugs ?? []),
      ].filter(Boolean).join("/");

  } catch (e) {
    // даже если resolver упал — canonical оставляем исходный urlPath
    consumedPath = urlPath;
  }

  // если resolver нашёл “хвост” — noindex, но canonical всё равно на consumedPath/urlPath
  const hasExtra = Boolean(resolved?.hasExtraSegments);

  // subject:
  // - если есть subcategory → treatmentLabel
  // - если есть только location → используем имя категории как subject (как ты и хотел)
  const subjectLabel = (resolved?.treatmentLabel || cat.name || cap(slug)) as string;

  // ✅ ГЛАВНОЕ ПРАВИЛО:
  // Если URL содержит фильтры (segments.length>0) → всегда treatment-шаблон.
  // Иначе → category-шаблон.
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

    // ✅ диагностический маркер (безопасный)
    // (Если его снова нет в view-source — значит этот файл не используется)
    other: {
      "x-mt-meta-source": hasUrlFilters ? "TREATMENT" : "CATEGORY",
      "x-mt-meta-path": consumedPath,
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
