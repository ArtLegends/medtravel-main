import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/routeClient";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const categoryIdRaw = url.searchParams.get("categoryId");
  const categoryId = Number(categoryIdRaw);

  if (!Number.isInteger(categoryId)) {
    return NextResponse.json({ error: "categoryId must be an integer" }, { status: 400 });
  }

  const supabase = await createRouteClient();
  const { data, error } = await supabase.rpc("patient_subcategories_roots_by_category", {
    p_category_id: categoryId,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const items = (data ?? []).map((r: any) => ({
    id: Number(r.id),
    name: r.name ?? "",
    clinics_count: Number(r.clinics_count ?? 0),
  }));

  return NextResponse.json({ items }, { headers: { "Cache-Control": "no-store" } });
}
