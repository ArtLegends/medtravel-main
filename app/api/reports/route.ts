// app/api/reports/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { createServerClient } from "@/lib/supabase/serverClient";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const clinic_id = String(body.clinic_id ?? "").trim();
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const relationship = String(body.relationship ?? "").trim();
    const message = String(body.message ?? "").trim();

    if (!clinic_id || !name || !email || !phone || !message) {
      return NextResponse.json(
        { ok: false, error: "Please fill all required fields." },
        { status: 400 }
      );
    }

    // авторизован ли пользователь?
    const authSb = createServerClient();
    const { data: u } = await authSb.auth.getUser();
    const user_id = u?.user?.id ?? null; // анонимно -> null

    const { error } = await supabaseServer.from("reports").insert({
      clinic_id,
      user_id,       // null для анонима — это ОК
      name,
      email,
      phone,
      relationship,
      message,
    } as any);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Bad request" },
      { status: 400 }
    );
  }
}
