// app/(admin)/admin/clinics/page.tsx
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/serviceClient";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButtons";

export const metadata = { title: "Clinics • Admin" };

const PAGE_SIZE = 15;

type Search = { page?: string; from?: string; to?: string; q?: string };

type Row = {
  id: string;
  name: string;
  country: string | null;
  city: string | null;
  created_at: string;
  status: "published" | "draft" | string | null;
};

async function getRows(searchParams: Search) {
  "use server";
  const sb = createServiceClient();

  const page = Math.max(1, Number(searchParams.page ?? 1) || 1);
  const from = searchParams.from
    ? new Date(`${searchParams.from}T00:00:00.000Z`).toISOString()
    : null;
  const to = searchParams.to
    ? new Date(`${searchParams.to}T23:59:59.999Z`).toISOString()
    : null;

  const nameQuery = (searchParams.q ?? "").trim();

  let q = sb
    .from("clinics")
    .select("id,name,country,city,created_at,status", { count: "exact" })
    .order("created_at", { ascending: false });

  if (from) q = q.gte("created_at", from);
  if (to) q = q.lte("created_at", to);

  // фильтр по имени клиники
  if (nameQuery) {
    q = q.ilike("name", `%${nameQuery}%`);
  }

  const fromIdx = (page - 1) * PAGE_SIZE;
  const toIdx = fromIdx + PAGE_SIZE - 1;

  const { data, error, count } = await q.range(fromIdx, toIdx);
  if (error) throw new Error(error.message);

  return {
    rows: (data ?? []) as Row[],
    page,
    pageCount: Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE)),
    total: count ?? 0,
  };
}

async function deleteCascade(
  sb: ReturnType<typeof createServiceClient>,
  clinicId: string,
) {
  const tablesOne = [
    "clinic_images",
    "clinic_hours",
    "clinic_staff",
    "clinic_services",
    "clinic_languages",
    "clinic_premises",
    "clinic_travel_services",
    "clinic_inquiries",
    "clinic_requests",
    "reports",
    "reviews",
    "clinic_translations",
    "clinic_categories",
    "clinic_accreditations",
  ];
  for (const t of tablesOne) {
    const { error } = await sb.from(t).delete().eq("clinic_id", clinicId);
    if (error) throw new Error(`${t}: ${error.message}`);
  }
  const { error } = await sb.from("doctors").delete().eq("clinic_id", clinicId);
  if (error) throw new Error(`doctors: ${error.message}`);
}

async function deleteClinic(formData: FormData) {
  "use server";
  const clinicId = String(formData.get("clinicId") || "");
  const path = String(formData.get("path") || "/admin/clinics");
  if (!clinicId) return;

  const sb = createServiceClient();
  await deleteCascade(sb, clinicId);

  const { error } = await sb.from("clinics").delete().eq("id", clinicId);
  if (error) throw new Error(`clinics: ${error.message}`);

  revalidatePath(path);
}

async function deleteAll(formData: FormData) {
  "use server";
  const from = String(formData.get("from") || "");
  const to = String(formData.get("to") || "");
  const path = String(formData.get("path") || "/admin/clinics");

  const sb = createServiceClient();

  let q = sb.from("clinics").select("id, created_at");
  if (from)
    q = q.gte(
      "created_at",
      new Date(`${from}T00:00:00.000Z`).toISOString(),
    );
  if (to)
    q = q.lte(
      "created_at",
      new Date(`${to}T23:59:59.999Z`).toISOString(),
    );

  const { data, error } = await q;
  if (error) throw new Error(error.message);

  const ids = (data ?? []).map((r: any) => r.id as string);
  if (!ids.length) {
    revalidatePath(path);
    return;
  }

  const tablesOne = [
    "clinic_images",
    "clinic_hours",
    "clinic_staff",
    "clinic_services",
    "clinic_languages",
    "clinic_premises",
    "clinic_travel_services",
    "clinic_inquiries",
    "clinic_requests",
    "reports",
    "reviews",
    "clinic_translations",
    "clinic_categories",
    "clinic_accreditations",
  ];
  for (const t of tablesOne) {
    const { error: e } = await sb.from(t).delete().in("clinic_id", ids);
    if (e) throw new Error(`${t}: ${e.message}`);
  }
  {
    const { error: e } = await sb.from("doctors").delete().in("clinic_id", ids);
    if (e) throw new Error(`doctors: ${e.message}`);
  }
  {
    const { error: e } = await sb.from("clinics").delete().in("id", ids);
    if (e) throw new Error(`clinics: ${e.message}`);
  }

  revalidatePath(path);
  redirect(path);
}

function DateFilter({
  from,
  to,
  q,
}: {
  from?: string;
  to?: string;
  q?: string;
}) {
  return (
    <form className="flex items-end gap-2" action="/admin/clinics" method="get">
      <label className="text-sm">
        <div className="mb-1 text-xs text-slate-600">From</div>
        <input
          type="date"
          name="from"
          defaultValue={from}
          className="rounded border px-2 py-1"
        />
      </label>
      <label className="text-sm">
        <div className="mb-1 text-xs text-slate-600">To</div>
        <input
          type="date"
          name="to"
          defaultValue={to}
          className="rounded border px-2 py-1"
        />
      </label>

      {/* поиск по названию клиники */}
      <label className="text-sm">
        <div className="mb-1 text-xs text-slate-600">Search</div>
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Clinic name"
          className="w-48 rounded border px-2 py-1"
        />
      </label>

      <button className="rounded border bg-white px-3 py-1.5 text-sm hover:bg-slate-50">
        Apply
      </button>
      <a
        href="/admin/clinics"
        className="rounded border bg-white px-3 py-1.5 text-sm hover:bg-slate-50"
      >
        Clear
      </a>
    </form>
  );
}

function Pager({
  page,
  pageCount,
  from,
  to,
  q,
}: {
  page: number;
  pageCount: number;
  from?: string;
  to?: string;
  q?: string;
}) {
  const mk = (p: number) => {
    const qs = new URLSearchParams();
    if (from) qs.set("from", from);
    if (to) qs.set("to", to);
    if (q) qs.set("q", q);
    qs.set("page", String(p));
    return `/admin/clinics?${qs.toString()}`;
  };
  return (
    <div className="flex items-center gap-2">
      <a
        href={mk(Math.max(1, page - 1))}
        className={`rounded border px-3 py-1.5 text-sm ${
          page <= 1
            ? "pointer-events-none opacity-50"
            : "bg-white hover:bg-slate-50"
        }`}
      >
        ← Prev
      </a>
      <div className="text-sm text-slate-600">
        Page {page} / {pageCount}
      </div>
      <a
        href={mk(Math.min(pageCount, page + 1))}
        className={`rounded border px-3 py-1.5 text-sm ${
          page >= pageCount
            ? "pointer-events-none opacity-50"
            : "bg-white hover:bg-slate-50"
        }`}
      >
        Next →
      </a>
    </div>
  );
}

export default async function ClinicsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;
  const { rows, page, pageCount, total } = await getRows(sp);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Clinics</h1>

        <div className="flex items-center gap-3">
          <DateFilter from={sp.from} to={sp.to} q={sp.q} />
          {/* ... остальное без изменений ... */}
        </div>
      </div>

      {/* ... таблица ... */}

      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-600">Total: {total}</div>
        <Pager
          page={page}
          pageCount={pageCount}
          from={sp.from}
          to={sp.to}
          q={sp.q}
        />
      </div>
    </div>
  );
}
