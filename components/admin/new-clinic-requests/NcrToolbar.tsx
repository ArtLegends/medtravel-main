'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { deleteAllNcrAction } from '@/app/(admin)/admin/new-clinic-requests/actions'

export default function NcrToolbar({ start, end }: { start?: string; end?: string }) {
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  function onDeleteAll() {
    const c1 = confirm('Delete ALL new clinic requests? This cannot be undone.')
    if (!c1) return
    const c2 = confirm('Are you absolutely sure?')
    if (!c2) return
    startTransition(async () => {
      await deleteAllNcrAction()
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <form method="GET" className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs text-gray-500">Start Date</label>
          <input type="date" name="start" defaultValue={start ?? ''} className="rounded-md border px-3 py-2" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">End Date</label>
          <input type="date" name="end" defaultValue={end ?? ''} className="rounded-md border px-3 py-2" />
        </div>
        <button className="rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700">Apply</button>
        <Link href="/admin/new-clinic-requests" className="rounded-md border px-4 py-2 hover:bg-gray-50">
          Clear Filters
        </Link>
      </form>

      <div className="grow" />

      <button
        onClick={onDeleteAll}
        disabled={pending}
        className="rounded-md bg-rose-600 px-4 py-2 text-white hover:bg-rose-700 disabled:opacity-60"
      >
        {pending ? 'Deleting…' : 'Delete all'}
      </button>
    </div>
  )
}
