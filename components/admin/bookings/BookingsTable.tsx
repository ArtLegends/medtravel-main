'use client'

import { useOptimistic, useTransition, startTransition } from 'react'
import { deleteBookingAction, updateBookingStatusAction } from '@/app/(admin)/admin/bookings/actions'

export type BookingRow = {
  id: string            // ⬅️ было uuid
  name: string | null
  phone: string | null
  contact_method: string | null
  service: string | null
  status: string | null
  created_at: string
}

const STATUSES = ['New','In review','Contacted','Scheduled','Done','Rejected'] as const

type OptimisticAction =
  | { type: 'update'; id: string; status: string }
  | { type: 'delete'; id: string }

export default function BookingsTable({ rows }: { rows: BookingRow[] }) {
  const [isPending, start] = useTransition()

  const [state, apply] = useOptimistic<BookingRow[], OptimisticAction>(
    rows,
    (prev, action) => {
      switch (action.type) {
        case 'update':
          return prev.map(r => r.id === action.id ? { ...r, status: action.status } : r)
        case 'delete':
          return prev.filter(r => r.id !== action.id)
        default:
          return prev
      }
    }
  )

  function onStatus(id: string, status: string) {
    // оптимистично в transition → пропадет warning
    start(() => apply({ type: 'update', id, status }))
    // серверное действие без ожидания UI
    updateBookingStatusAction(id, status).catch(console.error)
  }

  function onDelete(id: string) {
    if (!confirm('Delete this booking?')) return
    start(() => apply({ type: 'delete', id }))
    deleteBookingAction(id).catch(console.error)
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Phone</th>
            <th className="px-4 py-3">Contact Method</th>
            <th className="px-4 py-3">Service</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Created</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {state.map(row => (
            <tr key={row.id} className="border-t">
              <td className="px-4 py-2">{row.name ?? '—'}</td>
              <td className="px-4 py-2">{row.phone ?? '—'}</td>
              <td className="px-4 py-2">{row.contact_method ?? '—'}</td>
              <td className="px-4 py-2">{row.service ?? '—'}</td>

              <td className="px-4 py-2">
                <select
                  className="rounded-md border px-2 py-1"
                  value={row.status ?? 'New'}
                  onChange={(e) => onStatus(row.id, e.target.value)}
                  disabled={isPending}
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>

              <td className="px-4 py-2">{new Date(row.created_at).toLocaleString()}</td>

              <td className="px-4 py-2 text-right">
                <button
                  onClick={() => onDelete(row.id)}
                  disabled={isPending}
                  className="rounded-md bg-rose-600 px-3 py-1.5 text-white hover:bg-rose-700 disabled:opacity-50"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {state.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-10 text-center text-gray-500">No bookings yet</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
