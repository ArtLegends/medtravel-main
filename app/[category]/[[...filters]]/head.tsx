import { createServerClient } from "@/lib/supabase/serverClient";
import { buildCategoryMetadata, buildTreatmentMetadata } from "@/lib/seo/meta";
import { resolveCategoryRouteOnServer } from "@/lib/category-route/resolve";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default async function Head({
  params,
}: {
  params: { category: string; filters?: string | string[] };
}) {
  const slug = decodeURIComponent(params.category).toLowerCase();

  const raw = params.filters == null ? [] : Array.isArray(params.filters) ? params.filters : [params.filters];
  const segments = raw.map((s) => decodeURIComponent(s).toLowerCase());

  const sb = await createServerClient();

  const { data: cat } = await sb
    .from("categories")
    .select("id,name,name_ru,name_pl")
    .eq("slug", slug)
    .maybeSingle();

  const urlPath = "/" + [slug, ...segments].filter(Boolean).join("/");
  const hasUrlFilters = segments.length > 0;

  let resolved: any = {
    location: null,
    treatmentLabel: null,
    locationSlugs: [],
    subcatSlugs: [],
    hasExtraSegments: false,
  };

  let consumedPath = urlPath;

  if (cat) {
    try {
      resolved = await resolveCategoryRouteOnServer(sb, {
        categoryId: cat.id,
        categorySlug: slug,
        segments,
      });

      consumedPath =
        "/" +
        [slug, ...(resolved.locationSlugs ?? []), ...(resolved.subcatSlugs ?? [])]
          .filter(Boolean)
          .join("/");
    } catch {
      consumedPath = urlPath;
    }
  }

  const subjectLabel = (resolved?.treatmentLabel || cat?.name || cap(slug)) as string;

  const meta = !cat
    ? buildCategoryMetadata(urlPath, { categoryLabelEn: cap(slug) })
    : hasUrlFilters
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

  const title =
    typeof meta.title === "string"
      ? meta.title
      : (meta.title as any)?.absolute || (meta.title as any)?.default || String(meta.title);

  const description = String(meta.description ?? "");

  const abs = new URL(consumedPath, "https://medtravel.me").toString();
  const hasExtra = Boolean(resolved?.hasExtraSegments);

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={abs} />

      {/* Robots */}
      {hasExtra ? (
        <meta name="robots" content="noindex,follow" />
      ) : (
        <meta name="robots" content="index,follow" />
      )}

      {/* OG */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={abs} />
      <meta property="og:type" content="website" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />

      {/* ✅ Диагностика: это ТОЧНО появится в view-source */}
      <meta name="x-mt-meta-source" content={hasUrlFilters ? "TREATMENT(head.tsx)" : "CATEGORY(head.tsx)"} />
      <meta name="x-mt-meta-path" content={consumedPath} />
    </>
  );
}
