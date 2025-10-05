// components/category/CategoryClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/browserClient";
import CategoryFilters from "./CategoryFilters"; // скорректируй путь, если нужен другой

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
  accreditations: string[];
  languages: string[];
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
  // поддерживаем формат "service=a,b,c" и повторы вида ?service=a&service=b
  const fromComma = raw.split(",").filter(Boolean);
  const multi = sp.getAll("service").flatMap(v => v.split(","));
  const all = (multi.length > 1 ? multi : fromComma).map(s => s.trim()).filter(Boolean);
  return Array.from(new Set(all));
}

function useUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const state = useMemo(() => {
    const params = new URLSearchParams((searchParams?.toString() ?? ""));
    const page = Math.max(1, Number(params.get("page") || "1"));
    const sort = (params.get("sort") || "name_asc") as "name_asc" | "name_desc";
    const country = params.get("country") || undefined;
    const province = params.get("province") || undefined;
    const city = params.get("city") || undefined;
    const district = params.get("district") || undefined;
    const services = parseServicesParam(params);
    return { params, page, sort, country, province, city, district, services };
  }, [searchParams]);

  const setParams = (patch: Record<string, string | string[] | undefined>) => {
    const next = new URLSearchParams((searchParams?.toString() ?? ""));
    Object.entries(patch).forEach(([k, v]) => {
      if (v === undefined || (Array.isArray(v) && v.length === 0) || v === "") {
        next.delete(k);
        return;
      }
      if (Array.isArray(v)) {
        next.delete(k);
        next.set(k, v.join(",")); // компактно храним мульти-значения
      } else {
        next.set(k, v);
      }
    });
    // сбрасываем страницу при смене фильтров
    if (patch.country || patch.province || patch.city || patch.district || patch.service || patch.sort) {
      next.delete("page");
    }
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  const setPage = (page: number) => setParams({ page: String(page) });

  const resetAll = () => {
    router.replace(pathname ?? "/", { scroll: false });
  };

  return { ...state, setParams, setPage, resetAll };
}

export default function CategoryClient({ categorySlug }: { categorySlug: string }) {
  const supabase = useMemo(() => createClient(), []);
  const { page, sort, country, province, city, district, services, setParams, setPage, resetAll } = useUrlState();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [facets, setFacets] = useState<Facets>({});

  // загрузка данных при изменении URL-фильтров
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
      if (!row) {
        setItems([]);
        setTotal(0);
        setFacets({});
      } else {
        setItems(row.items ?? []);
        setTotal(Number(row.total_count ?? 0));
        setFacets(row.facets ?? {});
      }
      setLoading(false);
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [supabase, categorySlug, page, sort, country, province, city, district, services]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <CategoryFilters
        facets={facets}
        selected={{ country, province, city, district, services, sort }}
        onChangeAction={(chg) => {
          const patch: Record<string, string | string[] | undefined> = {};
          if ("country" in chg) patch.country = chg.country;
          if ("province" in chg) patch.province = chg.province;
          if ("city" in chg) patch.city = chg.city;
          if ("district" in chg) patch.district = chg.district;
          if ("services" in chg) patch.service = chg.services && chg.services.length ? chg.services : undefined;
          if ("sort" in chg) patch.sort = chg.sort;
          setParams(patch);
        }}
        onResetAction={resetAll}
      />

      {/* Список клиник */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading && items.length === 0 ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-gray-200" />
          ))
        ) : error ? (
          <div className="col-span-full rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            Ошибка загрузки: {error}
          </div>
        ) : items.length === 0 ? (
          <div className="col-span-full rounded-xl border bg-white p-6 text-center text-gray-600">
            Ничего не найдено. Попробуй изменить фильтры.
          </div>
        ) : (
          items.map((c) => (
            <a
              key={c.id}
              href={`/${categorySlug}/${encodeURIComponent(c.country ?? "")}/${encodeURIComponent(
                c.city ?? ""
              )}/${encodeURIComponent(c.slug)}`}
              className="rounded-2xl border bg-white p-5 hover:shadow-md transition"
            >
              <div className="text-lg font-semibold">{c.name}</div>
              <div className="mt-1 text-sm text-gray-600">
                {[c.country, c.province, c.city, c.district].filter(Boolean).join(" • ")}
              </div>
              {c.rating != null && (
                <div className="mt-2 text-sm">
                  Рейтинг: <span className="font-medium">{c.rating.toFixed(2)}</span>
                </div>
              )}
              {c.service_slugs?.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {c.service_slugs.slice(0, 5).map((s) => (
                    <span key={s} className="rounded-full bg-gray-100 px-3 py-1 text-xs">{s}</span>
                  ))}
                  {c.service_slugs.length > 5 && (
                    <span className="text-xs text-gray-500">+{c.service_slugs.length - 5}</span>
                  )}
                </div>
              ) : null}
            </a>
          ))
        )}
      </div>

      {/* Пагинация */}
      <div className="mt-6 flex items-center justify-center gap-2">
        <button
          className="rounded-full border px-3 py-1 disabled:opacity-50"
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page <= 1 || loading}
        >
          ← Назад
        </button>
        <span className="text-sm text-gray-600">
          Стр. {page} из {totalPages}
        </span>
        <button
          className="rounded-full border px-3 py-1 disabled:opacity-50"
          onClick={() => setPage(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages || loading}
        >
          Вперёд →
        </button>
      </div>
    </div>
  );
}
