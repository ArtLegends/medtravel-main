import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/routeClient";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const countryNodeId = Number(url.searchParams.get("countryNodeId"));

  if (!Number.isInteger(countryNodeId)) {
    return NextResponse.json({ error: "countryNodeId must be an integer" }, { status: 400 });
  }

  const supabase = await createRouteClient();
  const { data, error } = await supabase.rpc("patient_location_cities_by_country_node", {
    p_country_node_id: countryNodeId,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const items = (data ?? []).map((r: any) => ({
    id: Number(r.id),
    city: r.city ?? "",
    clinics_count: Number(r.clinics_count ?? 0),
  }));

  return NextResponse.json({ items }, { headers: { "Cache-Control": "no-store" } });
}
