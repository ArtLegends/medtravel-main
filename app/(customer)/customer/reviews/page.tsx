import TableShell from "@/components/customer/TableShell";

export default function ReviewsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reviews</h1>

      <div className="rounded-xl border bg-white p-4 space-y-4">
        <div className="flex flex-wrap gap-2">
          <button className="border rounded-md px-3 py-2 text-sm hover:bg-gray-50">Refresh</button>
          <button className="rounded-md px-3 py-2 text-sm bg-rose-500 text-white hover:bg-rose-600">Delete All</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select className="w-full px-3 py-2 border rounded-md">
            <option>All Statuses</option>
            <option>Pending</option><option>Published</option><option>Rejected</option>
          </select>
          <button className="border rounded-md px-3 py-2 text-sm text-left">🗓 Start Date</button>
          <button className="border rounded-md px-3 py-2 text-sm text-left">🗓 End Date</button>
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
      />
    </div>
  );
}
