'use client';

import { useOptimistic, useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { updateContactStatusAction, deleteContactAction, deleteAllContactsAction } from '@/app/(admin)/admin/contacts/actions';

export type ContactRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
  created_at: string;
  status: string | null;
};

type Props = {
  rows: ContactRow[];
  total: number;
  page: number;
  pages: number;
  start?: string;  // ISO 8601
  end?: string;    // ISO 8601
  limit: number;
};

function toInputDate(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  // YYYY-MM-DD
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}
function toISOmidnightLocal(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString();
}
function toISOendOfDayLocal(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T23:59:59.999');
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString();
}

export default function ContactsTable(props: Props) {
  const { rows, page, pages, start, end } = props;

  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const startDate = toInputDate(start);
  const endDate   = toInputDate(end);

  const buildHref = (p: number, sd?: string, ed?: string) => {
    const s = new URLSearchParams(sp?.toString() || '');
    s.set('page', String(p));
    if (sd) s.set('start', toISOmidnightLocal(sd)); else s.delete('start');
    if (ed) s.set('end',   toISOendOfDayLocal(ed)); else s.delete('end');
    return `${pathname}?${s.toString()}`;
  };

  const applyFilters = () => {
    const form = document.getElementById('contacts-filters') as HTMLFormElement | null;
    const fd = new FormData(form || undefined);
    const sd = String(fd.get('startDate') || '');
    const ed = String(fd.get('endDate') || '');
    router.push(buildHref(1, sd || undefined, ed || undefined));
  };

  const clearFilters = () => {
    router.push(`${pathname}?page=1`);
  };

  const goPrev = () => {
    if (page <= 1) return;
    router.push(buildHref(page - 1, startDate || undefined, endDate || undefined));
  };
  const goNext = () => {
    if (page >= pages) return;
    router.push(buildHref(page + 1, startDate || undefined, endDate || undefined));
  };

  const [state, apply] = useOptimistic(
    rows,
    (prev, upd: (Partial<ContactRow> & { id: string }) | { id: string; _delete: true }) => {
      if ('_delete' in upd) return prev.filter(r => r.id !== upd.id);
      return prev.map(r => (r.id === upd.id ? { ...r, ...upd } : r));
    }
  );

  const onStatus = (id: string, status: string) => {
    startTransition(async () => {
      apply({ id, status });
      try { await updateContactStatusAction(id, status); } catch {}
    });
  };

  const onDelete = (id: string) => {
    if (!confirm('Delete this contact message?')) return;
    startTransition(async () => {
      apply({ id, _delete: true });
      try { await deleteContactAction(id); } catch {}
    });
  };

  const onDeleteAll = () => {
    if (!confirm('Delete ALL contacts that match current filter?')) return;
    if (!confirm('Are you absolutely sure? This cannot be undone.')) return;
    startTransition(async () => {
      await deleteAllContactsAction({
        start: start || '',
        end: end || '',
      });
    });
  };

  return (
    <div className="rounded-lg border bg-white">
      {/* Панель фильтров + Delete all */}
      <div className="flex flex-wrap items-end justify-between gap-2 p-3">
        <form id="contacts-filters" className="flex flex-wrap items-end gap-2">
          <div>
            <div className="text-xs text-gray-500 mb-1">Start date</div>
            <input name="startDate" type="date" defaultValue={startDate} className="rounded border px-2 py-1" />
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">End date</div>
            <input name="endDate" type="date" defaultValue={endDate} className="rounded border px-2 py-1" />
          </div>
          <button type="button" onClick={applyFilters} className="rounded bg-emerald-600 px-3 py-1.5 text-white">Apply</button>
          <button type="button" onClick={clearFilters} className="rounded border px-3 py-1.5">Clear</button>
        </form>

        <button
          onClick={onDeleteAll}
          disabled={isPending}
          className="rounded-md bg-rose-600 px-3 py-1.5 text-white disabled:opacity-50"
        >
          Delete all
        </button>
      </div>

      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left">
          <tr>
            <th className="p-3">Name</th>
            <th className="p-3">Email</th>
            <th className="p-3">Phone</th>
            <th className="p-3">Created</th>
            <th className="p-3">Status</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {state.length === 0 ? (
            <tr><td className="p-3 text-gray-500" colSpan={6}>No contacts yet</td></tr>
          ) : state.map(r => (
            <tr key={r.id} className="border-t">
              <td className="p-3">{[r.first_name, r.last_name].filter(Boolean).join(' ') || '—'}</td>
              <td className="p-3">{r.email}</td>
              <td className="p-3">{r.phone || '—'}</td>
              <td className="p-3">{new Date(r.created_at).toLocaleString()}</td>
              <td className="p-3">
                <select
                  className="rounded-md border px-2 py-1"
                  defaultValue={r.status ?? 'New'}
                  onChange={(e) => onStatus(r.id, e.target.value)}
                  disabled={isPending}
                >
                  <option>New</option>
                  <option>In review</option>
                  <option>Contacted</option>
                  <option>Done</option>
                  <option>Rejected</option>
                </select>
              </td>
              <td className="p-3 text-right">
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
        </tbody>
      </table>

      {/* Пагинация */}
      <div className="flex items-center justify-between p-3 text-sm">
        <div>Page {page} of {pages} · {props.limit} per page</div>
        <div className="flex gap-2">
          <button onClick={goPrev} disabled={page <= 1} className="rounded border px-3 py-1.5 disabled:opacity-50">Prev</button>
          <button onClick={goNext} disabled={page >= pages} className="rounded border px-3 py-1.5 disabled:opacity-50">Next</button>
        </div>
      </div>
    </div>
  );
}
