'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { deleteAllClinicRequestsAction } from '@/app/(admin)/admin/clinic-requests/actions';

export default function ClinicRequestsToolbar({
  start,
  end,
}: {
  start?: string;
  end?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function onDeleteAll() {
    const c1 = confirm('Delete ALL requests that match current filter?');
    if (!c1) return;
    const c2 = confirm('Are you absolutely sure? This cannot be undone.');
    if (!c2) return;

    startTransition(async () => {
      await deleteAllClinicRequestsAction({ start, end });
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <form method="GET" className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Start date</label>
          <input type="date" name="start" defaultValue={start ?? ''} className="rounded-md border px-3 py-2" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">End date</label>
          <input type="date" name="end" defaultValue={end ?? ''} className="rounded-md border px-3 py-2" />
        </div>
        <button type="submit" className="rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700">
          Apply
        </button>
        <Link href="/admin/clinic-requests" className="rounded-md border px-4 py-2 hover:bg-gray-50">
          Clear filters
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
  );
}
