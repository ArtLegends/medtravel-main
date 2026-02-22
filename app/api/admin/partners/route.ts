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

  // ✅ берём всех user_id у кого есть роль customer
  const { data: roles, error: rErr } = await admin
    .from("user_roles")
    .select("user_id")
    .eq("role", "customer");

  if (rErr) return NextResponse.json({ error: rErr.message }, { status: 500 });

  const ids = Array.from(new Set((roles ?? []).map((x: any) => x.user_id).filter(Boolean)));
  if (!ids.length) return NextResponse.json({ items: [] });

  // ✅ оставляем только approved заявки (не обязательно, но правильно)
  const { data: approved, error: aErr } = await admin
    .from("customer_registration_requests")
    .select("user_id")
    .in("user_id", ids)
    .eq("status", "approved");

  if (aErr) return NextResponse.json({ error: aErr.message }, { status: 500 });

  const approvedIds = new Set((approved ?? []).map((x: any) => x.user_id).filter(Boolean));
  const filtered = ids.filter((id) => approvedIds.has(id));
  if (!filtered.length) return NextResponse.json({ items: [] });

  // ✅ оставляем только тех, у кого есть customer_clinic_membership
  const { data: mem, error: mErr } = await admin
    .from("customer_clinic_membership")
    .select("user_id, clinic_id")
    .in("user_id", filtered);

  if (mErr) return NextResponse.json({ error: mErr.message }, { status: 500 });

  const memMap = new Map<string, string>();
  (mem ?? []).forEach((x: any) => {
    if (x?.user_id && x?.clinic_id) memMap.set(String(x.user_id), String(x.clinic_id));
  });

  const finalIds = filtered.filter((id) => memMap.has(id));
  if (!finalIds.length) return NextResponse.json({ items: [] });

  // профили этих пользователей
  const { data: prof, error: pErr } = await admin
    .from("profiles")
    .select("id,first_name,last_name,email")
    .in("id", finalIds)
    .order("created_at", { ascending: false });

  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 });

  // (опционально) подтянем название клиники
  const clinicIds = Array.from(new Set(Array.from(memMap.values())));
  const { data: clinics } = await admin
    .from("clinics")
    .select("id,name")
    .in("id", clinicIds);

  const clinicNameById = new Map<string, string>();
  (clinics ?? []).forEach((c: any) => clinicNameById.set(String(c.id), String(c.name)));

  const items = (prof ?? []).map((p: any) => {
    const personName = [p.first_name, p.last_name].filter(Boolean).join(" ").trim();
    const clinicId = memMap.get(String(p.id)) || "";
    const clinicName = clinicId ? (clinicNameById.get(clinicId) ?? "") : "";

    return {
      id: p.id,              // customer user_id (то что кладём в partner_leads.assigned_partner_id)
      clinic_id: clinicId,   // удобно на будущее
      name: clinicName || personName || p.email || p.id,
      email: p.email ?? "",
    };
  });

  return NextResponse.json({ items });
}