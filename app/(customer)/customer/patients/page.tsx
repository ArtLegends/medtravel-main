import TableShell from "@/components/customer/TableShell";

export default function PatientsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">List of Patient</h1>
        <p className="text-gray-600 mt-2">Manage and view all patient records</p>
      </div>

      <div className="rounded-xl border bg-white p-4 space-y-4">
        <div className="flex flex-wrap gap-2">
          <button className="border rounded-md px-3 py-2 text-sm hover:bg-gray-50">Refresh Patients</button>
          <button className="rounded-md px-3 py-2 text-sm bg-rose-500 text-white hover:bg-rose-600">Delete All</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select className="w-full px-3 py-2 border rounded-md">
            <option>All Statuses</option>
            <option>New</option>
            <option>Processed</option>
            <option>Rejected</option>
          </select>
          <button className="border rounded-md px-3 py-2 text-sm text-left">🗓 Start Date</button>
          <button className="border rounded-md px-3 py-2 text-sm text-left">🗓 End Date</button>
        </div>
      </div>

      <div className="rounded-xl border bg-white">
        <div className="p-4 border-b">
          <div className="text-lg font-semibold">Patients (0)</div>
        </div>
        <TableShell
          head={
            <>
              <th className="px-4 py-3 text-left">Patient ID</th>
              <th className="px-4 py-3 text-left">Patient Name</th>
              <th className="px-4 py-3 text-left">Phone</th>
              <th className="px-4 py-3 text-left">Treatment</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Pre-cost</th>
              <th className="px-4 py-3 text-left">Actual</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </>
          }
          empty={<span className="text-gray-500">No patients added yet</span>}
        />
        {/* Пагинация мок — при подключении данных заменим */}
        <div className="p-4 text-sm text-gray-500">Showing 0 of 0 patients</div>
      </div>
    </div>
  );
}
