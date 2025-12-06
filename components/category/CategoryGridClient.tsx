// components/category/CategoryGridClient.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/browserClient";
import { clinicPath } from "@/lib/clinic-url";
import { clinicHref } from "@/lib/clinic-url"; // ← добавили
import Breadcrumbs from "@/components/Breadcrumbs";

type ServiceMap = Record<string, string>;

type CatalogItem = {
  id: string;
  slug: string;
  name: string;
  country: string | null;
  province: string | null;
  city: string | null;
  district: string | null;
  category_id: number;
  service_slugs: string[];
  rating: number | null;
  image_url?: string | null;
};

type Facets = {
  countries?: string[] | null;
  provinces?: string[] | null;
  cities?: string[] | null;
  districts?: string[] | null;
  services?: string[] | null;
};

type RpcRow = {
  total_count: number;
  items: CatalogItem[];
  facets: Facets;
};

const PAGE_SIZE = 12;

function parseServicesParam(sp: URLSearchParams): string[] {
  const raw = sp.get("service");
  if (!raw) return [];
  const multi = sp.getAll("service").flatMap((v) => v.split(","));
  const arr = (multi.length ? multi : raw.split(","))
    .map((s) => s.trim())
    .filter(Boolean);
  return Array.from(new Set(arr));
}

function useUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const state = useMemo(() => {
    const sp = new URLSearchParams(searchParams?.toString() ?? "");
    const page = Math.max(1, Number(sp.get("page") || "1"));
    const sort = (sp.get("sort") || "name_asc") as "name_asc" | "name_desc";
    const country = sp.get("country") || undefined;
    const province = sp.get("province") || undefined;
    const city = sp.get("city") || undefined;
    const district = sp.get("district") || undefined;
    const services = parseServicesParam(sp);
    return { sp, page, sort, country, province, city, district, services };
  }, [searchParams]);

  const setParams = (patch: Record<string, string | string[] | undefined>) => {
    const next = new URLSearchParams(searchParams?.toString() ?? "");
    Object.entries(patch).forEach(([k, v]) => {
      if (v === undefined || (Array.isArray(v) && v.length === 0) || v === "") {
        next.delete(k);
      } else if (Array.isArray(v)) {
        next.set(k, v.join(","));
      } else {
        next.set(k, v);
      }
    });
    if (
      "country" in patch ||
      "province" in patch ||
      "city" in patch ||
      "district" in patch ||
      "service" in patch ||
      "sort" in patch
    ) {
      next.delete("page");
    }
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  const setPage = (page: number) => setParams({ page: String(page) });
  const resetAll = () => router.replace(pathname ?? "/", { scroll: false });

  const buildHref = (patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams(searchParams?.toString() ?? "");
    Object.entries(patch).forEach(([k, v]) => {
      if (!v) next.delete(k);
      else next.set(k, v);
    });
    next.delete("page");
    return `${pathname}?${next.toString()}`;
  };

  return {
    ...state,
    setParams,
    setPage,
    resetAll,
    buildHref,
    pathname,
    searchParams,
    router,
  };
}

// форматируем локацию клиники
function formatLocationClinic(
  c: Pick<CatalogItem, "city" | "country" | "province" | "district">
) {
  const parts = [c.city, c.province, c.country].filter(Boolean);
  return parts.join(", ");
}

// короткий тизер-описание
function buildTeaser(
  c: CatalogItem,
  labelOf: (slug: string) => string
): string {
  const location = formatLocationClinic(c);
  const serviceNames = c.service_slugs
    .slice(0, 3)
    .map(labelOf)
    .filter(Boolean);

  const sentences: string[] = [];

  if (location) {
    sentences.push(`${c.name} is a clinic located in ${location}.`);
  } else {
    sentences.push(`${c.name} is a clinic from our trusted network.`);
  }

  if (serviceNames.length) {
    sentences.push(`It offers treatments such as ${serviceNames.join(", ")}.`);
  }

  const text = sentences.join(" ");
  if (text.length <= 260) return text;
  return text.slice(0, 260).replace(/\s+\S*$/, "") + "…";
}

