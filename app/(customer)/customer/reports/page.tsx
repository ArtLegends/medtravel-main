export const metadata = { title: 'Customer • Reports' };

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <header>
        <div className="text-sm text-gray-500">Customer Panel</div>
        <h1 className="text-2xl font-semibold">Reports</h1>
        <p className="text-sm text-gray-600">
          Manage user-submitted reports about clinic information
        </p>
      </header>

      <div className="rounded-xl border bg-white p-4">
        <div className="mb-3 flex flex-wrap items-end gap-3">
          <button className="rounded-md border px-3 py-2 text-sm">
            ⟳ Refresh Reports
          </button>
          <button className="rounded-md bg-rose-600 px-3 py-2 text-sm text-white">
            🗑 Delete All
          </button>
          <div className="grow" />
          <select className="rounded-md border px-3 py-2 text-sm">
            <option>All Statuses</option>
          </select>
          <input type="date" className="rounded-md border px-3 py-2 text-sm" />
          <input type="date" className="rounded-md border px-3 py-2 text-sm" />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Clinic</th>
                <th className="px-3 py-2">Reporter</th>
                <th className="px-3 py-2">Contact</th>
                <th className="px-3 py-2">Relationship</th>
                <th className="px-3 py-2">Details</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-gray-500">
                  No reports found
                  <div className="mt-2 text-xs text-gray-400">
                    List of user-submitted reports
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
