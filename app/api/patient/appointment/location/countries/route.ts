import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/routeClient";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);

  const categoryIdRaw = url.searchParams.get("categoryId");
  const subcategoryNodeIdRaw = url.searchParams.get("subcategoryNodeId");

  if (!categoryIdRaw || !subcategoryNodeIdRaw) {
    return NextResponse.json(
      { error: "categoryId and subcategoryNodeId are required" },
      { status: 400 }
    );
  }

  const categoryId = Number(categoryIdRaw);
  const subcategoryNodeId = Number(subcategoryNodeIdRaw);

  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    return NextResponse.json({ error: "categoryId must be a positive integer" }, { status: 400 });
  }
  if (!Number.isInteger(subcategoryNodeId) || subcategoryNodeId <= 0) {
    return NextResponse.json({ error: "subcategoryNodeId must be a positive integer" }, { status: 400 });
  }

  const supabase = await createRouteClient();

  const { data, error } = await supabase.rpc("patient_location_countries_by_category_and_node", {
    p_category_id: categoryId,
    p_node_id: subcategoryNodeId,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const items = (data ?? []).map((r: any) => ({
    country: r.country ?? "",
    clinics_count: Number(r.clinics_count ?? 0),
  }));

  return NextResponse.json({ items }, { headers: { "Cache-Control": "no-store" } });
}
