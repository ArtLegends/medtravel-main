import { NextRequest, NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/routeClient";

export const runtime = "nodejs";

function safeEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export async function POST(req: NextRequest) {
  const supabase = await createRouteClient();

  try {
    const fd = await req.formData();

    const source = String(fd.get("source") ?? "unknown").slice(0, 80);
    const full_name = String(fd.get("full_name") ?? "").trim();
    const phone = String(fd.get("phone") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim().toLowerCase();
    const ageRaw = String(fd.get("age") ?? "").trim();

    if (!full_name) return NextResponse.json({ error: "Введите ФИО" }, { status: 400 });
    if (!phone) return NextResponse.json({ error: "Введите телефон" }, { status: 400 });
    if (!email) return NextResponse.json({ error: "Введите email" }, { status: 400 });
    if (!safeEmail(email)) return NextResponse.json({ error: "Некорректный email" }, { status: 400 });

    const age = ageRaw ? Number(ageRaw) : null;
    const images = fd.getAll("images").filter(Boolean) as File[];
    const image_paths: string[] = [];

    // id будущей записи заранее, чтобы положить файлы в папку leadId
    const leadId = crypto.randomUUID();

    for (const file of images.slice(0, 3)) {
      if (!(file instanceof File)) continue;
      if (!file.type.startsWith("image/")) continue;

      const ext = (file.name.split(".").pop() || "jpg").toLowerCase().slice(0, 10);
      const path = `${leadId}/${crypto.randomUUID()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("partner-leads")
        .upload(path, file, {
          contentType: file.type,
          upsert: false,
          cacheControl: "3600",
        });

      if (upErr) {
        return NextResponse.json({ error: upErr.message }, { status: 500 });
      }

      image_paths.push(path);
    }

    const { error: insErr } = await supabase.from("partner_leads").insert({
      id: leadId,
      source,
      full_name,
      phone,
      email,
      age: Number.isFinite(age as any) ? age : null,
      image_paths,
      status: "new",
    });

    if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });

    return NextResponse.json({ ok: true, id: leadId });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message ?? e) }, { status: 500 });
  }
}