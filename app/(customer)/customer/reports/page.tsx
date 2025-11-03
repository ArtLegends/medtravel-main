import TableShell from "@/components/customer/TableShell";
import { sbAdmin, getDevCustomerContext } from "@/lib/supabase/adminClient";

export default async function CustomerReports() {
  const { clinicId } = getDevCustomerContext();

  const { data, error } = await sbAdmin
    .from("v_customer_reports")
    .select("*")
    .eq("clinic_id", clinicId)
    .order("created_at", { ascending: false });

  if (error) return <pre className="text-red-600">{error.message}</pre>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-gray-500">
            Manage user-submitted reports about clinic information
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-gray-50">
            {/* icon placeholder */}⟳
            Refresh Reports
          </button>
          <button className="inline-flex items-center gap-2 rounded-md bg-rose-500 px-3 py-2 text-sm text-white hover:bg-rose-600">
            {/* icon placeholder */}🗑
            Delete All
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border bg-white p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {/* Status */}
          <div className="space-y-2 md:col-span-1">
            <label className="text-sm font-medium">All Statuses</label>
            <select
              className="w-full rounded-md border px-3 py-2"
              defaultValue=""
              disabled
            >
              <option value="">All Statuses</option>
              <option value="new">New</option>
              <option value="processed">Processed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Start Date */}
          <div className="space-y-2 md:col-span-1">
            <label className="text-sm font-medium">Start Date</label>
            <input
              type="date"
              className="w-full rounded-md border px-3 py-2"
              disabled
            />
          </div>

          {/* End Date */}
          <div className="space-y-2 md:col-span-1">
            <label className="text-sm font-medium">End Date</label>
            <input
              type="date"
              className="w-full rounded-md border px-3 py-2"
              disabled
            />
          </div>

          {/* Spacer / align right on desktop */}
          <div className="flex items-end justify-end md:col-span-1">
            <button className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50" disabled>
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <TableShell
        head={
          <>
            <th className="px-4 py-3 text-left">Date</th>
            <th className="px-4 py-3 text-left">Clinic</th>
            <th className="px-4 py-3 text-left">Reporter</th>
            <th className="px-4 py-3 text-left">Contact</th>
            <th className="px-4 py-3 text-left">Relationship</th>
            <th className="px-4 py-3 text-left">Details</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Actions</th>
          </>
        }
        empty={
          <div className="flex flex-col items-center gap-2">
            <span className="text-gray-500">No reports found</span>
            <span className="text-xs text-gray-400">
              List of user-submitted reports
            </span>
          </div>
        }
      >
        {data?.map((r) => (
          <tr key={r.id} className="border-t">
            <td className="px-4 py-2">
              {new Date(r.created_at).toLocaleDateString()}
            </td>
            <td className="px-4 py-2">{r.clinic_name ?? "—"}</td>
            <td className="px-4 py-2">{r.reporter}</td>
            <td className="px-4 py-2">{r.contact}</td>
            <td className="px-4 py-2">{r.relationship ?? "—"}</td>
            <td className="px-4 py-2 max-w-[420px] truncate">{r.details}</td>
            <td className="px-4 py-2 capitalize">{r.status}</td>
            <td className="px-4 py-2">
              <span className="text-gray-400">—</span>
            </td>
          </tr>
        ))}
      </TableShell>
    </div>
  );
}
