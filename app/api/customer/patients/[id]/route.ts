import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/routeClient";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;

  const supabase = await createRouteClient();
  const body = await req.json().catch(() => ({}));

  const status = body?.status as string | undefined;
  const actualCost = body?.actualCost as number | null | undefined;

  if (!status || !["pending", "processed", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const patch: any = { status };
  if (actualCost !== undefined) patch.actual_cost = actualCost;

  const { error } = await supabase.from("patient_bookings").update(patch).eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;

  const supabase = await createRouteClient();

  const { error } = await supabase.from("patient_bookings").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
