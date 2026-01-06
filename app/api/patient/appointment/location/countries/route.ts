import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/routeClient";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const categoryId = Number(url.searchParams.get("categoryId"));

  if (!Number.isInteger(categoryId)) {
    return NextResponse.json({ error: "categoryId must be an integer" }, { status: 400 });
  }

  const supabase = await createRouteClient();
  const { data, error } = await supabase.rpc("patient_location_countries_by_category", {
    p_category_id: categoryId,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const items = (data ?? []).map((r: any) => ({
    id: Number(r.id),
    country: r.country ?? "",
    clinics_count: Number(r.clinics_count ?? 0),
  }));

  return NextResponse.json({ items }, { headers: { "Cache-Control": "no-store" } });
}
