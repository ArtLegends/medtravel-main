// lib/category-route/resolve.ts
type SB = any;

type Location = { country?: string|null; province?: string|null; city?: string|null; district?: string|null };

type LocNode = {
  id: number;
  parent_id: number | null;
  kind: "country" | "province" | "city" | "district";
  name: string;
  slug: string;
};

type SubNode = {
  id: number;
  parent_id: number | null;
  name: string;
  slug: string;
};

function uniq(arr: string[]) {
  return Array.from(new Set(arr));
}

function mapByParent<T extends { parent_id: any }>(rows: T[]) {
  const m = new Map<string, T[]>();
  for (const r of rows) {
    const k = String(r.parent_id ?? "null");
    m.set(k, [...(m.get(k) ?? []), r]);
  }
  return m;
}

function findChildBySlug<T extends { slug: string }>(children: T[] | undefined, slug: string) {
  if (!children?.length) return null;
  const s = slug.toLowerCase();
  return children.find((c) => String(c.slug).toLowerCase() === s) ?? null;
}

export async function resolveCategoryRouteOnServer(
  sb: any,
  args: { categoryId: number; categorySlug: string; segments: string[] }
) {
  const { categoryId, segments } = args;

  // 1) все location nodes
  const { data: locRows } = await sb
    .from("category_location_nodes")
    .select("id,parent_id,kind,name,slug")
    .eq("category_id", categoryId);

  // 2) все subcategory nodes
  const { data: subRows } = await sb
    .from("category_subcategory_nodes")
    .select("id,parent_id,name,slug")
    .eq("category_id", categoryId);

  const locMap = mapByParent<LocNode>((locRows ?? []) as any);
  const subMap = mapByParent<SubNode>((subRows ?? []) as any);

  const location: Location = {};
  const locationSlugs: string[] = [];
  const subcatSlugs: string[] = [];

  let i = 0;

  // --- LOCATION PATH (с начала) ---
  let curLocParent: number | null = null;

  while (i < segments.length) {
    const seg = segments[i];
    const children = locMap.get(String(curLocParent ?? "null"));
    const hit = findChildBySlug(children, seg);
    if (!hit) break;

    locationSlugs.push(hit.slug);
    // записываем имя в нужное поле по kind
    if (hit.kind === "country") location.country = hit.name;
    if (hit.kind === "province") location.province = hit.name;
    if (hit.kind === "city") location.city = hit.name;
    if (hit.kind === "district") location.district = hit.name;

    curLocParent = hit.id;
    i++;
  }

  // --- SUBCATEGORY PATH (остаток) ---
  let curSubParent: number | null = null;

  while (i < segments.length) {
    const seg = segments[i];
    const children = subMap.get(String(curSubParent ?? "null"));
    const hit = findChildBySlug(children, seg);
    if (!hit) break;

    subcatSlugs.push(hit.slug);
    curSubParent = hit.id;
    i++;
  }

  // если остались непонятные сегменты — считаем “хвост”
  const hasExtraSegments = i < segments.length;

  // treatmentLabel = последняя matched subcategory
  let treatmentLabel: string | null = null;
  if (subcatSlugs.length) {
    const lastSlug = subcatSlugs[subcatSlugs.length - 1];
    const lastNode = (subRows ?? []).find((n: any) => String(n.slug).toLowerCase() === String(lastSlug).toLowerCase());
    treatmentLabel = lastNode?.name ?? null;
  }

  return {
    location: Object.keys(location).length ? location : null,
    treatmentLabel,
    locationSlugs,
    subcatSlugs,
    matchedServiceSlugs: [], // если нужно — можно добавить позже
    hasExtraSegments,
    // можно расширить:
    // minPrice, maxPrice, currency
  };
}
