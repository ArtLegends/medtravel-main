// app/api/search/route.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/serverClient";
import { clinicHref } from '@/lib/clinic-url';

type RowClinic = {
  id: string;
  name: string;
  slug: string;
  country: string | null;
  province: string | null;
  city: string | null;
  district: string | null;
};
type RowCat = { clinic_id: string; categories: { name: string }[] };
type RowImg = { clinic_id: string; url: string | null; sort: number | null; created_at: string | null };

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    const limit = Math.min(Number(searchParams.get("limit") || 8), 20);

    if (q.length < 2) return NextResponse.json([], { status: 200 });

    const supabase = await createServerClient();

    // 1) клиники (только опубликованные и одобренные) + локация
    const { data: clinics, error: clinicsErr } = await supabase
      .from("clinics")
      .select("id,name,slug,country,province,city,district")
      .eq("is_published", true)
      .eq("moderation_status", "approved")
      .or(`name.ilike.%${q}%,slug.ilike.%${q}%`)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (clinicsErr) throw clinicsErr;
    if (!clinics?.length) return NextResponse.json([], { status: 200 });

    const clinicIds = clinics.map((c) => c.id);

    // 2) категории (для подписи)
    const { data: cats, error: catsErr } = await supabase
      .from("clinic_categories")
      .select("clinic_id,categories(name)")
      .in("clinic_id", clinicIds);
    if (catsErr) throw catsErr;

    const catMap = new Map<string, string>();
    (cats || []).forEach((row: RowCat) => {
      const first = row?.categories?.[0]?.name;
      if (first && !catMap.has(row.clinic_id)) catMap.set(row.clinic_id, first);
    });

    // 3) обложки
    const { data: imgs, error: imgsErr } = await supabase
      .from("clinic_images")
      .select("clinic_id,url,sort,created_at")
      .in("clinic_id", clinicIds)
      .order("sort", { ascending: true, nullsFirst: true })
      .order("created_at", { ascending: false, nullsFirst: true });
    if (imgsErr) throw imgsErr;

    const imgMap = new Map<string, string>();
    (imgs || []).forEach((row: RowImg) => {
      if (!imgMap.has(row.clinic_id) && row.url && String(row.url).trim().length > 0) {
        imgMap.set(row.clinic_id, row.url);
      }
    });

    // 4) выдача
    const items = (clinics as RowClinic[]).map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      category: catMap.get(c.id) || null,
      image_url:
        imgMap.get(c.id) ||
        "https://images.unsplash.com/photo-1584982751601-97dcc0972d8f?q=80&w=1200&auto=format&fit=crop",
      href: clinicHref({
        slug: c.slug,
        country: c.country,
        province: c.province,
        city: c.city,
        district: c.district,
      }),
    }));

    return NextResponse.json(items, { status: 200 });
  } catch (e: any) {
    console.error("[/api/search] error:", e);
    return NextResponse.json({ error: e?.message ?? "Search error" }, { status: 500 });
  }
}
