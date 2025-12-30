// lib/category-route/resolve.ts
type SB = any;

type Location = {
  country?: string | null;
  province?: string | null;
  city?: string | null;
  district?: string | null;
};

function uniq(arr: string[]) {
  return Array.from(new Set(arr));
}

export async function resolveCategoryRouteOnServer(
  sb: SB,
  args: {
    categoryId: number;
    categorySlug: string;
    segments: string[];
  }
): Promise<{
  location: Location | undefined;
  locationSlugs: string[];
  subcatSlugs: string[];
  treatmentLabel: string | null;
  matchedServiceSlugs: string[];
}> {
  const segments = (args.segments ?? []).map((s) => decodeURIComponent(s).trim()).filter(Boolean);

  // 1) грузим curated деревья (для категории)
  const [{ data: locNodes }, { data: subNodes }] = await Promise.all([
    sb
      .from("category_location_nodes")
      .select("id,parent_id,kind,name,slug,aliases,sort")
      .eq("category_id", args.categoryId),
    sb
      .from("category_subcategory_nodes")
      .select("id,parent_id,name,slug,aliases,sort")
      .eq("category_id", args.categoryId),
  ]);

  const loc = (locNodes ?? []) as any[];
  const sub = (subNodes ?? []) as any[];

  // быстрые индексы
  const locKey = (parentId: number | null, kind: string, slug: string) =>
    `${parentId ?? "root"}|${kind}|${slug.toLowerCase()}`;

  const locMap = new Map<string, any>();
  for (const n of loc) {
    locMap.set(locKey(n.parent_id ?? null, n.kind, n.slug), n);
  }

  const subKey = (parentId: number | null, slug: string) =>
    `${parentId ?? "root"}|${slug.toLowerCase()}`;

  const subMap = new Map<string, any>();
  for (const n of sub) {
    subMap.set(subKey(n.parent_id ?? null, n.slug), n);
  }

  // 2) greedy parse locations
  const kindOrder = ["country", "province", "city", "district"] as const;

  let i = 0;
  let locParent: number | null = null;
  let locDepth = 0;

  const locationSlugs: string[] = [];
  const location: Location = {};

  while (i < segments.length && locDepth < kindOrder.length) {
    const kind = kindOrder[locDepth];
    const seg = segments[i];

    const node = locMap.get(locKey(locParent, kind, seg));
    if (!node) break;

    locationSlugs.push(node.slug);
    location[kind] = node.name;

    locParent = node.id;
    locDepth++;
    i++;
  }

  // 3) остаток — subcategories (greedy)
  let subParent: number | null = null;
  const subcatSlugs: string[] = [];
  const pickedSubNodes: any[] = [];

  while (i < segments.length) {
    const seg = segments[i];
    const node = subMap.get(subKey(subParent, seg));
    if (!node) break;
    subcatSlugs.push(node.slug);
    pickedSubNodes.push(node);
    subParent = node.id;
    i++;
  }

  // 4) treatment label = самая глубокая выбранная подкатегория (как ты и хочешь)
  const treatmentLabel = pickedSubNodes.length
    ? String(pickedSubNodes[pickedSubNodes.length - 1].name)
    : null;

  // 5) approximate match -> service slugs
  const terms: string[] = [];
  for (const n of pickedSubNodes) {
    terms.push(n.slug, n.name);
    for (const a of (n.aliases ?? [])) terms.push(a);
  }

  let matchedServiceSlugs: string[] = [];
  if (terms.length) {
    const { data } = await sb.rpc("match_services_for_terms", {
      p_terms: uniq(terms),
      p_limit: 80,
    });
    matchedServiceSlugs = (data ?? []).map((r: any) => r.slug).filter(Boolean);
  }

  return {
    location: Object.keys(location).length ? location : undefined,
    locationSlugs,
    subcatSlugs,
    treatmentLabel,
    matchedServiceSlugs,
  };
}
