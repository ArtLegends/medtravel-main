import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/routeClient";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const supabase = await createRouteClient();

  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);

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

    autoWhen,
    autoHasXray,
  } = body ?? {};

  if (!clinicId || !serviceId || !fullName || !phone) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const method = bookingMethod === "automatic" ? "automatic" : "manual";

  // preferredDate обязателен только для manual,
  // и для automatic, когда autoWhen != "Unknown"
  const preferredDateRequired = !(method === "automatic" && autoWhen === "Unknown");
  if (preferredDateRequired && !preferredDate) {
    return NextResponse.json({ error: "Preferred date is required" }, { status: 400 });
  }

  const insertPayload: any = {
    patient_id: user.id,
    clinic_id: clinicId,
    category_id: categoryId ?? null,
    service_id: serviceId,
    booking_method: method,

    preferred_date: preferredDateRequired ? preferredDate : (preferredDate ?? null),
    preferred_time: preferredDateRequired ? (preferredTime ?? null) : (preferredTime ?? null),

    full_name: fullName,
    phone,
    notes: notes ?? null,

    status: "pending",
  };

  // эти поля добавляй только если колонки существуют в patient_bookings
  insertPayload.auto_when = method === "automatic" ? (autoWhen ?? null) : null;
  insertPayload.auto_has_xray = method === "automatic" ? (autoHasXray ?? null) : null;

  const { data, error } = await supabase
    .from("patient_bookings")
    .insert(insertPayload)
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ bookingId: data.id });
}
