import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/routeClient";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const serviceIdRaw = url.searchParams.get("serviceId");
  const serviceId = Number(serviceIdRaw);
  const country = url.searchParams.get("country");

  if (!Number.isInteger(serviceId) || !country) {
    return NextResponse.json({ error: "serviceId and country are required" }, { status: 400 });
  }

  const supabase = await createRouteClient();
  const { data, error } = await supabase.rpc("patient_cities_by_service", {
    p_service_id: serviceId,
    p_country: country,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const list = (data ?? []).map((c: any) => ({
    city: c.city ?? "",
    clinics_count: Number(c.clinicsCount ?? c.clinics_count ?? 0),
  }));

  return NextResponse.json(
    { cities: list, data: list, items: list },
    { headers: { "Cache-Control": "no-store" } }
  );
}
