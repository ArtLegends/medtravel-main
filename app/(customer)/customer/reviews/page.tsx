// app/(customer)/customer/reviews/page.tsx
import TableShell from '@/components/customer/TableShell';
import { supabaseServer } from '@/lib/supabase/server';
import { getCurrentClinicId } from '@/app/(customer)/customer/_utils/getCurrentClinicId';
import { updateReviewStatusAction, deleteReviewAction, deleteAllReviewsAction } from './actions';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Row = {
  id: string;
  clinic_id: string | null;
  created_at: string | null;
  reviewer: string | null;
  rating: string | number | null; // numeric из вьюхи
  comment: string | null;
  status: string | null;
};

export default async function ReviewsPage() {
  const clinicId = await getCurrentClinicId();
  if (!clinicId) return <div className="p-6 text-rose-600">Please set clinic cookie to view reviews.</div>;

  const { data } = await supabaseServer
    .from('v_customer_reviews' as any)
    .select('*')
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: false });

  const rows = (data ?? []) as unknown as Row[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reviews</h1>
          <p className="text-gray-500">Manage clinic reviews</p>
        </div>
        <form action={deleteAllReviewsAction}>
          <button className="rounded-md px-3 py-2 text-sm bg-rose-500 text-white hover:bg-rose-600">
            Delete All
          </button>
        </form>
      </div>

      {/* простые фильтры-заглушки, как в других разделах */}
      <div className="rounded-xl border bg-white p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select className="w-full px-3 py-2 border rounded-md">
            <option>All Statuses</option>
            <option>new</option><option>published</option><option>rejected</option>
          </select>
          <input type="date" className="w-full px-3 py-2 border rounded-md" />
          <input type="date" className="w-full px-3 py-2 border rounded-md" />
        </div>
      </div>

      <TableShell
        head={
          <>
            <th className="px-4 py-3 text-left">Date</th>
            <th className="px-4 py-3 text-left">Reviewer</th>
            <th className="px-4 py-3 text-left">Rating</th>
            <th className="px-4 py-3 text-left">Comment</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Actions</th>
          </>
        }
        empty={<span className="text-gray-500">No reviews yet</span>}
      >
        {rows.map((r) => (
          <tr key={r.id} className="border-t">
            <td className="px-4 py-2">{r.created_at ? new Date(r.created_at).toLocaleString() : '—'}</td>
            <td className="px-4 py-2">{r.reviewer ?? '—'}</td>
            <td className="px-4 py-2">{r.rating ?? '—'}</td>
            <td className="px-4 py-2 max-w-[520px] truncate">{r.comment ?? '—'}</td>
            <td className="px-4 py-2">
              <form action={async (fd) => {
                'use server';
                const val = fd.get('status')?.toString() ?? 'new';
                await updateReviewStatusAction(r.id, val);
              }}>
                <select name="status" defaultValue={r.status ?? 'new'} className="rounded border px-2 py-1">
                  {['new','published','rejected'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <button className="ml-2 rounded border px-2 py-1 text-sm">Save</button>
              </form>
            </td>
            <td className="px-4 py-2">
              <form action={async () => { 'use server'; await deleteReviewAction(r.id); }}>
                <button className="rounded-md bg-rose-500 px-3 py-1.5 text-white hover:bg-rose-600">Delete</button>
              </form>
            </td>
          </tr>
        ))}
      </TableShell>
    </div>
  );
}
