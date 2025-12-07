// app/(admin)/admin/clinics/detail/page.tsx

import Link from "next/link";
import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/serviceClient";
import { clinicPath } from "@/lib/clinic-url";
import ClinicDraftEditor from "@/components/admin/ClinicDraftEditor";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const CLINIC_BUCKET = "clinic-images";

type ClinicRow = {
  id: string;
  name: string;
  slug: string | null;
  country: string | null;
  city: string | null;
  province: string | null;
  district: string | null;
  address: string | null;
  status: string | null;
  moderation_status: string | null;
  is_published: boolean | null;
  created_at: string;
  updated_at: string | null;
  // jsonb поля (из старого импорта / драфтов)
  services?: any;
  doctors?: any;
  hours?: any;
  images?: any;
  gallery?: any;
  amenities?: any;
  payments?: any;
  // в clinics такой колонки нет, но тип оставляем как optional,
  // чтобы не падать, если позже появится
  accreditations?: any;
  map_embed_url?: string | null;
  directions?: string | null;
};

type DraftRow = {
  clinic_id: string;
  basic_info: any | null;
  facilities: any | null;
  services: any[] | null;
  doctors: any[] | null;
  hours: any[] | null;
  gallery: any[] | null;
  pricing: any[] | null;
  location: any | null;
  status: string | null;
  updated_at: string | null;
  // на всякий случай – если есть колонка accreditations в drafts
  accreditations?: any[] | null;
};

type SearchParams = {
  id?: string;
};

/* ---------- helpers ---------- */

function randomKey() {
  return Math.random().toString(36).slice(2);
}

async function uploadImageToClinicsBucket(
  sb: ReturnType<typeof createServiceClient>,
  file: File,
  pathPrefix: string,
) {
  if (!file || file.size === 0) return null;

  const extFromName = () => {
    const parts = file.name.split(".");
    if (parts.length < 2) return "jpg";
    const ext = parts.pop()!;
    return ext.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  };

  const ext = extFromName();
  const filePath = `${pathPrefix}/${Date.now()}-${randomKey()}.${ext}`;

  const { error: uploadError } = await sb.storage
    .from(CLINIC_BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || "image/jpeg",
    });

  if (uploadError) {
    console.error("storage upload error", uploadError);
    throw new Error("Failed to upload image");
  }

  const { data } = sb.storage.from(CLINIC_BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}

/** Нормализуем массив в массив строк (label/name/title/method/value → string) */
function normalizeStringList(value: any): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item: any) => {
      if (typeof item === "string") return item.trim();
      if (item && typeof item === "object") {
        if (typeof item.label === "string") return item.label.trim();
        if (typeof item.method === "string") return item.method.trim();
        if (typeof item.name === "string") return item.name.trim();
        if (typeof item.title === "string") return item.title.trim();
        if (typeof item.value === "string") return item.value.trim();
      }
      return null;
    })
    .filter((v: string | null): v is string => !!v && v.length > 0);
}

/* ---------- server action: сохранить клинику + драфт ---------- */

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

const WEEKDAY_MAP: Record<string, number> = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 7,
};

function dayNameToWeekday(day: string | undefined | null): number | null {
  if (!day) return null;
  const key = day.trim().toLowerCase();
  return WEEKDAY_MAP[key] ?? null;
}

function toTime(value: string | null | undefined): string | null {
  const v = (value ?? "").trim();
  if (!v) return null;
  const m = v.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const hh = String(Math.min(23, Math.max(0, Number(m[1])))).padStart(2, "0");
  const mm = String(Math.min(59, Math.max(0, Number(m[2])))).padStart(2, "0");
  return `${hh}:${mm}:00`;
}

