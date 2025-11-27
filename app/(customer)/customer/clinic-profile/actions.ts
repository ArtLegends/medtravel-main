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

  if (!userRes?.user) {
    throw new Error("Not authenticated");
  }

  const user = userRes.user;

  // 1) ищем существующее членство
  const { data: membership } = await sb
    .from("clinic_members")
    .select("clinic_id, role")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (membership?.clinic_id) return membership.clinic_id;

  // 2) создаём новую клинику-чёрновик
  const { data: clinic, error: cErr } = await sb
    .from("clinics")
    .insert({
      owner_id: user.id,
      moderation_status: "pending",
      name: "Draft Clinic",
      slug: makeSlug("draft-clinic"),
    })
    .select("id")
    .single();
  if (cErr) throw cErr;

  const { error: iErr } = await sb.from("clinic_members").insert({
    clinic_id: clinic.id,
    user_id: user.id,
    role: "owner",
  });
  if (iErr) throw iErr;

  return clinic.id;
}

/** Получить черновик */
export async function getDraft() {
  const clinicId = await ensureClinicForOwner();
  const client = await getSupa();

  let { data, error } = await client
    .from("clinic_profile_drafts")
    .select("*")
    .eq("clinic_id", clinicId)
    .maybeSingle();
  if (error) throw error;

  if (!data) {
    const { data: created, error: insErr } = await client
      .from("clinic_profile_drafts")
      .insert({ clinic_id: clinicId, status: "editing" })
      .select("*")
      .single();
    if (insErr) throw insErr;
    data = created;
  }

  return { clinicId, draft: data };
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

  // mapUrl из location → map_embed_url в clinics
  const map_embed_url = safe(location.mapUrl);

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
    about,        // текст
    amenities,    // jsonb
    map_embed_url,
    payments,     // jsonb [{method:"..."}] или null
  };

  // Если клиника ЕЩЁ НЕ опубликована – это запрос на модерацию
  if (!alreadyPublished) {
    clinicUpdate.moderation_status = "pending";
    clinicUpdate.is_published = false;
    clinicUpdate.status = "draft";
    clinicUpdate.verified_by_medtravel = true;
    clinicUpdate.is_official_partner = true;
  }

  const { error: uErr } = await admin
    .from("clinics")
    .update(clinicUpdate)
    .eq("id", clinicId);
  if (uErr) throw uErr;

  // 3) статус черновика:
  //    - до первой публикации: pending (для модератора)
  //    - после публикации: просто editing, без повторной модерации
  const draftStatus = alreadyPublished ? "editing" : "pending";

  const { error: e1 } = await admin
    .from("clinic_profile_drafts")
    .update({
      status: draftStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("clinic_id", clinicId);
  if (e1) throw e1;

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

export async function publishClinic(clinicId: string) {
  const supabase = await createServerClient();
  const { error } = await supabase.rpc("publish_clinic_from_draft", {
    p_clinic_id: clinicId,
  });
  if (error) throw error;
}

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

  return { ok: true };
}
