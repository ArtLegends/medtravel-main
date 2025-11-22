// app/(admin)/admin/moderation/[id]/page.tsx

import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/adminClient";
import { approveClinic, rejectClinic } from "./actions";
import { clinicPath } from "@/lib/clinic-url";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const dynamicParams = true;

export default async function ModerationDetail({
  params,
}: {
  params: { id: string };
}) {
  const sb = createAdminClient();
  const id = params.id;

  // пробуем забрать клинику + драфт
  const [{ data: clinic, error: cErr }, { data: draft, error: dErr }] =
    await Promise.all([
      sb
        .from("clinics")
        .select("*")
        .eq("id", id)
        .maybeSingle(), // <= maybeSingle, чтобы не падать
      sb
        .from("clinic_profile_drafts")
        .select("*")
        .eq("clinic_id", id)
        .maybeSingle(),
    ]);

  if (cErr || dErr) {
    return (
      <div className="p-6">
        <h1 className="mb-4 text-xl font-semibold">Moderation detail error</h1>
        <pre className="rounded-lg bg-red-50 p-4 text-xs text-red-700 whitespace-pre-wrap">
          {cErr && `clinics error: ${cErr.message}\n\n`}
          {dErr && `drafts error: ${dErr.message}\n\n`}
        </pre>
        <Link href="/admin/moderation" className="mt-4 inline-block text-blue-600">
          ← Back to list
        </Link>
      </div>
    );
  }

  // если клиника не найдена — покажем сообщение, но НЕ 404
  if (!clinic) {
    return (
      <div className="p-6 space-y-4">
        <h1 className="text-xl font-semibold">Clinic not found</h1>
        <p className="text-sm text-gray-600">
          We could not find a clinic with id: <code className="font-mono">{id}</code>
        </p>
        <Link href="/admin/moderation" className="text-blue-600 hover:underline">
          ← Back to list
        </Link>
      </div>
    );
  }

  const c: any = clinic;

  // URL публичной страницы
  const publicPath =
    c.slug &&
    (clinicPath({
      slug: c.slug,
      country: c.country,
      province: c.province ?? undefined,
      city: c.city ?? undefined,
      district: c.district ?? undefined,
    }) || `/clinic/${c.slug}`);

  // распаковка драфта
  const basic = (draft?.basic_info ?? {}) as any;
  const services = Array.isArray(draft?.services) ? (draft!.services as any[]) : [];
  const doctors = Array.isArray(draft?.doctors) ? (draft!.doctors as any[]) : [];
  const facilities = (draft?.facilities ?? {
    premises: [],
    clinic_services: [],
    travel_services: [],
    languages_spoken: [],
  }) as any;
  const hours = Array.isArray(draft?.hours) ? (draft!.hours as any[]) : [];
  const gallery = Array.isArray(draft?.gallery) ? (draft!.gallery as any[]) : [];
  const location = (draft?.location ?? {}) as any;
  const payments = Array.isArray(draft?.pricing) ? (draft!.pricing as any[]) : [];

  return (
    <div className="space-y-6 p-6">
      {/* header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{c.name || "(no name)"}</h1>
        <div className="flex items-center gap-4">
          {publicPath && (
            <Link
              href={publicPath}
              className="text-sm text-gray-600 hover:underline"
              target="_blank"
            >
              Open public page →
            </Link>
          )}
          <Link
            href="/admin/moderation"
            className="text-sm text-blue-600 hover:underline"
          >
            ← Back to list
          </Link>
        </div>
      </div>

      {/* iframe-предпросмотр */}
      {publicPath && (
        <Card title="Public page preview">
          <div className="aspect-[16/9] w-full overflow-hidden rounded-lg border bg-gray-50">
            <iframe
              src={publicPath}
              className="h-full w-full border-0"
              loading="lazy"
            />
          </div>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Clinic">
          <KV k="ID" v={c.id} />
          <KV k="Slug" v={c.slug} />
          <KV
            k="Moderation / Status"
            v={`${c.moderation_status} / ${c.status}`}
          />
          <KV k="Published" v={String(Boolean(c.is_published))} />
          <KV
            k="Location"
            v={[c.city, c.country].filter(Boolean).join(", ")}
          />
          <KV k="Address" v={c.address} />
          <KV k="Map URL" v={c.map_embed_url || "(empty)"} />
          <KV k="Updated" v={c.updated_at as any} />
        </Card>

        <Card title="Draft meta">
          <KV k="Draft status" v={(draft?.status as any) || "-"} />
          <KV k="Updated at" v={(draft?.updated_at as any) || "-"} />
          {!draft && (
            <div className="text-sm text-gray-500">No draft yet.</div>
          )}
        </Card>

        <Card title="Basic (draft)">
          <KV k="Name" v={basic.name} />
          <KV k="Slug" v={basic.slug} />
          <KV k="Specialty" v={basic.specialty} />
          <KV k="Country" v={basic.country} />
          <KV k="City" v={basic.city} />
          <KV k="Province" v={basic.province} />
          <KV k="District" v={basic.district} />
          <div className="mt-2 text-sm">
            <div className="mb-1 text-gray-500">Description</div>
            <div className="whitespace-pre-wrap">
              {basic.description || "-"}
            </div>
          </div>
        </Card>

        <Card title="Location (draft)">
          <KV k="Google Maps URL" v={location.mapUrl} />
          <div className="mt-2 text-sm">
            <div className="mb-1 text-gray-500">Directions</div>
            <div className="whitespace-pre-wrap">
              {location.directions || "-"}
            </div>
          </div>
        </Card>

        <Card title={`Services (${services.length})`}>
          {!services.length ? (
            <div className="text-sm text-gray-500">No services.</div>
          ) : (
            <ul className="space-y-1 list-disc pl-5 text-sm">
              {services.map((s, i) => (
                <li key={i}>
                  <span className="font-medium">{s?.name || "-"}</span>
                  {s?.price ? ` — ${s.price} ${s?.currency || ""}` : ""}
                  {s?.description ? ` • ${s.description}` : ""}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title={`Doctors (${doctors.length})`}>
          {!doctors.length ? (
            <div className="text-sm text-gray-500">No doctors.</div>
          ) : (
            <ul className="space-y-1 list-disc pl-5 text-sm">
              {doctors.map((d, i) => (
                <li key={i}>
                  <span className="font-medium">
                    {d?.fullName || d?.name || "-"}
                  </span>
                  {d?.title ? ` — ${d.title}` : ""}
                  {d?.specialty ? ` • ${d.specialty}` : ""}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Facilities & Languages">
          <TagRow label="Premises" values={facilities.premises} />
          <TagRow label="Clinic services" values={facilities.clinic_services} />
          <TagRow label="Travel services" values={facilities.travel_services} />
          <TagRow label="Languages" values={facilities.languages_spoken} />
        </Card>

        <Card title={`Hours (${hours.length})`}>
          {!hours.length ? (
            <div className="text-sm text-gray-500">No working hours.</div>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {hours.map((h, i) => (
                  <tr key={i} className="border-t">
                    <td className="py-1 pr-3">{h.day}</td>
                    <td className="py-1 pr-3">{h.status}</td>
                    <td className="py-1">
                      {[h.start, h.end].filter(Boolean).join(" - ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card title={`Payments (${payments.length})`}>
          {!payments.length ? (
            <div className="text-sm text-gray-500">No payment methods.</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {payments.map((p, i) => (
                <span
                  key={i}
                  className="rounded-full bg-gray-100 px-2 py-1 text-sm"
                >
                  {String(p)}
                </span>
              ))}
            </div>
          )}
        </Card>

        <Card title={`Gallery (${gallery.length})`}>
          {!gallery.length ? (
            <div className="text-sm text-gray-500">No images.</div>
          ) : (
            <div className="grid gap-3 grid-cols-2 md:grid-cols-3">
              {gallery.map((g, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-lg border"
                >
                  <div className="aspect-[4/3] bg-gray-100">
                    {g?.url && (
                      <img
                        src={g.url}
                        alt={g?.title || "Image"}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  {g?.title && (
                    <div className="truncate px-2 py-1 text-xs text-gray-600">
                      {g.title}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="flex items-center gap-3">
        <form action={approveClinic}>
          <input type="hidden" name="clinicId" value={c.id} />
          <button className="rounded-md bg-emerald-600 px-3 py-2 text-white hover:bg-emerald-700">
            Approve & Publish
          </button>
        </form>

        <form action={rejectClinic} className="flex items-center gap-2">
          <input type="hidden" name="clinicId" value={c.id} />
          <input
            name="reason"
            placeholder="Reason"
            className="rounded-md border px-2 py-2 text-sm"
          />
          <button className="rounded-md border px-3 py-2 hover:bg-gray-50">
            Reject
          </button>
        </form>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="mb-2 text-sm text-gray-500">{title}</div>
      {children}
    </div>
  );
}

function KV({ k, v }: { k: string; v?: string | null }) {
  return (
    <div className="flex gap-2 text-sm">
      <div className="w-40 text-gray-500">{k}</div>
      <div className="flex-1 break-words">{v || "-"}</div>
    </div>
  );
}

function TagRow({ label, values }: { label: string; values?: string[] }) {
  const arr = Array.isArray(values) ? values : [];
  return (
    <div className="mb-2">
      <div className="mb-1 text-xs text-gray-500">{label}</div>
      {!arr.length ? (
        <div className="text-sm text-gray-500">—</div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {arr.map((x, i) => (
            <span
              key={i}
              className="rounded-full bg-gray-100 px-2 py-1 text-sm"
            >
              {x}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
