// components/admin/clinic-requests/ClinicRequestsTable.tsx
'use client'

import { useState } from 'react'

export type Row = {
  id: string
  clinic_id: string
  service_id: number | null
  doctor_id: string | null
  name: string | null
  phone: string | null
  contact_method: string | null
  status: string | null
  created_at: string
  clinics?: { id: string; name: string } | null
}

const STATUSES = ['New', 'In review', 'Contacted', 'Scheduled', 'Done', 'Rejected'] as const

export default function ClinicRequestsTable({
  rows,
  total,
  page,
  pageSize,
  onChangeStatus,
  onDelete,
  onDeleteAll,
}: {
  rows: Row[]
  total: number
  page: number
  pageSize: number
  onChangeStatus: (id: string, status: Row['status']) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onDeleteAll: () => Promise<void>
}) {
  const [busy, setBusy] = useState<string | null>(null)

  const pages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="rounded-xl border">

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Contact</th>
              <th className="p-3">Clinic</th>
              <th className="p-3">Service</th>
              <th className="p-3">Status</th>
              <th className="p-3">Created</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="p-3">{r.name ?? '—'}</td>
                <td className="p-3">{r.phone ?? '—'}</td>
                <td className="p-3">{r.contact_method ?? '—'}</td>

                {/* название клиники из join */}
                <td className="p-3">{r.clinics?.name ?? '—'}</td>

                {/* именно ID услуги */}
                <td className="p-3">{r.service_id ?? '—'}</td>

                <td className="p-3">
                  <select
                    value={r.status ?? 'New'} // select всегда получает string
                    onChange={async (e) => {
                      const val = e.target.value as Row['status']
                      setBusy(r.id)
                      await onChangeStatus(r.id, val)
                      setBusy(null)
                    }}
                    disabled={busy === r.id}
                    className="rounded border px-2 py-1"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>

                <td className="p-3">{new Date(r.created_at).toLocaleString()}</td>

                <td className="p-3 text-right">
                  <button
                    onClick={async () => {
                      setBusy(r.id)
                      await onDelete(r.id)
                      setBusy(null)
                    }}
                    disabled={busy === r.id}
                    className="rounded-md bg-rose-600 px-3 py-1.5 text-white hover:bg-rose-700 disabled:opacity-60"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td className="p-6 text-center text-gray-500" colSpan={8}>
                  No requests found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
