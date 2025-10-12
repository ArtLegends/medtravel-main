'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteAllBookingsAction } from '@/app/(admin)/admin/bookings/actions'
import Link from 'next/link'

export default function BookingsToolbar({
  start,
  end,
}: {
  start?: string
  end?: string
}) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  async function onDeleteAll() {
    const c1 = confirm('Delete ALL bookings? This cannot be undone.')
    if (!c1) return
    const c2 = confirm('Are you absolutely sure? This will remove ALL records.')
    if (!c2) return
    startTransition(async () => {
      await deleteAllBookingsAction()
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <form method="GET" className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Start Date</label>
          <input
            type="date"
            name="start"
            defaultValue={start ?? ''}
            className="rounded-md border px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">End Date</label>
          <input
            type="date"
            name="end"
            defaultValue={end ?? ''}
            className="rounded-md border px-3 py-2"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
        >
          Apply
        </button>
        <Link
          href="/admin/bookings"
          className="rounded-md border px-4 py-2 hover:bg-gray-50"
        >
          Clear Filters
        </Link>
      </form>

      <div className="grow" />

      <button
        onClick={onDeleteAll}
        disabled={isPending}
        className="rounded-md bg-rose-600 px-4 py-2 text-white hover:bg-rose-700 disabled:opacity-60"
      >
        {isPending ? 'Deleting…' : 'Delete all'}
      </button>
    </div>
  )
}
