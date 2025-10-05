// app/api/clinic-inquiries/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // server-only key
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const clinic_slug = (body.clinic_slug ?? "").toString().trim();
    const clinic_name = (body.clinic_name ?? "").toString().trim();
    const name = (body.name ?? "").toString().trim();
    const email = (body.email ?? "").toString().trim();
    const phone = (body.phone ?? "").toString().trim();
    const message = (body.message ?? "").toString().trim();
    const service = (body.service ?? "").toString().trim();

    if (!clinic_slug || !clinic_name || !name || !phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("clinic_inquiries")
      .insert({
        clinic_slug, clinic_name, name, email, phone, message, service,
        status: "new",
      })
      .select("*")
      .single();

    if (error) throw error;
    return NextResponse.json({ ok: true, inquiry: data }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Server error" }, { status: 500 });
  }
}
