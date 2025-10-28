// components/category/CategoryGridClient.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/browserClient";
import CategoryFilters from "./CategoryFilters";
import { clinicPath } from '@/lib/clinic-url'

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
  const arr = (multi.length ? multi : raw.split(",")).map((s) => s.trim()).filter(Boolean);
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
    if ("country" in patch || "province" in patch || "city" in patch || "district" in patch || "service" in patch || "sort" in patch) {
      next.delete("page");
    }
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  const setPage = (page: number) => setParams({ page: String(page) });
  const resetAll = () => router.replace(pathname ?? "/", { scroll: false });

  return { ...state, setParams, setPage, resetAll };
}

export default function CategoryGridClient({ categorySlug }: { categorySlug: string }) {
  const supabase = useMemo(() => createClient(), []);
  const { page, sort, country, province, city, district, services, setParams, setPage, resetAll } = useUrlState();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [facets, setFacets] = useState<Facets>({});

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
      const row = Array.isArray(data) ? (data[0] as RpcRow | undefined) : (data as RpcRow | undefined);
      setItems(row?.items ?? []);
      setTotal(Number(row?.total_count ?? 0));
      setFacets(row?.facets ?? {});
      setLoading(false);
    }
    run();
    return () => { cancelled = true; };
  }, [supabase, categorySlug, page, sort, country, province, city, district, services]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // удобные «популярные» списки (если есть фасеты — используем их, иначе фолбэк как раньше)
  const popularCities = (facets.cities && facets.cities.slice(0, 5)) || ["Istanbul", "Ankara", "Antalya", "Warsaw", "Krakow"];
  const popularServices = (facets.services && facets.services.slice(0, 5)) || [
    "Hair Transplant",
    "Dental Implants",
    "Veneers",
    "Rhinoplasty",
    "Crowns",
  ];

  return (
    <section className="bg-gray-50">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-10 lg:grid-cols-[1fr_360px]">
        {/* Листинг слева — сохраняем как на первом скрине */}
        <div className="space-y-4">
          {loading && items.length === 0 ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-36 animate-pulse rounded-2xl border bg-white" />
            ))
          ) : error ? (
            <div className="rounded-2xl border bg-white p-6 text-red-600">Error: {error}</div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border bg-white p-10 text-center text-gray-600">No clinics found</div>
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
                    {c.service_slugs.slice(0, 5).map((t) => (
                      <span key={t} className="rounded-full bg-gray-100 px-3 py-1 text-xs">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))
          )}

          {/* Пагинация снизу под списком */}
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

        {/* Сайдбар справа — здесь живые фильтры + «популярные» списки (как на первом скрине) */}
        <aside className="space-y-6">

          <div className="rounded-2xl border bg-white p-5">
            <div className="mb-3 text-sm font-semibold">Search locations</div>
            <input className="w-full rounded-xl border px-3 py-2" placeholder="Search locations" />
            <h3 className="mt-4 text-lg font-semibold">Popular locations</h3>
            <ul className="mt-2 space-y-2">
              {popularCities.map((l) => (
                <li key={l}>
                  <Link className="text-blue-600 hover:underline" href={`/${categorySlug}?city=${encodeURIComponent(l)}`}>
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border bg-white p-5">
            <div className="mb-3 text-sm font-semibold">Search treatments</div>
            <input className="w-full rounded-xl border px-3 py-2" placeholder="Search treatments" />
            <h3 className="mt-4 text-lg font-semibold">Popular treatments</h3>
            <ul className="mt-2 space-y-2">
              {popularServices.map((t) => (
                <li key={t}>
                  <Link
                    className="text-blue-600 hover:underline"
                    href={`/${categorySlug}?service=${encodeURIComponent(
                      t.toLowerCase().replace(/\s+/g, "-")
                    )}`}
                  >
                    {t}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}
