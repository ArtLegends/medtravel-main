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

async function isCustomer(supabase: any, userId: string) {
  const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  if (error) return false;
  const roles = (data ?? []).map((r: any) => String(r.role ?? "").toLowerCase());
  return roles.includes("customer");
}

export async function GET(_req: Request, ctx: any) {
  const bookingId = String(ctx?.params?.id ?? "");
  if (!bookingId) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const supa = await createRouteClient();
  const { data: au } = await supa.auth.getUser();
  const user = au?.user;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 1) проверяем роль customer
  const okRole = await isCustomer(supa, user.id);
  if (!okRole) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // 2) получаем clinic_id текущего customer (под обычной сессией, НЕ service role)
  const { data: clinicId, error: eClinic } = await supa.rpc("customer_current_clinic_id");
  if (eClinic) return NextResponse.json({ error: eClinic.message }, { status: 500 });
  if (!clinicId) return NextResponse.json({ error: "No clinic bound to this customer" }, { status: 403 });

  const admin = adminClient();

  // 3) читаем booking через admin и проверяем принадлежность клинике customer
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

  // 4) выдаём signed url
  const { data: signed, error: e1 } = await admin.storage
    .from("patient-files")
    .createSignedUrl(row.xray_path, 60 * 10);

  if (e1) return NextResponse.json({ error: e1.message }, { status: 500 });

  return NextResponse.json({ url: signed?.signedUrl ?? null });
}
