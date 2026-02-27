import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/routeClient";
import { createServiceClient } from "@/lib/supabase/serviceClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

function splitName(full: string) {
  const s = String(full || "").trim().replace(/\s+/g, " ");
  if (!s) return { first_name: null as string | null, last_name: null as string | null };
  const parts = s.split(" ");
  const first = parts[0] ?? "";
  const last = parts.slice(1).join(" ").trim();
  return { first_name: first || null, last_name: last || null };
}

export async function POST(req: Request) {
  // 1) must be logged in (phone OTP already verified)
  const route = await createRouteClient();
  const { data: au } = await route.auth.getUser();
  const user = au?.user;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const leadId = String(body?.lead_id ?? "").trim();
  const fullName = String(body?.full_name ?? "").trim();
  const phone = String(body?.phone ?? "").trim();

  if (!isUuid(leadId)) return NextResponse.json({ error: "Invalid lead_id" }, { status: 400 });

  const sb = createServiceClient();

  // 2) check lead exists
  const { data: lead, error: lErr } = await sb
    .from("partner_leads")
    .select("id,patient_id,phone,email,full_name")
    .eq("id", leadId)
    .maybeSingle();

  if (lErr) return NextResponse.json({ error: lErr.message }, { status: 500 });
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  // 3) make sure patient role exists + profile updated
  const { first_name, last_name } = splitName(fullName || lead.full_name || "");

  await sb.from("profiles").upsert(
    {
      id: user.id,
      email: user.email ?? null, // phone users can have null email
      role: "patient",
      first_name,
      last_name,
      phone: phone || lead.phone || user.phone || null,
    } as any,
    { onConflict: "id" },
  );

  await sb
    .from("user_roles")
    .upsert({ user_id: user.id, role: "patient" } as any, { onConflict: "user_id,role" } as any);

  // 4) set user_metadata (optional, but nice for UI)
  await sb.auth.admin.updateUserById(user.id, {
    user_metadata: {
      ...(user.user_metadata ?? {}),
      first_name,
      last_name,
      phone: phone || lead.phone || user.phone || null,
      display_name: fullName || lead.full_name || null,
      requested_role: "PATIENT",
    },
  });

  // 5) create notification "set password" (optional; phone users may skip it, but ok)
  await sb.from("notifications").insert({
    user_id: user.id,
    type: "set_password",
    data: {
      title: "Secure your account",
      message: "Set a password to sign in faster next time.",
      action_url: "/settings",
    },
    is_read: false,
  });

  // 6) attach lead -> patient_id (idempotent)
  const { error: updLeadErr } = await sb
    .from("partner_leads")
    .update({
      patient_id: user.id,
    })
    .eq("id", leadId);

  if (updLeadErr) return NextResponse.json({ error: updLeadErr.message }, { status: 500 });

  return NextResponse.json({ ok: true, patient_id: user.id });
}