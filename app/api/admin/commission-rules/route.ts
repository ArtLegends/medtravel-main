// app/api/admin/commission-rules/route.ts
import { NextResponse, NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/serviceClient";

// GET: list rules (optionally filter by clinic_id)
export async function GET(req: NextRequest) {
  const sb = createServiceClient();
  const clinicId = req.nextUrl.searchParams.get("clinic_id");

  let query = sb
    .from("clinic_commission_rules")
    .select("*")
    .order("clinic_id")
    .order("priority", { ascending: true });

  if (clinicId) {
    query = query.eq("clinic_id", clinicId);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST: create a new rule
export async function POST(req: NextRequest) {
  const sb = createServiceClient();
  const body = await req.json();

  const {
    clinic_id,
    rule_type,
    threshold_min,
    threshold_max,
    rate_pct,
    fixed_amount,
    currency,
    priority,
    is_active,
  } = body;

  if (!clinic_id || !rule_type) {
    return NextResponse.json(
      { error: "clinic_id and rule_type are required" },
      { status: 400 }
    );
  }

  const { data, error } = await sb
    .from("clinic_commission_rules")
    .insert({
      clinic_id,
      rule_type,
      threshold_min: threshold_min ?? null,
      threshold_max: threshold_max ?? null,
      rate_pct: rule_type === "percentage" ? rate_pct : null,
      fixed_amount: rule_type === "fixed" ? fixed_amount : null,
      currency: currency ?? "EUR",
      priority: priority ?? 0,
      is_active: is_active ?? true,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// PUT: update an existing rule
export async function PUT(req: NextRequest) {
  const sb = createServiceClient();
  const body = await req.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  // Clean up: ensure correct fields for rule_type
  if (updates.rule_type === "percentage") {
    updates.fixed_amount = null;
  } else if (updates.rule_type === "fixed") {
    updates.rate_pct = null;
  }

  const { data, error } = await sb
    .from("clinic_commission_rules")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE: remove a rule
export async function DELETE(req: NextRequest) {
  const sb = createServiceClient();
  const id = req.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const { error } = await sb
    .from("clinic_commission_rules")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}