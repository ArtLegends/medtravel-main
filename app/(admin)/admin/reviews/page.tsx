// app/(admin)/admin/reviews/page.tsx
import { listReviews, updateReviewStatus, deleteReview, deleteAllReviews } from './actions';
import { revalidatePath } from 'next/cache';
import { StatusForm } from './StatusForm';
import { DeleteBtn } from './DeleteBtn';
import { DeleteAllBtn } from './DeleteAllBtn';

function fmtDate(v?: string|null) {
  if (!v) return '—';
  try { return new Date(v).toLocaleString(); } catch { return v!; }
}

// ✅ searchParams теперь Promise<...>
export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; start?: string; end?: string }>
}) {
  // ✅ ждем перед использованием
  const sp = await searchParams;
  const page  = Number(sp.page  ?? '1') || 1;
  const start = sp.start ?? null;
  const end   = sp.end   ?? null;

  const { rows, count, limit } = await listReviews({ page, start, end });
  const pages = Math.max(1, Math.ceil(count / limit));

  // server actions
  async function doUpdate(formData: FormData) {
    'use server';
    await updateReviewStatus({
      id: String(formData.get('id')),
      status: String(formData.get('status')) as any,
    });
    revalidatePath('/admin/reviews');
  }

  async function doDelete(formData: FormData) {
    'use server';
    await deleteReview(String(formData.get('id')));
    revalidatePath('/admin/reviews');
  }

  async function doDeleteAll() {
    'use server';
    await deleteAllReviews({ start, end });
    revalidatePath('/admin/reviews');
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Reviews</h1>

      {/* Filters */}
      <form className="mb-4 flex flex-wrap items-end gap-2">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Start Date</label>
          <input type="date" name="start" defaultValue={start ?? ''} className="rounded border px-2 py-1" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">End Date</label>
          <input type="date" name="end" defaultValue={end ?? ''} className="rounded border px-2 py-1" />
        </div>
        <button formAction="/admin/reviews" className="rounded bg-gray-800 text-white px-3 py-2">
          Apply
        </button>

        <div className="ml-auto">
          {/* ✅ Кнопка удаления вынесена в клиент */}
          <DeleteAllBtn action={doDeleteAll} />
        </div>
      </form>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Clinic</th>
              <th className="p-3">Author</th>
              <th className="p-3">Rating</th>
              <th className="p-3">Created</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map(r => (
              <tr key={r.id}>
                <td className="p-3">{r.clinic_name}</td>
                <td className="p-3">{r.author ?? '—'}</td>
                <td className="p-3">{r.rating ?? '—'}/10</td>
                <td className="p-3">{fmtDate(r.created_at)}</td>
                <td className="p-3">
                  {/* ✅ Селект статуса — клиентский компонент с form action */}
                  <StatusForm id={r.id} initial={r.status} action={doUpdate} />
                </td>
                <td className="p-3 text-right">
                  {/* ✅ Delete с confirm в клиенте */}
                  <DeleteBtn id={r.id} action={doDelete} />
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td className="p-4 text-gray-500" colSpan={6}>No reviews found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-3 flex items-center justify-center gap-2">
        <a
          className={`rounded border px-3 py-1 ${page <= 1 ? 'pointer-events-none opacity-40' : ''}`}
          href={`/admin/reviews?${new URLSearchParams({ page: String(page-1), ...(start ? {start} : {}), ...(end ? {end} : {}) })}`}
        >‹ Previous</a>

        <span className="px-2 text-sm">Page {page}</span>

        <a
          className={`rounded border px-3 py-1 ${page * limit >= count ? 'pointer-events-none opacity-40' : ''}`}
          href={`/admin/reviews?${new URLSearchParams({ page: String(page+1), ...(start ? {start} : {}), ...(end ? {end} : {}) })}`}
        >Next ›</a>
      </div>
    </div>
  );
}
