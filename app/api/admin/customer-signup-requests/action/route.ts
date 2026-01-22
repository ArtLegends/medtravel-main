import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createRouteClient } from "@/lib/supabase/routeClient";
import { resendSend, customerApprovedTemplate, customerRejectedTemplate } from "@/lib/mail/resend";

export const dynamic = "force-dynamic";

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, service, { auth: { persistSession: false } });
}

export async function POST(req: Request) {
  const supaUser = await createRouteClient();
  const { data: auth } = await supaUser.auth.getUser();
  const admin = auth?.user;
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const id = String(body?.id ?? "");
  const action = String(body?.action ?? ""); // approve | reject
  const note = body?.note ? String(body.note) : null;

  if (!id || (action !== "approve" && action !== "reject")) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  // ✅ делаем критические изменения через service role
  const supabase = adminClient();

  const { data: reqRow, error: e0 } = await supabase
    .from("customer_registration_requests")
    .select("id,user_id,email,status")
    .eq("id", id)
    .single();

  if (e0) return NextResponse.json({ error: e0.message }, { status: 500 });

  if (reqRow.status !== "pending") {
    return NextResponse.json({ error: "Request already processed" }, { status: 400 });
  }

  if (action === "reject") {
    const { error } = await supabase
      .from("customer_registration_requests")
      .update({
        status: "rejected",
        decided_at: new Date().toISOString(),
        decided_by: admin.id,
        admin_note: note,
      })
      .eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // TODO: отправить письмо об отказе (ниже дам)
    return NextResponse.json({ ok: true });
  }

  // approve
  // 1) ставим роль customer
  const { error: e1 } = await supabase.from("user_roles").upsert(
    { user_id: reqRow.user_id, role: "customer" },
    { onConflict: "user_id,role" }
  );
  if (e1) return NextResponse.json({ error: e1.message }, { status: 500 });

  // 2) profiles.role = customer (если используешь как primary)
  await supabase.from("profiles").upsert(
    { id: reqRow.user_id, email: reqRow.email, role: "customer" },
    { onConflict: "id" }
  );

  // 3) отмечаем заявку
  const { error: e2 } = await supabase
    .from("customer_registration_requests")
    .update({
      status: "approved",
      decided_at: new Date().toISOString(),
      decided_by: admin.id,
      admin_note: note,
    })
    .eq("id", id);

  if (e2) return NextResponse.json({ error: e2.message }, { status: 500 });

    // approve:
    const tpl = customerApprovedTemplate();
    await resendSend({ to: reqRow.email, subject: tpl.subject, html: tpl.html });

    // reject:
    const tpl2 = customerRejectedTemplate();
    await resendSend({ to: reqRow.email, subject: tpl2.subject, html: tpl2.html });

  return NextResponse.json({ ok: true });
}
