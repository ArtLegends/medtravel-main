// app/[category]/[[...filters]]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import CategoryHero from "@/components/category/CategoryHero";
import CategoryWhy from "@/components/category/CategoryWhy";
import CategoryGrid from "@/components/category/CategoryGrid";
import { createServerClient } from "@/lib/supabase/serverClient";
import { buildCategoryMetadata, buildTreatmentMetadata } from "@/lib/seo/meta";

export const revalidate = 60;

type Params = { category: string; filters?: string[] };

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// helper: вытянуть популярные фасеты по категории (для fallback-локации)
async function popularLocationForCategory(slug: string) {
  const sb = await createServerClient();
  const { data } = await sb.rpc("catalog_browse_basic", {
    p_category_slug: slug,
    p_country: null,
    p_province: null,
    p_city: null,
    p_district: null,
    p_service_slugs: null,
    p_sort: "name_asc",
    p_limit: 0,
    p_offset: 0,
  });

  const row = Array.isArray(data) ? data[0] : data;
  const cities = (row?.facets?.cities ?? []) as string[];
  const countries = (row?.facets?.countries ?? []) as string[];

  return {
    country: countries?.[0] ?? null,
    city: cities?.[0] ?? null,
    district: null,
  };
}

async function serviceLabels(
  sb: Awaited<ReturnType<typeof createServerClient>>,
  slugs: string[],
) {
  if (slugs.length === 0) return {};
  const { data } = await sb
    .from("services")
    .select("slug,name")
    .in("slug", slugs);

  const map: Record<string, string> = {};
  for (const row of data ?? []) map[row.slug] = row.name;
  return map;
}

async function resolveFilters(filters: string[] | undefined) {
  const f = (filters ?? []).slice(0, 2).map((x) => decodeURIComponent(x));
  if (f.length === 0) return { city: undefined as string | undefined, services: [] as string[] };

  const sb = await createServerClient();

  const isService = async (candidate: string) => {
    const slug = candidate.toLowerCase();
    const { data } = await sb
      .from("services")
      .select("slug")
      .eq("slug", slug)
      .maybeSingle();
    return data?.slug ? slug : null;
  };

  // /category/one-seg  -> либо service, либо city
  if (f.length === 1) {
    const seg = f[0];
    const svc = await isService(seg);
    if (svc) return { city: undefined, services: [svc] };
    return { city: seg, services: [] };
  }

  // /category/a/b -> обычно service/city, но сделаем безопасно
  const [a, b] = f;
  const svcA = await isService(a);
  if (svcA) return { city: b, services: [svcA] };

  const svcB = await isService(b);
  if (svcB) return { city: a, services: [svcB] };

  // если ни один не service — считаем что это city (b), service нет
  return { city: b, services: [] };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { category, filters } = await params;
  const slug = decodeURIComponent(category).toLowerCase();

  // подтягиваем названия категории (EN/RU/PL)
  let nameEn = cap(slug);
  let nameRu = cap(slug);
  let namePl = cap(slug);

  try {
    const sb = await createServerClient();
    const { data: cat } = await sb
      .from("categories")
      .select("name, name_ru, name_pl")
      .eq("slug", slug)
      .maybeSingle();

    if (cat?.name) nameEn = cat.name;
    if ((cat as any)?.name_ru) nameRu = (cat as any).name_ru;
    if ((cat as any)?.name_pl) namePl = (cat as any).name_pl;
  } catch {
    // ok
  }

  const { city, services } = await resolveFilters(filters);

  const hasCity = !!city;
  const fallbackLoc = await popularLocationForCategory(slug);

  // категория без service
  if (services.length === 0) {
    return buildCategoryMetadata(`/${slug}${city ? `/${encodeURIComponent(city)}` : ""}`, {
      categoryLabelEn: nameEn,
      categoryLabelRu: nameRu,
      categoryLabelPl: namePl,
      location: hasCity ? { city } : undefined,
    });
  }

  // treatment (service внутри категории)
  const sb = await createServerClient();
  const dict = await serviceLabels(sb, services);

  const labels = services.map((s) => dict[s] ?? s.replace(/-/g, " "));
  const treatmentLabel =
    labels.length === 1 ? labels[0] : `${labels[0]} + ${labels.length - 1} more`;

  let min: number | null = null;
  let max: number | null = null;
  let currency: string | undefined;

  try {
    const { data } = await sb.rpc("seo_treatment_price_range", {
      p_category_slug: slug,
      p_service_slugs: services.length ? services : null,
      p_city: city ?? null,
      p_country: null,
      p_district: null,
    });

    const row = Array.isArray(data) ? data[0] : data;
    if (row?.min != null) min = Math.round(Number(row.min));
    if (row?.max != null) max = Math.round(Number(row.max));

    currency =
      (row &&
        (row.currency ??
          row.currency_code ??
          row.min_currency ??
          row.max_currency)) || undefined;

    // fallback currency если rpc не дал
    if (!currency && services.length > 0) {
      const firstSlug = services[0];
      const { data: serviceRow } = await sb
        .from("services")
        .select("id")
        .eq("slug", firstSlug)
        .maybeSingle();

      if (serviceRow?.id) {
        const { data: csRow } = await sb
          .from("clinic_services")
          .select("currency")
          .eq("service_id", serviceRow.id)
          .not("currency", "is", null)
          .limit(1)
          .maybeSingle();

        if (csRow?.currency) currency = String(csRow.currency);
      }
    }
  } catch {
    // ok
  }

  const effLoc = hasCity ? { city } : fallbackLoc;

  const path =
    `/${slug}/${encodeURIComponent(services[0])}` +
    (city ? `/${encodeURIComponent(city)}` : "");

  return buildTreatmentMetadata(path, {
    treatmentLabel,
    location: effLoc,
    minPrice: min,
    maxPrice: max,
    currency,
  });
}

export default async function Page({
  params,
}: {
  params: Promise<Params>;
}) {
  const { category, filters } = await params;
  const slug = decodeURIComponent(category).toLowerCase();

  const sb = await createServerClient();
  const { data: cat } = await sb
    .from("categories")
    .select("name")
    .eq("slug", slug)
    .maybeSingle();

  if (!cat) notFound();

  const titleName = cat.name || cap(slug);

  const resolved = await resolveFilters(filters);

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
        initialCity={resolved.city}
        initialServices={resolved.services}
      />
    </>
  );
}
