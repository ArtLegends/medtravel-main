// app/api/customer/patients/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/routeClient";

export const dynamic = "force-dynamic";

const ALLOWED_STATUSES = new Set(["pending", "processed", "rejected"]);

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;

  let body: any = null;
  try {
    body = await req.json();
  } catch {
    body = {};
  }

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

  const row = Array.isArray(data) ? data[0] : data ?? null;

  if (!row) {
    return NextResponse.json(
      { error: "Booking not found (or does not belong to your clinic)" },
      { status: 404 }
    );
  }

  return NextResponse.json({ booking: row }, { headers: { "Cache-Control": "no-store" } });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;

  const supabase = await createRouteClient();

  const { data, error } = await supabase.rpc("customer_patient_delete_one", {
    p_booking_id: id,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (data !== true) {
    return NextResponse.json(
      { error: "Booking not found (or does not belong to your clinic)" },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
