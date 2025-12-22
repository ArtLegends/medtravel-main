import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/routeClient";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const categoryId = url.searchParams.get("categoryId");
  if (!categoryId) return NextResponse.json({ error: "categoryId is required" }, { status: 400 });

  const supabase = await createRouteClient();

  const { data, error } = await supabase.rpc("patient_services_by_category", {
    p_category_id: categoryId,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const list = (data ?? []).map((s: any) => ({
    ...s,
    id: String(s.id),                    // <- железобетонно строкой (UI часто ждёт string)
    label: s.name,
    value: String(s.id),
  }));

  return NextResponse.json(
    { services: list, data: list, items: list },
    { headers: { "Cache-Control": "no-store" } }
  );
}
