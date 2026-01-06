import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/routeClient";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);

  const categoryId = Number(url.searchParams.get("categoryId"));
  const subcategoryNodeId = Number(url.searchParams.get("subcategoryNodeId"));
  const country = url.searchParams.get("country");
  const city = url.searchParams.get("city");
  const q = url.searchParams.get("q") ?? null;

  const limit = Number(url.searchParams.get("limit") ?? "15");
  const offset = Number(url.searchParams.get("offset") ?? "0");

  if (!Number.isInteger(categoryId) || !Number.isInteger(subcategoryNodeId) || !country || !city) {
    return NextResponse.json(
      { error: "categoryId, subcategoryNodeId, country, city are required" },
      { status: 400 }
    );
  }

  const supabase = await createRouteClient();
  const { data, error } = await supabase.rpc("patient_clinics_by_filters", {
    p_category_id: categoryId,
    p_subcategory_node_id: subcategoryNodeId,
    p_country: country,
    p_city: city,
    p_q: q,
    p_limit: limit,
    p_offset: offset,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const items = (data ?? []).map((r: any) => ({
    clinic_id: String(r.clinic_id),
    clinic_name: r.clinic_name ?? "",
    country: r.country ?? "",
    city: r.city ?? "",
    total_count: Number(r.total_count ?? 0),
  }));

  const total = items[0]?.total_count ?? 0;

  return NextResponse.json({ items, total }, { headers: { "Cache-Control": "no-store" } });
}