export default function CategoryGridClient({
  categorySlug,
  categoryName,
}: {
  categorySlug: string;
  categoryName?: string;
}) {
  const supabase = useMemo(() => createClient(), []);
  const {
    page,
    sort,
    country,
    province,
    city,
    district,
    services,
    setPage,
    resetAll,
    buildHref,
  } = useUrlState();

  const [svcMap, setSvcMap] = useState<ServiceMap>({});

  useEffect(() => {
    let cancelled = false;
    async function run() {
      const { data } = await supabase
        .from("services")
        .select("slug,name")
        .limit(1000);
      if (!cancelled) {
        const map: ServiceMap = {};
        for (const r of data ?? []) map[r.slug] = r.name;
        setSvcMap(map);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [facets, setFacets] = useState<Facets>({});

  const initialFacetsRef = useRef<Facets | null>(null);
  const hasAnyFilter = !!(
    country ||
    province ||
    city ||
    district ||
    services.length
  );

  const [locationQuery, setLocationQuery] = useState("");
  const [treatmentQuery, setTreatmentQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.rpc("catalog_browse_basic", {
        p_category_slug: categorySlug,
        p_country: country ?? null,
        p_province: province ?? null,
        p_city: city ?? null,
        p_district: district ?? null,
        p_service_slugs: services.length ? services : null,
        p_sort: sort,
        p_limit: PAGE_SIZE,
        p_offset: (page - 1) * PAGE_SIZE,
      });

      if (cancelled) return;

      if (error) {
        setError(error.message);
        setItems([]);
        setTotal(0);
        setFacets({});
        setLoading(false);
        return;
      }

      const row = Array.isArray(data)
        ? (data[0] as RpcRow | undefined)
        : (data as RpcRow | undefined);

      const baseItems: CatalogItem[] = row?.items ?? [];
      setTotal(Number(row?.total_count ?? 0));
      setFacets(row?.facets ?? {});

      // Подтягиваем cover из clinic_images
      let enrichedItems: CatalogItem[] = baseItems;
      try {
        if (baseItems.length) {
          const ids = baseItems.map((c) => c.id);
          const { data: imgs } = await supabase
            .from("clinic_images")
            .select("clinic_id,url,sort,created_at")
            .in("clinic_id", ids)
            .order("sort", { ascending: true, nullsFirst: true })
            .order("created_at", { ascending: false, nullsFirst: true });

          const imgMap = new Map<string, string>();
          (imgs ?? []).forEach((row: any) => {
            const url = (row?.url || "").trim();
            if (!url) return;
            if (!imgMap.has(row.clinic_id)) imgMap.set(row.clinic_id, url);
          });

          enrichedItems = baseItems.map((c) => ({
            ...c,
            image_url: imgMap.get(c.id) ?? null,
          }));
        }
      } catch {
        enrichedItems = baseItems;
      }

      if (!hasAnyFilter && row?.facets && !initialFacetsRef.current) {
        initialFacetsRef.current = row.facets;
      }

      setItems(enrichedItems);
      setLoading(false);
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [
    supabase,
    categorySlug,
    page,
    sort,
    country,
    province,
    city,
    district,
    services,
    hasAnyFilter,
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const labelOf = (slug: string) => svcMap[slug] ?? slug.replace(/-/g, " ");

  const baseFacets = initialFacetsRef.current ?? facets;

  const popularCitiesAll = (baseFacets.cities ?? []).filter(Boolean) as string[];
  const popularServicesAll = (baseFacets.services ?? []).filter(
    Boolean
  ) as string[];

  const popularCities = popularCitiesAll
    .filter((c) => c.toLowerCase().includes(locationQuery.toLowerCase()))
    .slice(0, 5);

  const popularServices = popularServicesAll
    .filter((s) => s.toLowerCase().includes(treatmentQuery.toLowerCase()))
    .slice(0, 5);

  const toggleServiceHref = (slug: string) => {
    const set = new Set(services);
    set.has(slug) ? set.delete(slug) : set.add(slug);
    const v = Array.from(set).join(",");
    return buildHref({ service: v || undefined });
  };

  return (
    <section className="bg-gray-50">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-10 lg:grid-cols-[1fr_360px]">
        {/* Листинг слева */}
        <div className="space-y-4">
          <Breadcrumbs
            items={[
              { label: "Home page", href: "/" },
              {
                label:
                  categoryName ??
                  (categorySlug.charAt(0).toUpperCase() +
                    categorySlug.slice(1)),
              },
            ]}
          />

          {loading && items.length === 0 ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-40 animate-pulse rounded-2xl border bg-white"
              />
            ))
          ) : error ? (
            <div className="rounded-2xl border bg-white p-6 text-red-600">
              Error: {error}
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border bg-white p-10 text-center text-gray-600">
              No clinics found
            </div>
          ) : (
            items.map((c) => {
              const clinicUrl = clinicHref({
                slug: c.slug,
                country: c.country,
                province: c.province,
                city: c.city,
                district: c.district,
              });

              // корректный путь на страницу заявки
              const quoteUrl = clinicHref(
                {
                  slug: c.slug,
                  country: c.country,
                  province: c.province,
                  city: c.city,
                  district: c.district,
                },
                "inquiry"
              );

              const locationLabel = formatLocationClinic(c);
              const teaser = buildTeaser(c, labelOf);

              return (
                <article
                  key={c.id}
                  className="rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex flex-col gap-4 md:flex-row">
                    {/* Изображение */}
                    <Link
                      href={clinicUrl}
                      className="md:w-48 md:min-w-[12rem]"
                    >
                      <div className="h-40 w-full overflow-hidden rounded-xl bg-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={
                            c.image_url ??
                            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80"
                          }
                          alt={c.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </Link>

                    {/* Контент */}
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <Link
                            href={clinicUrl}
                            className="text-lg font-semibold text-gray-900 hover:underline"
                          >
                            {c.name}
                          </Link>
                          {locationLabel && (
                            <p className="mt-1 text-sm text-gray-500">
                              {locationLabel}
                            </p>
                          )}
                        </div>

                        <Link
                          href={quoteUrl}
                          className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700"
                        >
                          Claim your free quote
                        </Link>
                      </div>

                      {/* Описание + Read more */}
                      {teaser && (
                        <p className="text-sm text-gray-600">
                          {teaser}{" "}
                          <Link
                            href={clinicUrl}
                            className="font-medium text-teal-700 hover:underline"
                          >
                            Read more
                          </Link>
                        </p>
                      )}

                      {/* Услуги – старый визуал (pills) + лимит и More treatments */}
                      {c.service_slugs?.length > 0 && (
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {c.service_slugs.slice(0, 4).map((t) => {
                            const active = services.includes(t);
                            return (
                              <span
                                key={t}
                                className={`rounded-full border px-3 py-1 text-xs ${
                                  active
                                    ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                                    : "border-gray-200 bg-gray-100 text-gray-700"
                                }`}
                                title={t}
                              >
                                {labelOf(t)}
                              </span>
                            );
                          })}
                          {c.service_slugs.length > 4 && (
                            <Link
                              href={clinicUrl}
                              className="text-xs font-medium text-teal-700 hover:underline"
                            >
                              More treatments
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })
          )}

          {/* Пагинация */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              className="rounded-full border px-3 py-1 text-sm disabled:opacity-50"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1 || loading}
            >
              ← Prev
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              className="rounded-full border px-3 py-1 text-sm disabled:opacity-50"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages || loading}
            >
              Next →
            </button>
          </div>
        </div>

        {/* Сайдбар справа */}
        <aside className="space-y-6">
          <div className="rounded-2xl border bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-semibold">Search locations</div>
              <button
                type="button"
                className="text-xs text-red-600 hover:underline"
                onClick={() => resetAll()}
                title="Reset all filters"
              >
                Reset filters
              </button>
            </div>
            <input
              className="w-full rounded-xl border px-3 py-2 text-sm"
              placeholder="Type to filter locations"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
            />
            <h3 className="mt-4 text-sm font-semibold">Popular locations</h3>
            <ul className="mt-2 space-y-2 text-sm">
              {popularCities.map((l) => {
                const isActive =
                  city && l.toLowerCase() === city.toLowerCase();
                return (
                  <li key={l}>
                    <Link
                      className={
                        isActive
                          ? "font-semibold text-blue-700 underline"
                          : "text-blue-600 hover:underline"
                      }
                      href={buildHref({ city: l })}
                    >
                      {l}
                    </Link>
                  </li>
                );
              })}
              {popularCities.length === 0 && (
                <li className="text-xs text-gray-500">No matches.</li>
              )}
            </ul>
          </div>

          <div className="rounded-2xl border bg-white p-5">
            <div className="mb-3 text-sm font-semibold">Search treatments</div>
            <input
              className="w-full rounded-xl border px-3 py-2 text-sm"
              placeholder="Type to filter treatments"
              value={treatmentQuery}
              onChange={(e) => setTreatmentQuery(e.target.value)}
            />
            <h3 className="mt-4 text-sm font-semibold">Popular treatments</h3>
            <ul className="mt-2 space-y-2 text-sm">
              {popularServices.map((t) => {
                const slug = t.toLowerCase().replace(/\s+/g, "-");
                const isActive = services.includes(slug);
                return (
                  <li key={t}>
                    <Link
                      className={
                        isActive
                          ? "font-semibold text-blue-700 hover:underline"
                          : "text-blue-600 hover:underline"
                      }
                      href={toggleServiceHref(slug)}
                      title="Toggle treatment filter"
                    >
                      {labelOf(slug)}
                    </Link>
                  </li>
                );
              })}
              {popularServices.length === 0 && (
                <li className="text-xs text-gray-500">No matches.</li>
              )}
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}