/** локальная версия parseTimeSpan для часов из draft: "9:00-18:00", "Closed" и т.п. */
function parseTimeSpanDraft(
  s?: string,
): { open: string | null; close: string | null; is_closed: boolean } {
  const text = (s || "").trim();
  if (!text) return { open: null, close: null, is_closed: false };
  if (/^closed$/i.test(text)) return { open: null, close: null, is_closed: true };

  const m = text.match(
    /^\s*([0-9: ]+(?:am|pm)?)\s*[-–—]\s*([0-9: ]+(?:am|pm)?)\s*$/i,
  );
  if (!m) return { open: null, close: null, is_closed: false };

  const to24 = (v: string) => {
    const t = v.trim().toLowerCase();
    const ampm = t.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i);
    if (ampm) {
      let hh = Number(ampm[1]);
      const mm = Number(ampm[2] ?? 0);
      const ap = ampm[3].toLowerCase();
      if (ap === "pm" && hh !== 12) hh += 12;
      if (ap === "am" && hh === 12) hh = 0;
      return `${String(hh).padStart(2, "0")}:${String(mm).padStart(
        2,
        "0",
      )}:00`;
    }
    const hhmm = t.match(/^(\d{1,2})(?::(\d{2}))?$/);
    if (hhmm) {
      const hh = Number(hhmm[1]);
      const mm = Number(hhmm[2] ?? 0);
      return `${String(hh).padStart(2, "0")}:${String(mm).padStart(
        2,
        "0",
      )}:00`;
    }
    return null;
  };

  const open = to24(m[1]) as string | null;
  const close = to24(m[2]) as string | null;
  return { open, close, is_closed: false };
}

