import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const categoryId = Number(searchParams.get("categoryId") || 0);
  const subcategoryNodeId = Number(searchParams.get("subcategoryNodeId") || 0);
  const country = (searchParams.get("country") || "").trim();
  const city = (searchParams.get("city") || "").trim();

  if (!categoryId || !subcategoryNodeId || !country || !city) {
    return new NextResponse("Missing params", { status: 400 });
  }

  const sb = supabaseServer;

  const { data, error } = await sb.rpc("patient_auto_pick_clinic", {
    p_category_id: categoryId,
    p_subcategory_node_id: subcategoryNodeId,
    p_country: country,
    p_city: city,
  });

  if (error) return new NextResponse(error.message, { status: 400 });

  const row = Array.isArray(data) ? data[0] : data; // supabase иногда возвращает массив
  if (!row) return new NextResponse("No match", { status: 404 });

  return NextResponse.json({ item: row });
}
