// app/(admin)/admin/clinics/[id]/page.tsx

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/adminClient";

// SEO
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const dynamicParams = true;

/* ========== SERVER ACTIONS ========== */

// Обновление базовых полей клиники (таблица clinics)
async function updateClinicBasics(formData: FormData) {
  "use server";
  const sb = createAdminClient();

  const clinicId = String(formData.get("clinicId") || "");
  if (!clinicId) return;

  const v = (name: string) => {
    const raw = formData.get(name);
    if (!raw) return null;
    const s = String(raw).trim();
    return s.length ? s : null;
  };

  const isPublished = formData.get("is_published") === "on";

  const payload: any = {
    name: v("name"),
    slug: v("slug"),
    country: v("country"),
    city: v("city"),
    province: v("province"),
    district: v("district"),
    address: v("address"),
    map_embed_url: v("map_embed_url"),
    status: v("status"),
    moderation_status: v("moderation_status"),
    is_published: isPublished,
  };

  // убираем undefined, оставляем только ключи (null допустим)
  Object.keys(payload).forEach((k) => {
    if (payload[k] === undefined) delete payload[k];
  });

  const { error } = await sb.from("clinics").update(payload).eq("id", clinicId);
  if (error) throw error;

  revalidatePath(`/admin/clinics/${clinicId}`);
  revalidatePath("/admin/clinics");
}

// Обновление JSON-черновика (clinic_profile_drafts)
async function updateClinicDraft(formData: FormData) {
  "use server";
  const sb = createAdminClient();
  const clinicId = String(formData.get("clinicId") || "");
  if (!clinicId) return;

  const parseJson = (name: string) => {
    const raw = formData.get(name);
    if (!raw) return undefined; // не трогаем это поле
    const s = String(raw).trim();
    if (!s.length) return null;
    try {
      return JSON.parse(s);
    } catch {
      // если невалидный JSON — просто игнорируем это поле
      return undefined;
    }
  };

  const patch: any = {
    clinic_id: clinicId,
  };

  const basic_info = parseJson("basic_info");
  const services = parseJson("services");
  const doctors = parseJson("doctors");
  const facilities = parseJson("facilities");
  const hours = parseJson("hours");
  const gallery = parseJson("gallery");
  const location = parseJson("location");
  const pricing = parseJson("pricing");

  if (basic_info !== undefined) patch.basic_info = basic_info;
  if (services !== undefined) patch.services = services;
  if (doctors !== undefined) patch.doctors = doctors;
  if (facilities !== undefined) patch.facilities = facilities;
  if (hours !== undefined) patch.hours = hours;
  if (gallery !== undefined) patch.gallery = gallery;
  if (location !== undefined) patch.location = location;
  if (pricing !== undefined) patch.pricing = pricing;

  const { error } = await sb
    .from("clinic_profile_drafts")
    .upsert(patch, { onConflict: "clinic_id" });

  if (error) throw error;

  revalidatePath(`/admin/clinics/${clinicId}`);
}

/* ========== PAGE COMPONENT ========== */