async function saveClinic(formData: FormData) {
  "use server";

  const id = String(formData.get("clinic_id") || "");
  if (!id) return;

  const sb = createServiceClient();

  const str = (name: string) => String(formData.get(name) ?? "").trim();
  const parseJson = (field: string) => {
    const raw = formData.get(field);
    if (!raw) return null;
    try {
      return JSON.parse(String(raw));
    } catch {
      return null;
    }
  };

  // --- basic info / location ---
  const basic_info = {
    name: str("clinic_name") || null,
    slug: str("clinic_slug") || null,
    specialty: str("clinic_specialty") || null,
    country: str("clinic_country") || null,
    city: str("clinic_city") || null,
    province: str("clinic_province") || null,
    district: str("clinic_district") || null,
    description: str("clinic_description") || null,
  };

  const location = {
    mapUrl: str("clinic_mapUrl") || null,
    directions: str("clinic_directions") || null,
  };

  const address = str("clinic_address") || null;
  const clinicStatus = str("clinic_status") || null;
  const moderationStatus = str("clinic_moderation_status") || null;
  const draftStatus = str("draft_status") || null;

  // --- СЫРОЙ JSON из формы (то, что уйдёт в clinic_profile_drafts) ---
  const rawServices = (parseJson("draft_services") ?? []) as any[];
  const rawDoctors = (parseJson("draft_doctors") ?? []) as any[];
  const rawHours = (parseJson("draft_hours") ?? []) as any[];
  const rawGallery = (parseJson("draft_gallery") ?? []) as any[];
  const rawFacilities = (parseJson("draft_facilities") ?? {}) as any;
  const rawPricing = (parseJson("draft_pricing") ?? []) as any[];
  const rawAccreditations = (parseJson("clinic_accreditations") ??
    []) as any[];

  // --- НОРМАЛИЗОВАННЫЕ структуры ДЛЯ ТАБЛИЦ / JSON клиники ---

  const servicesForDb = Array.isArray(rawServices) ? rawServices : [];

  const doctorsForDb = Array.isArray(rawDoctors)
    ? rawDoctors.map((d) => {
        const name = (d.fullName ?? d.name ?? "").trim();
        const title = (d.title ?? "").trim();
        const spec = (d.specialty ?? d.spec ?? "").trim();

        let langs: string[] = [];
        if (Array.isArray(d.languages)) {
          langs = d.languages
            .filter(
              (x: unknown): x is string =>
                typeof x === "string" && x.trim().length > 0,
            )
            .map((x: string) => x.trim());
        } else if (typeof d.languages === "string") {
          langs = d.languages
            .split(",")
            .map((x: string) => x.trim())
            .filter(Boolean);
        }

        return {
          name,
          title: title || null,
          position: spec || title || null,
          bio:
            typeof d.bio === "string" && d.bio.trim().length
              ? d.bio.trim()
              : null,
          photo_url:
            (d.photoUrl ?? d.photo_url ?? d.photo ?? "").trim() || null,
          languages: langs,
        };
      })
    : [];

  const hoursForDb = Array.isArray(rawHours)
    ? rawHours
        .map((h) => {
          const day = h.day ?? h.weekday ?? "";
          const weekday = dayNameToWeekday(day);
          if (!weekday) return null;

          let status: string = h.status ?? "open";
          let isClosed = status === "closed";

          let openStr: string | null = h.start ?? h.open ?? null;
          let closeStr: string | null = h.end ?? h.close ?? null;
          const timeText: string | null = h.time ?? null;

          let open: string | null = null;
          let close: string | null = null;
          let hoursText: string | null = null;

          if (timeText && !openStr && !closeStr) {
            const parsed = parseTimeSpanDraft(timeText);
            open = parsed.open;
            close = parsed.close;
            isClosed = parsed.is_closed;
            hoursText = timeText;
            if (parsed.is_closed) status = "closed";
          } else {
            open = isClosed ? null : toTime(openStr);
            close = isClosed ? null : toTime(closeStr);
            if (isClosed) hoursText = "closed";
            else if (status === "by_appointment") hoursText = "by appointment";
            else if (openStr && closeStr) hoursText = `${openStr} - ${closeStr}`;
          }

          return {
            clinic_id: id,
            weekday,
            open,
            close,
            is_closed: isClosed,
            dow: weekday,
            hours_text: hoursText,
          };
        })
        .filter((x): x is NonNullable<typeof x> => x !== null)
    : [];

  const galleryRawArray = Array.isArray(rawGallery) ? rawGallery : [];
  const galleryForClinic = galleryRawArray
    .map((g, index) => {
      const url = (
        g?.url ??
        g?.src ??
        g?.imageUrl ??
        g?.image_url ??
        g?.logo_url ??
        ""
      )
        .toString()
        .trim();
      if (!url) return null;
      const title = (g?.title ?? g?.alt ?? g?.caption ?? null) as
        | string
        | null;
      return { url, title, sort: index };
    })
    .filter(
      (x): x is { url: string; title: string | null; sort: number } => !!x,
    );

  const amenitiesForClinic = {
    premises: normalizeStringList(rawFacilities.premises),
    clinic_services: normalizeStringList(rawFacilities.clinic_services),
    travel_services: normalizeStringList(rawFacilities.travel_services),
    languages_spoken: normalizeStringList(rawFacilities.languages_spoken),
  };

  const paymentNames = normalizeStringList(rawPricing);
  const paymentsForClinic = paymentNames.map((method) => ({ method }));

  const accreditationsRaw = Array.isArray(rawAccreditations)
    ? rawAccreditations
    : [];
  const accreditationsForClinic = accreditationsRaw
    .map((a) => {
      const name = (a?.name ?? "").trim();
      if (!name) return null;
      const logo_url =
        (a?.logo_url ?? a?.logoUrl ?? a?.url ?? "").trim() || null;
      const desc =
        typeof a?.description === "string" && a.description.trim().length
          ? a.description.trim()
          : null;
      return { name, logo_url, description: desc };
    })
    .filter(
      (
        x,
      ): x is {
        name: string;
        logo_url: string | null;
        description: string | null;
      } => !!x,
    );

  // --- 1) clinics ---

  const clinicUpdate: any = {
    name: basic_info.name,
    slug: basic_info.slug,
    about: basic_info.description,
    country: basic_info.country,
    city: basic_info.city,
    province: basic_info.province,
    district: basic_info.district,
    address,
    status: clinicStatus || null,
    moderation_status: moderationStatus || "draft",
    is_published: formData.get("clinic_is_published") === "on",
    map_embed_url: location.mapUrl,
    amenities: amenitiesForClinic,
    payments: paymentsForClinic,
  };

  const { error: clinicError } = await sb
    .from("clinics")
    .update(clinicUpdate)
    .eq("id", id);

  if (clinicError) {
    console.error("clinics update error", clinicError);
    throw new Error("Failed to update clinic");
  }

  // --- 2) categories + clinic_categories (по specialty) ---

  if (basic_info.specialty) {
    try {
      const catSlug = slugify(basic_info.specialty);
      let categoryId: number | null = null;

      const { data: existing, error: catSelErr } = await sb
        .from("categories")
        .select("id")
        .eq("slug", catSlug)
        .maybeSingle();

      if (catSelErr) throw catSelErr;

      if (existing?.id) {
        categoryId = existing.id as number;
      } else {
        const { data: created, error: catInsErr } = await sb
          .from("categories")
          .insert({ name: basic_info.specialty, slug: catSlug } as any)
          .select("id")
          .single();

        if (catInsErr) throw catInsErr;
        categoryId = created.id as number;
      }

      if (categoryId != null) {
        const { error: delCcErr } = await sb
          .from("clinic_categories")
          .delete()
          .eq("clinic_id", id);
        if (delCcErr) throw delCcErr;

        const { error: insCcErr } = await sb
          .from("clinic_categories")
          .insert({ clinic_id: id, category_id: categoryId } as any);
        if (insCcErr) throw insCcErr;
      }
    } catch (err) {
      console.error("clinic category sync error", err);
    }
  }

  // --- 3) services + clinic_services ---

  try {
    const { error: delLinksErr } = await sb
      .from("clinic_services")
      .delete()
      .eq("clinic_id", id);
    if (delLinksErr) throw delLinksErr;

    for (const s of servicesForDb) {
      const name = (s?.name ?? "").trim();
      if (!name) continue;

      const desc = s?.description ?? s?.desc ?? null;
      const currency = (s?.currency ?? "USD").trim() || "USD";

      let priceNum: number | null = null;
      const p = s?.price;
      if (typeof p === "number") {
        priceNum = p;
      } else if (typeof p === "string" && p.trim() !== "") {
        const parsed = Number(p.replace(",", "."));
        if (!Number.isNaN(parsed)) priceNum = parsed;
      }

      const { data: existingSvc, error: svcSelErr } = await sb
        .from("services")
        .select("id")
        .eq("name", name)
        .maybeSingle();

      if (svcSelErr) throw svcSelErr;

      let serviceId: number;
      if (existingSvc?.id) {
        serviceId = existingSvc.id as number;
        await sb
          .from("services")
          .update({ description: desc, slug: slugify(name) } as any)
          .eq("id", serviceId);
      } else {
        const { data: createdSvc, error: svcInsErr } = await sb
          .from("services")
          .insert(
            {
              name,
              slug: slugify(name),
              description: desc,
            } as any,
          )
          .select("id")
          .single();

        if (svcInsErr || !createdSvc)
          throw svcInsErr || new Error("Service insert failed");
        serviceId = createdSvc.id as number;
      }

      const { error: linkErr } = await sb.from("clinic_services").insert({
        clinic_id: id,
        service_id: serviceId,
        price: priceNum,
        currency,
      } as any);

      if (linkErr) throw linkErr;
    }
  } catch (err) {
    console.error("services sync error", err);
    throw new Error("Failed to update clinic services");
  }

  // --- 4) clinic_images ---

  try {
    const { error: delImgErr } = await sb
      .from("clinic_images")
      .delete()
      .eq("clinic_id", id);
    if (delImgErr) throw delImgErr;

    const imageRows = galleryForClinic.map((g) => ({
      clinic_id: id,
      url: g.url,
      title: g.title,
      sort: g.sort,
      created_at: new Date().toISOString(),
    }));

    if (imageRows.length) {
      const { error: insImgErr } = await sb
        .from("clinic_images")
        .insert(imageRows as any);
      if (insImgErr) throw insImgErr;
    }
  } catch (err) {
    console.error("clinic_images sync error", err);
    throw new Error("Failed to update clinic images");
  }

  // --- 5) clinic_staff ---

  try {
    const { error: delStaffErr } = await sb
      .from("clinic_staff")
      .delete()
      .eq("clinic_id", id);
    if (delStaffErr) throw delStaffErr;

    const staffRows = doctorsForDb
      .filter((d) => (d.name ?? "").trim().length > 0)
      .map((d) => ({
        clinic_id: id,
        name: d.name,
        title: d.title,
        position: d.position,
        bio: d.bio,
        languages: d.languages ?? [],
        photo_url: d.photo_url ?? null,
        created_at: new Date().toISOString(),
      }));

    if (staffRows.length) {
      const { error: insStaffErr } = await sb
        .from("clinic_staff")
        .insert(staffRows as any);
      if (insStaffErr) throw insStaffErr;
    }
  } catch (err) {
    console.error("clinic_staff sync error", err);
    throw new Error("Failed to update clinic staff");
  }

  // --- 6) clinic_hours ---

  try {
    const { error: delHoursErr } = await sb
      .from("clinic_hours")
      .delete()
      .eq("clinic_id", id);
    if (delHoursErr) throw delHoursErr;

    if (hoursForDb.length) {
      const { error: insHoursErr } = await sb
        .from("clinic_hours")
        .insert(hoursForDb as any);
      if (insHoursErr) throw insHoursErr;
    }
  } catch (err) {
    console.error("clinic_hours sync error", err);
    throw new Error("Failed to update clinic hours");
  }

  // --- 7) accreditations + clinic_accreditations ---

  try {
    const { error: delLinksErr } = await sb
      .from("clinic_accreditations")
      .delete()
      .eq("clinic_id", id);
    if (delLinksErr) throw delLinksErr;

    for (const item of accreditationsForClinic) {
      const { name, logo_url, description } = item;

      const { data: existingAcc, error: accSelErr } = await sb
        .from("accreditations")
        .select("id")
        .eq("name", name)
        .maybeSingle();

      if (accSelErr) throw accSelErr;

      let accreditationId: number;
      if (existingAcc?.id) {
        accreditationId = existingAcc.id as number;
        await sb
          .from("accreditations")
          .update({ logo_url, description } as any)
          .eq("id", accreditationId);
      } else {
        const { data: createdAcc, error: accInsErr } = await sb
          .from("accreditations")
          .insert(
            {
              name,
              logo_url,
              description,
              slug: slugify(name),
            } as any,
          )
          .select("id")
          .single();

        if (accInsErr || !createdAcc)
          throw accInsErr || new Error("Accreditation insert failed");
        accreditationId = createdAcc.id as number;
      }

      const { error: linkErr } = await sb
        .from("clinic_accreditations")
        .insert({
          clinic_id: id,
          accreditation_id: accreditationId,
        } as any);

      if (linkErr) throw linkErr;
    }
  } catch (err) {
    console.error("clinic_accreditations sync error", err);
    throw new Error("Failed to update clinic accreditations");
  }

  // --- 8) clinic_profile_drafts (сырые данные формы) ---

  const { error: draftError } = await sb
    .from("clinic_profile_drafts")
    .upsert(
      {
        clinic_id: id,
        basic_info,
        location,
        services: Array.isArray(rawServices) ? rawServices : [],
        doctors: Array.isArray(rawDoctors) ? rawDoctors : [],
        hours: Array.isArray(rawHours) ? rawHours : [],
        gallery: Array.isArray(rawGallery) ? rawGallery : [],
        facilities: rawFacilities ?? {},
        pricing: Array.isArray(rawPricing) ? rawPricing : [],
        status: draftStatus || "draft",
        updated_at: new Date().toISOString(),
        // сюда НЕ пишем accreditations, чтобы не триггерить ошибку,
        // если колонки нет
      } as any,
      { onConflict: "clinic_id" } as any,
    );

  if (draftError) {
    console.error("clinic_profile_drafts upsert error", draftError);
    throw new Error("Failed to update clinic draft");
  }

  // Перегенерируем админку + список клиник
  revalidatePath(`/admin/clinics/detail?id=${id}`);
  revalidatePath("/admin/clinics");

  // И публичную страницу клиники
  if (basic_info.slug) {
    const publicPath =
      clinicPath({
        slug: basic_info.slug,
        country: basic_info.country ?? undefined,
        province: basic_info.province ?? undefined,
        city: basic_info.city ?? undefined,
        district: basic_info.district ?? undefined,
      }) || `/clinic/${basic_info.slug}`;
    if (publicPath) {
      revalidatePath(publicPath);
    }
  }
}

