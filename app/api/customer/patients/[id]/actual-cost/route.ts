import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/routeClient";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PATCH(req: NextRequest, ctx: any) {
  const id = String(ctx?.params?.id ?? "");
  const body = await req.json().catch(() => ({}));

  const actual_cost_raw = (body as any)?.actual_cost;
  const currency = String((body as any)?.currency ?? "").trim() || null;

  // allow null (clear) if you want — сейчас сделаем строго number
  const actual_cost = actual_cost_raw === null ? null : Number(actual_cost_raw);

  if (actual_cost === null || !Number.isFinite(actual_cost)) {
    return NextResponse.json({ error: "actual_cost must be a number" }, { status: 400 });
  }
  if (actual_cost < 0) {
    return NextResponse.json({ error: "actual_cost must be >= 0" }, { status: 400 });
  }

  const supabase = await createRouteClient();

  const { data, error } = await supabase.rpc("customer_patient_set_actual_cost", {
    p_booking_id: id,
    p_actual_cost: actual_cost,
    p_currency: currency,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const row = Array.isArray(data) ? data[0] : data ?? null;
  return NextResponse.json({ booking: row }, { headers: { "Cache-Control": "no-store" } });
}