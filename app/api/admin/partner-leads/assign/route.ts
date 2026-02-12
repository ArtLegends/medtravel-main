import { NextRequest, NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/routeClient";
import { createServiceClient } from "@/lib/supabase/serviceClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function isAdmin(route: any, userId: string) {
  const { data } = await route.from("user_roles").select("role").eq("user_id", userId);
  const roles = (data ?? []).map((r: any) => String(r.role ?? "").toLowerCase());
  return roles.includes("admin");
}

function isUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

export async function PATCH(req: NextRequest) {
  // 1) auth + admin check
  const route = await createRouteClient();
  const { data: auth } = await route.auth.getUser();
  const user = auth?.user;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ok = await isAdmin(route, user.id);
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // 2) body
  const body = await req.json().catch(() => null);
  const lead_id = String(body?.lead_id ?? "").trim();
  const partner_id = String(body?.partner_id ?? "").trim();
  const note = String(body?.note ?? "").trim().slice(0, 500);

  if (!isUuid(lead_id)) return NextResponse.json({ error: "Invalid lead_id" }, { status: 400 });
  if (!isUuid(partner_id)) return NextResponse.json({ error: "Invalid partner_id" }, { status: 400 });

  // 3) update via service client
  const admin = createServiceClient();

  // (опционально) убедимся что partner_id реально partner
  const { data: roleCheck, error: rcErr } = await admin
    .from("user_roles")
    .select("user_id")
    .eq("user_id", partner_id)
    .eq("role", "partner")
    .maybeSingle();

  if (rcErr) return NextResponse.json({ error: rcErr.message }, { status: 500 });
  if (!roleCheck) return NextResponse.json({ error: "User is not a partner" }, { status: 400 });

  const patch: any = {
    assigned_partner_id: partner_id,
    assigned_at: new Date().toISOString(),
    assigned_by: user.id,
    assigned_note: note || null,
    status: "assigned",
  };

  const { data, error } = await admin
    .from("partner_leads")
    .update(patch)
    .eq("id", lead_id)
    .select(
      "id,source,full_name,phone,email,age,image_paths,status,admin_note,created_at,assigned_partner_id,assigned_at,assigned_by,assigned_note"
    )
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, item: data });
}