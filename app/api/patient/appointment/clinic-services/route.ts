import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/routeClient";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const clinicId = url.searchParams.get("clinicId");
  const subcategoryNodeId = Number(url.searchParams.get("subcategoryNodeId"));

  if (!clinicId || !Number.isInteger(subcategoryNodeId)) {
    return NextResponse.json({ error: "clinicId and subcategoryNodeId are required" }, { status: 400 });
  }

  const supabase = await createRouteClient();
  const { data, error } = await supabase.rpc("patient_services_by_clinic_filtered", {
    p_clinic_id: clinicId,
    p_subcategory_node_id: subcategoryNodeId,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const items = (data ?? []).map((r: any) => ({
    service_id: String(r.service_id),
    service_name: r.service_name ?? "",
  }));

  return NextResponse.json({ items }, { headers: { "Cache-Control": "no-store" } });
}
