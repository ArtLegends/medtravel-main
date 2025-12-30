// components/category/CategoryGridClient.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/browserClient";
import { clinicHref } from "@/lib/clinic-url";
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

type RpcRow = {
  total_count: number;
  items: CatalogItem[];
  facets: any;
};

type NodeKind = "country" | "province" | "city" | "district";

type LocationNode = {
  id: number;
  category_id: number;
  parent_id: number | null;
  kind: NodeKind;
  name: string;
  slug: string;
  aliases: string[] | null;
  sort: number;
};

type SubNode = {
  id: number;
  category_id: number;
  parent_id: number | null;
  name: string;
  slug: string;
  aliases: string[] | null;
  sort: number;
};

const PAGE_SIZE = 12;

const LOC_KIND_ORDER: NodeKind[] = ["country", "province", "city", "district"];

function uniq(arr: string[]) {
  return Array.from(new Set(arr.map((s) => s.trim()).filter(Boolean)));
}

function slugToWords(slug: string) {
  return slug.replace(/-/g, " ").trim();
}

function buildTermPack(name?: string | null, slug?: string | null, aliases?: string[] | null) {
  const out: string[] = [];
  if (name) out.push(name);
  if (slug) out.push(slugToWords(slug), slug);
  for (const a of aliases ?? []) out.push(a, slugToWords(a), a.replace(/\s+/g, "-"));
  return uniq(out);
}

function formatLocationClinic(
  c: Pick<CatalogItem, "city" | "country" | "province" | "district">
) {
  const parts = [c.city, c.province, c.country].filter(Boolean);
  return parts.join(", ");
}

function buildTeaser(c: CatalogItem, labelOf: (slug: string) => string): string {
  const location = formatLocationClinic(c);
  const serviceNames = c.service_slugs.slice(0, 3).map(labelOf).filter(Boolean);

  const sentences: string[] = [];
  if (location) sentences.push(`${c.name} is a clinic located in ${location}.`);
  else sentences.push(`${c.name} is a clinic from our trusted network.`);

  if (serviceNames.length) sentences.push(`It offers treatments such as ${serviceNames.join(", ")}.`);

  const text = sentences.join(" ");
  if (text.length <= 260) return text;
  return text.slice(0, 260).replace(/\s+\S*$/, "") + "…";
}

// path helpers
function splitPath(pathname: string) {
  return pathname.split("/").filter(Boolean);
}
function joinCategoryPath(categorySlug: string, parts: string[]) {
  const clean = parts.filter(Boolean);
  return "/" + [categorySlug, ...clean].join("/");
}

