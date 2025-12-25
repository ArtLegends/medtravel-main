import { NextRequest, NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/routeClient";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: { [key: string]: string | string[] };
};

const ALLOWED_STATUSES = new Set(["pending", "processed", "rejected"]);

function getParam(ctx: RouteContext, key: string) {
  const v = ctx.params?.[key];
  return Array.isArray(v) ? v[0] : v;
}

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const id = getParam(ctx, "id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

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

  const row = Array.isArray(data) ? data[0] : null;
  return NextResponse.json({ booking: row }, { headers: { "Cache-Control": "no-store" } });
}

export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  const id = getParam(ctx, "id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const supabase = await createRouteClient();

  const { data, error } = await supabase.rpc("customer_patient_delete_one", {
    p_booking_id: id,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: data === true }, { headers: { "Cache-Control": "no-store" } });
}
