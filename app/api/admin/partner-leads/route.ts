import { NextRequest, NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/routeClient";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function isAdmin(supabase: any, userId: string) {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const roles = (data ?? []).map((r: any) => String(r.role ?? "").toLowerCase());
  return roles.includes("admin");
}

export async function GET(req: NextRequest) {
  const supabase = await createRouteClient();

  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ok = await isAdmin(supabase, user.id);
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const url = new URL(req.url);
  const status = (url.searchParams.get("status") || "all").toLowerCase();
  const q = (url.searchParams.get("q") || "").trim().toLowerCase();

  const limit = Math.min(Number(url.searchParams.get("limit") || "20"), 100);
  const offset = Math.max(Number(url.searchParams.get("offset") || "0"), 0);

  let query = supabase
    .from("partner_leads")
    .select("id,source,full_name,phone,email,age,image_paths,status,admin_note,created_at", { count: "exact" })
    .order("created_at", { ascending: false });

  if (status !== "all") query = query.eq("status", status);

  if (q) {
    // простая универсальная выборка
    query = query.or(
      `email.ilike.%${q}%,phone.ilike.%${q}%,full_name.ilike.%${q}%`
    );
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