// components/category/CategoryGridClient.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/browserClient";
// import CategoryFilters from "./CategoryFilters"; // ❌ не используем в этой версии
import { clinicPath } from "@/lib/clinic-url";

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
    // при изменении фильтров — сбрасываем страницу
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

export default function CategoryGridClient({
  categorySlug,
}: {
  categorySlug: string;
}) {
  const supabase = useMemo(() => createClient(), []);
  const {
    page, sort, country, province, city, district, services,
    setParams, setPage, resetAll, buildHref,
  } = useUrlState();

  const [svcMap, setSvcMap] = useState<ServiceMap>({}); // <— словарь slug→name

  // грузим словарь услуг один раз (или можно по facets.services)
  useEffect(() => {
    let cancelled = false;
    async function run() {
      const { data } = await supabase.from('services').select('slug,name').limit(1000);
      if (!cancelled) {
        const map: ServiceMap = {};
        for (const r of (data ?? [])) map[r.slug] = r.name;
        setSvcMap(map);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [supabase]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [facets, setFacets] = useState<Facets>({});

  // КЭШ «первого» набора фасетов (без фильтров) — база для «Popular …»
  const initialFacetsRef = useRef<Facets | null>(null);
  const hasAnyFilter = !!(
    country ||
    province ||
    city ||
    district ||
    services.length
  );

  // Локальные поиски в сайдбаре
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
      setItems(row?.items ?? []);
      setTotal(Number(row?.total_count ?? 0));
      setFacets(row?.facets ?? {});
      // сохраняем «базовые» фасеты (только когда фильтров нет)
      if (!hasAnyFilter && row?.facets && !initialFacetsRef.current) {
        initialFacetsRef.current = row.facets;
      }
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
  const labelOf = (slug: string) => svcMap[slug] ?? slug.replace(/-/g,' ');

  // База для популярных — либо закэшированные «первичные», либо текущие фасеты
  const baseFacets = initialFacetsRef.current ?? facets;

  const popularCitiesAll = (baseFacets.cities ?? []).filter(Boolean) as string[];
  const popularServicesAll = (baseFacets.services ?? []).filter(
    Boolean
  ) as string[];

  // Клиентская фильтрация по инпутам сайдбара + лимит 5
  const popularCities = popularCitiesAll
    .filter((c) => c.toLowerCase().includes(locationQuery.toLowerCase()))
    .slice(0, 5);

  const popularServices = popularServicesAll
    .filter((s) => s.toLowerCase().includes(treatmentQuery.toLowerCase()))
    .slice(0, 5);

  // Тоггл ссылок для services в сайдбаре (множественный выбор)
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
          {/* Скелетон/список */}
          {loading && items.length === 0 ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-36 animate-pulse rounded-2xl border bg-white"
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
            items.map((c) => (
              <Link
                key={c.slug}
                href={clinicPath({
                  slug: c.slug,
                  country: c.country,
                  province: c.province,
                  city: c.city,
                  district: c.district,
                })}
                className="block rounded-2xl border bg-white p-5 transition hover:shadow-md"
              >
                <div className="text-lg font-semibold">{c.name}</div>
                <div className="mt-1 text-sm text-gray-600">
                  {[c.country, c.city].filter(Boolean).join(" • ")}
                </div>
                {c.service_slugs?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {c.service_slugs.slice(0, 5).map((t) => {
                      const active = services.includes(t);
                      return (
                        <span
                          key={t}
                          className={
                            `rounded-full px-3 py-1 text-xs border
               ${active ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 bg-gray-100'}`
                          }
                          title={t}
                        >
                          {labelOf(t)}
                        </span>
                      );
                    })}
                  </div>
                )}
              </Link>
            ))
          )}

          {/* Пагинация */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              className="rounded-full border px-3 py-1 disabled:opacity-50"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1 || loading}
            >
              ← Prev
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              className="rounded-full border px-3 py-1 disabled:opacity-50"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages || loading}
            >
              Next →
            </button>
          </div>
        </div>

        {/* Сайдбар справа — «популярные» всегда из baseFacets, не исчезают */}
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
              className="w-full rounded-xl border px-3 py-2"
              placeholder="Type to filter locations"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
            />
            <h3 className="mt-4 text-lg font-semibold">Popular locations</h3>
            <ul className="mt-2 space-y-2">
              {popularCities.map((l) => {
                const isActive = city && l.toLowerCase() === city.toLowerCase();
                return (
                  <li key={l}>
                    <Link
                      className={isActive ? 'font-semibold text-blue-700 underline' : 'text-blue-600 hover:underline'}
                      href={buildHref({ city: l })}
                    >
                      {l}
                    </Link>
                  </li>
                );
              })}
              {popularCities.length === 0 && <li className="text-sm text-gray-500">No matches.</li>}
            </ul>
          </div>

          <div className="rounded-2xl border bg-white p-5">
            <div className="mb-3 text-sm font-semibold">Search treatments</div>
            <input
              className="w-full rounded-xl border px-3 py-2"
              placeholder="Type to filter treatments"
              value={treatmentQuery}
              onChange={(e) => setTreatmentQuery(e.target.value)}
            />
            <h3 className="mt-4 text-lg font-semibold">Popular treatments</h3>
            <ul className="mt-2 space-y-2">
              {popularServices.map((t) => {
                const slug = t.toLowerCase().replace(/\s+/g, "-"); // если facets отдает имя; если уже slug — оставьте t
                const isActive = services.includes(slug);
                return (
                  <li key={t}>
                    <Link
                      className={`hover:underline ${isActive ? 'font-semibold text-blue-700' : 'text-blue-600'}`}
                      href={toggleServiceHref(slug)}
                      title="Toggle treatment filter"
                    >
                      {labelOf(slug)}
                    </Link>
                  </li>
                );
              })}
              {popularServices.length === 0 && (
                <li className="text-sm text-gray-500">No matches.</li>
              )}
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}
