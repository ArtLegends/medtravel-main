// app/api/contacts/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const firstName = String(body.firstName ?? "").trim();
    const lastName  = String(body.lastName  ?? "").trim();
    const email     = String(body.email     ?? "").trim();
    const phone     = String(body.phone     ?? "").trim();
    const message   = String(body.message   ?? "").trim();

    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { ok: false, error: "firstName, lastName and email are required" },
        { status: 400 }
      );
    }

    const sb = supabaseServer;
    const { error } = await sb
      .from("contact_messages" as any)      // 👈 cast
      .insert({
        first_name: firstName,
        last_name:  lastName,
        email,
        phone,
        message: message || null,
      } as any);                            // 👈 cast

    if (error) {
      console.error("contact_messages INSERT error:", error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
}

export async function GET() {
  const sb = supabaseServer;
  const { data, error } = await sb
    .from("contact_messages" as any)        // 👈 cast
    .select("id, first_name, last_name, email, phone, created_at" as any) // 👈 cast
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, rows: data });
}