/* ---------- сама страница ---------- */

export default async function ClinicEditorPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const id = sp.id;

  if (!id) {
    return (
      <div className="space-y-4 p-6">
        <h1 className="text-xl font-semibold">Clinic editor</h1>
        <p className="text-sm text-gray-600">
          Missing <code className="font-mono">id</code> query parameter.
        </p>
        <Link
          href="/admin/clinics"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to list
        </Link>
      </div>
    );
  }

  const sb = createServiceClient();

  const [
    { data: clinic, error: clinicError },
    { data: draft, error: draftError },
  ] = await Promise.all([
    sb.from("clinics").select("*").eq("id", id).maybeSingle<ClinicRow>(),
    sb
      .from("clinic_profile_drafts")
      .select("*")
      .eq("clinic_id", id)
      .maybeSingle<DraftRow>(),
  ]);

  if (clinicError || draftError) {
    return (
      <div className="space-y-4 p-6">
        <h1 className="text-xl font-semibold">Clinic editor error</h1>
        <pre className="whitespace-pre-wrap rounded-lg bg-red-50 p-4 text-xs text-red-700">
          {clinicError && `clinics error: ${clinicError.message}\n\n`}
          {draftError && `drafts error: ${draftError.message}\n\n`}
        </pre>
        <Link
          href="/admin/clinics"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to list
        </Link>
      </div>
    );
  }

  if (!clinic) {
    return (
      <div className="space-y-4 p-6">
        <h1 className="text-xl font-semibold">Clinic not found</h1>
        <p className="text-sm text-gray-600">
          We could not find a clinic with id:{" "}
          <code className="font-mono">{id}</code>
        </p>
        <Link
          href="/admin/clinics"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to list
        </Link>
      </div>
    );
  }

  // ---- подгружаем аккредитации через join таблицы ----
  let accreditationsFromJoin: any[] = [];
  try {
    const { data: linkRows, error: linksErr } = await sb
      .from("clinic_accreditations")
      .select("accreditation_id")
      .eq("clinic_id", id);

    if (!linksErr && Array.isArray(linkRows) && linkRows.length) {
      const ids = linkRows.map((r: any) => r.accreditation_id);
      const { data: accRows, error: accErr } = await sb
        .from("accreditations")
        .select("id, name, logo_url, description")
        .in("id", ids);

      if (!accErr && Array.isArray(accRows)) {
        accreditationsFromJoin = accRows;
      }
    }
  } catch (e) {
    console.error("load accreditations join error", e);
  }

  // ---- нормализация initial-данных из draft + clinics ----

  const rawBasic = (draft?.basic_info ?? {}) as any;
  const basic = {
    name: rawBasic.name ?? clinic.name,
    slug: rawBasic.slug ?? clinic.slug ?? "",
    specialty: rawBasic.specialty ?? (clinic as any).specialty ?? "",
    country: rawBasic.country ?? clinic.country ?? "",
    city: rawBasic.city ?? clinic.city ?? "",
    province: rawBasic.province ?? clinic.province ?? "",
    district: rawBasic.district ?? clinic.district ?? "",
    description: rawBasic.description ?? (clinic as any).about ?? "",
  };

  const rawLocationDraft = (draft?.location ?? {}) as any;
  const location = {
    mapUrl: rawLocationDraft.mapUrl ?? (clinic as any).map_embed_url ?? "",
    directions:
      rawLocationDraft.directions ?? (clinic as any).directions ?? "",
  };

  const services = (Array.isArray(draft?.services)
    ? (draft!.services as any[])
    : Array.isArray((clinic as any).services)
    ? ((clinic as any).services as any[])
    : []) as any[];

  const doctors = (Array.isArray(draft?.doctors)
    ? (draft!.doctors as any[])
    : Array.isArray((clinic as any).doctors)
    ? ((clinic as any).doctors as any[])
    : []) as any[];

  const hours = (Array.isArray(draft?.hours)
    ? (draft!.hours as any[])
    : Array.isArray((clinic as any).hours)
    ? ((clinic as any).hours as any[])
    : []) as any[];

  const gallery = (Array.isArray(draft?.gallery)
    ? (draft!.gallery as any[])
    : Array.isArray((clinic as any).images)
    ? ((clinic as any).images as any[])
    : Array.isArray((clinic as any).gallery)
    ? ((clinic as any).gallery as any[])
    : []) as any[];

  const rawFacilitiesDraft = (draft?.facilities ?? {}) as any;
  const rawAmenitiesClinic = ((clinic as any).amenities ?? {}) as any;

  function normalizeAmenityArray(value: any): string[] {
    if (!Array.isArray(value)) return [];
    return value
      .map((item: any) => {
        if (typeof item === "string") return item.trim();
        if (item && typeof item === "object") {
          if (typeof item.label === "string") return item.label.trim();
          if (typeof item.name === "string") return item.name.trim();
          if (typeof item.title === "string") return item.title.trim();
        }
        return null;
      })
      .filter((v: string | null): v is string => !!v && v.length > 0);
  }

  const facilities = {
    premises: normalizeAmenityArray(
      Array.isArray(rawFacilitiesDraft.premises)
        ? rawFacilitiesDraft.premises
        : rawAmenitiesClinic.premises,
    ),
    clinic_services: normalizeAmenityArray(
      Array.isArray(rawFacilitiesDraft.clinic_services)
        ? rawFacilitiesDraft.clinic_services
        : rawAmenitiesClinic.clinic_services,
    ),
    travel_services: normalizeAmenityArray(
      Array.isArray(rawFacilitiesDraft.travel_services)
        ? rawFacilitiesDraft.travel_services
        : rawAmenitiesClinic.travel_services,
    ),
    languages_spoken: normalizeAmenityArray(
      Array.isArray(rawFacilitiesDraft.languages_spoken)
        ? rawFacilitiesDraft.languages_spoken
        : rawAmenitiesClinic.languages_spoken,
    ),
  };

  const payments: string[] = (() => {
    if (Array.isArray(draft?.pricing)) {
      return (draft!.pricing as any[])
        .map((x) => {
          if (typeof x === "string") return x;
          if (x && typeof x.method === "string") return x.method;
          if (x && typeof x.name === "string") return x.name;
          if (x && typeof x.label === "string") return x.label;
          return null;
        })
        .filter(
          (v: unknown): v is string =>
            typeof v === "string" && v.trim().length > 0,
        );
    }

    const raw = (clinic as any).payments;
    if (!Array.isArray(raw)) return [];
    return raw
      .map((x: any) => {
        if (typeof x === "string") return x;
        if (x && typeof x.method === "string") return x.method;
        if (x && typeof x.name === "string") return x.name;
        if (x && typeof x.label === "string") return x.label;
        return null;
      })
      .filter(
        (v: unknown): v is string =>
          typeof v === "string" && v.trim().length > 0,
      );
  })();

  const accreditations: any[] = accreditationsFromJoin.length
    ? accreditationsFromJoin
    : Array.isArray((draft as any)?.accreditations)
    ? ((draft as any).accreditations as any[])
    : Array.isArray((clinic as any).accreditations)
    ? ((clinic as any).accreditations as any[])
    : [];

  const formatDate = (v?: string | null) =>
    v ? new Date(v).toLocaleString() : "-";

  const publicPath =
    clinic.slug &&
    (clinicPath({
      slug: clinic.slug,
      country: clinic.country ?? undefined,
      province: clinic.province ?? undefined,
      city: clinic.city ?? undefined,
      district: clinic.district ?? undefined,
    }) || `/clinic/${clinic.slug}`);

  return (
    <form className="mx-auto max-w-6xl space-y-6 p-6" action={saveClinic}>
      <input type="hidden" name="clinic_id" value={clinic.id} />

      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">
            {clinic.name || "(no name)"}
          </h1>
          <p className="text-sm text-gray-500">
            Admin view &amp; full edit for clinic
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm">
          {publicPath && (
            <Link
              href={publicPath}
              className="rounded-full border border-gray-200 px-3 py-1 text-gray-700 hover:bg-gray-50"
              target="_blank"
            >
              Open public page →
            </Link>
          )}
          <Link
            href="/admin/clinics"
            className="rounded-full border border-gray-200 px-3 py-1 text-blue-600 hover:bg-gray-50"
          >
            ← Back to list
          </Link>
        </div>
      </div>

      {/* SUMMARY CARD */}
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Clinic
            </div>
            <div className="text-lg font-semibold">{clinic.name}</div>
            <div className="text-xs text-gray-500">{clinic.slug}</div>
          </div>

          <div className="space-y-1 text-sm">
            <div>
              <span className="text-xs uppercase tracking-wide text-gray-500">
                Status:&nbsp;
              </span>
              <span>
                {(clinic.moderation_status ?? "pending") +
                  " / " +
                  (clinic.status ?? "draft")}
              </span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wide text-gray-500">
                Published:&nbsp;
              </span>
              <span>{clinic.is_published ? "Yes" : "No"}</span>
            </div>
            <div className="text-xs text-gray-500">
              Created: {formatDate(clinic.created_at)}
              <br />
              Updated: {formatDate(clinic.updated_at as any)}
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-4 text-sm md:grid-cols-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Location
            </div>
            <div className="text-sm text-gray-800">
              {[clinic.city, clinic.country].filter(Boolean).join(", ") ||
                "—"}
            </div>
            <div className="mt-1 text-xs text-gray-500">
              {clinic.address || "-"}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Draft status
            </div>
            <select
              name="draft_status"
              defaultValue={draft?.status ?? ""}
              className="mt-1 w-full rounded border px-2 py-1 text-sm"
            >
              <option value="">—</option>
              <option value="draft">draft</option>
              <option value="pending">pending</option>
              <option value="published">published</option>
            </select>
            <div className="mt-2 text-xs text-gray-500">
              Updated: {formatDate(draft?.updated_at as any)}
            </div>
          </div>

          <div className="space-y-2 text-xs text-gray-500">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Admin meta
            </div>
            <div className="space-y-1">
              <label className="flex flex-col gap-1 text-xs">
                <span>Clinic status</span>
                <select
                  name="clinic_status"
                  defaultValue={clinic.status ?? "draft"}
                  className="rounded border px-2 py-1 text-sm"
                >
                  <option value="">—</option>
                  <option value="draft">draft</option>
                  <option value="published">published</option>
                  <option value="hidden">hidden</option>
                </select>
              </label>
              <label className="flex flex-col gap-1 text-xs">
                <span>Moderation status</span>
                <select
                  name="clinic_moderation_status"
                  defaultValue={clinic.moderation_status ?? "pending"}
                  className="rounded border px-2 py-1 text-sm"
                >
                  <option value="">—</option>
                  <option value="pending">pending</option>
                  <option value="approved">approved</option>
                  <option value="rejected">rejected</option>
                </select>
              </label>
              <label className="mt-1 flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  name="clinic_is_published"
                  defaultChecked={!!clinic.is_published}
                  className="h-4 w-4"
                />
                <span>Published on site</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* BASIC INFO + EDITOR */}
      <div className="space-y-8 rounded-2xl border bg-white p-6 shadow-sm">
        {/* BASIC */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Basic information
            </h2>
          </div>

          <div className="grid gap-6 text-sm md:grid-cols-2">
            <div className="space-y-2">
              <Field label="Name">
                <input
                  name="clinic_name"
                  defaultValue={basic.name ?? ""}
                  className="w-full rounded border px-2 py-1.5 text-sm"
                />
              </Field>
              <Field label="Slug">
                <input
                  name="clinic_slug"
                  defaultValue={basic.slug ?? ""}
                  className="w-full rounded border px-2 py-1.5 text-sm"
                  placeholder="new-clinic"
                />
              </Field>
              <Field label="Specialty">
                <input
                  name="clinic_specialty"
                  defaultValue={basic.specialty ?? ""}
                  className="w-full rounded border px-2 py-1.5 text-sm"
                />
              </Field>
              <Field label="Country">
                <input
                  name="clinic_country"
                  defaultValue={basic.country ?? ""}
                  className="w-full rounded border px-2 py-1.5 text-sm"
                />
              </Field>
              <Field label="City">
                <input
                  name="clinic_city"
                  defaultValue={basic.city ?? ""}
                  className="w-full rounded border px-2 py-1.5 text-sm"
                />
              </Field>
              <Field label="Province">
                <input
                  name="clinic_province"
                  defaultValue={basic.province ?? ""}
                  className="w-full rounded border px-2 py-1.5 text-sm"
                />
              </Field>
              <Field label="District">
                <input
                  name="clinic_district"
                  defaultValue={basic.district ?? ""}
                  className="w-full rounded border px-2 py-1.5 text-sm"
                />
              </Field>
              <Field label="Address (string)">
                <input
                  name="clinic_address"
                  defaultValue={clinic.address ?? ""}
                  className="w-full rounded border px-2 py-1.5 text-sm"
                />
              </Field>
            </div>

            <div className="space-y-3">
              <Field label="Google Maps URL">
                <input
                  name="clinic_mapUrl"
                  defaultValue={location.mapUrl ?? ""}
                  className="w-full rounded border px-2 py-1.5 text-sm"
                  placeholder="https://maps.google.com/..."
                />
              </Field>
              <Field label="Description">
                <textarea
                  name="clinic_description"
                  defaultValue={basic.description ?? ""}
                  rows={4}
                  className="w-full rounded border px-3 py-2 text-sm"
                />
              </Field>
              <Field label="Directions">
                <textarea
                  name="clinic_directions"
                  defaultValue={location.directions ?? ""}
                  rows={3}
                  className="w-full rounded border px-3 py-2 text-sm"
                />
              </Field>
            </div>
          </div>
        </section>

        {/* SERVICES / DOCTORS / HOURS / GALLERY / FACILITIES / PAYMENTS / ACCREDITATIONS */}
        <ClinicDraftEditor
          initialServices={services}
          initialDoctors={doctors}
          initialHours={hours}
          initialGallery={gallery}
          initialFacilities={facilities}
          initialPricing={payments}
          initialAccreditations={accreditations}
        />
      </div>

      {/* ACTIONS */}
      <div className="flex items-center justify-between border-t pt-4">
        <div className="text-xs text-gray-500">
          Press &ldquo;Save changes&rdquo; to update clinic and draft in
          Supabase. Changes apply immediately.
        </div>
        <button
          type="submit"
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700"
        >
          Save changes
        </button>
      </div>
    </form>
  );
}

/* ---------- UI helper ---------- */

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </div>
      {children}
    </div>
  );
}
