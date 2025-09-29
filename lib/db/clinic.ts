// lib/db/clinic.ts
import { createServerClient } from "@/lib/supabase/serverClient";

// Минимальные БД-типизации (под твои таблицы)
type DbClinic = {
  id: string;
  name: string;
  slug: string;
  about?: string | null;
  address?: string | null;
  country?: string | null;
  city?: string | null;
  district?: string | null;
  verified_by_medtravel?: boolean | null;
  is_official_partner?: boolean | null;
};

type DbImage = { url: string };
type DbHour  = { day: string; open: string | null; close: string | null };
type DbClinicService = {
  service_id: string;
  price: number | string | null;
  currency?: string | null;
  description?: string | null; // если у тебя такого поля нет — не страшно
  duration?: string | null;    // тоже опционально
};
type DbService = { id: string; name: string; slug: string };

// Это формат, который понимает ClinicDetailPage (совместим с ClinicMock)
export type ClinicView = {
  slug: string;
  name: string;
  country: string;
  city: string;
  district?: string;
  about: string;
  images: string[];
  services?: Array<{ name: string; price?: string | number; description?: string }>;
  hours?: Array<{ day: string; open?: string; close?: string }>;
  location?: { address: string; mapEmbedUrl?: string };
  payments?: string[];
  verifiedByMedtravel?: boolean;
  isOfficialPartner?: boolean;

  // Эти — пустые/опц., чтобы страница не падала
  tags?: string[];
  staff?: Array<{ name: string; position: string; languages?: string[]; bio?: string; photo?: string }>;
  accreditations?: Array<{ name?: string; title?: string; country?: string; desc?: string; logo_url?: string }>;
  additionalServices?: {
    premises?: string[];
    clinic_services?: string[];
    travel_services?: string[];
    languages_spoken?: string[];
  };
};

export async function getClinicViewBySlug(slug: string): Promise<ClinicView | null> {
  const supabase = createServerClient();

  // 1) Клиника
  const { data: clinic, error: e1 } = await supabase
    .from("clinics")
    .select("id, name, slug, about, address, country, city, district, verified_by_medtravel, is_official_partner")
    .eq("slug", slug)
    .maybeSingle<DbClinic>();

  if (e1) {
    console.error("clinics select error", e1);
    return null;
  }
  if (!clinic) return null;

  // 2) Параллельно тянем картинки, часы и связки услуг
  const [imgsRes, hoursRes, csRes] = await Promise.all([
    supabase.from("clinic_images").select("url").eq("clinic_id", clinic.id).order("created_at", { ascending: true }) as any,
    supabase.from("clinic_hours").select("day, open, close").eq("clinic_id", clinic.id) as any,
    supabase.from("clinic_services").select("service_id, price, currency, description, duration").eq("clinic_id", clinic.id) as any,
  ]);

  if (imgsRes.error)  console.warn("clinic_images error", imgsRes.error);
  if (hoursRes.error) console.warn("clinic_hours error",  hoursRes.error);
  if (csRes.error)    console.warn("clinic_services error", csRes.error);

  const images: string[] = (imgsRes.data as DbImage[] | null)?.map(i => i.url).filter(Boolean) ?? [];

  const hours: ClinicView["hours"] =
    (hoursRes.data as DbHour[] | null)?.map(h => ({
      day: h.day,
      open: h.open ?? undefined,
      close: h.close ?? undefined,
    })) ?? [];

  const clinicServices = (csRes.data as DbClinicService[] | null) ?? [];
  let services: ClinicView["services"] = [];

  if (clinicServices.length) {
    const svcIds = [...new Set(clinicServices.map(r => r.service_id).filter(Boolean))];
    if (svcIds.length) {
      const { data: svcRows, error: eSvc } = await supabase
        .from("services")
        .select("id, name, slug")
        .in("id", svcIds) as unknown as { data: DbService[] | null; error: any };

      if (eSvc) {
        console.warn("services select error", eSvc);
      } else {
        const byId = new Map(svcRows?.map(s => [s.id, s]) ?? []);
        services = clinicServices.map(r => {
          const s = byId.get(r.service_id);
          return {
            name: s?.name ?? "Service",
            price: r.price ?? undefined,
            description: r.description ?? r.duration ?? undefined,
          };
        });
      }
    }
  }

  // Аккредитации/персонал/доп.сервисы — если у тебя будут таблицы, сюда легко добавить
  const view: ClinicView = {
    slug: clinic.slug,
    name: clinic.name,
    country: clinic.country ?? "",
    city: clinic.city ?? "",
    district: clinic.district ?? undefined,
    about: clinic.about ?? "",
    images,
    services,
    hours,
    location: clinic.address ? { address: clinic.address } : undefined,
    payments: [], // если позже заведёшь таблицу/колонку — подставим
    verifiedByMedtravel: !!clinic.verified_by_medtravel,
    isOfficialPartner: !!clinic.is_official_partner,

    // чтобы существующие секции отрендерились без падений
    accreditations: [],
    staff: [],
    additionalServices: {},
  };

  return view;
}
