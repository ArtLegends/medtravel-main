import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/routeClient";
import { createServiceClient } from "@/lib/supabase/serviceClient";
import { resendSend, customerApprovedTemplate } from "@/lib/mail/resend";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function isAdmin(supabase: any, userId: string) {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const roles = (data ?? []).map((r: any) => String(r.role ?? "").toLowerCase());
  return roles.includes("admin");
}

export async function POST(req: Request) {
  const supabase = await createRouteClient();

  const { data: auth } = await supabase.auth.getUser();
  const me = auth?.user;
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ok = await isAdmin(supabase, me.id);
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const id = String(body?.id || "");
  const note = body?.note ? String(body.note).slice(0, 500) : null;

  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const sb = createServiceClient();

  const { data: row, error: selErr } = await sb
    .from("customer_registration_requests")
    .select("id,user_id,email,status")
    .eq("id", id)
    .maybeSingle();

  if (selErr) return NextResponse.json({ error: selErr.message }, { status: 500 });
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (row.status !== "pending") {
    return NextResponse.json({ error: "Request already processed" }, { status: 400 });
  }

  // 1) роль customer
  await sb.from("user_roles").upsert(
    { user_id: row.user_id, role: "customer" },
    { onConflict: "user_id,role" }
  );

  await sb.from("profiles").upsert(
    { id: row.user_id, email: row.email, role: "customer" },
    { onConflict: "id" }
  );

  // 2) обновляем заявку
  const { error: updErr } = await sb
    .from("customer_registration_requests")
    .update({
      status: "approved",
      decided_at: new Date().toISOString(),
      decided_by: me.id,
      admin_note: note,
    })
    .eq("id", id);

  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

  // 3) письмо
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "https://medtravel.me";
  const loginUrl = `${origin}/auth/login?as=CUSTOMER&next=%2Fcustomer`;

  const tpl = customerApprovedTemplate(loginUrl);
  await resendSend({ to: String(row.email).toLowerCase(), subject: tpl.subject, html: tpl.html });

  return NextResponse.json({ ok: true });
}
