import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/routeClient";
import { createServiceClient } from "@/lib/supabase/serviceClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function extractLeadId(notes: string | null, autoWhen: string | null) {
  const s = `${notes ?? ""} ${autoWhen ?? ""}`;
  // поддержим оба формата:
  // 1) [lead:<uuid>]
  // 2) lead:<uuid>
  const m =
    s.match(/\[lead:([0-9a-f-]{36})\]/i) ||
    s.match(/\blead:([0-9a-f-]{36})\b/i);
  return m?.[1] ?? null;
}

export async function GET(_req: Request, ctx: any) {
  const bookingId = String(ctx?.params?.id ?? "").trim();
  if (!bookingId) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  // 1) auth как customer (route client)
  const route = await createRouteClient();
  const { data: au } = await route.auth.getUser();
  const user = au?.user;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 2) узнаём clinic_id текущего customer
  const { data: clinicId, error: eClinic } = await route.rpc("customer_current_clinic_id");
  if (eClinic) return NextResponse.json({ error: eClinic.message }, { status: 500 });
  if (!clinicId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // 3) service role: читаем booking (чтобы достать notes/auto_when и сравнить clinic_id)
  const admin = createServiceClient();

  const { data: booking, error: bErr } = await admin
    .from("patient_bookings")
    .select("id, clinic_id, notes, auto_when")
    .eq("id", bookingId)
    .maybeSingle();

  if (bErr) return NextResponse.json({ error: bErr.message }, { status: 500 });
  if (!booking) return NextResponse.json({ urls: [] });

  if (String(booking.clinic_id) !== String(clinicId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 4) достаём leadId из notes/auto_when
  const leadId = extractLeadId(booking.notes ?? null, booking.auto_when ?? null);
  if (!leadId) return NextResponse.json({ urls: [] });

  // 5) тянем image_paths из partner_leads
  const { data: lead, error: lErr } = await admin
    .from("partner_leads")
    .select("image_paths")
    .eq("id", leadId)
    .maybeSingle();

  if (lErr) return NextResponse.json({ error: lErr.message }, { status: 500 });

  const paths: string[] = (lead as any)?.image_paths ?? [];
  const sliced = paths.map((p) => String(p ?? "").trim()).filter(Boolean).slice(0, 3);
  if (!sliced.length) return NextResponse.json({ urls: [] });

  // 6) подписанные ссылки (bucket partner-leads)
  const urls: string[] = [];
  for (const p of sliced) {
    const { data: signed, error: sErr } = await admin.storage
      .from("partner-leads")
      .createSignedUrl(p, 60 * 10);

    if (sErr) return NextResponse.json({ error: sErr.message }, { status: 500 });
    if (signed?.signedUrl) urls.push(signed.signedUrl);
  }

  return NextResponse.json({ urls });
}