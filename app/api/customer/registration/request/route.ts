import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, service, { auth: { persistSession: false } });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = String(body?.email ?? "").trim().toLowerCase();

  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const supabase = adminClient();

  // найти пользователя в auth по email
  const { data: users, error: e1 } = await supabase.auth.admin.listUsers({ page: 1, perPage: 2000 });
  if (e1) return NextResponse.json({ error: e1.message }, { status: 500 });

  const u = users.users.find((x) => String(x.email || "").toLowerCase() === email);
  if (!u) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // upsert заявки (одна на user_id)
  const { error } = await supabase
    .from("customer_registration_requests")
    .upsert(
      { user_id: u.id, email, status: "pending" },
      { onConflict: "user_id" }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
