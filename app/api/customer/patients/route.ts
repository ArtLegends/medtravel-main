import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/routeClient";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);

  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1"));
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit") ?? "15")));

  const status = url.searchParams.get("status"); // pending|processed|rejected|all|null
  const startDate = url.searchParams.get("startDate"); // YYYY-MM-DD
  const endDate = url.searchParams.get("endDate");     // YYYY-MM-DD

  const supabase = await createRouteClient();

  const { data, error } = await supabase.rpc("customer_patients_list", {
    p_status: status && status !== "all" ? status : null,
    p_start_date: startDate || null,
    p_end_date: endDate || null,
    p_limit: limit,
    p_offset: (page - 1) * limit,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = data ?? [];
  const total = rows[0]?.total_count ?? 0;

  return NextResponse.json(
    { items: rows, total, page, limit },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const startDate = url.searchParams.get("startDate");
  const endDate = url.searchParams.get("endDate");

  const supabase = await createRouteClient();

  const { data, error } = await supabase.rpc("customer_patients_delete_all", {
    p_status: status && status !== "all" ? status : null,
    p_start_date: startDate || null,
    p_end_date: endDate || null,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(
    { deleted: data ?? 0 },
    { headers: { "Cache-Control": "no-store" } }
  );
}
