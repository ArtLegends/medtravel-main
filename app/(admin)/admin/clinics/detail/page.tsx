// app/(admin)/admin/clinics/detail/page.tsx

import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/serviceClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ClinicRow = {
  id: string;
  name: string;
  slug: string | null;
  country: string | null;
  city: string | null;
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

export default async function ClinicEditorPage(
  { searchParams }: { searchParams: Promise<SearchParams> }
) {
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

  const [{ data: clinic, error: clinicError }, { data: draft, error: draftError }] =
    await Promise.all([
      sb
        .from("clinics")
        .select("*")
        .eq("id", id)
        .maybeSingle<ClinicRow>(),
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
        <pre className="rounded-lg bg-red-50 p-4 text-xs text-red-700 whitespace-pre-wrap">
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
  const services = (Array.isArray(draft?.services) ? draft!.services : []) as any[];
  const doctors  = (Array.isArray(draft?.doctors)  ? draft!.doctors  : []) as any[];
  const hours    = (Array.isArray(draft?.hours)    ? draft!.hours    : []) as any[];
  const gallery  = (Array.isArray(draft?.gallery)  ? draft!.gallery  : []) as any[];
  const facilities = (draft?.facilities ?? {
    premises: [],
    clinic_services: [],
    travel_services: [],
    languages_spoken: [],
  }) as any;
  const payments = (Array.isArray(draft?.pricing) ? draft!.pricing : []) as any[];
  const location = (draft?.location ?? {}) as any;

  const formatDate = (v?: string | null) =>
    v ? new Date(v).toLocaleString() : "-";

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">
            {clinic.name || "(no name)"}
          </h1>
          <p className="text-sm text-gray-500">
            Admin view &amp; basic edit for clinic
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm">
          {clinic.slug && (
            <Link
              href={`/clinic/${clinic.slug}`}
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
              {[clinic.city, clinic.country].filter(Boolean).join(", ") || "—"}
            </div>
            <div className="mt-1 text-xs text-gray-500">
              {clinic.address || "-"}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Draft status
            </div>
            <div className="text-sm text-gray-800">
              {(draft?.status as any) || "-"}
            </div>
            <div className="mt-1 text-xs text-gray-500">
              Updated: {formatDate(draft?.updated_at as any)}
            </div>
          </div>

          <div className="text-xs text-gray-500">
            This page currently shows a read-only summary of the clinic
            and its draft. Editing UI can be expanded here (basic info,
            services, doctors, gallery, etc.) using the same data model
            as in moderation.
          </div>
        </div>
      </div>

      {/* BASIC INFO / LOCATION */}
      <div className="space-y-8 rounded-2xl border bg-white p-6 shadow-sm">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Basic information (draft)
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 text-sm">
            <div className="space-y-2">
              <KV k="Name" v={basic.name ?? clinic.name} />
              <KV k="Slug (draft)" v={basic.slug} />
              <KV k="Specialty" v={basic.specialty} />
              <KV k="Country" v={basic.country ?? clinic.country} />
              <KV k="City" v={basic.city ?? clinic.city} />
              <KV k="Province" v={basic.province} />
              <KV k="District" v={basic.district} />
            </div>

            <div className="space-y-3">
              <KV k="Google Maps URL" v={location.mapUrl} />
              <TextBlock label="Description" value={basic.description} />
              <TextBlock label="Directions" value={location.directions} />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Services &amp; doctors (from draft)
            </h2>
            <span className="text-xs text-gray-400">
              {services.length} service(s) • {doctors.length} doctor(s)
            </span>
          </div>

          <div className="grid gap-6 md:grid-cols-2 text-sm">
            <div>
              <div className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                Services
              </div>
              {!services.length ? (
                <EmptyHint>No services specified in draft.</EmptyHint>
              ) : (
                <ul className="space-y-1 leading-relaxed">
                  {services.map((s, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-0.5 h-1 w-1 flex-shrink-0 rounded-full bg-gray-400" />
                      <span>
                        <span className="font-medium">
                          {s?.name || "-"}
                        </span>
                        {s?.price ? (
                          <>
                            {" "}
                            — {s.price} {s?.currency || ""}
                          </>
                        ) : null}
                        {s?.description ? (
                          <span className="text-gray-600">
                            {" "}
                            • {s.description}
                          </span>
                        ) : null}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <div className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                Doctors
              </div>
              {!doctors.length ? (
                <EmptyHint>No doctors specified in draft.</EmptyHint>
              ) : (
                <ul className="space-y-1 leading-relaxed">
                  {doctors.map((d, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-0.5 h-1 w-1 flex-shrink-0 rounded-full bg-gray-400" />
                      <span>
                        <span className="font-medium">
                          {d?.fullName || d?.name || "-"}
                        </span>
                        {d?.title ? <> — {d.title}</> : null}
                        {d?.specialty ? (
                          <span className="text-gray-600">
                            {" "}
                            • {d.specialty}
                          </span>
                        ) : null}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

        {/* дальше можно расширять: facilities, hours, gallery, payments */}
      </div>
    </div>
  );
}

function KV({ k, v }: { k: string; v?: string | null }) {
  return (
    <div className="flex gap-2 text-sm">
      <div className="w-32 shrink-0 text-xs font-medium uppercase tracking-wide text-gray-500">
        {k}
      </div>
      <div className="flex-1 text-gray-800">{v || "-"} </div>
    </div>
  );
}

function TextBlock({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <div className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="whitespace-pre-wrap rounded-lg border bg-gray-50/60 px-3 py-2 text-sm leading-relaxed text-gray-800">
        {value || "—"}
      </div>
    </div>
  );
}

function EmptyHint({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500">
      {children}
    </div>
  );
}
