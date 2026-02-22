// app/api/admin/partner-leads/assign/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/routeClient";
import { createServiceClient } from "@/lib/supabase/serviceClient";
import { resendSend, partnerNewLeadTemplate } from "@/lib/mail/resend";

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
  const partner_id = String(body?.partner_id ?? "").trim(); // (исторически) в UI поле называется partner_id, но это customer user_id
  const note = String(body?.note ?? "").trim().slice(0, 500);

  if (!isUuid(lead_id)) return NextResponse.json({ error: "Invalid lead_id" }, { status: 400 });
  if (!isUuid(partner_id)) return NextResponse.json({ error: "Invalid partner_id" }, { status: 400 });

  // 3) service client
  const admin = createServiceClient();

  // 3.1) убедимся что user реально customer
  const { data: roleCheck, error: rcErr } = await admin
    .from("user_roles")
    .select("user_id")
    .eq("user_id", partner_id)
    .eq("role", "customer")
    .maybeSingle();

  if (rcErr) return NextResponse.json({ error: rcErr.message }, { status: 500 });
  if (!roleCheck) return NextResponse.json({ error: "User is not a customer" }, { status: 400 });

  // 4) прочитаем текущий lead (до обновления)
  const { data: before, error: beforeErr } = await admin
    .from("partner_leads")
    .select("id,assigned_partner_id,full_name,phone,email,source,created_at")
    .eq("id", lead_id)
    .maybeSingle();

  if (beforeErr) return NextResponse.json({ error: beforeErr.message }, { status: 500 });
  if (!before) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  const prevPartnerId = before.assigned_partner_id ?? null;
  const customerChanged = String(prevPartnerId ?? "") !== String(partner_id);

  // 5) resolve clinic_id by customer user_id
  const { data: mem, error: memErr } = await admin
    .from("customer_clinic_membership")
    .select("clinic_id")
    .eq("user_id", partner_id)
    .maybeSingle();

  if (memErr) return NextResponse.json({ error: memErr.message }, { status: 500 });
  if (!mem?.clinic_id) return NextResponse.json({ error: "Customer has no clinic membership" }, { status: 400 });

  const clinicId = String(mem.clinic_id);

  // 6) resolve patient_id by lead email
  const leadEmail = String(before.email ?? "").trim().toLowerCase();
  const { data: pat, error: patErr } = await admin
    .from("profiles")
    .select("id")
    .eq("email", leadEmail)
    .maybeSingle();

  if (patErr) return NextResponse.json({ error: patErr.message }, { status: 500 });
  if (!pat?.id) return NextResponse.json({ error: "Patient profile not found for lead email" }, { status: 400 });

  const patientId = String(pat.id);

  // 7) create booking from lead (ТОЛЬКО если customerChanged)
  //    + защита от дублей: ищем booking с таким lead маркером
  const leadMarker = `[lead:${lead_id}]`;

  let bookingId: string | null = null;

  if (customerChanged) {
    // 7.1) check duplicate booking (same clinic + same patient + same marker in notes)
    const { data: exists, error: exErr } = await admin
      .from("patient_bookings")
      .select("id")
      .eq("clinic_id", clinicId)
      .eq("patient_id", patientId)
      .ilike("notes", `%${leadMarker}%`)
      .maybeSingle();

    if (exErr) return NextResponse.json({ error: exErr.message }, { status: 500 });

    bookingId = exists?.id ?? null;

    if (!bookingId) {
      const { data: booking, error: bookErr } = await admin
        .from("patient_bookings")
        .insert({
          patient_id: patientId,
          clinic_id: clinicId,
          service_id: 803, // Hair Transplant
          booking_method: "automatic", // лид
          status: "pending",
          full_name: before.full_name,
          phone: before.phone,
          notes: `${leadMarker} Landing lead (${before.source ?? "unknown"})`,
        })
        .select("id")
        .single();

      if (bookErr) return NextResponse.json({ error: bookErr.message }, { status: 500 });
      bookingId = booking?.id ?? null;
    }
  }

  // 8) update lead assignment
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
      "id,source,full_name,phone,email,age,image_paths,status,admin_note,created_at,assigned_partner_id,assigned_at,assigned_by,assigned_note",
    )
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 9) email notify (best-effort: не ломаем assignment если email упал)
  let emailSent = false;
  let emailError: string | null = null;

  if (customerChanged) {
    try {
      const { data: customerProfile, error: pErr } = await admin
        .from("profiles")
        .select("email,first_name,last_name")
        .eq("id", partner_id)
        .maybeSingle();

      if (pErr) throw new Error(pErr.message);
      const customerEmail = customerProfile?.email?.trim();
      if (!customerEmail) throw new Error("Customer email not found in profiles");

      const customerName =
        `${customerProfile?.first_name ?? ""} ${customerProfile?.last_name ?? ""}`.trim() || null;

      const origin = req.nextUrl.origin;
      const patientsUrl = `${origin}/customer/patients`;

      const tpl = partnerNewLeadTemplate({
        partnerName: customerName,
        leadsUrl: patientsUrl,
        lead: {
          full_name: before.full_name,
          phone: before.phone,
          email: before.email,
          source: before.source,
          created_at: before.created_at,
        },
      });

      await resendSend({ to: customerEmail, subject: tpl.subject, html: tpl.html });
      emailSent = true;
    } catch (e: any) {
      emailError = String(e?.message ?? e);
    }
  }

  return NextResponse.json({
    ok: true,
    item: data,
    booking: {
      attempted: customerChanged,
      id: bookingId,
    },
    email: {
      attempted: customerChanged,
      sent: emailSent,
      error: emailError,
    },
  });
}