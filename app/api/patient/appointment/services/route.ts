// app/api/patient/appointment/services/route.ts
import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/routeClient";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const categoryIdRaw = url.searchParams.get("categoryId");

  if (!categoryIdRaw) {
    return NextResponse.json({ error: "categoryId is required" }, { status: 400 });
  }

  const categoryId = Number(categoryIdRaw);
  if (!Number.isFinite(categoryId)) {
    return NextResponse.json({ error: "categoryId must be a number" }, { status: 400 });
  }

  const supabase = await createRouteClient();

  const { data, error } = await supabase.rpc("patient_services_by_category", {
    p_category_id: categoryId, // ✅ integer
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ services: data ?? [] });
}
