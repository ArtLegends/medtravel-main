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
  return (data ?? []).some((r: any) => r.role === "admin");
}

async function isEmptyDraftClinic(sb: any, clinicId: string): Promise<boolean> {
  const { data: clinic } = await sb.from("clinics")
    .select("name, slug, is_published").eq("id", clinicId).maybeSingle();
  if (!clinic) return false;
  if (clinic.is_published) return false;
  if (clinic.name !== "Draft Clinic") return false;
  if (!String(clinic.slug ?? "").startsWith("draft-clinic-")) return false;

  const { count: svcCount } = await sb.from("clinic_services").select("*", { count: "exact", head: true }).eq("clinic_id", clinicId);
  if ((svcCount ?? 0) > 0) return false;
  const { count: staffCount } = await sb.from("clinic_staff").select("*", { count: "exact", head: true }).eq("clinic_id", clinicId);
  if ((staffCount ?? 0) > 0) return false;

  const { data: draft } = await sb.from("clinic_profile_drafts")
    .select("basic_info, services, doctors").eq("clinic_id", clinicId).maybeSingle();
  if (draft) {
    const bi = draft.basic_info;
    if (bi && typeof bi === "object" && bi.name && bi.name.trim() && bi.name.trim() !== "Draft Clinic") return false;
    if (Array.isArray(draft.services) && draft.services.length > 0) return false;
    if (Array.isArray(draft.doctors) && draft.doctors.length > 0) return false;
  }
  return true;
}

async function deleteDraftClinicCascade(sb: any, clinicId: string) {
  const tables = [
    "clinic_profile_drafts", "clinic_images", "clinic_hours", "clinic_staff",
    "clinic_services", "clinic_categories", "clinic_accreditations",
    "clinic_members", "customer_clinic_membership",
  ];
  for (const t of tables) {
    try { await sb.from(t).delete().eq("clinic_id", clinicId); } catch {}
  }
  await sb.from("clinics").delete().eq("id", clinicId);
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
  const action = String(body?.action ?? "assign");

  if (!isUuid(clinicId)) return NextResponse.json({ error: "Invalid clinic_id" }, { status: 400 });
  const sb = createServiceClient();

  // ── Unassign ──
  if (action === "unassign") {
    const { data: clinic } = await sb.from("clinics").select("owner_id").eq("id", clinicId).maybeSingle();
    const prevOwner = clinic?.owner_id;
    await sb.from("clinics").update({ owner_id: null }).eq("id", clinicId);
    if (prevOwner) {
      await sb.from("customer_clinic_membership").delete().eq("user_id", prevOwner).eq("clinic_id", clinicId);
      await sb.from("clinic_members").delete().eq("user_id", prevOwner).eq("clinic_id", clinicId);
    }
    return NextResponse.json({ ok: true, action: "unassigned" });
  }

  // ── Assign ──
  if (!ownerEmail) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const { data: profile } = await sb.from("profiles").select("id, email").eq("email", ownerEmail).maybeSingle();
  if (!profile?.id) return NextResponse.json({ error: `User not found: ${ownerEmail}` }, { status: 404 });

  const { data: roles } = await sb.from("user_roles").select("role").eq("user_id", profile.id);
  if (!(roles ?? []).some((r: any) => r.role === "customer")) {
    return NextResponse.json({ error: "User does not have customer role." }, { status: 400 });
  }

  // 1) Find ALL clinics owned by this user (via owner_id OR clinic_members)
  const { data: ownedClinics } = await sb.from("clinics")
    .select("id, name, slug").eq("owner_id", profile.id).neq("id", clinicId);
  
  const { data: memberClinics } = await sb.from("clinic_members")
    .select("clinic_id").eq("user_id", profile.id).neq("clinic_id", clinicId);

  // Collect all clinic IDs to check
  const allClinicIds = new Set<string>();
  (ownedClinics ?? []).forEach((c: any) => allClinicIds.add(c.id));
  (memberClinics ?? []).forEach((m: any) => allClinicIds.add(m.clinic_id));

  let deletedCount = 0;

  // 2) Delete empty draft clinics, clean up memberships
  for (const cId of allClinicIds) {
    const isEmpty = await isEmptyDraftClinic(sb, cId);
    if (isEmpty) {
      await deleteDraftClinicCascade(sb, cId);
      deletedCount++;
    }
  }

  // 3) Also clean any stale clinic_members for this user pointing to non-existent clinics
  await sb.from("clinic_members").delete().eq("user_id", profile.id).neq("clinic_id", clinicId);

  // 4) Re-check: any real clinics remaining?
  const { data: remaining } = await sb.from("clinics")
    .select("id, name").eq("owner_id", profile.id).neq("id", clinicId).limit(1).maybeSingle();

  if (remaining) {
    return NextResponse.json({
      error: `User already owns clinic "${remaining.name}" with content. Unassign that first.`
    }, { status: 400 });
  }

  // 5) Assign
  await sb.from("clinics").update({ owner_id: profile.id }).eq("id", clinicId);

  // 6) Set up memberships
  await sb.from("customer_clinic_membership").upsert(
    { user_id: profile.id, clinic_id: clinicId },
    { onConflict: "user_id,clinic_id" } as any
  );

  const { data: existingMember } = await sb.from("clinic_members")
    .select("id").eq("user_id", profile.id).eq("clinic_id", clinicId).maybeSingle();
  if (!existingMember) {
    await sb.from("clinic_members").insert({ clinic_id: clinicId, user_id: profile.id, role: "owner" });
  }

  return NextResponse.json({
    ok: true, action: "assigned",
    owner: { id: profile.id, email: profile.email },
    deleted_empty_drafts: deletedCount,
  });
}