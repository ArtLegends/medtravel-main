// app/api/admin/clinics/assign-owner/route.ts
import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/routeClient";
import { createServiceClient } from "@/lib/supabase/serviceClient";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function isUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

async function isAdmin(supabase: any, userId: string) {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const roles = (data ?? []).map((r: any) => String(r.role ?? "").toLowerCase());
  return roles.includes("admin");
}

export async function POST(req: Request) {
  const route = await createRouteClient();
  const { data: auth } = await route.auth.getUser();
  const me = auth?.user;
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await isAdmin(route, me.id))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const clinicId = String(body?.clinic_id ?? "").trim();
  const ownerEmail = String(body?.owner_email ?? "").trim().toLowerCase();
  const action = String(body?.action ?? "assign"); // "assign" | "unassign"

  if (!isUuid(clinicId)) return NextResponse.json({ error: "Invalid clinic_id" }, { status: 400 });

  const sb = createServiceClient();

  // Unassign
  if (action === "unassign") {
    // Get current owner
    const { data: clinic } = await sb.from("clinics").select("owner_id").eq("id", clinicId).maybeSingle();
    const prevOwner = clinic?.owner_id;

    await sb.from("clinics").update({ owner_id: null }).eq("id", clinicId);

    if (prevOwner) {
      await sb.from("customer_clinic_membership").delete()
        .eq("user_id", prevOwner).eq("clinic_id", clinicId);
    }

    return NextResponse.json({ ok: true, action: "unassigned" });
  }

  // Assign
  if (!ownerEmail) return NextResponse.json({ error: "Email required" }, { status: 400 });

  // Find user by email
  const { data: profile } = await sb
    .from("profiles")
    .select("id, email, role")
    .eq("email", ownerEmail)
    .maybeSingle();

  if (!profile?.id) return NextResponse.json({ error: `User not found: ${ownerEmail}` }, { status: 404 });

  // Check user has customer role
  const { data: roles } = await sb
    .from("user_roles")
    .select("role")
    .eq("user_id", profile.id);

  const hasCustomer = (roles ?? []).some((r: any) => r.role === "customer");
  if (!hasCustomer) {
    return NextResponse.json({ error: "User does not have customer role. Approve their customer request first." }, { status: 400 });
  }

  // Check if user already owns another clinic
  const { data: existingClinic } = await sb
    .from("clinics")
    .select("id, name")
    .eq("owner_id", profile.id)
    .neq("id", clinicId)
    .limit(1)
    .maybeSingle();

  if (existingClinic) {
    return NextResponse.json({
      error: `User already owns clinic "${existingClinic.name}". Unassign that first.`
    }, { status: 400 });
  }

  // Assign
  await sb.from("clinics").update({ owner_id: profile.id }).eq("id", clinicId);

  // Ensure customer_clinic_membership
  await sb.from("customer_clinic_membership").upsert(
    { user_id: profile.id, clinic_id: clinicId },
    { onConflict: "user_id,clinic_id" } as any
  );

  return NextResponse.json({
    ok: true,
    action: "assigned",
    owner: { id: profile.id, email: profile.email }
  });
}