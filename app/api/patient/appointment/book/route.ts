import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/routeClient";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const supabase = await createRouteClient();

  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const {
    clinicId,
    categoryId,
    serviceId,
    bookingMethod,
    preferredDate,
    preferredTime,
    fullName,
    phone,
    notes,
  } = body ?? {};

  if (!clinicId || !serviceId || !preferredDate || !fullName || !phone) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("patient_bookings")
    .insert({
      patient_id: user.id,
      clinic_id: clinicId,
      category_id: categoryId ?? null,
      service_id: serviceId,
      booking_method: bookingMethod === "automatic" ? "automatic" : "manual",
      preferred_date: preferredDate,
      preferred_time: preferredTime ?? null,
      full_name: fullName,
      phone,
      notes: notes ?? null,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ id: data.id });
}
