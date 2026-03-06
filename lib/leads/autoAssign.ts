// lib/leads/autoAssign.ts
import { createServiceClient } from "@/lib/supabase/serviceClient";
import { resendSend, partnerNewLeadTemplate } from "@/lib/mail/resend";

function isUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

/**
 * Выбор клиники/клиентского user_id для лида.
 * Сейчас: берём первого активного customer с membership.
 * Потом: сюда добавим веса/рейтинги и выбор по ним.
 */
async function pickCustomerUserId(admin: any) {
  // Берём customer user_id, у которого есть membership clinic_id
  const { data, error } = await admin
    .from("user_roles")
    .select("user_id")
    .eq("role", "customer")
    .limit(50);

  if (error) throw new Error(error.message);

  const ids = (data ?? [])
    .map((x: any) => String(x.user_id ?? ""))
    .filter(isUuid);

  if (!ids.length) return null;

  // Фильтруем только тех, у кого есть clinic membership
  const { data: mem, error: memErr } = await admin
    .from("customer_clinic_membership")
    .select("user_id,clinic_id")
    .in("user_id", ids)
    .limit(50);

  if (memErr) throw new Error(memErr.message);

  const candidates = (mem ?? [])
    .map((m: any) => ({ user_id: String(m.user_id), clinic_id: String(m.clinic_id ?? "") }))
    .filter((x: any) => isUuid(x.user_id) && isUuid(x.clinic_id));

  if (!candidates.length) return null;

  // ✅ Сейчас просто первый (пока одна клиника)
  return candidates[0].user_id;
}

/**
 * Авто-назначение лида клинике + (если возможно) создание booking + уведомление.
 * Идемпотентно: если уже assigned_partner_id есть — не перезаписываем.
 */
export async function autoAssignLead(opts: { leadId: string; origin: string }) {
  const leadId = String(opts.leadId ?? "").trim();
  const origin = String(opts.origin ?? "").trim();

  if (!isUuid(leadId)) {
    return { ok: false, reason: "invalid_lead_id" as const };
  }

  const admin = createServiceClient();

  // 1) читаем лид
  const { data: lead, error: leadErr } = await admin
    .from("partner_leads")
    .select("id,assigned_partner_id,full_name,phone,email,patient_id,source,created_at,status")
    .eq("id", leadId)
    .maybeSingle();

  if (leadErr) return { ok: false, reason: "lead_read_error" as const, error: leadErr.message };
  if (!lead) return { ok: false, reason: "lead_not_found" as const };

    // 2) resolve customer user_id:
  // - если уже назначен → используем assigned_partner_id (чтобы после attach можно было создать booking)
  // - иначе выбираем автоматически
  const alreadyAssigned = Boolean(lead.assigned_partner_id);
  const customerUserId = alreadyAssigned
    ? String(lead.assigned_partner_id)
    : await pickCustomerUserId(admin);

  if (!customerUserId) return { ok: false, reason: "no_customer_found" as const };

  // 3) resolve clinic_id
  const { data: mem, error: memErr } = await admin
    .from("customer_clinic_membership")
    .select("clinic_id")
    .eq("user_id", customerUserId)
    .maybeSingle();

  if (memErr) return { ok: false, reason: "membership_error" as const, error: memErr.message };
  const clinicId = String(mem?.clinic_id ?? "");
  if (!isUuid(clinicId)) return { ok: false, reason: "no_clinic_membership" as const };

  // 4) resolve patient_id (patient_id OR email -> profiles)
  let patientId: string | null = lead.patient_id ? String(lead.patient_id) : null;

  if (!patientId) {
    const leadEmail = String(lead.email ?? "").trim().toLowerCase();
    if (leadEmail) {
      const { data: pat, error: patErr } = await admin
        .from("profiles")
        .select("id")
        .eq("email", leadEmail)
        .maybeSingle();

      if (patErr) return { ok: false, reason: "patient_lookup_error" as const, error: patErr.message };
      if (pat?.id) patientId = String(pat.id);
    }
  }

    // 5) обновляем назначение лида ТОЛЬКО если он ещё не был assigned
  let patched: any = null;

  if (!alreadyAssigned) {
    const { data, error: patchErr } = await admin
      .from("partner_leads")
      .update({
        assigned_partner_id: customerUserId,
        assigned_at: new Date().toISOString(),
        assigned_by: null, // авто
        assigned_note: "auto",
        status: "assigned",
      })
      .eq("id", leadId)
      .is("assigned_partner_id", null)
      .select(
        "id,source,full_name,phone,email,age,image_paths,status,admin_note,created_at,assigned_partner_id,assigned_at,assigned_by,assigned_note"
      )
      .maybeSingle();

    if (patchErr) return { ok: false, reason: "lead_patch_error" as const, error: patchErr.message };
    patched = data ?? null;
  }

  // 6) создаём booking если есть patientId (иначе booking пока невозможен)
  const leadMarker = `[lead:${leadId}]`;
  let bookingId: string | null = null;

  if (patientId) {
    // антидубль
    const { data: exists, error: exErr } = await admin
      .from("patient_bookings")
      .select("id")
      .eq("clinic_id", clinicId)
      .eq("patient_id", patientId)
      .ilike("notes", `%${leadMarker}%`)
      .order("created_at", { ascending: false })
      .limit(1);

    if (exErr) return { ok: false, reason: "booking_check_error" as const, error: exErr.message };

    bookingId = exists?.[0]?.id ?? null;

    if (!bookingId) {
      const { data: booking, error: bookErr } = await admin
        .from("patient_bookings")
        .insert({
          patient_id: patientId,
          clinic_id: clinicId,
          service_id: 803,
          booking_method: "automatic",
          status: "pending",
          full_name: lead.full_name,
          phone: lead.phone,
          notes: `${leadMarker} Landing lead (${lead.source ?? "unknown"})`,
        })
        .select("id")
        .single();

      if (bookErr) return { ok: false, reason: "booking_create_error" as const, error: bookErr.message };
      bookingId = booking?.id ?? null;
    }
  }

    // 7) email notify (best-effort) — отправляем только при первом auto-assign,
  // чтобы attach (повторный вызов) не спамил клинику.
  let emailSent = false;
  let emailError: string | null = null;

  if (!alreadyAssigned) {
    try {
      const { data: customerProfile, error: pErr } = await admin
        .from("profiles")
        .select("email,first_name,last_name")
        .eq("id", customerUserId)
        .maybeSingle();

      if (pErr) throw new Error(pErr.message);
      const customerEmail = customerProfile?.email?.trim();
      if (!customerEmail) throw new Error("Customer email not found in profiles");

      const customerName =
        `${customerProfile?.first_name ?? ""} ${customerProfile?.last_name ?? ""}`.trim() || null;

      const patientsUrl = `${origin}/customer/patients`;

      const tpl = partnerNewLeadTemplate({
        partnerName: customerName,
        leadsUrl: patientsUrl,
        lead: {
          full_name: lead.full_name,
          phone: lead.phone,
          email: lead.email,
          source: lead.source,
          created_at: lead.created_at,
        },
      });

      await resendSend({ to: customerEmail, subject: tpl.subject, html: tpl.html });
      emailSent = true;
    } catch (e: any) {
      emailError = String(e?.message ?? e);
    }
  }

    return {
    ok: true,
    alreadyAssigned: alreadyAssigned as boolean,
    item: patched ?? lead,
    booking: {
      attempted: Boolean(patientId),
      id: bookingId,
      patient_id: patientId,
    },
    email: {
      attempted: !alreadyAssigned,
      sent: emailSent,
      error: emailError,
    },
  };
}