// app/(customer)/customer/bookings/page.tsx
import Link from "next/link";

export default function CustomerBookings() {
  return (
    <>
      <div className="mb-6">
        <div className="text-xs text-gray-500">Customer Panel</div>
        <h1 className="text-xl font-semibold mt-1">Bookings</h1>
        <p className="text-sm text-gray-500">Manage booking requests for your clinic</p>
      </div>

      {/* Верхняя панель действий */}
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs text-gray-500">Start Date</label>
            <input type="date" className="rounded-md border px-3 py-2" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">End Date</label>
            <input type="date" className="rounded-md border px-3 py-2" />
          </div>
          <div className="w-64">
            <label className="mb-1 block text-xs text-gray-500">Search</label>
            <input className="w-full rounded-md border px-3 py-2" placeholder="Search by name or phone..." />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">All Statuses</label>
            <select className="rounded-md border px-3 py-2">
              <option>All Statuses</option>
              <option>New</option>
              <option>Processed</option>
              <option>Done</option>
              <option>Rejected</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">All Services</label>
            <select className="rounded-md border px-3 py-2">
              <option>All Services</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">All Methods</label>
            <select className="rounded-md border px-3 py-2">
              <option>All Methods</option>
            </select>
          </div>
          <button className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50">Reset Filters</button>
        </div>

        <div className="grow" />

        <div className="flex items-center gap-2">
          <button className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50">⟳ Refresh</button>
          <button className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50">🧪 Test DB</button>
          <button className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50">⬇ Export CSV</button>
          <button className="rounded-md bg-rose-600 px-3 py-2 text-sm text-white hover:bg-rose-700">🗑 Delete All</button>
        </div>
      </div>

      {/* Таблица */}
      <div className="overflow-x-auto rounded-xl border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left">
              {["Name", "Phone", "Contact Method", "Service", "Status", "Created At", "Actions"].map(h => (
                <th key={h} className="px-4 py-3 text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                No booking records found.<div className="text-xs text-gray-400 mt-1">Нет записей</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <button className="mt-4 inline-flex items-center rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700 hover:bg-rose-100">
        🗑 Delete All
      </button>
    </>
  );
}
