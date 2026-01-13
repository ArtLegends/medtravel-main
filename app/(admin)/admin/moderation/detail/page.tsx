// app/(admin)/admin/moderation/detail/page.tsx

import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/adminClient";
import { approveClinic, rejectClinic } from "../actions";
import { clinicPath } from "@/lib/clinic-url";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type SearchParams = {
  id?: string;
};

type ModerationDetailProps = {
  // в Next 15 searchParams приходит как Promise
  searchParams: Promise<SearchParams>;
};

export default async function ModerationDetail({
  searchParams,
}: ModerationDetailProps) {
  const sp = await searchParams;
  const clinicId = sp.id;
  if (!clinicId) return notFound();

  const sb = createAdminClient();

  const [{ data: clinic, error: cErr }, { data: draft, error: dErr }] =
    await Promise.all([
      sb.from("clinics").select("*").eq("id", clinicId).maybeSingle(),
      sb
        .from("clinic_profile_drafts")
        .select("*")
        .eq("clinic_id", clinicId)
        .maybeSingle(),
    ]);

  if (cErr) throw cErr;
  if (!clinic) return notFound();
  if (dErr) throw dErr;

  // безопасная распаковка черновика
  const basic = (draft?.basic_info ?? {}) as any;

  const services: any[] = Array.isArray(draft?.services)
    ? (draft!.services as any[])
    : [];

  const doctors: any[] = Array.isArray(draft?.doctors)
    ? (draft!.doctors as any[])
    : [];

  const facilities = (draft?.facilities ?? {
    premises: [],
    clinic_services: [],
    travel_services: [],
    languages_spoken: [],
  }) as any;

  const hours: any[] = Array.isArray(draft?.hours)
    ? (draft!.hours as any[])
    : [];

  const gallery: any[] = Array.isArray(draft?.gallery)
    ? (draft!.gallery as any[])
    : [];

  const location = (draft?.location ?? {}) as any;

  // pricing → массив строк (названия методов)
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

  const formatDateTime = (v?: string | null) =>
    v ? new Date(v).toLocaleString() : "-";

    const publicPath =
    clinic.slug &&
    (clinicPath({
      slug: clinic.slug,
      country: clinic.country ?? undefined,
      province: (clinic as any).province ?? undefined,
      city: clinic.city ?? undefined,
      district: (clinic as any).district ?? undefined,
    }) || `/clinic/${clinic.slug}`);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">
            {clinic.name || "(no name)"}
          </h1>
          <p className="text-sm text-gray-500">
            Moderation overview for clinic draft
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
            href="/admin/moderation"
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

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Badge
              label="Moderation"
              value={clinic.moderation_status ?? "pending"}
            />
            <Badge label="Status" value={clinic.status ?? "draft"} />
            <Badge
              label="Published"
              value={clinic.is_published ? "Yes" : "No"}
              tone={clinic.is_published ? "success" : "neutral"}
            />
            {draft?.status && (
              <Badge label="Draft" value={draft.status} tone="info" />
            )}
          </div>
        </div>

        <div className="mt-4 grid gap-4 text-sm md:grid-cols-3">
          <InfoBlock
            title="Location"
            lines={[
              [undefined, [clinic.city, clinic.country].filter(Boolean).join(", ")],
              ["Address", clinic.address || "-"],
            ]}
          />
          <InfoBlock
            title="Meta"
            lines={[
              ["Clinic ID", clinic.id],
              ["Updated at", formatDateTime(clinic.updated_at as any)],
            ]}
          />
          <InfoBlock
            title="Draft meta"
            lines={[
              ["Status", (draft?.status as any) || "-"],
              ["Updated at", formatDateTime(draft?.updated_at as any)],
            ]}
          />
        </div>
      </div>

      {/* MAIN CONTENT PANEL */}
      <div className="space-y-8 rounded-2xl border bg-white p-6 shadow-sm">
        {/* BASIC + LOCATION */}
        <section className="space-y-4">
          <SectionHeader title="Basic information" />

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2 text-sm">
              <KV k="Name" v={basic.name} />
              <KV k="Slug (draft)" v={basic.slug} />
              <KV k="Specialty" v={basic.specialty} />
              <KV k="Country" v={basic.country} />
              <KV k="City" v={basic.city} />
              <KV k="Province" v={basic.province} />
              <KV k="District" v={basic.district} />
            </div>

            <div className="space-y-3 text-sm">
              <KV k="Google Maps URL" v={location.mapUrl} />
              <div>
                <div className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                  Description
                </div>
                <div className="whitespace-pre-wrap rounded-lg border bg-gray-50/60 px-3 py-2 text-sm leading-relaxed text-gray-800">
                  {basic.description || "—"}
                </div>
              </div>
              <div>
                <div className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                  Directions
                </div>
                <div className="whitespace-pre-wrap rounded-lg border bg-gray-50/60 px-3 py-2 text-sm leading-relaxed text-gray-800">
                  {location.directions || "—"}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SERVICES + DOCTORS */}
        <section className="space-y-4">
          <SectionHeader
            title="Services & doctors"
            meta={`${services.length} service(s) • ${doctors.length} doctor(s)`}
          />

          <div className="grid gap-6 md:grid-cols-2">
            {/* Services */}
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Services ({services.length})
              </div>
              {!services.length ? (
                <EmptyHint>No services specified.</EmptyHint>
              ) : (
                <ul className="space-y-1 text-sm leading-relaxed">
                  {services.map((s, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-0.5 h-1 w-1 flex-shrink-0 rounded-full bg-gray-400" />
                      <span>
                        <span className="font-medium">{s?.name || "-"}</span>
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

            {/* Doctors */}
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Doctors ({doctors.length})
              </div>
              {!doctors.length ? (
                <EmptyHint>No doctors specified.</EmptyHint>
              ) : (
                <ul className="space-y-1 text-sm leading-relaxed">
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

        {/* FACILITIES / HOURS / PAYMENTS */}
        <section className="space-y-4">
          <SectionHeader title="Operations" />

          <div className="grid gap-6 lg:grid-cols-[2fr,1.5fr]">
            {/* Facilities */}
            <div className="space-y-4">
              <div>
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Facilities & languages
                </div>
                <div className="grid gap-3 text-sm md:grid-cols-2">
                  <TagRow label="Premises" values={facilities.premises} />
                  <TagRow
                    label="Clinic services"
                    values={facilities.clinic_services}
                  />
                  <TagRow
                    label="Travel services"
                    values={facilities.travel_services}
                  />
                  <TagRow
                    label="Languages"
                    values={facilities.languages_spoken}
                  />
                </div>
              </div>

              <div>
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Payment methods ({payments.length})
                </div>
                {!payments.length ? (
                  <EmptyHint>No payment methods specified.</EmptyHint>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {payments.map((p, i) => (
                      <span
                        key={i}
                        className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Hours */}
            <div>
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Working hours
              </div>
              {!hours.length ? (
                <EmptyHint>No working hours specified.</EmptyHint>
              ) : (
                <table className="w-full text-sm">
                  <thead className="border-b bg-gray-50 text-left text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-2 py-1.5">Day</th>
                      <th className="px-2 py-1.5">Status</th>
                      <th className="px-2 py-1.5">Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hours.map((h, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="px-2 py-1.5">{h.day}</td>
                        <td className="px-2 py-1.5 text-gray-700">
                          {h.status || "—"}
                        </td>
                        <td className="px-2 py-1.5 text-gray-700">
                          {[h.start, h.end].filter(Boolean).join(" – ") || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </section>

        {/* GALLERY */}
        <section className="space-y-3">
          <SectionHeader title="Gallery" meta={`${gallery.length} image(s)`} />
          {!gallery.length ? (
            <EmptyHint>No images uploaded.</EmptyHint>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {gallery.map((g, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-xl border bg-gray-50"
                >
                  <div className="aspect-[4/3] bg-gray-100">
                    {g?.url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={g.url}
                        alt={g?.title || "Image"}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  {g?.title && (
                    <div className="truncate px-3 py-2 text-xs text-gray-600">
                      {g.title}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ACTIONS */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-4">
        <div className="text-xs text-gray-500">
          Approve will publish clinic and sync data from this draft. Reject will
          return clinic to draft state.
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <form action={approveClinic}>
            <input type="hidden" name="clinicId" value={clinic.id} />
            <button className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700">
              Approve &amp; Publish
            </button>
          </form>

          <form action={rejectClinic} className="flex items-center gap-2">
            <input type="hidden" name="clinicId" value={clinic.id} />
            <input
              name="reason"
              placeholder="Reason"
              className="h-9 rounded-md border px-3 text-sm"
            />
            <button className="h-9 rounded-md border px-4 text-sm font-medium hover:bg-gray-50">
              Reject
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ===== small UI helpers ===== */

function SectionHeader({ title, meta }: { title: string; meta?: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
        {title}
      </h2>
      {meta && <span className="text-xs text-gray-400">{meta}</span>}
    </div>
  );
}

function KV({ k, v }: { k: string; v?: string | null }) {
  return (
    <div className="flex gap-2 text-sm">
      <div className="w-28 shrink-0 text-xs font-medium uppercase tracking-wide text-gray-500">
        {k}
      </div>
      <div className="flex-1 text-gray-800">{v || "-"}</div>
    </div>
  );
}

function toStringArray(values: unknown): string[] {
  if (!Array.isArray(values)) return [];

  return values
    .map((v) => {
      if (typeof v === "string") return v.trim();
      if (v && typeof v === "object" && "label" in v) {
        const lbl = (v as any).label;
        return typeof lbl === "string" ? lbl.trim() : "";
      }
      return "";
    })
    .filter((x) => x.length > 0);
}

function TagRow({ label, values }: { label: string; values?: unknown }) {
  const arr = toStringArray(values);

  return (
    <div className="space-y-1">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </div>
      {!arr.length ? (
        <div className="text-sm text-gray-400">—</div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {arr.map((x, i) => (
            <span
              key={i}
              className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm"
            >
              {x}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function Badge({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "success" | "info";
}) {
  const toneClasses =
    tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : tone === "info"
      ? "border-sky-200 bg-sky-50 text-sky-700"
      : "border-gray-200 bg-gray-50 text-gray-700";

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs ${toneClasses}`}
    >
      <span className="text-[10px] font-medium uppercase tracking-wide text-gray-500">
        {label}
      </span>
      <span className="text-xs">{value}</span>
    </div>
  );
}

function InfoBlock({
  title,
  lines,
}: {
  title: string;
  lines: ([string | undefined, string | null | undefined])[];
}) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {title}
      </div>
      {lines.map(([label, value], i) =>
        label ? (
          <KV key={i} k={label} v={value ?? undefined} />
        ) : (
          <div key={i} className="text-sm text-gray-800">
            {value || "-"}
          </div>
        ),
      )}
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
