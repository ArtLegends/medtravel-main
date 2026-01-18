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

function humanizeSlug(s: string) {
  return s
    .split("-")
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function locationFromSlugs(slugs: string[]) {
  const loc: any = {};
  if (slugs[0]) loc.country = humanizeSlug(slugs[0]);
  if (slugs[1]) loc.province = humanizeSlug(slugs[1]);
  if (slugs[2]) loc.city = humanizeSlug(slugs[2]);
  if (slugs[3]) loc.district = humanizeSlug(slugs[3]);
  return loc;
}

export async function generateMetadata(
  { params }: { params: Promise<Params> }
): Promise<Metadata> {
  const { category, filters } = await params;

  const slug = cleanSeg(category);
  const segments = Array.isArray(filters) ? filters.map(cleanSeg).filter(Boolean) : [];

  const sb = await createServerClient();

  // ✅ categories: только то, что реально существует
  const { data: cat, error: catErr } = await sb
    .from("categories")
    .select("id,name")
    .eq("slug", slug)
    .maybeSingle();

  const urlPath = "/" + [slug, ...segments].join("/");

  // --------- 1) определяем, какие сегменты являются service slug ----------
  // Берём ВСЕ services, которые совпали по slug из segments
  // (если у services есть category_id — добавь .eq("category_id", cat?.id))
  const { data: svcRows } = await sb
    .from("services")
    .select("slug,name")
    .in("slug", segments);

  const svcMap = new Map<string, string>();
  (svcRows ?? []).forEach(r => {
    if (r?.slug) svcMap.set(String(r.slug), String((r as any).name ?? r.slug));
  });

  const firstServiceIdx = segments.findIndex(s => svcMap.has(s));

  const locationSlugs =
    firstServiceIdx === -1 ? segments : segments.slice(0, firstServiceIdx);

  const serviceSlugs =
    firstServiceIdx === -1 ? [] : segments.slice(firstServiceIdx);

  const hasLocation = locationSlugs.length > 0;
  const hasTreatment = serviceSlugs.length > 0;

  const locationForMeta = hasLocation ? locationFromSlugs(locationSlugs) : undefined;

  // --------- 2) если категории нет — всё равно делаем нормальную мету ----------
  if (catErr || !cat) {
    const base = hasTreatment
      ? buildTreatmentMetadata(urlPath, {
          treatmentLabel: svcMap.get(serviceSlugs[serviceSlugs.length - 1]) ?? humanizeSlug(serviceSlugs[serviceSlugs.length - 1] ?? slug),
          location: locationForMeta,
        })
      : buildCategoryMetadata(urlPath, {
          categoryLabelEn: humanizeSlug(slug),
          location: locationForMeta,
        });

    return {
      ...base,
      alternates: { canonical: urlPath },
      other: {
        "x-mt-meta-source": hasTreatment ? "FALLBACK_TREATMENT_NO_CATEGORY" : "FALLBACK_CATEGORY_NO_CATEGORY",
        "x-mt-meta-path": urlPath,
        "x-mt-meta-location-slugs": locationSlugs.join("|"),
        "x-mt-meta-service-slugs": serviceSlugs.join("|"),
      },
    };
  }

  // --------- 3) выбор режима: only-location => CATEGORY, иначе => TREATMENT ----------
  const isOnlyLocation = hasLocation && !hasTreatment;

  // treatment label — имя последнего service slug
  const treatmentLabel =
    hasTreatment
      ? (svcMap.get(serviceSlugs[serviceSlugs.length - 1]) ?? humanizeSlug(serviceSlugs[serviceSlugs.length - 1]))
      : null;

  // --------- 4) цены: если treatment есть, считаем min/max ----------
  let minPrice: number | null = null;
  let maxPrice: number | null = null;
  let currency: string | null = null;

  if (hasTreatment) {
    const loc = locationForMeta;
    const { data: pr } = await sb.rpc("seo_treatment_price_range_v2", {
      p_service_slugs: serviceSlugs,
      p_country: loc?.country ?? null,
      p_province: loc?.province ?? null,
      p_city: loc?.city ?? null,
      p_district: loc?.district ?? null,
    });

    // pr может быть объектом или массивом — подстрахуемся
    const row = Array.isArray(pr) ? pr[0] : pr;
    if (row?.min != null) minPrice = Number(row.min);
    if (row?.max != null) maxPrice = Number(row.max);
    if ((row as any)?.currency != null) currency = String((row as any).currency);
  }

  const base = isOnlyLocation
    ? buildCategoryMetadata(urlPath, {
        categoryLabelEn: cat.name ?? humanizeSlug(slug),
        categoryLabelRu: cat.name ?? humanizeSlug(slug),
        categoryLabelPl: cat.name ?? humanizeSlug(slug),
        location: locationForMeta,
      })
    : buildTreatmentMetadata(urlPath, {
        treatmentLabel: treatmentLabel ?? (cat.name ?? humanizeSlug(slug)),
        location: locationForMeta,
        minPrice,
        maxPrice,
        currency,
      });

  return {
    ...base,
    alternates: { canonical: urlPath },
    other: {
      "x-mt-meta-source": isOnlyLocation ? "CATEGORY_WITH_LOCATION" : "TREATMENT",
      "x-mt-meta-path": urlPath,
      "x-mt-meta-location-slugs": locationSlugs.join("|"),
      "x-mt-meta-service-slugs": serviceSlugs.join("|"),
      "x-mt-meta-is-only-location": String(isOnlyLocation),
      "x-mt-meta-treatment-label": String(treatmentLabel ?? ""),
      "x-mt-meta-min": String(minPrice ?? ""),
      "x-mt-meta-max": String(maxPrice ?? ""),
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
