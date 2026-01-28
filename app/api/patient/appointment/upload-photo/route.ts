import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/routeClient";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, service, { auth: { persistSession: false } });
}

export async function POST(req: Request) {
  try {
    const supa = await createRouteClient();
    const { data: au } = await supa.auth.getUser();
    const user = au?.user;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const form = await req.formData();
    const bookingId = String(form.get("bookingId") || "");
    const file = form.get("file");

    if (!bookingId) return NextResponse.json({ error: "Missing bookingId" }, { status: 400 });
    if (!file || typeof file === "string") return NextResponse.json({ error: "Missing file" }, { status: 400 });

    const f = file as File;

    const MAX = 15 * 1024 * 1024;
    if (f.size > MAX) return NextResponse.json({ error: "File too large (max 15MB)" }, { status: 400 });

    // проверяем владельца booking
    const admin = adminClient();

    const { data: row, error: e0 } = await admin
      .from("patient_bookings")
      .select("id, patient_id")
      .eq("id", bookingId)
      .maybeSingle();

    if (e0) return NextResponse.json({ error: e0.message }, { status: 500 });
    if (!row) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    if (String(row.patient_id) !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const ext = (f.name.split(".").pop() || "jpg").toLowerCase();
    const safeExt = ["jpg", "jpeg", "png", "webp"].includes(ext) ? ext : "jpg";

    const path = `photos/${user.id}/${bookingId}.${safeExt}`;

    const buf = Buffer.from(await f.arrayBuffer());

    const up = await admin.storage.from("patient-files").upload(path, buf, {
      contentType: f.type || "image/jpeg",
      upsert: true,
    });

    if (up.error) return NextResponse.json({ error: up.error.message }, { status: 500 });

    // записываем путь в booking
    const { error: e1 } = await admin
        .from("patient_bookings")
        .update({ photo_path: path })
        .eq("id", bookingId);

    if (e1) return NextResponse.json({ error: e1.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
