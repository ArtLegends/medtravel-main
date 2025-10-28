'use client'

import { useTransition } from 'react'
import { updateNcrStatusAction, deleteNcrAction } from '@/app/(admin)/admin/new-clinic-requests/actions'

type Row = {
  id: string
  created_at: string
  clinic_name: string
  country: string | null
  city: string | null
  contact_first_name: string | null
  contact_last_name: string | null
  email: string | null
  phone: string | null
  status: 'new'|'in_progress'|'approved'|'rejected'
}

export default function NcrTable({ rows }: { rows: Row[] }) {
  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr className="[&>th]:px-4 [&>th]:py-2 text-left">
            <th>Created</th>
            <th>Clinic</th>
            <th>Contact</th>
            <th>Location</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Status</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-6 text-center text-gray-500">No requests yet.</td>
            </tr>
          ) : (
            rows.map(r => <NcrRow key={r.id} row={r} />)
          )}
        </tbody>
      </table>
    </div>
  )
}

function NcrRow({ row }: { row: Row }) {
  const [pending, start] = useTransition()

  const onStatus = (v: Row['status']) => start(async () => {
    await updateNcrStatusAction(row.id, v)
  })

  const onDelete = () => {
    if (!confirm('Delete this request?')) return
    start(async () => {
      await deleteNcrAction(row.id)
    })
  }

  const contact = [row.contact_first_name, row.contact_last_name].filter(Boolean).join(' ')
  const loc = [row.city, row.country].filter(Boolean).join(', ')
  const created = new Date(row.created_at).toLocaleString()

  return (
    <tr className="[&>td]:px-4 [&>td]:py-2 border-t">
      <td>{created}</td>
      <td>{row.clinic_name}</td>
      <td>{contact || '—'}</td>
      <td>{loc || '—'}</td>
      <td>{row.email || '—'}</td>
      <td>{row.phone || '—'}</td>
      <td>
        <select
          disabled={pending}
          defaultValue={row.status}
          onChange={e => onStatus(e.target.value as Row['status'])}
          className="rounded border px-2 py-1"
        >
          <option value="new">new</option>
          <option value="in_progress">in progress</option>
          <option value="approved">approved</option>
          <option value="rejected">rejected</option>
        </select>
      </td>
      <td className="text-right">
        <button
          onClick={onDelete}
          disabled={pending}
          className="rounded bg-rose-600 px-3 py-1 text-white hover:bg-rose-700 disabled:opacity-60"
        >
          Delete
        </button>
      </td>
    </tr>
  )
}
