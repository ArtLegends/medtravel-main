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

    const list = (data ?? []).map((n: any) => ({
        id: Number(n.id),
        name: n.name ?? "",
        clinics_count: Number(n.clinics_count ?? n.clinicsCount ?? 0),
    }));

    return NextResponse.json({ items: list }, { headers: { "Cache-Control": "no-store" } });
}
