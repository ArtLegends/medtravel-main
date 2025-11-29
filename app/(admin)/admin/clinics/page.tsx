// app/(admin)/admin/clinics/page.tsx
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/serviceClient';
import { ConfirmDeleteButton } from '@/components/admin/ConfirmDeleteButtons';

export const metadata = { title: 'Clinics • Admin' };

const PAGE_SIZE = 15;

type Search = { page?: string; from?: string; to?: string };

type Row = {
  id: string;
  name: string;
  country: string | null;
  city: string | null;
  created_at: string;
  status: 'published' | 'draft' | string | null;
};

async function getRows(searchParams: Search) {
  'use server';
  const sb = createServiceClient();

  const page = Math.max(1, Number(searchParams.page ?? 1) || 1);
  const from = searchParams.from ? new Date(`${searchParams.from}T00:00:00.000Z`).toISOString() : null;
  const to   = searchParams.to   ? new Date(`${searchParams.to}T23:59:59.999Z`).toISOString()   : null;

  let q = sb
    .from('clinics')
    .select('id,name,country,city,created_at,status', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (from) q = q.gte('created_at', from);
  if (to)   q = q.lte('created_at', to);

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

/** Каскадное удаление зависимостей вручную (FK без ON DELETE CASCADE) */
async function deleteCascade(sb: ReturnType<typeof createServiceClient>, clinicId: string) {
  const tablesOne = [
    'clinic_images',
    'clinic_hours',
    'clinic_staff',
    'clinic_services',
    'clinic_languages',
    'clinic_premises',
    'clinic_travel_services',
    'clinic_inquiries',
    'clinic_requests',
    'reports',
    'reviews',
    'clinic_translations',
    'clinic_categories',
    'clinic_accreditations',
  ];
  for (const t of tablesOne) {
    const { error } = await sb.from(t).delete().eq('clinic_id', clinicId);
    if (error) throw new Error(`${t}: ${error.message}`);
  }
  const { error } = await sb.from('doctors').delete().eq('clinic_id', clinicId);
  if (error) throw new Error(`doctors: ${error.message}`);
}

/** Удаление одной клиники — локальная server action (без export) */
async function deleteClinic(formData: FormData) {
  'use server';
  const clinicId = String(formData.get('clinicId') || '');
  const path = String(formData.get('path') || '/admin/clinics');
  if (!clinicId) return;

  const sb = createServiceClient();
  await deleteCascade(sb, clinicId);

  const { error } = await sb.from('clinics').delete().eq('id', clinicId);
  if (error) throw new Error(`clinics: ${error.message}`);

  revalidatePath(path);
}

/** Удаление всех клиник из текущего фильтра — локальная server action (без export) */
async function deleteAll(formData: FormData) {
  'use server';
  const from = String(formData.get('from') || '');
  const to   = String(formData.get('to')   || '');
  const path = String(formData.get('path') || '/admin/clinics');

  const sb = createServiceClient();

  let q = sb.from('clinics').select('id, created_at');
  if (from) q = q.gte('created_at', new Date(`${from}T00:00:00.000Z`).toISOString());
  if (to)   q = q.lte('created_at', new Date(`${to}T23:59:59.999Z`).toISOString());

  const { data, error } = await q;
  if (error) throw new Error(error.message);

  const ids = (data ?? []).map((r: any) => r.id as string);
  if (!ids.length) {
    revalidatePath(path);
    return;
  }

  const tablesOne = [
    'clinic_images',
    'clinic_hours',
    'clinic_staff',
    'clinic_services',
    'clinic_languages',
    'clinic_premises',
    'clinic_travel_services',
    'clinic_inquiries',
    'clinic_requests',
    'reports',
    'reviews',
    'clinic_translations',
    'clinic_categories',
    'clinic_accreditations',
  ];
  for (const t of tablesOne) {
    const { error: e } = await sb.from(t).delete().in('clinic_id', ids);
    if (e) throw new Error(`${t}: ${e.message}`);
  }
  {
    const { error: e } = await sb.from('doctors').delete().in('clinic_id', ids);
    if (e) throw new Error(`doctors: ${e.message}`);
  }
  {
    const { error: e } = await sb.from('clinics').delete().in('id', ids);
    if (e) throw new Error(`clinics: ${e.message}`);
  }

  revalidatePath(path);
  redirect(path);
}

function DateFilter({ from, to }: { from?: string; to?: string }) {
  return (
    <form className="flex items-end gap-2" action="/admin/clinics" method="get">
      <label className="text-sm">
        <div className="text-xs text-slate-600 mb-1">From</div>
        <input type="date" name="from" defaultValue={from} className="rounded border px-2 py-1" />
      </label>
      <label className="text-sm">
        <div className="text-xs text-slate-600 mb-1">To</div>
        <input type="date" name="to" defaultValue={to} className="rounded border px-2 py-1" />
      </label>
      <button className="rounded border px-3 py-1.5 text-sm bg-white hover:bg-slate-50">Apply</button>
      <a href="/admin/clinics" className="rounded border px-3 py-1.5 text-sm bg-white hover:bg-slate-50">
        Clear
      </a>
    </form>
  );
}

function Pager({ page, pageCount, from, to }: { page: number; pageCount: number; from?: string; to?: string }) {
  const mk = (p: number) => {
    const qs = new URLSearchParams();
    if (from) qs.set('from', from);
    if (to)   qs.set('to', to);
    qs.set('page', String(p));
    return `/admin/clinics?${qs.toString()}`;
  };
  return (
    <div className="flex items-center gap-2">
      <a
        href={mk(Math.max(1, page - 1))}
        className={`rounded border px-3 py-1.5 text-sm ${page <= 1 ? 'pointer-events-none opacity-50' : 'bg-white hover:bg-slate-50'}`}
      >
        ← Prev
      </a>
      <div className="text-sm text-slate-600">Page {page} / {pageCount}</div>
      <a
        href={mk(Math.min(pageCount, page + 1))}
        className={`rounded border px-3 py-1.5 text-sm ${page >= pageCount ? 'pointer-events-none opacity-50' : 'bg-white hover:bg-slate-50'}`}
      >
        Next →
      </a>
    </div>
  );
}

// <<< главный экспорт страницы c правильной типизацией >>>
export default async function ClinicsPage(
  { searchParams }: { searchParams: Promise<Search> }
) {
  const sp = await searchParams; // объект query
  const { rows, page, pageCount, total } = await getRows(sp);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Clinics</h1>

        <div className="flex items-center gap-3">
          <DateFilter from={sp.from} to={sp.to} />
          <form action={deleteAll}>
            <input type="hidden" name="from" value={sp.from || ''} />
            <input type="hidden" name="to" value={sp.to || ''} />
            <input type="hidden" name="path" value="/admin/clinics" />
            <ConfirmDeleteButton
              label="Delete all"
              confirmMessage="Are you sure you want to delete ALL clinics in this filter (with all related data)? This action cannot be undone."
              className="rounded border px-3 py-1.5 text-sm bg-white hover:bg-slate-50 text-red-600 disabled:opacity-50 disabled:pointer-events-none"
              disabled={total === 0}
            />
          </form>
        </div>
      </div>

      <div className="rounded-lg border bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Country</th>
              <th className="p-3">City</th>
              <th className="p-3">Created</th>
              <th className="p-3">Status</th>
              <th className="p-3 w-1 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={6} className="p-6 text-center text-slate-500">No clinics found.</td></tr>
            ) : rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-3">
                  <a
                    href={`/admin/clinics/${encodeURIComponent(r.id)}`}
                    className="text-blue-600 hover:underline"
                  >
                    {r.name}
                  </a>
                </td>
                <td className="p-3">{r.country || '—'}</td>
                <td className="p-3">{r.city || '—'}</td>
                <td className="p-3">{new Date(r.created_at).toLocaleString()}</td>
                <td className="p-3 capitalize">{(r.status || 'draft').toString()}</td>
                <td className="p-3">
                  <div className="flex items-center justify-end">
                    <form action={deleteClinic}>
                      <input type="hidden" name="clinicId" value={r.id} />
                      <input type="hidden" name="path" value="/admin/clinics" />
                      <ConfirmDeleteButton
                        label="Delete"
                        confirmMessage="Delete this clinic and all related data? This cannot be undone."
                        className="rounded border px-2 py-1 text-xs text-red-600 bg-white hover:bg-slate-50"
                      />
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-600">Total: {total}</div>
        <Pager page={page} pageCount={pageCount} from={sp.from} to={sp.to} />
      </div>
    </div>
  );
}
