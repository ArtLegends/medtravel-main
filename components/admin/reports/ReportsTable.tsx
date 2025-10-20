'use client'

import { useOptimistic, useTransition } from 'react'
import { deleteReportAction, updateReportStatusAction } from '@/app/(admin)/admin/reports/actions'

export type ReportRow = {
  id: string
  clinic_name: string | null   // денормализуем на уровне запроса
  name: string | null
  email: string | null
  phone: string | null
  relationship: string | null
  message: string | null
  status: string | null
  created_at: string
}

const STATUSES = ['New', 'In review', 'Resolved', 'Rejected'] as const

type OptimisticAction =
  | { type: 'update'; id: string; status: string }
  | { type: 'delete'; id: string }

export default function ReportsTable({ rows }: { rows: ReportRow[] }) {
  const [isPending, startTransition] = useTransition()

  const [state, apply] = useOptimistic<ReportRow[], OptimisticAction>(
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
    startTransition(() => apply({ type: 'update', id, status }))
    updateReportStatusAction(id, status).catch(console.error)
  }

  function onDelete(id: string) {
    if (!confirm('Delete this report?')) return
    startTransition(() => apply({ type: 'delete', id }))
    deleteReportAction(id).catch(console.error)
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left">
          <tr>
            <th className="px-4 py-3">Created</th>
            <th className="px-4 py-3">Clinic</th>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Phone</th>
            <th className="px-4 py-3">Relationship</th>
            <th className="px-4 py-3">Message</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {state.map(r => (
            <tr key={r.id} className="border-t align-top">
              <td className="px-4 py-2 whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</td>
              <td className="px-4 py-2">{r.clinic_name ?? '—'}</td>
              <td className="px-4 py-2">{r.name ?? '—'}</td>
              <td className="px-4 py-2">{r.email ?? '—'}</td>
              <td className="px-4 py-2">{r.phone ?? '—'}</td>
              <td className="px-4 py-2">{r.relationship ?? '—'}</td>
              <td className="px-4 py-2 max-w-[360px]">
                <div className="whitespace-pre-line break-words">{r.message ?? '—'}</div>
              </td>
              <td className="px-4 py-2">
                <select
                  className="rounded-md border px-2 py-1"
                  value={r.status ?? 'New'}
                  onChange={(e) => onStatus(r.id, e.target.value)}
                  disabled={isPending}
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
              <td className="px-4 py-2 text-right">
                <button
                  onClick={() => onDelete(r.id)}
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
              <td colSpan={9} className="px-4 py-10 text-center text-gray-500">No reports yet</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
