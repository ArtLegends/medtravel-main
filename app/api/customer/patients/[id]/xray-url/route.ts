import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/routeClient";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, service, { auth: { persistSession: false } });
}

export async function GET(_req: Request, ctx: any) {
  const bookingId = String(ctx?.params?.id ?? "");
  if (!bookingId) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const supa = await createRouteClient();
  const { data: au } = await supa.auth.getUser();
  const user = au?.user;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // ✅ главный гейт: должен быть привязан clinic_id
  const { data: clinicId, error: eClinic } = await supa.rpc("customer_current_clinic_id");
  if (eClinic) return NextResponse.json({ error: eClinic.message }, { status: 500 });
  if (!clinicId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const admin = adminClient();

  const { data: row, error: e0 } = await admin
    .from("patient_bookings")
    .select("id, clinic_id, xray_path")
    .eq("id", bookingId)
    .maybeSingle();

  if (e0) return NextResponse.json({ error: e0.message }, { status: 500 });
  if (!row) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

  if (String(row.clinic_id) !== String(clinicId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!row.xray_path) return NextResponse.json({ url: null });

  const { data: signed, error: e1 } = await admin.storage
    .from("patient-files")
    .createSignedUrl(row.xray_path, 60 * 10);

  if (e1) return NextResponse.json({ error: e1.message }, { status: 500 });

  return NextResponse.json({ url: signed?.signedUrl ?? null });
}
