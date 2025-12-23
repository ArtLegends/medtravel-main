import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/routeClient";

export const dynamic = "force-dynamic";

type Params = { id: string };

const ALLOWED_STATUSES = new Set(["pending", "processed", "rejected"]);

export async function PATCH(req: Request, { params }: { params: Promise<Params> }) {
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

  const { data, error } = await supabase
    .from("patient_bookings")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id, status, updated_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ booking: data }, { headers: { "Cache-Control": "no-store" } });
}

export async function DELETE(_req: Request, { params }: { params: Promise<Params> }) {
  const { id } = await params;

  const supabase = await createRouteClient();

  const { error } = await supabase.from("patient_bookings").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