export default async function ClinicEditorPage(
    { params }: { params: Promise<{ id: string }> }
  ) {
    const { id } = await params;
  const sb = createAdminClient();

  const [{ data: clinic, error: cErr }, { data: draft, error: dErr }] =
    await Promise.all([
      sb.from("clinics").select("*").eq("id", id).maybeSingle(),
      sb.from("clinic_profile_drafts").select("*").eq("clinic_id", id).maybeSingle(),
    ]);

  if (cErr) throw cErr;
  if (dErr) throw dErr;
  if (!clinic) return notFound();

  const c: any = clinic;
  const d: any = draft ?? {};

  const basic = (d.basic_info ?? {}) as any;
  const services: any[] = Array.isArray(d.services) ? d.services : [];
  const doctors: any[] = Array.isArray(d.doctors) ? d.doctors : [];
  const facilities =
    d.facilities ??
    ({
      premises: [],
      clinic_services: [],
      travel_services: [],
      languages_spoken: [],
    } as any);
  const hours: any[] = Array.isArray(d.hours) ? d.hours : [];
  const gallery: any[] = Array.isArray(d.gallery) ? d.gallery : [];
  const location = (d.location ?? {}) as any;
  const payments: any[] = Array.isArray(d.pricing) ? d.pricing : [];

  const formatDateTime = (v?: string | null) =>
    v ? new Date(v).toLocaleString() : "-";

  // JSON строки для редактора
  const json = {
    basic_info: JSON.stringify(d.basic_info ?? {}, null, 2),
    services: JSON.stringify(d.services ?? [], null, 2),
    doctors: JSON.stringify(d.doctors ?? [], null, 2),
    facilities: JSON.stringify(facilities ?? {}, null, 2),
    hours: JSON.stringify(d.hours ?? [], null, 2),
    gallery: JSON.stringify(d.gallery ?? [], null, 2),
    location: JSON.stringify(d.location ?? {}, null, 2),
    pricing: JSON.stringify(d.pricing ?? [], null, 2),
  };

  const publicUrl = c.slug
    ? `/clinic/${encodeURIComponent(c.slug)}`
    : null;

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">
            {c.name || "(no name)"}
          </h1>
          <p className="text-sm text-gray-500">
            Clinic editor (All Clinics)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm">
          {publicUrl && (
            <Link
              href={publicUrl}
              target="_blank"
              className="rounded-full border border-gray-200 px-3 py-1 text-gray-700 hover:bg-gray-50"
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

      {/* SUMMARY CARD c текущими статусами */}
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Clinic
            </div>
            <div className="text-lg font-semibold">{c.name}</div>
            <div className="text-xs text-gray-500">{c.slug}</div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Badge
              label="Moderation"
              value={c.moderation_status ?? "pending"}
            />
            <Badge label="Status" value={c.status ?? "draft"} />
            <Badge
              label="Published"
              value={c.is_published ? "Yes" : "No"}
              tone={c.is_published ? "success" : "neutral"}
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
              [
                undefined,
                [c.city, c.country].filter(Boolean).join(", "),
              ],
              ["Address", c.address || "-"],
            ]}
          />
          <InfoBlock
            title="Meta"
            lines={[
              ["Clinic ID", c.id],
              ["Created at", formatDateTime(c.created_at as any)],
              ["Updated at", formatDateTime(c.updated_at as any)],
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

      {/* БЛОК: ФОРМА ОБНОВЛЕНИЯ ТАБЛИЦЫ CLINICS */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">
        <SectionHeader title="Edit clinic basics (table `clinics`)" />
        <form action={updateClinicBasics} className="grid gap-4 md:grid-cols-2">
          <input type="hidden" name="clinicId" value={c.id} />
          <TextField label="Name" name="name" defaultValue={c.name ?? ""} />
          <TextField label="Slug" name="slug" defaultValue={c.slug ?? ""} />

          <TextField label="Country" name="country" defaultValue={c.country ?? ""} />
          <TextField label="City" name="city" defaultValue={c.city ?? ""} />
          <TextField label="Province" name="province" defaultValue={c.province ?? ""} />
          <TextField label="District" name="district" defaultValue={c.district ?? ""} />

          <div className="md:col-span-2">
            <TextField
              label="Address"
              name="address"
              defaultValue={c.address ?? ""}
            />
          </div>

          <div className="md:col-span-2">
            <TextField
              label="Google Maps / Map embed URL"
              name="map_embed_url"
              defaultValue={c.map_embed_url ?? ""}
            />
          </div>

          <TextField
            label="Status"
            name="status"
            defaultValue={c.status ?? ""}
            helper="e.g. published / draft / archived"
          />
          <TextField
            label="Moderation status"
            name="moderation_status"
            defaultValue={c.moderation_status ?? ""}
            helper="e.g. approved / pending / rejected"
          />

          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <input
              type="checkbox"
              name="is_published"
              defaultChecked={Boolean(c.is_published)}
            />
            <span>Published</span>
          </label>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Save clinic
            </button>
          </div>
        </form>
      </div>

      {/* ЧИСТОЕ ПРЕВЬЮ ДРАФТА (как в модерации) */}
      <div className="space-y-8 rounded-2xl border bg-white p-6 shadow-sm">
        <section className="space-y-4">
          <SectionHeader title="Basic information (draft preview)" />
          <div className="grid gap-6 md:grid-cols-2 text-sm">
            <div className="space-y-2">
              <KV k="Name" v={basic.name} />
              <KV k="Slug (draft)" v={basic.slug} />
              <KV k="Specialty" v={basic.specialty} />
              <KV k="Country" v={basic.country} />
              <KV k="City" v={basic.city} />
              <KV k="Province" v={basic.province} />
              <KV k="District" v={basic.district} />
            </div>
            <div className="space-y-3">
              <KV k="Map URL" v={location.mapUrl} />
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

        <section className="space-y-4">
          <SectionHeader
            title="Services & doctors (draft preview)"
            meta={`${services.length} service(s) • ${doctors.length} doctor(s)`}
          />
          <div className="grid gap-6 md:grid-cols-2 text-sm">
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Services ({services.length})
              </div>
              {!services.length ? (
                <EmptyHint>No services specified.</EmptyHint>
              ) : (
                <ul className="space-y-1 leading-relaxed">
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

            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Doctors ({doctors.length})
              </div>
              {!doctors.length ? (
                <EmptyHint>No doctors specified.</EmptyHint>
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

        <section className="space-y-4">
          <SectionHeader title="Operations (draft preview)" />
          <div className="grid gap-6 lg:grid-cols-[2fr,1.5fr]">
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
                  Payment methods
                </div>
                {!payments.length ? (
                  <EmptyHint>No payment methods specified.</EmptyHint>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {payments.map((p, i) => {
                      const label =
                        typeof p === "string"
                          ? p
                          : typeof p?.method === "string"
                          ? p.method
                          : JSON.stringify(p);
                      return (
                        <span
                          key={i}
                          className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm"
                        >
                          {label}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

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

        <section className="space-y-3">
          <SectionHeader title="Gallery (draft preview)" meta={`${gallery.length} image(s)`} />
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

      {/* ФОРМА РЕДАКТИРОВАНИЯ JSON-ЧЕРНОВИКА */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">
        <SectionHeader title="Edit draft JSON (`clinic_profile_drafts`)" />
        <p className="text-xs text-gray-500">
          Здесь можно вручную править JSON-черновик клиники. Поля принимают валидный JSON.
          Оставь поле пустым, чтобы НЕ изменять его; запиши пустую строку {"\"\""} или <code>null</code>,
          если хочешь очистить значение. После сохранения данные можно будет опубликовать
          через существующий flow (publish_clinic_from_draft).
        </p>
        <form action={updateClinicDraft} className="grid gap-4 md:grid-cols-2">
          <input type="hidden" name="clinicId" value={c.id} />

          <JsonArea label="basic_info" name="basic_info" defaultValue={json.basic_info} />
          <JsonArea label="services" name="services" defaultValue={json.services} />
          <JsonArea label="doctors" name="doctors" defaultValue={json.doctors} />
          <JsonArea label="facilities" name="facilities" defaultValue={json.facilities} />
          <JsonArea label="hours" name="hours" defaultValue={json.hours} />
          <JsonArea label="gallery" name="gallery" defaultValue={json.gallery} />
          <JsonArea label="location" name="location" defaultValue={json.location} />
          <JsonArea label="pricing" name="pricing" defaultValue={json.pricing} />

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Save draft JSON
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ===== small UI helpers (скопированы и чуть упрощены) ===== */

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

function TagRow({ label, values }: { label: string; values?: string[] }) {
  const arr = Array.isArray(values) ? values : [];
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
        )
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

function TextField({
  label,
  name,
  defaultValue,
  helper,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  helper?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </span>
      <input
        name={name}
        defaultValue={defaultValue}
        className="rounded-md border px-3 py-2 text-sm"
      />
      {helper && (
        <span className="text-[11px] text-gray-400">{helper}</span>
      )}
    </label>
  );
}

function JsonArea({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </span>
      <textarea
        name={name}
        defaultValue={defaultValue}
        rows={10}
        className="font-mono text-xs rounded-md border px-3 py-2 leading-snug"
      />
    </label>
  );
}
