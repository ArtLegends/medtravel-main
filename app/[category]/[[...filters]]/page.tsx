import type { Metadata } from "next";

import CategoryHero from "@/components/category/CategoryHero";
import CategoryWhy from "@/components/category/CategoryWhy";
import CategoryGrid from "@/components/category/CategoryGrid";
import { createServerClient } from "@/lib/supabase/serverClient";
import { buildCategoryMetadata, buildTreatmentMetadata, LocationParts } from "@/lib/seo/meta";
import { resolveCategoryRouteOnServer } from "@/lib/category-route/resolve";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Params = {
  category: string;
  filters?: string[];
};

function cleanSeg(v: string) {
  return decodeURIComponent(v).trim().toLowerCase();
}

function capWords(s: string) {
  return s
    .split(" ")
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Опционально: маркетинговые имена категорий (чтобы Dentistry -> Dental Clinics) */
function categorySeoLabel(slug: string, fallbackName: string) {
  if (slug === "dentistry") return "Dental Clinics";
  if (slug === "hair-transplant") return "Hair Transplant Clinics";
  if (slug === "plastic-surgery") return "Plastic Surgery Clinics";
  return fallbackName;
}

/** Строим LocationParts из найденных location nodes */
function buildLocationPartsFromNodes(nodes: Array<{ kind: string; name: string }>): LocationParts | undefined {
  if (!nodes.length) return undefined;
  const loc: LocationParts = {};
  for (const n of nodes) {
    if (n.kind === "country") loc.country = n.name;
    if (n.kind === "province") loc.province = n.name;
    if (n.kind === "city") loc.city = n.name;
    if (n.kind === "district") loc.district = n.name;
  }
  return loc;
}

/**
 * Создаём индекс по parent_id -> (slug -> node)
 * parent_id может быть null => кладём в ключ "__root__"
 */
function indexByParent<T extends { parent_id: any; slug: string }>(rows: T[]) {
  const rootKey = "__root__";
  const m = new Map<string, Map<string, T>>();
  for (const r of rows) {
    const k = r.parent_id == null ? rootKey : String(r.parent_id);
    if (!m.has(k)) m.set(k, new Map());
    m.get(k)!.set(String(r.slug), r);
  }
  return { m, rootKey };
}

/**
 * “Съедаем” цепочку сегментов по дереву: root -> child -> child...
 * Возвращаем: consumedNodes, consumedSlugs, nextIndex
 */
function consumeChain<T extends { id: any; parent_id: any; slug: string }>(
  segments: string[],
  startIdx: number,
  index: { m: Map<string, Map<string, T>>; rootKey: string }
) {
  const consumed: T[] = [];
  const consumedSlugs: string[] = [];

  let parentKey = index.rootKey;
  let i = startIdx;

  while (i < segments.length) {
    const seg = segments[i];
    const bucket = index.m.get(parentKey);
    const node = bucket?.get(seg);

    if (!node) break;

    consumed.push(node);
    consumedSlugs.push(seg);

    parentKey = String((node as any).id);
    i++;
  }

  return { consumed, consumedSlugs, nextIndex: i };
}

export async function generateMetadata(
  { params }: { params: Promise<Params> }
): Promise<Metadata> {
  const { category, filters } = await params;

  const slug = cleanSeg(category);
  const segments = Array.isArray(filters) ? filters.map(cleanSeg).filter(Boolean) : [];
  const urlPath = "/" + [slug, ...segments].join("/");

  const sb = await createServerClient();

  // 1) category
  const { data: cat, error: catErr } = await sb
    .from("categories")
    .select("id,name,name_ru,name_pl,slug")
    .eq("slug", slug)
    .maybeSingle();

  // fallback если категория не найдена
  if (catErr || !cat) {
    const base = buildCategoryMetadata(urlPath, {
      categoryLabelEn: capWords(slug),
    });

    return {
      ...base,
      alternates: { canonical: urlPath },
      other: {
        "x-mt-meta-source": "FALLBACK_CATEGORY_NO_CATEGORY",
        "x-mt-meta-path": urlPath,
        "x-mt-meta-segments": segments.join("|"),
        "x-mt-meta-caterr": String(catErr ? JSON.stringify(catErr) : ""),
      },
    };
  }

  // 2) preload nodes (одним запросом на каждую таблицу)
  const [locRes, subRes] = await Promise.all([
    sb
      .from("category_location_nodes")
      .select("id,parent_id,kind,name,slug")
      .eq("category_id", cat.id)
      .in("slug", segments),
    sb
      .from("category_subcategory_nodes")
      .select("id,parent_id,name,slug")
      .eq("category_id", cat.id)
      .in("slug", segments),
  ]);

  const locRows = (locRes.data ?? []) as Array<any>;
  const subRows = (subRes.data ?? []) as Array<any>;

  const locIndex = indexByParent(locRows);
  const subIndex = indexByParent(subRows);

  // 3) consume location chain from start
  const locConsumed = consumeChain(segments, 0, locIndex);
  const locationNodes = locConsumed.consumed as Array<{ kind: string; name: string }>;
  const locationSlugs = locConsumed.consumedSlugs;

  // 4) consume subcategory chain from where location ended
  const subConsumed = consumeChain(segments, locConsumed.nextIndex, subIndex);
  const subcatNodes = subConsumed.consumed as Array<{ id: any; name: string; slug: string }>;
  const subcatSlugs = subConsumed.consumedSlugs;

  const consumedCount = locConsumed.nextIndex + (subConsumed.nextIndex - locConsumed.nextIndex);
  const hasExtra = consumedCount < segments.length;

  // canonical: только “съеденная” часть (без мусора)
  const canonicalPath =
    "/" + [slug, ...locationSlugs, ...subcatSlugs].filter(Boolean).join("/");

  const locationForMeta = buildLocationPartsFromNodes(locationNodes);

  const hasSubcategory = subcatNodes.length > 0;
  const mode = hasSubcategory ? "TREATMENT" : "CATEGORY";

  // treatmentLabel = имя последней подкатегории
  const treatmentLabel = hasSubcategory
    ? String(subcatNodes[subcatNodes.length - 1].name ?? subcatSlugs[subcatSlugs.length - 1])
    : null;

  // 5) цены: только для treatment, через связь subcategory -> services
  let minPrice: number | null = null;
  let maxPrice: number | null = null;
  let currency: string | null = null;

  if (hasSubcategory) {
    const nodeIds = subcatNodes.map(n => n.id);

    const { data: svcLinks } = await sb
      .from("category_subcategory_node_services")
      .select("service_id")
      .in("node_id", nodeIds);

    const serviceIds = Array.from(new Set((svcLinks ?? []).map(r => (r as any).service_id).filter(Boolean)));

    let serviceSlugs: string[] = [];
    if (serviceIds.length) {
      const { data: svc } = await sb
        .from("services")
        .select("slug")
        .in("id", serviceIds);

      serviceSlugs = Array.from(new Set((svc ?? []).map(r => String((r as any).slug)).filter(Boolean)));
    }

    if (serviceSlugs.length) {
      const { data: pr } = await sb.rpc("seo_treatment_price_range_v2", {
        p_service_slugs: serviceSlugs,
        // ВАЖНО: тут лучше передавать именно "name" из nodes (а не slug),
        // потому что мета и UI у тебя на человекочитаемых названиях.
        p_country: locationForMeta?.country ?? null,
        p_province: locationForMeta?.province ?? null,
        p_city: locationForMeta?.city ?? null,
        p_district: locationForMeta?.district ?? null,
      });

      const row = Array.isArray(pr) ? pr[0] : pr;
      if (row?.min != null) minPrice = Number(row.min);
      if (row?.max != null) maxPrice = Number(row.max);
      currency = (row as any)?.currency != null ? String((row as any).currency) : null;
    }
  }

  // 6) строим meta по твоим правилам
  const catLabelEn = categorySeoLabel(slug, String(cat.name ?? capWords(slug)));

  const base = mode === "CATEGORY"
    ? buildCategoryMetadata(canonicalPath, {
        categoryLabelEn: catLabelEn,
        categoryLabelRu: (cat as any).name_ru ?? catLabelEn,
        categoryLabelPl: (cat as any).name_pl ?? catLabelEn,
        location: locationForMeta,
      })
    : buildTreatmentMetadata(canonicalPath, {
        treatmentLabel: String(treatmentLabel ?? catLabelEn),
        location: locationForMeta, // если нет, meta.ts покажет "Popular Destinations"
        minPrice,
        maxPrice,
        currency: currency ?? "USD", // можешь убрать, если не хочешь форсить
      });

  return {
    ...base,
    alternates: { canonical: canonicalPath },
    // если есть мусорные сегменты — noindex,follow (чтобы не плодить дубли)
    robots: hasExtra ? { index: false, follow: true } : undefined,
    openGraph: { ...(base.openGraph as any), url: canonicalPath },

    other: {
      "x-mt-meta-source": mode,
      "x-mt-meta-path": canonicalPath,
      "x-mt-meta-urlpath": urlPath,

      "x-mt-meta-location-slugs": locationSlugs.join("|"),
      "x-mt-meta-subcat-slugs": subcatSlugs.join("|"),
      "x-mt-meta-has-extra": String(hasExtra),

      "x-mt-meta-treatment-label": String(treatmentLabel ?? ""),
      "x-mt-meta-min": String(minPrice ?? ""),
      "x-mt-meta-max": String(maxPrice ?? ""),
      "x-mt-meta-currency": String(currency ?? ""),
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
function cap(slug: string): any {
  throw new Error("Function not implemented.");
}

