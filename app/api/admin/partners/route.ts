import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/routeClient";
import { createServiceClient } from "@/lib/supabase/serviceClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function isAdmin(route: any, userId: string) {
  const { data } = await route.from("user_roles").select("role").eq("user_id", userId);
  const roles = (data ?? []).map((r: any) => String(r.role ?? "").toLowerCase());
  return roles.includes("admin");
}

export async function GET() {
  // 1) auth + admin check
  const route = await createRouteClient();
  const { data: auth } = await route.auth.getUser();
  const user = auth?.user;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ok = await isAdmin(route, user.id);
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // 2) service client for data
  const admin = createServiceClient();

  // берём всех user_id у кого есть роль partner
  const { data: roles, error: rErr } = await admin
    .from("user_roles")
    .select("user_id")
    .eq("role", "partner");

  if (rErr) return NextResponse.json({ error: rErr.message }, { status: 500 });

  const ids = Array.from(new Set((roles ?? []).map((x: any) => x.user_id).filter(Boolean)));
  if (!ids.length) return NextResponse.json({ items: [] });

  // тянем профили этих пользователей
  const { data: prof, error: pErr } = await admin
    .from("profiles")
    .select("id,first_name,last_name,email")
    .in("id", ids)
    .order("created_at", { ascending: false });

  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 });

  const items = (prof ?? []).map((p: any) => {
    const name = [p.first_name, p.last_name].filter(Boolean).join(" ").trim();
    return {
      id: p.id,
      name: name || p.email || p.id,
      email: p.email ?? "",
    };
  });

  return NextResponse.json({ items });
}