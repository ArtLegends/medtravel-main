'use client';

import { useState, useTransition } from 'react';
import { updateCustomerRequestStatusAction, deleteCustomerRequestAction, deleteAllCustomerRequestsAction } from '@/app/(customer)/customer/[handle]/bookings/actions';

export type Row = {
  id: string;
  clinic_id: string | null;
  name: string | null;
  phone: string | null;
  contact_method: string | null;
  service: string | null;
  status: string | null;
  created_at: string | null;
};

const STATUSES = ['New','In review','Contacted','Scheduled','Done','Rejected'] as const;

export default function CustomerBookingsTable({ rows }: { rows: Row[] }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="rounded-xl border bg-white overflow-x-auto">
      <div className="p-3 flex items-center justify-between gap-2 border-b">
        <div className="text-sm text-gray-600">Total: {rows.length}</div>
        <div className="flex items-center gap-2">
          <button
            className="rounded-md bg-rose-600 px-3 py-1.5 text-white hover:bg-rose-700 disabled:opacity-60"
            disabled={isPending}
            onClick={() => {
              const c1 = confirm('Delete ALL bookings for your clinic?');
              const c2 = c1 && confirm('Are you absolutely sure? This cannot be undone.');
              if (!c2) return;
              startTransition(async () => { await deleteAllCustomerRequestsAction(); });
            }}
          >
            {isPending ? 'Deleting…' : 'Delete all'}
          </button>
        </div>
      </div>

      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-left">
          <tr>
            <th className="p-3">Name</th>
            <th className="p-3">Phone</th>
            <th className="p-3">Contact Method</th>
            <th className="p-3">Service</th>
            <th className="p-3">Status</th>
            <th className="p-3">Created At</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((r) => (
            <tr key={r.id}>
              <td className="p-3">{r.name ?? '—'}</td>
              <td className="p-3">{r.phone ?? '—'}</td>
              <td className="p-3">{r.contact_method ?? '—'}</td>
              <td className="p-3">{r.service ?? '—'}</td>
              <td className="p-3">
                <select
                  value={r.status ?? 'New'}
                  disabled={busy === r.id}
                  className="rounded border px-2 py-1"
                  onChange={async (e) => {
                    const next = e.target.value;
                    setBusy(r.id);
                    await updateCustomerRequestStatusAction(r.id, next);
                    setBusy(null);
                  }}
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
              <td className="p-3">{r.created_at ? new Date(r.created_at).toLocaleString() : '—'}</td>
              <td className="p-3 text-right">
                <button
                  className="rounded-md bg-rose-600 px-3 py-1.5 text-white hover:bg-rose-700 disabled:opacity-60"
                  disabled={busy === r.id}
                  onClick={async () => {
                    if (!confirm('Delete this booking?')) return;
                    setBusy(r.id);
                    await deleteCustomerRequestAction(r.id);
                    setBusy(null);
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {rows.length === 0 && (
            <tr>
              <td className="p-6 text-center text-gray-500" colSpan={7}>
                No booking records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
