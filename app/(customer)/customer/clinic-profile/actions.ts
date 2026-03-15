// app/(customer)/customer/clinic-profile/actions.ts
"use server";

import { createServerClient } from "@/lib/supabase/serverClient";
import type { SupabaseClient } from "@supabase/supabase-js";

async function getSupa(): Promise<SupabaseClient> {
  return await createServerClient();
}

function makeSlug(base = "dev-draft-clinic") {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${base}-${rand}`;
}

/** Возвращает clinic_id «текущего пользователя». */
export async function ensureClinicForOwner(): Promise<string> {
  const sb = await createServerClient();
  const { data: userRes } = await sb.auth.getUser();
  if (!userRes?.user) throw new Error("Not authenticated");
  const user = userRes.user;

  // Priority 1: clinics.owner_id (admin-assigned)
  const { data: ownedClinic } = await sb
    .from("clinics")
    .select("id")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (ownedClinic?.id) {
    // Ensure clinic_members
    try {
    await sb.from("clinic_members").upsert(
      { clinic_id: ownedClinic.id, user_id: user.id, role: "owner" },
      { onConflict: "clinic_id,user_id" } as any
    );
  } catch {}
    return ownedClinic.id;
  }

  // Priority 2: clinic_members
  const { data: membership } = await sb
    .from("clinic_members")
    .select("clinic_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  if (membership?.clinic_id) return membership.clinic_id;

  // Priority 3: customer_clinic_membership
  const { data: ccm } = await sb
    .from("customer_clinic_membership")
    .select("clinic_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  if (ccm?.clinic_id) {
    try {
    await sb.from("clinic_members").upsert(
      { clinic_id: ccm.clinic_id, user_id: user.id, role: "owner" },
      { onConflict: "clinic_id,user_id" } as any
    );
  } catch {}
    return ccm.clinic_id;
  }

  // Priority 4: Create Draft Clinic
  const { data: clinic, error: cErr } = await sb
    .from("clinics")
    .insert({
      owner_id: user.id,
      is_published: false,
      moderation_status: "draft",
      status: "not_published",
      name: "Draft Clinic",
      slug: makeSlug("draft-clinic"),
    })
    .select("id")
    .single();
  if (cErr) throw cErr;

  await sb.from("clinic_members").insert({
    clinic_id: clinic.id, user_id: user.id, role: "owner",
  });

  return clinic.id;
}

/** Получить черновик + мету клиники */
export async function getDraft() {
  const clinicId = await ensureClinicForOwner();
  const client = await getSupa();

  // тянем клинику, чтобы знать статус / опубликована ли
  const { data: clinic, error: clinicErr } = await client
    .from("clinics")
    .select(
      "id, is_published, moderation_status, status, slug, country, province, city, district"
    )
    .eq("id", clinicId)
    .maybeSingle();

  if (clinicErr) throw clinicErr;

  let { data: draft, error } = await client
    .from("clinic_profile_drafts")
    .select("*")
    .eq("clinic_id", clinicId)
    .maybeSingle();

  if (error) throw error;

  if (!draft) {
    const { data: created, error: insErr } = await client
      .from("clinic_profile_drafts")
      .insert({ clinic_id: clinicId, status: "editing" })
      .select("*")
      .single();
    if (insErr) throw insErr;
    draft = created;
  }

  // If draft is empty but clinic has real data (admin-assigned clinic),
  // populate draft from existing clinic tables
  if (draft && !draft.basic_info?.name && clinic) {
    const clinicId = clinic.id;

    // Load clinic basic data
    const { data: fullClinic } = await client
      .from("clinics")
      .select("name, slug, about, country, city, province, district, address, map_embed_url, amenities, payments")
      .eq("id", clinicId)
      .maybeSingle();

    if (fullClinic && fullClinic.name && fullClinic.name !== "Draft Clinic") {
      // Load services
      const { data: svcRows } = await client
        .from("clinic_services")
        .select("service_id, price, currency, services(name, description)")
        .eq("clinic_id", clinicId);

      const services = (svcRows ?? []).map((s: any) => ({
        name: s.services?.name ?? "",
        price: s.price ? String(s.price) : "",
        currency: s.currency ?? "USD",
        description: s.services?.description ?? "",
      }));

      // Load doctors
      const { data: staffRows } = await client
        .from("clinic_staff")
        .select("name, title, position, bio, photo_url")
        .eq("clinic_id", clinicId);

      const doctors = (staffRows ?? []).map((d: any) => ({
        fullName: d.name ?? "",
        title: d.title ?? "",
        specialty: d.position ?? "",
        description: d.bio ?? "",
        photo: d.photo_url ?? "",
      }));

      // Load hours
      const { data: hoursRows } = await client
        .from("clinic_hours")
        .select("weekday, open, close, is_closed")
        .eq("clinic_id", clinicId)
        .order("weekday");

      const dayNames = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      const hours = (hoursRows ?? []).map((h: any) => ({
        day: dayNames[h.weekday] ?? "",
        status: h.is_closed ? "Closed" : "Open",
        start: h.open ? String(h.open).slice(0, 5) : undefined,
        end: h.close ? String(h.close).slice(0, 5) : undefined,
      }));

      // Load gallery
      const { data: imgRows } = await client
        .from("clinic_images")
        .select("url, title")
        .eq("clinic_id", clinicId)
        .order("sort");

      const gallery = (imgRows ?? []).map((g: any) => ({
        url: g.url ?? "",
        title: g.title ?? "",
      }));

      // Build facilities from amenities jsonb
      const am = fullClinic.amenities ?? {};
      const facilities = {
        premises: Array.isArray(am.premises) ? am.premises : [],
        clinic_services: Array.isArray(am.clinic_services) ? am.clinic_services : [],
        travel_services: Array.isArray(am.travel_services) ? am.travel_services : [],
        languages_spoken: Array.isArray(am.languages_spoken) ? am.languages_spoken : [],
      };

      // Build payments
      const pricing = Array.isArray(fullClinic.payments)
        ? fullClinic.payments.map((p: any) => typeof p === "string" ? p : p?.method ?? "").filter(Boolean)
        : [];

      // Determine specialty from categories
      const { data: catLink } = await client
        .from("clinic_categories")
        .select("category_id, categories(slug)")
        .eq("clinic_id", clinicId)
        .limit(1)
        .maybeSingle();

      const specialty = (catLink as any)?.categories?.slug ?? "";

      // Build basic_info
      const basic_info = {
        name: fullClinic.name ?? "",
        slug: fullClinic.slug ?? "",
        specialty,
        country: fullClinic.country ?? "",
        city: fullClinic.city ?? "",
        province: fullClinic.province ?? "",
        district: fullClinic.district ?? "",
        address: fullClinic.address ?? "",
        description: fullClinic.about ?? "",
      };

      const location = {
        mapUrl: fullClinic.map_embed_url ?? "",
        directions: fullClinic.address ?? "",
      };

      // Save populated draft
      await client.from("clinic_profile_drafts").update({
        basic_info,
        services,
        doctors,
        hours: hours.length ? hours : undefined,
        gallery,
        facilities,
        location,
        pricing,
        updated_at: new Date().toISOString(),
      }).eq("clinic_id", clinicId);

      // Re-fetch draft
      const { data: refreshedDraft } = await client
        .from("clinic_profile_drafts")
        .select("*")
        .eq("clinic_id", clinicId)
        .maybeSingle();

      if (refreshedDraft) draft = refreshedDraft;
    }
  }

  return { clinicId, draft, clinic };
}

/** Сохранить секцию черновика */
export async function saveDraftSection(
  section:
    | "basic_info"
    | "services"
    | "doctors"
    | "facilities"
    | "hours"
    | "gallery"
    | "location"
    | "pricing",
  payload: unknown
) {
  const clinicId = await ensureClinicForOwner();
  const client = await getSupa();

  const fields: Record<string, unknown> = {
    [section]: payload,
    updated_at: new Date().toISOString(),
  };

  const { error } = await client
    .from("clinic_profile_drafts")
    .upsert({ clinic_id: clinicId, ...fields }, { onConflict: "clinic_id" });
  if (error) throw error;

  return { ok: true };
}

/** Отправить на ревью / обновить опубликованную клинику */
export async function submitForReview() {
  const clinicId = await ensureClinicForOwner();
  const admin = await getSupa();

  // 0) тянем саму клинику, чтобы понять опубликована она или нет
  const { data: clinic, error: cErr } = await admin
    .from("clinics")
    .select("id, is_published, moderation_status, status")
    .eq("id", clinicId)
    .maybeSingle();

  if (cErr) throw cErr;

  const alreadyPublished = !!clinic?.is_published;

  // 1) тянем черновик
  const { data: draft, error: dErr } = await admin
    .from("clinic_profile_drafts")
    .select("*")
    .eq("clinic_id", clinicId)
    .maybeSingle();
  if (dErr) throw dErr;

  const basic: any = draft?.basic_info ?? {};
  const facilities: any = draft?.facilities ?? {};
  const location: any = draft?.location ?? {};

  const about =
    typeof basic.description === "string" ? basic.description.trim() : null;

  // собрать amenities в формат jsonb
  const amenities = {
    premises: Array.isArray(facilities.premises) ? facilities.premises : [],
    clinic_services: Array.isArray(facilities.clinic_services)
      ? facilities.clinic_services
      : [],
    travel_services: Array.isArray(facilities.travel_services)
      ? facilities.travel_services
      : [],
    languages_spoken: Array.isArray(facilities.languages_spoken)
      ? facilities.languages_spoken
      : [],
  };

  // собрать payments: jsonb [{ method: "Cash" }, ...]
  const payments =
    Array.isArray(draft?.pricing)
      ? draft.pricing
          .map((x: any) => {
            if (typeof x === "string") return x;
            if (x && typeof x.method === "string") return x.method;
            return null;
          })
          .filter(
            (v: unknown): v is string =>
              typeof v === "string" && v.trim().length > 0
          )
          .map((method: string) => ({ method }))
      : null;

  const safe = (v: unknown) => (typeof v === "string" ? v.trim() : null);

  // mapUrl / directions из location
  const map_embed_url = safe(location.mapUrl);
  const directions = safe(location.directions);

  const location_json =
    map_embed_url || directions
      ? {
          mapUrl: map_embed_url,
          directions,
        }
      : null;

  // slug нормализация
  const slugify = (s: string) =>
    (s || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  let slug = slugify(basic.slug || basic.name || "");
  if (!slug) slug = `clinic-${Math.random().toString(36).slice(2, 8)}`;

  // 2) формируем апдейт для clinics
  const clinicUpdate: Record<string, unknown> = {
    name: safe(basic.name),
    slug,
    address: safe(basic.address),
    country: safe(basic.country),
    city: safe(basic.city),
    province: safe(basic.province),
    district: safe(basic.district),
    about,
    amenities,
    map_embed_url,
    payments,
  };

  if (location_json) {
    clinicUpdate.location = location_json;
  }

  // если клиника ещё НЕ опубликована – это первый сабмит на модерацию
  if (!alreadyPublished) {
    clinicUpdate.moderation_status = "pending";
    clinicUpdate.is_published = false;
    clinicUpdate.status = "pending"; // или "draft", но лучше "pending"
    clinicUpdate.verified_by_medtravel = false;
    clinicUpdate.is_official_partner = false;
  }

  const { error: uErr } = await admin
    .from("clinics")
    .update(clinicUpdate)
    .eq("id", clinicId);
  if (uErr) throw uErr;

  // синхронизируем связанные таблицы (услуги, доктора, часы, галерея, аккредитации, категории)
  const { error: syncErr } = await admin.rpc(
    "sync_clinic_relations_from_draft",
    { p_clinic_id: clinicId }
  );
  if (syncErr) throw syncErr;

  // 3) статус черновика:
  //    - до первой публикации: pending (для модератора)
  //    - после публикации: editing (без повторной модерации)
  const draftStatus = alreadyPublished ? "editing" : "pending";

  const { error: e1 } = await admin
    .from("clinic_profile_drafts")
    .update({
      status: draftStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("clinic_id", clinicId);
  if (e1) throw e1;

  // БЕЗ rpc("publish_clinic_from_draft") — иначе 500 на повторном вызове

  return { ok: true, alreadyPublished };
}

export async function getCategories() {
  const client = await getSupa();
  const { data, error } = await client
    .from("categories")
    .select("id,name,slug")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

// export async function publishClinic(clinicId: string) {
//   const supabase = await createServerClient();
//   const { error } = await supabase.rpc("publish_clinic_from_draft", {
//     p_clinic_id: clinicId,
//   });
//   if (error) throw error;
// }

/* -------------------- Upload helpers -------------------- */

const MAX_IMAGE_SIZE_MB = 20;
const MAX_IMAGE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

/**
 * Внутренний helper: грузим файлы в bucket `clinic-images`
 * с префиксом (gallery/staff/accreditations) и лимитом по размеру.
 */
async function uploadImagesInternal(files: File[], folder: string) {
  const supa = await getSupa();
  await supa.auth.getUser();

  const urls: string[] = [];

  for (const f of files) {
    if (f.size > MAX_IMAGE_BYTES) {
      throw new Error(
        `File "${f.name}" is too large. Max size is ${MAX_IMAGE_SIZE_MB} MB.`
      );
    }

    const ext = (f.name.split(".").pop() || "jpg").toLowerCase();
    const key = `u/${folder}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${ext}`;

    // ВАЖНО: конвертим File -> ArrayBuffer, чтобы upload не падал на сервере
    const buffer = await f.arrayBuffer();

    const { error: upErr } = await supa.storage
      .from("clinic-images")
      .upload(key, buffer, {
        cacheControl: "31536000",
        upsert: false,
        contentType: f.type || "application/octet-stream",
      });

    if (upErr) {
      console.error("Supabase upload error:", upErr);
      throw new Error(upErr.message || "Supabase upload error");
    }

    const { data: pub } = supa.storage.from("clinic-images").getPublicUrl(key);
    urls.push(pub.publicUrl);
  }

  return urls;
}

/**
 * Галерея клиники – вызывается с FormData, в котором несколько файлов под ключом "files".
 */
export async function uploadGallery(formData: FormData) {
  const files = formData.getAll("files") as File[];
  if (!files.length) {
    throw new Error("No files provided");
  }
  return uploadImagesInternal(files, "gallery");
}

/** Фото доктора – одно изображение (FormData, ключ "file") */
export async function uploadDoctorImage(formData: FormData) {
  const file = formData.get("file") as File | null;
  if (!file) {
    throw new Error("No file provided");
  }
  const [url] = await uploadImagesInternal([file], "staff");
  return url;
}

/** Лого аккредитации – одно изображение (FormData, ключ "file") */
export async function uploadAccreditationLogo(formData: FormData) {
  const file = formData.get("file") as File | null;
  if (!file) {
    throw new Error("No file provided");
  }
  const [url] = await uploadImagesInternal([file], "accreditations");
  return url;
}

// copyImageFromUrl оставляем почти как было
export async function copyImageFromUrl(url: string) {
  const supa = await getSupa();
  await supa.auth.getUser();

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to download image from URL");
  }

  const contentType = res.headers.get("content-type") || "image/jpeg";

  const ext =
    contentType.includes("png")
      ? "png"
      : contentType.includes("webp")
      ? "webp"
      : contentType.includes("gif")
      ? "gif"
      : "jpg";

  const key = `u/staff/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${ext}`;

  const blob = await res.blob();

  const { error: upErr } = await supa.storage
    .from("clinic-images")
    .upload(key, blob, {
      cacheControl: "31536000",
      upsert: false,
      contentType,
    });

  if (upErr) {
    console.error("Supabase upload from URL error:", upErr);
    throw upErr;
  }

  const { data: pub } = supa.storage.from("clinic-images").getPublicUrl(key);

  return pub.publicUrl;
}

/** Сохранить весь драфт одним апдейтом (без стирания других полей) */
export async function saveDraftWhole(payload: {
  basic_info: any;
  services: any[];
  doctors: any[];
  facilities: any;
  hours: any[];
  gallery: any[];
  location: any;
  pricing: string[];
}) {
  const clinicId = await ensureClinicForOwner();
  const client = await getSupa();

  const { data: existing, error: getErr } = await client
    .from("clinic_profile_drafts")
    .select("*")
    .eq("clinic_id", clinicId)
    .maybeSingle();
  if (getErr) throw getErr;

  const nextRow = {
    clinic_id: clinicId,
    status: existing?.status ?? "editing",
    updated_at: new Date().toISOString(),
    ...payload,
  };

  const { error: upErr } = await client
    .from("clinic_profile_drafts")
    .upsert(nextRow, { onConflict: "clinic_id" });
  if (upErr) throw upErr;

  // переводим клинику в Draft только если она не опубликована
  const { error: sErr } = await client
    .from("clinics")
    .update({ status: "draft" })
    .eq("id", clinicId)
    .eq("is_published", false);

  if (sErr) throw sErr;

  return { ok: true };
}

export async function syncClinicRelationsFromDraft(clinicId: string) {
  const supabase = await createServerClient();
  const { error } = await supabase.rpc("sync_clinic_relations_from_draft", {
    p_clinic_id: clinicId,
  });
  if (error) throw error;
}

export async function getClinicMeta() {
  const clinicId = await ensureClinicForOwner();
  const client = await getSupa();

  const { data: clinic, error } = await client
    .from("clinics")
    .select("is_published, moderation_status, status, slug, country, province, city, district")
    .eq("id", clinicId)
    .maybeSingle();

  if (error) throw error;
  return clinic;
}