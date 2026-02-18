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
  const partner_id = String(body?.partner_id ?? "").trim();
  const note = String(body?.note ?? "").trim().slice(0, 500);

  if (!isUuid(lead_id)) return NextResponse.json({ error: "Invalid lead_id" }, { status: 400 });
  if (!isUuid(partner_id)) return NextResponse.json({ error: "Invalid partner_id" }, { status: 400 });

  // 3) service client
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

  // 4) прочитаем текущий lead, чтобы:
  // - понять изменилось ли назначение (без миграций / без дублей)
  // - взять данные лида для письма
  const { data: before, error: beforeErr } = await admin
    .from("partner_leads")
    .select("id,assigned_partner_id,full_name,phone,email,source,created_at")
    .eq("id", lead_id)
    .maybeSingle();

  if (beforeErr) return NextResponse.json({ error: beforeErr.message }, { status: 500 });
  if (!before) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  const prevPartnerId = before.assigned_partner_id ?? null;
  const partnerChanged = prevPartnerId !== partner_id;

  // 5) update lead
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

  // 6) email notify (best-effort: не ломаем assignment если email упал)
  let emailSent = false;
  let emailError: string | null = null;

  if (partnerChanged) {
    try {
      // email партнёра берём из profiles
      const { data: partnerProfile, error: pErr } = await admin
        .from("profiles")
        .select("email,first_name,last_name")
        .eq("id", partner_id)
        .maybeSingle();

      if (pErr) throw new Error(pErr.message);
      const partnerEmail = partnerProfile?.email?.trim();
      if (!partnerEmail) throw new Error("Partner email not found in profiles");

      const partnerName = `${partnerProfile?.first_name ?? ""} ${partnerProfile?.last_name ?? ""}`.trim() || null;

      const origin = req.nextUrl.origin;
      const leadsUrl = `${origin}/partner/leads`;

      const tpl = partnerNewLeadTemplate({
        partnerName,
        leadsUrl,
        lead: {
          full_name: before.full_name,
          phone: before.phone,
          email: before.email,
          source: before.source,
          created_at: before.created_at,
        },
      });

      await resendSend({ to: partnerEmail, subject: tpl.subject, html: tpl.html });
      emailSent = true;
    } catch (e: any) {
      emailError = String(e?.message ?? e);
      // не бросаем ошибку — assignment уже сделан
    }
  }

  return NextResponse.json({
    ok: true,
    item: data,
    email: {
      attempted: partnerChanged,
      sent: emailSent,
      error: emailError,
    },
  });
}