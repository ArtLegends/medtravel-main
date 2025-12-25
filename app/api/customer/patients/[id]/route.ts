import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/routeClient";

export const dynamic = "force-dynamic";

type Params = { id: string };
type Ctx = { params: Promise<Params> };

const ALLOWED_STATUSES = new Set(["pending", "processed", "rejected"]);

export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;

  const body = await req.json().catch(() => ({}));
  const status = String(body?.status ?? "").toLowerCase();

  if (!ALLOWED_STATUSES.has(status)) {
    return NextResponse.json(
      { error: `Invalid status. Allowed: ${Array.from(ALLOWED_STATUSES).join(", ")}` },
      { status: 400 }
    );
  }

  const supabase = await createRouteClient();

  const { data, error } = await supabase.rpc("customer_patient_update_status", {
    p_booking_id: id,
    p_status: status,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // rpc returns TABLE => array
  const row = Array.isArray(data) ? data[0] : null;

  return NextResponse.json(
    { booking: row },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;

  const supabase = await createRouteClient();

  const { data, error } = await supabase.rpc("customer_patient_delete_one", {
    p_booking_id: id,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(
    { ok: data === true },
    { headers: { "Cache-Control": "no-store" } }
  );
}
