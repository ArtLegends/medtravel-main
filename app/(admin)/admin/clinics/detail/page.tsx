// app/(admin)/admin/clinics/detail/page.tsx

import Link from "next/link";
import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/serviceClient";
import { clinicPath } from "@/lib/clinic-url";
import ClinicDraftEditor from "@/components/admin/ClinicDraftEditor";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
};

type SearchParams = {
  id?: string;
};

/* ---------- server action: сохранить клинику + драфт ---------- */

async function saveClinic(formData: FormData) {
  "use server";

  const id = String(formData.get("clinic_id") || "");
  if (!id) return;

  const sb = createServiceClient();

  const str = (name: string) =>
    String(formData.get(name) ?? "").trim();

  // --- обновляем основную запись clinics ---
  const clinicUpdate: any = {
    name: str("clinic_name") || null,
    slug: str("clinic_slug") || null,
    country: str("clinic_country") || null,
    city: str("clinic_city") || null,
    province: str("clinic_province") || null,
    district: str("clinic_district") || null,
    address: str("clinic_address") || null,
    status: str("clinic_status") || null,
    moderation_status: str("clinic_moderation_status") || null,
    is_published: formData.get("clinic_is_published") === "on",
  };

  await sb.from("clinics").update(clinicUpdate).eq("id", id);

  // --- собираем basic_info / location для драфта ---
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

  const parseJson = (field: string) => {
    const raw = formData.get(field);
    if (!raw) return null;
    try {
      return JSON.parse(String(raw));
    } catch {
      return null;
    }
  };

  const services = parseJson("draft_services");
  const doctors = parseJson("draft_doctors");
  const hours = parseJson("draft_hours");
  const gallery = parseJson("draft_gallery");
  const facilities = parseJson("draft_facilities");
  const pricing = parseJson("draft_pricing");
  const draftStatus = str("draft_status") || null;

  await sb
    .from("clinic_profile_drafts")
    .upsert(
      {
        clinic_id: id,
        basic_info,
        location,
        services: Array.isArray(services) ? services : services ?? [],
        doctors: Array.isArray(doctors) ? doctors : doctors ?? [],
        hours: Array.isArray(hours) ? hours : hours ?? [],
        gallery: Array.isArray(gallery) ? gallery : gallery ?? [],
        facilities: facilities ?? null,
        pricing: Array.isArray(pricing) ? pricing : pricing ?? [],
        status: draftStatus,
        updated_at: new Date().toISOString(),
      } as any,
      { onConflict: "clinic_id" } as any,
    );

  revalidatePath(`/admin/clinics/detail?id=${id}`);
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
      <div className="p-6 space-y-4">
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
      <div className="p-6 space-y-4">
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
      <div className="p-6 space-y-4">
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

  const basic = (draft?.basic_info ?? {}) as any;

  const services = (Array.isArray(draft?.services)
    ? (draft!.services as any[])
    : []) as any[];

  const doctors = (Array.isArray(draft?.doctors)
    ? (draft!.doctors as any[])
    : []) as any[];

  const hours = (Array.isArray(draft?.hours)
    ? (draft!.hours as any[])
    : []) as any[];

  const gallery = (Array.isArray(draft?.gallery)
    ? (draft!.gallery as any[])
    : []) as any[];

  const rawFacilities = (draft?.facilities ?? {}) as any;
  const facilities = {
    premises: Array.isArray(rawFacilities.premises)
      ? rawFacilities.premises
      : [],
    clinic_services: Array.isArray(rawFacilities.clinic_services)
      ? rawFacilities.clinic_services
      : [],
    travel_services: Array.isArray(rawFacilities.travel_services)
      ? rawFacilities.travel_services
      : [],
    languages_spoken: Array.isArray(rawFacilities.languages_spoken)
      ? rawFacilities.languages_spoken
      : [],
  };

  const payments: string[] = Array.isArray(draft?.pricing)
    ? (draft!.pricing as any[])
        .map((x) => {
          if (typeof x === "string") return x;
          if (x && typeof x.method === "string") return x.method;
          return null;
        })
        .filter(
          (v: unknown): v is string =>
            typeof v === "string" && v.trim().length > 0,
        )
    : [];

  const location = (draft?.location ?? {}) as any;

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
    <form
      className="mx-auto max-w-6xl space-y-6 p-6"
      action={saveClinic}
    >
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

      {/* SUMMARY CARD (read-only + admin meta) */}
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
            <input
              name="draft_status"
              defaultValue={draft?.status ?? ""}
              className="mt-1 w-full rounded border px-2 py-1 text-sm"
              placeholder="draft / published / pending..."
            />
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
                <input
                  name="clinic_status"
                  defaultValue={clinic.status ?? ""}
                  className="rounded border px-2 py-1 text-sm"
                  placeholder="draft / published..."
                />
              </label>
              <label className="flex flex-col gap-1 text-xs">
                <span>Moderation status</span>
                <input
                  name="clinic_moderation_status"
                  defaultValue={clinic.moderation_status ?? ""}
                  className="rounded border px-2 py-1 text-sm"
                  placeholder="pending / approved..."
                />
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

      {/* BASIC INFO / LOCATION */}
      <div className="space-y-8 rounded-2xl border bg-white p-6 shadow-sm">
        {/* BASIC */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Basic information
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 text-sm">
            <div className="space-y-2">
              <Field label="Name">
                <input
                  name="clinic_name"
                  defaultValue={basic.name ?? clinic.name}
                  className="w-full rounded border px-2 py-1.5 text-sm"
                />
              </Field>
              <Field label="Slug">
                <input
                  name="clinic_slug"
                  defaultValue={basic.slug ?? clinic.slug ?? ""}
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
                  defaultValue={basic.country ?? clinic.country ?? ""}
                  className="w-full rounded border px-2 py-1.5 text-sm"
                />
              </Field>
              <Field label="City">
                <input
                  name="clinic_city"
                  defaultValue={basic.city ?? clinic.city ?? ""}
                  className="w-full rounded border px-2 py-1.5 text-sm"
                />
              </Field>
              <Field label="Province">
                <input
                  name="clinic_province"
                  defaultValue={basic.province ?? clinic.province ?? ""}
                  className="w-full rounded border px-2 py-1.5 text-sm"
                />
              </Field>
              <Field label="District">
                <input
                  name="clinic_district"
                  defaultValue={basic.district ?? clinic.district ?? ""}
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

        {/* SERVICES / DOCTORS / GALLERY / FACILITIES / PAYMENTS */}
        <ClinicDraftEditor
          initialServices={services}
          initialDoctors={doctors}
          initialHours={hours}
          initialGallery={gallery}
          initialFacilities={facilities}
          initialPricing={payments}
        />
      </div>

      {/* ACTIONS */}
      <div className="flex items-center justify-between border-t pt-4">
        <div className="text-xs text-gray-500">
          Press &ldquo;Save changes&rdquo; to update clinic and draft
          in Supabase. Changes apply immediately.
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

/* ---------- небольшие UI-хелперы ---------- */

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
