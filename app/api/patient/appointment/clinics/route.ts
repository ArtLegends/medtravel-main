import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/routeClient";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const serviceIdRaw = url.searchParams.get("serviceId");
  const serviceId = Number(serviceIdRaw);
  const country = url.searchParams.get("country");
  const city = url.searchParams.get("city");

  if (!Number.isInteger(serviceId) || !country || !city) {
    return NextResponse.json({ error: "serviceId, country, city are required" }, { status: 400 });
  }

  const supabase = await createRouteClient();
  const { data, error } = await supabase.rpc("patient_clinics_by_service", {
    p_service_id: serviceId,
    p_country: country,
    p_city: city,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const list = (data ?? []).map((c: any) => ({
    clinic_id: String(c.id ?? c.clinic_id),
    clinic_name: c.name ?? c.clinic_name ?? "",
    slug: c.slug ?? null,
    country: c.country ?? "",
    city: c.city ?? "",
  }));

  return NextResponse.json(
    { clinics: list, data: list, items: list },
    { headers: { "Cache-Control": "no-store" } }
  );
}
