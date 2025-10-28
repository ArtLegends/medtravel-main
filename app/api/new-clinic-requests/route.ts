import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type Body = {
  clinicName: string;
  address?: string;
  country?: string;
  city?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email: string;
};

const bad = (msg: string, code = 400) =>
  NextResponse.json({ error: msg }, { status: code });

export async function POST(req: Request) {
  let b: Body;
  try {
    b = await req.json();
  } catch {
    return bad("Invalid JSON");
  }

  if (!b.clinicName || !b.firstName || !b.lastName || !b.email) {
    return bad("Missing required fields");
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { error } = await supabase.from("new_clinic_requests").insert({
    clinic_name: b.clinicName,
    address: b.address ?? null,
    country: b.country ?? null,
    city: b.city ?? null,
    contact_first_name: b.firstName,
    contact_last_name: b.lastName,
    phone: b.phone ?? null,
    email: b.email,
    status: "new",
  });

  if (error) {
    console.error("[new_clinic_requests] insert error:", error);
    return bad("Insert failed", 400);
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
