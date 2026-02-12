import { NextRequest, NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/routeClient";
import { createServiceClient } from "@/lib/supabase/serviceClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function isPartner(route: any, userId: string) {
  const { data } = await route.from("user_roles").select("role").eq("user_id", userId);
  const roles = (data ?? []).map((r: any) => String(r.role ?? "").toLowerCase());
  return roles.includes("partner");
}

export async function GET(req: NextRequest) {
  const route = await createRouteClient();

  const { data: auth } = await route.auth.getUser();
  const user = auth?.user;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ok = await isPartner(route, user.id);
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const url = new URL(req.url);
  const status = (url.searchParams.get("status") || "all").toLowerCase();
  const q = (url.searchParams.get("q") || "").trim().toLowerCase();
  const limit = Math.min(Number(url.searchParams.get("limit") || "20"), 100);
  const offset = Math.max(Number(url.searchParams.get("offset") || "0"), 0);

  const admin = createServiceClient();

  let query = admin
    .from("partner_leads")
    .select(
      "id,source,full_name,phone,email,age,image_paths,status,created_at,assigned_at",
      { count: "exact" }
    )
    .eq("assigned_partner_id", user.id)
    .order("assigned_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (status !== "all") query = query.eq("status", status);

  if (q) {
    query = query.or(`email.ilike.%${q}%,phone.ilike.%${q}%,full_name.ilike.%${q}%`);
  }

  const { data, error, count } = await query.range(offset, offset + limit - 1);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    items: data ?? [],
    total: Number(count ?? 0),
    limit,
    offset,
  });
}