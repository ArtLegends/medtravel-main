import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/routeClient";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createRouteClient();

  const { data, error } = await supabase
    .from("categories")
    .select("id,name,slug")
    .order("name", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // По ТЗ категорий 6 — если больше, оставим первые 6 (можешь убрать лимит)
  return NextResponse.json({ categories: (data ?? []).slice(0, 6) });
}
