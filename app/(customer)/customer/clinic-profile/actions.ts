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

/** Отправить на ревью */
export async function submitForReview() {
  const clinicId = await ensureClinicForOwner();
  const admin = await getSupa();

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

  // 2) обновляем клинику для модерации и предпросмотра
  const { error: uErr } = await admin
    .from("clinics")
    .update({
      name: safe(basic.name),
      slug,
      address: safe(basic.address),
      country: safe(basic.country),
      city: safe(basic.city),
      province: safe(basic.province),
      district: safe(basic.district),
      about, // текст
      amenities, // jsonb
      map_embed_url, // ссылка карты
      payments, // jsonb [{method:"..."}] или null
      moderation_status: "pending",
      is_published: false,
      status: "draft",
      verified_by_medtravel: true,
      is_official_partner: true,
    })
    .eq("id", clinicId);
  if (uErr) throw uErr;

  // 3) помечаем черновик как pending
  const { error: e1 } = await admin
    .from("clinic_profile_drafts")
    .update({ status: "pending", updated_at: new Date().toISOString() })
    .eq("clinic_id", clinicId);
  if (e1) throw e1;

  return { ok: true };
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

export async function uploadGallery(files: File[]) {
  const supa = await getSupa();
  await supa.auth.getUser();

  const urls: string[] = [];

  for (const f of files) {
    const ext = (f.name.split(".").pop() || "jpg").toLowerCase();
    const key = `u/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${ext}`;

    const { error: upErr } = await supa.storage
      .from("clinic-images")
      .upload(key, f, {
        cacheControl: "31536000",
        upsert: false,
        contentType: f.type || "image/*",
      });
    if (upErr) throw upErr;

    const { data: pub } = supa.storage
      .from("clinic-images")
      .getPublicUrl(key);
    urls.push(pub.publicUrl);
  }
  return urls;
}

export async function copyImageFromUrl(url: string) {
  const supa = await getSupa();
  // убеждаемся, что пользователь залогинен (RLS и т.д.)
  await supa.auth.getUser();

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to download image from URL");
  }

  const contentType = res.headers.get("content-type") || "image/jpeg";

  const ext =
    contentType.includes("png") ? "png" :
    contentType.includes("webp") ? "webp" :
    contentType.includes("gif") ? "gif" :
    "jpg";

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

  if (upErr) throw upErr;

  const { data: pub } = supa.storage
    .from("clinic-images")
    .getPublicUrl(key);

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
