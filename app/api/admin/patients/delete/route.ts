import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/serverClient";

export async function POST(req: Request) {
  try {
    const { booking_id } = await req.json();
    if (!booking_id) return new NextResponse("booking_id is required", { status: 400 });

    const sb = await createServerClient();

    // (опционально) тут можно добавить проверку админ-доступа через sb.auth.getUser()
    // const { data: u } = await sb.auth.getUser(); if (!u?.user) return new NextResponse("Unauthorized", { status: 401 });

    const { data, error } = await sb.rpc("admin_patients_delete", { p_booking_id: booking_id });

    if (error) return new NextResponse(error.message, { status: 500 });
    if (!data) return new NextResponse("Not deleted", { status: 400 });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return new NextResponse(e?.message ?? "Unknown error", { status: 500 });
  }
}
