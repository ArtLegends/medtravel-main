// app/api/auth/add-role/route.ts
// Allows an already-authenticated user to request an additional role
// No password needed — uses current session
import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/routeClient";
import { createServiceClient } from "@/lib/supabase/serviceClient";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ALLOWED_ROLES = ["CUSTOMER", "PARTNER", "SUPERVISOR", "PATIENT"] as const;
type RequestableRole = typeof ALLOWED_ROLES[number];

function isRequestableRole(v: string): v is RequestableRole {
  return ALLOWED_ROLES.includes(v as any);
}

export async function POST(req: Request) {
  const route = await createRouteClient();
  const { data: auth } = await route.auth.getUser();
  const user = auth?.user;

  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const requestedRole = String(body?.role ?? "").trim().toUpperCase();

  if (!isRequestableRole(requestedRole)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const userId = user.id;
  const email = user.email?.toLowerCase() ?? null;

  if (!email) {
    return NextResponse.json({ error: "Email required. Please add an email to your account first." }, { status: 400 });
  }

  const sb = createServiceClient();

  // Check if user already has this role
  const { data: existingRole } = await sb
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", requestedRole.toLowerCase())
    .maybeSingle();

  if (existingRole) {
    return NextResponse.json({ error: "You already have this role.", already_has: true }, { status: 400 });
  }

  // PATIENT — grant immediately (no approval needed)
  if (requestedRole === "PATIENT") {
    await sb.from("user_roles").upsert(
      { user_id: userId, role: "patient" },
      { onConflict: "user_id,role" }
    );
    await sb.from("profiles").update({ role: "patient" }).eq("id", userId);
    return NextResponse.json({ ok: true, status: "granted", role: "PATIENT" });
  }

  // CUSTOMER — create registration request
  if (requestedRole === "CUSTOMER") {
    const { data: existing } = await sb
      .from("customer_registration_requests")
      .select("status")
      .eq("user_id", userId)
      .maybeSingle();

    if (existing?.status === "approved") {
      // Already approved — just grant the role
      await sb.from("user_roles").upsert({ user_id: userId, role: "customer" }, { onConflict: "user_id,role" });
      return NextResponse.json({ ok: true, status: "granted", role: "CUSTOMER" });
    }
    if (existing?.status === "pending") {
      return NextResponse.json({ ok: true, status: "pending", role: "CUSTOMER" });
    }

    await sb.from("customer_registration_requests").upsert(
      { user_id: userId, email, status: "pending" },
      { onConflict: "user_id" }
    );
    return NextResponse.json({ ok: true, status: "pending", role: "CUSTOMER" });
  }

  // PARTNER — create registration request
  if (requestedRole === "PARTNER") {
    const { data: existing } = await sb
      .from("partner_registration_requests")
      .select("status")
      .eq("user_id", userId)
      .maybeSingle();

    if (existing?.status === "approved") {
      await sb.from("user_roles").upsert({ user_id: userId, role: "partner" }, { onConflict: "user_id,role" });
      return NextResponse.json({ ok: true, status: "granted", role: "PARTNER" });
    }
    if (existing?.status === "pending") {
      return NextResponse.json({ ok: true, status: "pending", role: "PARTNER" });
    }

    await sb.from("partner_registration_requests").upsert(
      { user_id: userId, email, status: "pending" },
      { onConflict: "user_id" }
    );
    return NextResponse.json({ ok: true, status: "pending", role: "PARTNER" });
  }

  // SUPERVISOR — create registration request
  if (requestedRole === "SUPERVISOR") {
    const { data: existing } = await sb
      .from("supervisor_registration_requests")
      .select("status")
      .eq("user_id", userId)
      .maybeSingle();

    if (existing?.status === "approved") {
      await sb.from("user_roles").upsert({ user_id: userId, role: "supervisor" }, { onConflict: "user_id,role" });
      return NextResponse.json({ ok: true, status: "granted", role: "SUPERVISOR" });
    }
    if (existing?.status === "pending") {
      return NextResponse.json({ ok: true, status: "pending", role: "SUPERVISOR" });
    }

    await sb.from("supervisor_registration_requests").upsert(
      { user_id: userId, email, status: "pending" },
      { onConflict: "user_id" }
    );
    return NextResponse.json({ ok: true, status: "pending", role: "SUPERVISOR" });
  }

  return NextResponse.json({ error: "Unhandled role" }, { status: 400 });
}