export default function CategoryGridClient({
  categorySlug,
  categoryName,
}: {
  categorySlug: string;
  categoryName?: string;
}) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // query params (оставляем только page/sort)
  const page = Math.max(1, Number(searchParams?.get("page") || "1"));
  const sort = (searchParams?.get("sort") || "name_asc") as "name_asc" | "name_desc";

  // UI state
  const [locationQuery, setLocationQuery] = useState("");
  const [treatmentQuery, setTreatmentQuery] = useState("");
  const [showAllLocations, setShowAllLocations] = useState(false);
  const [showAllTreatments, setShowAllTreatments] = useState(false);

  // dictionaries
  const [svcMap, setSvcMap] = useState<ServiceMap>({});

  // active filter paths (resolved from URL)
  const [activeLoc, setActiveLoc] = useState<Partial<Record<NodeKind, LocationNode>>>({});
  const [activeSub, setActiveSub] = useState<SubNode[]>([]);

  // options for current level
  const [locOptions, setLocOptions] = useState<LocationNode[]>([]);
  const [subOptions, setSubOptions] = useState<SubNode[]>([]);

  // listing
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [total, setTotal] = useState(0);

  // keep initial facets? мы теперь не используем RPC facets, но оставим как было для cover
  const initialLoadedRef = useRef(false);

  // load services labels
  useEffect(() => {
    let cancelled = false;
    async function run() {
      const { data } = await supabase.from("services").select("slug,name").limit(5000);
      if (cancelled) return;
      const map: ServiceMap = {};
      for (const r of data ?? []) map[r.slug] = r.name;
      setSvcMap(map);
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const labelOf = (slug: string) => svcMap[slug] ?? slugToWords(slug);

  // Resolve URL -> (location path + subcategory path)
  useEffect(() => {
    let cancelled = false;

    async function resolveFromUrl() {
      const segs = splitPath(pathname || "");
      // ожидаем: /{category}/{...filters}
      if (!segs.length || segs[0] !== categorySlug) {
        setActiveLoc({});
        setActiveSub([]);
        return;
      }
      const filters = segs.slice(1);

      // 1) LOCATION (country->province->city->district), c пропусками уровней
      const nextLoc: Partial<Record<NodeKind, LocationNode>> = {};
      let parentId: number | null = null;
      let idx = 0;

      for (let k = 0; k < LOC_KIND_ORDER.length && idx < filters.length; ) {
        const kind = LOC_KIND_ORDER[k];
        const seg = filters[idx];

        const q = supabase
          .from("category_location_nodes")
          .select("id,category_id,parent_id,kind,name,slug,aliases,sort")
          .eq("category_id", (await getCategoryId(categorySlug)).id)
          .eq("kind", kind)
          .eq("slug", seg);

        parentId === null ? q.is("parent_id", null) : q.eq("parent_id", parentId);

        const { data } = await q.maybeSingle();

        if (cancelled) return;

        if (data) {
          nextLoc[kind] = data as any;
          parentId = (data as any).id;
          idx += 1;
          k += 1;
        } else {
          // допускаем пропуски уровней: не съедаем сегмент, просто пробуем следующий kind
          k += 1;
        }
      }

      // 2) SUBCATS (до 3 уровней), строго по parent_id
      const nextSub: SubNode[] = [];
      let subParent: number | null = null;

      for (let depth = 0; depth < 10 && idx < filters.length; depth++) {
        const seg = filters[idx];

        const q = supabase
          .from("category_subcategory_nodes")
          .select("id,category_id,parent_id,name,slug,aliases,sort")
          .eq("category_id", (await getCategoryId(categorySlug)).id)
          .eq("slug", seg);

        subParent === null ? q.is("parent_id", null) : q.eq("parent_id", subParent);

        const { data } = await q.maybeSingle();
        if (cancelled) return;

        if (!data) break; // остаток игнорируем (никаких 404)
        nextSub.push(data as any);
        subParent = (data as any).id;
        idx += 1;
        // если хочешь жёстко ограничить до 3 — поставь if(nextSub.length>=3) break;
      }

      setActiveLoc(nextLoc);
      setActiveSub(nextSub);
    }

    // маленький кэш category_id
    const catCache = new Map<string, { id: number }>();
    async function getCategoryId(slug: string) {
      const cached = catCache.get(slug);
      if (cached) return cached;

      const { data } = await supabase.from("categories").select("id").eq("slug", slug).maybeSingle();
      const id = Number((data as any)?.id || 0);
      const res = { id };
      catCache.set(slug, res);
      return res;
    }

    resolveFromUrl();

    return () => {
      cancelled = true;
    };
  }, [pathname, supabase, categorySlug]);

  // Load current-level location options
  useEffect(() => {
    let cancelled = false;

    async function run() {
      const { data: cat } = await supabase.from("categories").select("id").eq("slug", categorySlug).maybeSingle();
      const categoryId = Number((cat as any)?.id || 0);
      if (!categoryId) return;

      // определяем текущую глубину локации
      let lastKindIndex = -1;
      let lastNode: LocationNode | null = null;
      for (let i = 0; i < LOC_KIND_ORDER.length; i++) {
        const k = LOC_KIND_ORDER[i];
        const n = (activeLoc as any)[k] as LocationNode | undefined;
        if (n) {
          lastKindIndex = i;
          lastNode = n;
        }
      }

      const nextKind = LOC_KIND_ORDER[Math.min(lastKindIndex + 1, LOC_KIND_ORDER.length - 1)];
      const parentId = lastNode?.id ?? null;

      const q = supabase
        .from("category_location_nodes")
        .select("id,category_id,parent_id,kind,name,slug,aliases,sort")
        .eq("category_id", categoryId)
        .eq("kind", nextKind)
        .order("sort", { ascending: true })
        .order("name", { ascending: true });

      parentId === null ? q.is("parent_id", null) : q.eq("parent_id", parentId);

      const { data } = await q;
      if (cancelled) return;
      setLocOptions((data as any) ?? []);
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [supabase, categorySlug, activeLoc]);

  // Load current-level subcategory options
  useEffect(() => {
    let cancelled = false;

    async function run() {
      const { data: cat } = await supabase.from("categories").select("id").eq("slug", categorySlug).maybeSingle();
      const categoryId = Number((cat as any)?.id || 0);
      if (!categoryId) return;

      const last = activeSub[activeSub.length - 1] ?? null;
      const parentId = last?.id ?? null;

      const q = supabase
        .from("category_subcategory_nodes")
        .select("id,category_id,parent_id,name,slug,aliases,sort")
        .eq("category_id", categoryId)
        .order("sort", { ascending: true })
        .order("name", { ascending: true });

      parentId === null ? q.is("parent_id", null) : q.eq("parent_id", parentId);

      const { data } = await q;
      if (cancelled) return;
      setSubOptions((data as any) ?? []);
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [supabase, categorySlug, activeSub]);

  // Build RPC params (smart)
  const rpcParams = useMemo(() => {
    const country = activeLoc.country?.name ?? null;
    const province = activeLoc.province?.name ?? null;
    const city = activeLoc.city?.name ?? null;
    const district = activeLoc.district?.name ?? null;

    const countryTerms = activeLoc.country ? buildTermPack(activeLoc.country.name, activeLoc.country.slug, activeLoc.country.aliases) : null;
    const provinceTerms = activeLoc.province ? buildTermPack(activeLoc.province.name, activeLoc.province.slug, activeLoc.province.aliases) : null;
    const cityTerms = activeLoc.city ? buildTermPack(activeLoc.city.name, activeLoc.city.slug, activeLoc.city.aliases) : null;
    const districtTerms = activeLoc.district ? buildTermPack(activeLoc.district.name, activeLoc.district.slug, activeLoc.district.aliases) : null;

    const serviceTerms = activeSub.length
      ? uniq(
          activeSub.flatMap((n) => buildTermPack(n.name, n.slug, n.aliases))
        )
      : null;

    return {
      p_category_slug: categorySlug,
      p_country: country,
      p_province: province,
      p_city: city,
      p_district: district,
      p_service_slugs: null, // мы больше не хотим строгий service slug из URL

      p_sort: sort,
      p_limit: PAGE_SIZE,
      p_offset: (page - 1) * PAGE_SIZE,

      p_country_terms: countryTerms,
      p_province_terms: provinceTerms,
      p_city_terms: cityTerms,
      p_district_terms: districtTerms,

      // p_service_ids подгрузим отдельным эффектом ниже
      p_service_terms: serviceTerms,
      p_sim: 0.25,
    };
  }, [activeLoc, activeSub, categorySlug, sort, page]);

  const [serviceIds, setServiceIds] = useState<number[] | null>(null);

  // Load mapped service_ids by selected subcategory nodes
  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!activeSub.length) {
        setServiceIds(null);
        return;
      }
      const nodeIds = activeSub.map((n) => n.id);

      const { data } = await supabase
        .from("category_subcategory_node_services")
        .select("service_id,node_id,weight")
        .in("node_id", nodeIds);

      if (cancelled) return;
      const ids = uniq((data ?? []).map((r: any) => String(r.service_id))).map((x) => Number(x)).filter(Boolean);
      setServiceIds(ids.length ? ids : null);
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [supabase, activeSub]);

  // Fetch listing from RPC
  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.rpc("catalog_browse_basic", {
        ...rpcParams,
        p_service_ids: serviceIds ?? null,
      } as any);

      if (cancelled) return;

      if (error) {
        setError(error.message);
        setItems([]);
        setTotal(0);
        setLoading(false);
        return;
      }

      const row = Array.isArray(data) ? (data[0] as RpcRow | undefined) : (data as RpcRow | undefined);
      const baseItems: CatalogItem[] = (row?.items as any) ?? [];
      setTotal(Number(row?.total_count ?? 0));

      // cover from clinic_images
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
          (imgs ?? []).forEach((r: any) => {
            const url = (r?.url || "").trim();
            if (!url) return;
            if (!imgMap.has(r.clinic_id)) imgMap.set(r.clinic_id, url);
          });

          enrichedItems = baseItems.map((c) => ({ ...c, image_url: imgMap.get(c.id) ?? null }));
        }
      } catch {
        enrichedItems = baseItems;
      }

      setItems(enrichedItems);
      setLoading(false);
      initialLoadedRef.current = true;
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [supabase, rpcParams, serviceIds]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Build current path arrays (slugs) to preserve when navigating
  const currentLocSlugs = useMemo(() => {
    const out: string[] = [];
    for (const k of LOC_KIND_ORDER) {
      const n = (activeLoc as any)[k] as LocationNode | undefined;
      if (n?.slug) out.push(n.slug);
    }
    return out;
  }, [activeLoc]);

  const currentSubSlugs = useMemo(() => {
    return activeSub.map((n) => n.slug);
  }, [activeSub]);

  const resetAll = () => {
    router.push(`/${categorySlug}`, { scroll: false });
  };

  const pushWithQuery = (pathOnly: string) => {
    const sp = new URLSearchParams(searchParams?.toString() ?? "");
    sp.delete("page");
    const q = sp.toString();
    router.push(q ? `${pathOnly}?${q}` : pathOnly, { scroll: false });
  };

  // click handlers for nested selection
  const hrefSelectLocation = (node: LocationNode) => {
    // определить уровень ноды и собрать slugs до него (включительно)
    const idx = LOC_KIND_ORDER.indexOf(node.kind);
    const nextLoc: string[] = [];
    for (let i = 0; i < idx; i++) {
      const k = LOC_KIND_ORDER[i];
      const n = (activeLoc as any)[k] as LocationNode | undefined;
      if (n?.slug) nextLoc.push(n.slug);
    }
    nextLoc.push(node.slug);

    return joinCategoryPath(categorySlug, [...nextLoc, ...currentSubSlugs]);
  };

  const hrefSelectSub = (node: SubNode) => {
    const nextSub = [...currentSubSlugs, node.slug];
    return joinCategoryPath(categorySlug, [...currentLocSlugs, ...nextSub]);
  };

  // go back one level
  const hrefBackLocation = () => {
    const nextLoc = [...currentLocSlugs];
    nextLoc.pop();
    return joinCategoryPath(categorySlug, [...nextLoc, ...currentSubSlugs]);
  };
  const hrefBackSub = () => {
    const nextSub = [...currentSubSlugs];
    nextSub.pop();
    return joinCategoryPath(categorySlug, [...currentLocSlugs, ...nextSub]);
  };

  // filter options by query + show all
  const locFiltered = useMemo(() => {
    const q = locationQuery.trim().toLowerCase();
    const list = !q
      ? locOptions
      : locOptions.filter((n) => {
          const hay = `${n.name} ${n.slug} ${(n.aliases ?? []).join(" ")}`.toLowerCase();
          return hay.includes(q);
        });
    return showAllLocations ? list : list.slice(0, 5);
  }, [locOptions, locationQuery, showAllLocations]);

  const subFiltered = useMemo(() => {
    const q = treatmentQuery.trim().toLowerCase();
    const list = !q
      ? subOptions
      : subOptions.filter((n) => {
          const hay = `${n.name} ${n.slug} ${(n.aliases ?? []).join(" ")}`.toLowerCase();
          return hay.includes(q);
        });
    return showAllTreatments ? list : list.slice(0, 5);
  }, [subOptions, treatmentQuery, showAllTreatments]);

  const hasAnyFilter = currentLocSlugs.length > 0 || currentSubSlugs.length > 0;

  return (
    <section className="bg-gray-50">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-10 lg:grid-cols-[1fr_360px]">
        {/* LIST */}
        <div className="space-y-4">
          <Breadcrumbs
            items={[
              { label: "Home page", href: "/" },
              { label: categoryName ?? categorySlug },
            ]}
          />

          {loading && items.length === 0 ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl border bg-white" />
            ))
          ) : error ? (
            <div className="rounded-2xl border bg-white p-6 text-red-600">Error: {error}</div>
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
                    <Link href={clinicUrl} className="md:w-48 md:min-w-[12rem]">
                      <div className="h-40 w-full overflow-hidden rounded-xl bg-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={
                            c.image_url ??
                            ""
                          }
                          alt={c.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </Link>

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
                            <p className="mt-1 text-sm text-gray-500">{locationLabel}</p>
                          )}
                        </div>

                        <Link
                          href={quoteUrl}
                          className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700"
                        >
                          Claim your free quote
                        </Link>
                      </div>

                      {teaser && (
                        <p className="text-sm text-gray-600">
                          {teaser}{" "}
                          <Link href={clinicUrl} className="font-medium text-teal-700 hover:underline">
                            Read more
                          </Link>
                        </p>
                      )}

                      {c.service_slugs?.length > 0 && (
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {c.service_slugs.slice(0, 4).map((t) => (
                            <span
                              key={t}
                              className="rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-xs text-gray-700"
                              title={t}
                            >
                              {labelOf(t)}
                            </span>
                          ))}
                          {c.service_slugs.length > 4 && (
                            <Link href={clinicUrl} className="text-xs font-medium text-teal-700 hover:underline">
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

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              className="rounded-full border px-3 py-1 text-sm disabled:opacity-50"
              onClick={() => pushWithQuery(joinCategoryPath(categorySlug, [...currentLocSlugs, ...currentSubSlugs]) + `?page=${Math.max(1, page - 1)}`)}
              disabled={page <= 1 || loading}
            >
              ← Prev
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              className="rounded-full border px-3 py-1 text-sm disabled:opacity-50"
              onClick={() => pushWithQuery(joinCategoryPath(categorySlug, [...currentLocSlugs, ...currentSubSlugs]) + `?page=${Math.min(totalPages, page + 1)}`)}
              disabled={page >= totalPages || loading}
            >
              Next →
            </button>
          </div>
        </div>

        {/* SIDEBAR */}
        <aside className="space-y-6">
          {/* Locations */}
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

            {/* active path + back */}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              {currentLocSlugs.length > 0 && (
                <Link href={hrefBackLocation()} className="text-blue-600 hover:underline">
                  ← Back
                </Link>
              )}
              {currentLocSlugs.length === 0 ? (
                <span className="text-gray-500">Top level</span>
              ) : (
                <span className="text-gray-500">{currentLocSlugs.join(" / ")}</span>
              )}
            </div>

            <h3 className="mt-4 text-sm font-semibold">Popular locations</h3>
            <ul className="mt-2 space-y-2 text-sm">
              {locFiltered.map((n) => (
                <li key={n.id}>
                  <Link
                    className="text-blue-600 hover:underline"
                    href={hrefSelectLocation(n)}
                  >
                    {n.name}
                  </Link>
                </li>
              ))}
              {locFiltered.length === 0 && (
                <li className="text-xs text-gray-500">No matches.</li>
              )}
            </ul>

            {!locationQuery && locOptions.length > 5 && (
              <button
                type="button"
                className="mt-3 text-xs font-medium text-teal-700 hover:underline"
                onClick={() => setShowAllLocations((v) => !v)}
              >
                {showAllLocations ? "Show less" : `Show all (${locOptions.length})`}
              </button>
            )}
          </div>

          {/* Treatments */}
          <div className="rounded-2xl border bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-semibold">Search treatments</div>
              {activeSub.length > 0 && (
                <Link href={hrefBackSub()} className="text-xs text-blue-600 hover:underline">
                  ← Back
                </Link>
              )}
            </div>

            <input
              className="w-full rounded-xl border px-3 py-2 text-sm"
              placeholder="Type to filter treatments"
              value={treatmentQuery}
              onChange={(e) => setTreatmentQuery(e.target.value)}
            />

            <div className="mt-3 text-xs text-gray-500">
              {activeSub.length ? activeSub.map((n) => n.slug).join(" / ") : "Top level"}
            </div>

            <h3 className="mt-4 text-sm font-semibold">Popular treatments</h3>
            <ul className="mt-2 space-y-2 text-sm">
              {subFiltered.map((n) => (
                <li key={n.id}>
                  <Link
                    className="text-blue-600 hover:underline"
                    href={hrefSelectSub(n)}
                  >
                    {n.name}
                  </Link>
                </li>
              ))}
              {subFiltered.length === 0 && (
                <li className="text-xs text-gray-500">No matches.</li>
              )}
            </ul>

            {!treatmentQuery && subOptions.length > 5 && (
              <button
                type="button"
                className="mt-3 text-xs font-medium text-teal-700 hover:underline"
                onClick={() => setShowAllTreatments((v) => !v)}
              >
                {showAllTreatments ? "Show less" : `Show all (${subOptions.length})`}
              </button>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
