import { NextRequest, NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/routeClient";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PATCH(req: NextRequest, ctx: any) {
  const id = String(ctx?.params?.id ?? "");
  if (!id) return NextResponse.json({ error: "Missing booking id" }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const scheduled_at = (body as any)?.scheduled_at as string | null;

  if (!scheduled_at) {
    return NextResponse.json({ error: "scheduled_at is required" }, { status: 400 });
  }

  const dt = new Date(scheduled_at);
  if (Number.isNaN(dt.getTime())) {
    return NextResponse.json({ error: "Invalid scheduled_at" }, { status: 400 });
  }

  const supabase = await createRouteClient();

  // ⚠️ имя функции поставь то, которое ты реально создал в пункте (3)
  const { data, error } = await supabase.rpc("customer_patient_set_schedule", {
    p_booking_id: id,
    p_scheduled_at: dt.toISOString(),
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 403 });

  // если твой RPC возвращает строку — удобно отдать её
  const row = Array.isArray(data) ? data[0] : data ?? null;

  return NextResponse.json({ booking: row }, { headers: { "Cache-Control": "no-store" } });
}
