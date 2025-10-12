'use client';

import { useOptimistic, useTransition, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  updateClinicInquiryStatusAction,
  deleteClinicInquiryAction,
  deleteAllClinicInquiriesAction,
} from '@/app/(admin)/admin/clinic-inquiries/actions';

export type Row = {
  id: string;
  created_at: string;
  clinic_slug: string;
  clinic_name: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  message: string | null;
  status: string | null;
};

type Props = {
  rows: Row[];
  total: number;
  page: number;
  pages: number;
  start?: string;
  end?: string;
  limit: number;
};

// util: ISO → value для <input type="date">
function isoToDateInput(v?: string) {
  if (!v) return '';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '';
  // yyyy-mm-dd (локаль не нужна)
  return d.toISOString().slice(0, 10);
}

export default function ClinicInquiriesTable(props: Props) {
  const { rows, start, end, page, pages } = props;

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const basePath = pathname ?? '';

  // локальные значения фильтров (контролируемые date input)
  const [startDate, setStartDate] = useState<string>(isoToDateInput(start));
  const [endDate, setEndDate] = useState<string>(isoToDateInput(end));

  // строим href с сохранением фильтров
  const buildHref = useMemo<(p: number, s?: string, e?: string) => string>(() => {
    return (p, s, e) => {
      const qs = new URLSearchParams(searchParams?.toString() ?? '');

      qs.delete('page'); qs.delete('start'); qs.delete('end');

      if (p > 1) qs.set('page', String(p));
      if (s) qs.set('start', new Date(s).toISOString());
      if (e) qs.set('end', new Date(e).toISOString());

      const q = qs.toString();
      return q ? `${basePath}?${q}` : basePath;
    };
  }, [basePath, searchParams]);

  const [isPending, startTransition] = useTransition();

  const [state, apply] = useOptimistic(
    rows,
    (prev, upd: (Partial<Row> & { id: string }) | { id: string; _delete: true }) => {
      if ('_delete' in upd) return prev.filter(r => r.id !== upd.id);
      return prev.map(r => (r.id === upd.id ? { ...r, ...upd } : r));
    }
  );

  // ——— actions (обёрнуты в startTransition) ———
  const onStatus = (id: string, status: string) => {
    startTransition(async () => {
      apply({ id, status });
      await updateClinicInquiryStatusAction(id, status);
    });
  };

  const onDelete = (id: string) => {
    if (!confirm('Delete this inquiry?')) return;
    startTransition(async () => {
      apply({ id, _delete: true });
      await deleteClinicInquiryAction(id);
    });
  };

  const onDeleteAll = () => {
    if (!confirm('Delete ALL inquiries that match the current filter?')) return;
    if (!confirm('Are you absolutely sure? This cannot be undone.')) return;
    startTransition(async () => {
      await deleteAllClinicInquiriesAction({
        start: startDate ? new Date(startDate).toISOString() : '',
        end: endDate ? new Date(endDate).toISOString() : '',
      });
    });
  };

  // ——— фильтры ———
  const applyFilters = () => {
    const href = buildHref(1, startDate || undefined, endDate || undefined);
    router.push(href ?? '');
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    router.push(pathname ?? '');
  };

  // ——— пагинация ———
  const goPrev = () => {
    if (page <= 1) return;
    // router.push(buildHref(page - 1, startDate || undefined, endDate || undefined));
  };
  const goNext = () => {
    if (page >= pages) return;
    // router.push(buildHref(page + 1, startDate || undefined, endDate || undefined));
  };

  return (
    <div className="rounded-lg border bg-white">
      {/* Фильтр дат + Delete all */}
      <div className="flex flex-wrap items-end justify-between gap-3 p-3">
        <div className="flex flex-wrap items-end gap-2">
          <div>
            <div className="text-xs text-gray-500 mb-1">Start date</div>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="rounded-md border px-2 py-1"
            />
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">End date</div>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="rounded-md border px-2 py-1"
            />
          </div>
          <button
            onClick={applyFilters}
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-white hover:bg-emerald-700"
          >
            Apply
          </button>
          <button
            onClick={clearFilters}
            className="rounded-md border px-3 py-1.5 hover:bg-gray-50"
          >
            Clear filters
          </button>
        </div>

        <button
          onClick={onDeleteAll}
          disabled={isPending}
          className="rounded-md bg-rose-600 px-3 py-1.5 text-white disabled:opacity-50"
        >
          Delete all
        </button>
      </div>

      {/* Таблица */}
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left">
          <tr>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Clinic</th>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Contact</th>
            <th className="px-4 py-3">Message</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {state.map(r => (
            <tr key={r.id} className="border-t">
              <td className="px-4 py-2">{new Date(r.created_at).toLocaleString()}</td>
              <td className="px-4 py-2">
                <a className="text-primary hover:underline" href={`/clinic/${r.clinic_slug}`} target="_blank">
                  {r.clinic_name}
                </a>
              </td>
              <td className="px-4 py-2">{r.name ?? '—'}</td>
              <td className="px-4 py-2">
                <div className="space-y-0.5">
                  {r.phone ?? '—'}
                  {r.email ? <div className="text-xs text-gray-500">{r.email}</div> : null}
                </div>
              </td>
              <td className="px-4 py-2">{r.message ?? '—'}</td>
              <td className="px-4 py-2">
                <select
                  className="rounded-md border px-2 py-1"
                  defaultValue={r.status ?? 'New'}
                  onChange={(e) => onStatus(r.id, e.target.value)}
                  disabled={isPending}
                >
                  <option>New</option>
                  <option>In review</option>
                  <option>Contacted</option>
                  <option>Scheduled</option>
                  <option>Done</option>
                  <option>Rejected</option>
                </select>
              </td>
              <td className="px-4 py-2 text-right">
                <button
                  className="rounded-md bg-rose-600 px-3 py-1.5 text-white hover:bg-rose-700 disabled:opacity-50"
                  onClick={() => onDelete(r.id)}
                  disabled={isPending}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {state.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                No inquiries yet
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Пагинация */}
      <div className="flex items-center justify-between border-t p-3 text-sm">
        <div>
          Page {page} of {pages} • {props.limit} per page
        </div>
        <div className="flex gap-2">
          <button
            onClick={goPrev}
            disabled={page <= 1}
            className="rounded-md border px-3 py-1.5 disabled:opacity-50"
          >
            Prev
          </button>
          <button
            onClick={goNext}
            disabled={page >= pages}
            className="rounded-md border px-3 py-1.5 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
