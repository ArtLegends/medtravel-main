// app/(admin)/admin/clinics/detail/page.tsx

import Link from "next/link";
import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/serviceClient";
import { clinicPath } from "@/lib/clinic-url";
import ClinicDraftEditor from "@/components/admin/ClinicDraftEditor";
import ClinicOwnerManager from "@/components/admin/ClinicOwnerManager";

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
  owner_id: string | null;
  created_at: string;
  updated_at: string | null;
  services?: any;
  doctors?: any;
  hours?: any;
  images?: any;
  gallery?: any;
  amenities?: any;
  payments?: any;
  accreditations?: any;
  map_embed_url?: string | null;
  directions?: string | null;
  google_place_id?: string | null;
  google_rating?: number | null;
  google_reviews_count?: number | null;
  google_reviews_synced_at?: string | null;
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
  accreditations?: any[] | null;
};

type SearchParams = { id?: string };

/* ---------- helpers ---------- */

function randomKey() {
  return Math.random().toString(36).slice(2);
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

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

const WEEKDAY_MAP: Record<string, number> = {
  monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6, sunday: 7,
};

function dayNameToWeekday(day: string | undefined | null): number | null {
  if (!day) return null;
  return WEEKDAY_MAP[day.trim().toLowerCase()] ?? null;
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

function parseTimeSpanDraft(s?: string) {
  const text = (s || "").trim();
  if (!text) return { open: null as string | null, close: null as string | null, is_closed: false };
  if (/^closed$/i.test(text)) return { open: null as string | null, close: null as string | null, is_closed: true };
  const m = text.match(/^\s*([0-9: ]+(?:am|pm)?)\s*[-–—]\s*([0-9: ]+(?:am|pm)?)\s*$/i);
  if (!m) return { open: null as string | null, close: null as string | null, is_closed: false };
  const to24 = (v: string) => {
    const t = v.trim().toLowerCase();
    const ampm = t.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i);
    if (ampm) {
      let hh = Number(ampm[1]);
      const mm = Number(ampm[2] ?? 0);
      if (ampm[3].toLowerCase() === "pm" && hh !== 12) hh += 12;
      if (ampm[3].toLowerCase() === "am" && hh === 12) hh = 0;
      return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:00`;
    }
    const hhmm = t.match(/^(\d{1,2})(?::(\d{2}))?$/);
    if (hhmm) return `${String(Number(hhmm[1])).padStart(2, "0")}:${String(Number(hhmm[2] ?? 0)).padStart(2, "0")}:00`;
    return null;
  };
  return { open: to24(m[1]), close: to24(m[2]), is_closed: false };
}

/* ---------- server action ---------- */

async function saveClinic(formData: FormData) {
  "use server";

  const id = String(formData.get("clinic_id") || "");
  if (!id) return;

  const sb = createServiceClient();
  const str = (name: string) => String(formData.get(name) ?? "").trim();
  const parseJson = (field: string) => {
    const raw = formData.get(field);
    if (!raw) return null;
    try { return JSON.parse(String(raw)); } catch { return null; }
  };

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

  const rawServices = (parseJson("draft_services") ?? []) as any[];
  const rawDoctors = (parseJson("draft_doctors") ?? []) as any[];
  const rawHours = (parseJson("draft_hours") ?? []) as any[];
  const rawGallery = (parseJson("draft_gallery") ?? []) as any[];
  const rawFacilities = (parseJson("draft_facilities") ?? {}) as any;
  const rawPricing = (parseJson("draft_pricing") ?? []) as any[];
  const rawAccreditations = (parseJson("clinic_accreditations") ?? []) as any[];

  const servicesForDb = Array.isArray(rawServices) ? rawServices : [];
  const doctorsForDb = Array.isArray(rawDoctors)
    ? rawDoctors.map((d) => ({
        name: (d.fullName ?? d.name ?? "").trim(),
        title: (d.title ?? "").trim() || null,
        position: (d.specialty ?? d.spec ?? d.title ?? "").trim() || null,
        bio: typeof d.bio === "string" && d.bio.trim().length ? d.bio.trim() : null,
        photo_url: (d.photoUrl ?? d.photo_url ?? d.photo ?? d.image_url ?? "").trim() || null,
        languages: Array.isArray(d.languages) ? d.languages.filter((x: any) => typeof x === "string" && x.trim()) : [],
      }))
    : [];

  const hoursForDb = Array.isArray(rawHours)
    ? rawHours.map((h) => {
        const weekday = dayNameToWeekday(h.day ?? h.weekday ?? "");
        if (!weekday) return null;
        let isClosed = (h.status ?? "open") === "closed";
        let open: string | null = null;
        let close: string | null = null;
        let hoursText: string | null = null;
        const timeText: string | null = h.time ?? null;
        if (timeText && !h.start && !h.end) {
          const parsed = parseTimeSpanDraft(timeText);
          open = parsed.open; close = parsed.close; isClosed = parsed.is_closed;
          hoursText = timeText; if (parsed.is_closed) h.status = "closed";
        } else {
          open = isClosed ? null : toTime(h.start ?? h.open ?? null);
          close = isClosed ? null : toTime(h.end ?? h.close ?? null);
          if (isClosed) hoursText = "closed";
          else if (h.start && h.end) hoursText = `${h.start} - ${h.end}`;
        }
        return { clinic_id: id, weekday, open, close, is_closed: isClosed, dow: weekday, hours_text: hoursText };
      }).filter(Boolean)
    : [];

  const galleryForClinic = (Array.isArray(rawGallery) ? rawGallery : [])
    .map((g, i) => {
      const url = (g?.url ?? g?.src ?? g?.imageUrl ?? g?.image_url ?? "").toString().trim();
      if (!url) return null;
      return { url, title: g?.title ?? g?.alt ?? null, sort: i };
    }).filter(Boolean) as { url: string; title: string | null; sort: number }[];

  const amenitiesForClinic = {
    premises: normalizeStringList(rawFacilities.premises),
    clinic_services: normalizeStringList(rawFacilities.clinic_services),
    travel_services: normalizeStringList(rawFacilities.travel_services),
    languages_spoken: normalizeStringList(rawFacilities.languages_spoken),
  };

  const paymentsForClinic = normalizeStringList(rawPricing).map((method) => ({ method }));

  const accreditationsForClinic = (Array.isArray(rawAccreditations) ? rawAccreditations : [])
    .map((a) => {
      const name = (a?.name ?? "").trim();
      if (!name) return null;
      return { name, logo_url: (a?.logo_url ?? "").trim() || null, description: (a?.description ?? "").trim() || null };
    }).filter(Boolean) as { name: string; logo_url: string | null; description: string | null }[];

  // 1) clinics
  const clinicUpdate: any = {
    name: basic_info.name, slug: basic_info.slug, about: basic_info.description,
    country: basic_info.country, city: basic_info.city, province: basic_info.province,
    district: basic_info.district, address, status: clinicStatus || null,
    moderation_status: moderationStatus || "draft",
    is_published: formData.get("clinic_is_published") === "on",
    map_embed_url: location.mapUrl, amenities: amenitiesForClinic, payments: paymentsForClinic,
    google_place_id: formData.get("clinic_google_place_id") as string || null,
  };
  const { error: clinicError } = await sb.from("clinics").update(clinicUpdate).eq("id", id);
  if (clinicError) throw new Error("Failed to update clinic: " + clinicError.message);

  // 2) categories
  if (basic_info.specialty) {
    try {
      const catSlug = slugify(basic_info.specialty);
      const { data: existing } = await sb.from("categories").select("id").eq("slug", catSlug).maybeSingle();
      let categoryId = existing?.id as number | null;
      if (!categoryId) {
        const { data: created } = await sb.from("categories").insert({ name: basic_info.specialty, slug: catSlug } as any).select("id").single();
        categoryId = created?.id as number;
      }
      if (categoryId) {
        await sb.from("clinic_categories").delete().eq("clinic_id", id);
        await sb.from("clinic_categories").insert({ clinic_id: id, category_id: categoryId } as any);
      }
    } catch (e) { console.error("category sync error", e); }
  }

  // 3) services
  try {
    await sb.from("clinic_services").delete().eq("clinic_id", id);
    for (const s of servicesForDb) {
      const name = (s?.name ?? "").trim(); if (!name) continue;
      const desc = s?.description ?? null;
      const currency = (s?.currency ?? "USD").trim() || "USD";
      let priceNum: number | null = null;
      if (typeof s?.price === "number") priceNum = s.price;
      else if (typeof s?.price === "string" && s.price.trim()) { const p = Number(s.price.replace(",", ".")); if (!Number.isNaN(p)) priceNum = p; }
      const { data: existingSvc } = await sb.from("services").select("id").eq("name", name).maybeSingle();
      let serviceId: number;
      if (existingSvc?.id) { serviceId = existingSvc.id as number; } else {
        const { data: c } = await sb.from("services").insert({ name, slug: slugify(name), description: desc } as any).select("id").single();
        serviceId = c?.id as number;
      }
      await sb.from("clinic_services").insert({ clinic_id: id, service_id: serviceId, price: priceNum, currency } as any);
    }
  } catch (e) { console.error("services sync error", e); throw new Error("Failed to update services"); }

  // 4) images
  try {
    await sb.from("clinic_images").delete().eq("clinic_id", id);
    if (galleryForClinic.length) {
      await sb.from("clinic_images").insert(galleryForClinic.map((g) => ({ clinic_id: id, url: g.url, title: g.title, sort: g.sort, created_at: new Date().toISOString() })) as any);
    }
  } catch (e) { throw new Error("Failed to update images"); }

  // 5) staff
  try {
    await sb.from("clinic_staff").delete().eq("clinic_id", id);
    const staffRows = doctorsForDb.filter((d) => d.name.length > 0).map((d) => ({
      clinic_id: id, name: d.name, title: d.title, position: d.position,
      bio: d.bio, languages: d.languages, photo_url: d.photo_url, created_at: new Date().toISOString(),
    }));
    if (staffRows.length) await sb.from("clinic_staff").insert(staffRows as any);
  } catch (e) { throw new Error("Failed to update staff"); }

  // 6) hours
  try {
    await sb.from("clinic_hours").delete().eq("clinic_id", id);
    if (hoursForDb.length) await sb.from("clinic_hours").insert(hoursForDb as any);
  } catch (e) { throw new Error("Failed to update hours"); }

  // 7) accreditations
  try {
    await sb.from("clinic_accreditations").delete().eq("clinic_id", id);
    for (const item of accreditationsForClinic) {
      const { data: existing } = await sb.from("accreditations").select("id").eq("name", item.name).maybeSingle();
      let accId: number;
      if (existing?.id) { accId = existing.id as number; await sb.from("accreditations").update({ logo_url: item.logo_url, description: item.description } as any).eq("id", accId); }
      else { const { data: c } = await sb.from("accreditations").insert({ name: item.name, logo_url: item.logo_url, description: item.description, slug: slugify(item.name) } as any).select("id").single(); accId = c?.id as number; }
      await sb.from("clinic_accreditations").insert({ clinic_id: id, accreditation_id: accId } as any);
    }
  } catch (e) { throw new Error("Failed to update accreditations"); }

  // 8) draft
  await sb.from("clinic_profile_drafts").upsert({
    clinic_id: id, basic_info, location,
    services: rawServices, doctors: rawDoctors, hours: rawHours, gallery: rawGallery,
    facilities: rawFacilities ?? {}, pricing: rawPricing, status: draftStatus || "draft",
    updated_at: new Date().toISOString(),
  } as any, { onConflict: "clinic_id" } as any);

  revalidatePath(`/admin/clinics/detail?id=${id}`);
  revalidatePath("/admin/clinics");
  if (basic_info.slug) {
    const pp = clinicPath({ slug: basic_info.slug, country: basic_info.country ?? undefined, province: basic_info.province ?? undefined, city: basic_info.city ?? undefined, district: basic_info.district ?? undefined }) || `/clinic/${basic_info.slug}`;
    revalidatePath(pp);
  }
}

/* ---------- PAGE ---------- */

function normalizeAmenityArray(value: any): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item: any) => {
    if (typeof item === "string") return item.trim();
    if (item && typeof item === "object") {
      if (typeof item.label === "string") return item.label.trim();
      if (typeof item.name === "string") return item.name.trim();
    }
    return null;
  }).filter((v: string | null): v is string => !!v);
}

export default async function ClinicEditorPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const id = sp.id;

  if (!id) return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Clinic editor</h1>
      <p className="text-sm text-gray-600">Missing <code>id</code> query parameter.</p>
      <Link href="/admin/clinics" className="text-sm text-blue-600 hover:underline">← Back to list</Link>
    </div>
  );

  const sb = createServiceClient();
  const [{ data: clinic, error: clinicError }, { data: draft, error: draftError }] = await Promise.all([
    sb.from("clinics").select("*").eq("id", id).maybeSingle<ClinicRow>(),
    sb.from("clinic_profile_drafts").select("*").eq("clinic_id", id).maybeSingle<DraftRow>(),
  ]);

  if (clinicError || draftError) return (
    <div className="p-6 space-y-4">
      <pre className="bg-red-50 rounded-lg p-4 text-xs text-red-700">{clinicError?.message} {draftError?.message}</pre>
      <Link href="/admin/clinics" className="text-sm text-blue-600 hover:underline">← Back to list</Link>
    </div>
  );

  if (!clinic) return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Clinic not found</h1>
      <Link href="/admin/clinics" className="text-sm text-blue-600 hover:underline">← Back to list</Link>
    </div>
  );

  // Owner info
  let ownerEmail: string | null = null;
  if (clinic.owner_id) {
    const { data: ownerProfile } = await sb.from("profiles").select("email").eq("id", clinic.owner_id).maybeSingle();
    ownerEmail = ownerProfile?.email ?? null;
  }

  // Accreditations
  let accreditationsFromJoin: any[] = [];
  try {
    const { data: linkRows } = await sb.from("clinic_accreditations").select("accreditation_id").eq("clinic_id", id);
    if (Array.isArray(linkRows) && linkRows.length) {
      const ids = linkRows.map((r: any) => r.accreditation_id);
      const { data: accRows } = await sb.from("accreditations").select("id, name, logo_url, description").in("id", ids);
      if (Array.isArray(accRows)) accreditationsFromJoin = accRows;
    }
  } catch {}

  // Normalize data
  const rawBasic = (draft?.basic_info ?? {}) as any;
  const basic = {
    name: rawBasic.name ?? clinic.name, slug: rawBasic.slug ?? clinic.slug ?? "",
    specialty: rawBasic.specialty ?? "", country: rawBasic.country ?? clinic.country ?? "",
    city: rawBasic.city ?? clinic.city ?? "", province: rawBasic.province ?? clinic.province ?? "",
    district: rawBasic.district ?? clinic.district ?? "",
    description: rawBasic.description ?? (clinic as any).about ?? "",
  };
  const rawLoc = (draft?.location ?? {}) as any;
  const location = { mapUrl: rawLoc.mapUrl ?? (clinic as any).map_embed_url ?? "", directions: rawLoc.directions ?? (clinic as any).directions ?? "" };
  const services = (draft?.services ?? (clinic as any).services ?? []) as any[];
  const doctors = (draft?.doctors ?? (clinic as any).doctors ?? []) as any[];
  const hours = (draft?.hours ?? (clinic as any).hours ?? []) as any[];
  const gallery = (draft?.gallery ?? (clinic as any).images ?? (clinic as any).gallery ?? []) as any[];
  const rawFac = (draft?.facilities ?? {}) as any;
  const rawAm = ((clinic as any).amenities ?? {}) as any;
  const facilities = {
    premises: normalizeAmenityArray(rawFac.premises ?? rawAm.premises),
    clinic_services: normalizeAmenityArray(rawFac.clinic_services ?? rawAm.clinic_services),
    travel_services: normalizeAmenityArray(rawFac.travel_services ?? rawAm.travel_services),
    languages_spoken: normalizeAmenityArray(rawFac.languages_spoken ?? rawAm.languages_spoken),
  };
  const payments: string[] = (() => {
    const src = draft?.pricing ?? (clinic as any).payments;
    if (!Array.isArray(src)) return [];
    return src.map((x: any) => typeof x === "string" ? x : x?.method ?? x?.name ?? x?.label ?? null).filter(Boolean);
  })();
  const accreditations = accreditationsFromJoin.length ? accreditationsFromJoin : ((draft as any)?.accreditations ?? []);

  const formatDate = (v?: string | null) => v ? new Date(v).toLocaleString() : "—";
  const publicPath = clinic.slug && (clinicPath({ slug: clinic.slug, country: clinic.country ?? undefined, province: clinic.province ?? undefined, city: clinic.city ?? undefined, district: clinic.district ?? undefined }) || `/clinic/${clinic.slug}`);
  const isPublished = !!clinic.is_published && clinic.status === "published";

  return (
    <form className="mx-auto max-w-6xl space-y-6 p-6" action={saveClinic}>
      <input type="hidden" name="clinic_id" value={clinic.id} />

      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{clinic.name || "(unnamed)"}</h1>
          <p className="text-sm text-slate-500 mt-1">Full admin editor for clinic profile</p>
        </div>
        <div className="flex items-center gap-3">
          {publicPath && (
            <Link href={publicPath} className="rounded-lg border px-4 py-2 text-sm hover:bg-slate-50" target="_blank">
              View public page ↗
            </Link>
          )}
          <Link href="/admin/clinics" className="rounded-lg border px-4 py-2 text-sm text-blue-600 hover:bg-blue-50">
            ← Back to list
          </Link>
          <button type="submit" className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700">
            Save changes
          </button>
        </div>
      </div>

      {/* STATUS + OWNER CARD */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Status card */}
        <div className="rounded-2xl border bg-white p-5 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Publication & Status</h2>
          <div className="grid grid-cols-2 gap-4">
            <label className="space-y-1">
              <span className="text-xs text-slate-500">Clinic status</span>
              <select name="clinic_status" defaultValue={clinic.status ?? "draft"} className="w-full rounded-lg border px-3 py-2 text-sm">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="hidden">Hidden</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-xs text-slate-500">Moderation</span>
              <select name="clinic_moderation_status" defaultValue={clinic.moderation_status ?? "pending"} className="w-full rounded-lg border px-3 py-2 text-sm">
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-xs text-slate-500">Draft status</span>
              <select name="draft_status" defaultValue={draft?.status ?? ""} className="w-full rounded-lg border px-3 py-2 text-sm">
                <option value="">—</option>
                <option value="draft">draft</option>
                <option value="pending">pending</option>
                <option value="published">published</option>
              </select>
            </label>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" name="clinic_is_published" defaultChecked={!!clinic.is_published} className="h-4 w-4 rounded border-slate-300" />
                <span>Published on site</span>
              </label>
            </div>
          </div>
          <div className="flex gap-4 text-xs text-slate-400">
            <span>Created: {formatDate(clinic.created_at)}</span>
            <span>Updated: {formatDate(clinic.updated_at)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${isPublished ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
              {isPublished ? "Live" : "Not live"}
            </span>
            <span className="text-xs text-slate-400">{clinic.slug}</span>
          </div>
        </div>

        {/* Owner card */}
        <div className="rounded-2xl border bg-white p-5">
          <ClinicOwnerManager
            clinicId={clinic.id}
            currentOwnerId={clinic.owner_id}
            currentOwnerEmail={ownerEmail}
          />
        </div>
      </div>

      {/* BASIC INFO */}
      <div className="rounded-2xl border bg-white p-6 space-y-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Basic Information</h2>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Name"><input name="clinic_name" defaultValue={basic.name ?? ""} className="w-full rounded-lg border px-3 py-2 text-sm" /></Field>
          <Field label="Slug"><input name="clinic_slug" defaultValue={basic.slug} className="w-full rounded-lg border px-3 py-2 text-sm font-mono" placeholder="clinic-slug" /></Field>
          <Field label="Specialty"><input name="clinic_specialty" defaultValue={basic.specialty} className="w-full rounded-lg border px-3 py-2 text-sm" /></Field>
          <Field label="Country"><input name="clinic_country" defaultValue={basic.country} className="w-full rounded-lg border px-3 py-2 text-sm" /></Field>
          <Field label="City"><input name="clinic_city" defaultValue={basic.city} className="w-full rounded-lg border px-3 py-2 text-sm" /></Field>
          <Field label="Province"><input name="clinic_province" defaultValue={basic.province} className="w-full rounded-lg border px-3 py-2 text-sm" /></Field>
          <Field label="District"><input name="clinic_district" defaultValue={basic.district} className="w-full rounded-lg border px-3 py-2 text-sm" /></Field>
          <Field label="Address"><input name="clinic_address" defaultValue={clinic.address ?? ""} className="w-full rounded-lg border px-3 py-2 text-sm" /></Field>
          <Field label="Google Maps URL"><input name="clinic_mapUrl" defaultValue={location.mapUrl} className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="https://maps.google.com/..." /></Field>
          <Field label="Google Place ID">
            <input
              name="clinic_google_place_id"
              defaultValue={clinic.google_place_id ?? ""}
              className="w-full rounded-lg border px-3 py-2 text-sm font-mono"
              placeholder="ChIJN1t_tDeuEmsR..."
            />
          </Field>
          <div className="md:col-span-2 text-xs text-gray-400">
            Find Place ID:{" "}
            <a
              href="https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Google Place ID Finder ↗
            </a>
            {clinic.google_rating != null && (
              <span className="ml-4 text-gray-600">
                Google Rating: <strong>{clinic.google_rating}</strong> ({clinic.google_reviews_count ?? 0} reviews)
                {clinic.google_reviews_synced_at && (
                  <span className="ml-2 text-gray-400">
                    synced {new Date(clinic.google_reviews_synced_at).toLocaleDateString()}
                  </span>
                )}
              </span>
            )}
          </div>
          <Field label="Directions"><textarea name="clinic_directions" defaultValue={location.directions} rows={2} className="w-full rounded-lg border px-3 py-2 text-sm" /></Field>
          <div className="md:col-span-2">
            <Field label="Description"><textarea name="clinic_description" defaultValue={basic.description} rows={4} className="w-full rounded-lg border px-3 py-2 text-sm" /></Field>
          </div>
        </div>
      </div>

      {/* DYNAMIC EDITOR */}
      <div className="rounded-2xl border bg-white p-6 space-y-8">
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

      {/* BOTTOM ACTIONS */}
      <div className="flex items-center justify-between rounded-2xl border bg-white px-6 py-4">
        <span className="text-xs text-slate-400">Changes apply immediately on save.</span>
        <button type="submit" className="rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-emerald-700">
          Save changes
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      {children}
    </div>
  );
}