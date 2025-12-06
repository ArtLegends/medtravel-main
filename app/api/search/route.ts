// app/api/search/route.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/serverClient";
import { clinicHref } from "@/lib/clinic-url";

type RowSearch = {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  image_url: string | null;
};

type RowClinicMeta = {
  id: string;
  country: string | null;
  province: string | null;
  city: string | null;
  district: string | null;
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    const limit = Math.min(Number(searchParams.get("limit") || 8), 20);

    if (q.length < 2) {
      return NextResponse.json([], { status: 200 });
    }

    const supabase = await createServerClient();

    // 1) основной поиск по функции search_clinics_v1
    const { data: rows, error } = await supabase.rpc("search_clinics_v1", {
      q,
      limit_count: limit,
    });

    if (error) throw error;
    if (!rows || !rows.length) {
      return NextResponse.json([], { status: 200 });
    }

    const searchRows = rows as RowSearch[];
    const clinicIds = searchRows.map((r) => r.id);

    // 2) подтягиваем локацию по тем же id
    const { data: metaRows, error: metaErr } = await supabase
      .from("clinics")
      .select("id,country,province,city,district")
      .in("id", clinicIds);

    if (metaErr) throw metaErr;

    const metaMap = new Map<string, RowClinicMeta>();
    (metaRows || []).forEach((m) => metaMap.set(m.id, m as RowClinicMeta));

    // 3) собираем то, что ждёт фронт (SearchBar)
    const items = searchRows.map((row) => {
      const meta = metaMap.get(row.id) || ({} as RowClinicMeta);

      const country = meta.country ?? null;
      const province = meta.province ?? null;
      const city = meta.city ?? null;
      const district = meta.district ?? null;

      return {
        id: row.id,
        name: row.name,
        slug: row.slug,
        category: row.category ?? null,
        image_url: row.image_url, // если null – SearchBar подставит FALLBACK_IMG
        href: clinicHref({
          slug: row.slug,
          country,
          province,
          city,
          district,
        }),
        country,
        province,
        city,
        district,
      };
    });

    return NextResponse.json(items, { status: 200 });
  } catch (e: any) {
    console.error("[/api/search] error:", e);
    return NextResponse.json(
      { error: e?.message ?? "Search error" },
      { status: 500 },
    );
  }
}
