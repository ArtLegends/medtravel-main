import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/serverClient";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const status = body?.status ?? null;
    const start = body?.start ?? null; // YYYY-MM-DD
    const end = body?.end ?? null;     // YYYY-MM-DD

    const sb = await createServerClient();

    // (опционально) проверка админа
    // const { data: u } = await sb.auth.getUser(); if (!u?.user) return new NextResponse("Unauthorized", { status: 401 });

    const { data, error } = await sb.rpc("admin_patients_delete_all", {
      p_status: status,
      p_start_date: start,
      p_end_date: end,
    });

    if (error) return new NextResponse(error.message, { status: 500 });

    return NextResponse.json({ ok: true, deleted: data ?? 0 });
  } catch (e: any) {
    return new NextResponse(e?.message ?? "Unknown error", { status: 500 });
  }
}
