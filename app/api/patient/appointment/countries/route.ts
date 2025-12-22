import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/routeClient";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const serviceIdRaw = url.searchParams.get("serviceId");
  const serviceId = Number(serviceIdRaw);

  if (!Number.isInteger(serviceId)) {
    return NextResponse.json({ error: "serviceId must be an integer" }, { status: 400 });
  }

  const supabase = await createRouteClient();
  const { data, error } = await supabase.rpc("patient_countries_by_service", {
    p_service_id: serviceId,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const list = (data ?? []).map((c: any) => ({
    country: c.country ?? "",
    clinics_count: Number(c.clinicsCount ?? c.clinics_count ?? 0),
  }));

  return NextResponse.json(
    { countries: list, data: list, items: list },
    { headers: { "Cache-Control": "no-store" } }
  );
}
