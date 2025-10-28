// app/(customer)/customer/patients/page.tsx
export default function CustomerPatients() {
  const rows = [
    { id: "PID 21201", name: "Charlene Reed", phone: "+7(937) 394 - 57 - 53", treatment: "veneers",  status: "Processed", prelim: "$ 4 000", actual: "$ 4 300" },
    { id: "PID 21304", name: "Carl Kelly",     phone: "+7(937) 394 - 57 - 53", treatment: "crowns",   status: "New",       prelim: "$ 1 300", actual: "$ 1 100" },
    { id: "PID 22145", name: "Michelle Fairfax", phone: "+7(937) 394 - 57 - 53", treatment: "plastic surgery", status: "Rejected",  prelim: "$ 2 000", actual: "$ 2 000" },
    { id: "PID 22512", name: "Gina Moore",    phone: "+7(937) 394 - 57 - 53", treatment: "dentistry", status: "Processed", prelim: "$ 3 200", actual: "$ 3 500" },
  ];

  const badge = (s: string) => {
    if (s === "Processed") return "bg-emerald-50 text-emerald-700";
    if (s === "Rejected")  return "bg-rose-50 text-rose-700";
    return "bg-blue-50 text-blue-700";
  };

  return (
    <>
      <div className="mb-6">
        <div className="text-xs text-gray-500">Customer Panel</div>
        <h1 className="text-xl font-semibold mt-1">List of Patient</h1>
        <p className="text-sm text-gray-500">Manage and view all patient records</p>
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="flex items-center gap-2">
          <button className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50">⟳ Refresh Patients</button>
          <button className="rounded-md bg-rose-600 px-3 py-2 text-sm text-white hover:bg-rose-700">🗑 Delete All</button>
        </div>

        <div className="grow" />

        <select className="rounded-md border px-3 py-2 text-sm">
          <option>All Statuses</option>
          <option>New</option>
          <option>Processed</option>
          <option>Rejected</option>
        </select>
        <input type="date" className="rounded-md border px-3 py-2 text-sm" />
        <input type="date" className="rounded-md border px-3 py-2 text-sm" />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-gray-600">
              {[
                "Patient ID","Patient Name","Phone","Treatment",
                "Status","Preliminary cost of treatment","Actual cost of treatment","Actions"
              ].map(h => <th key={h} className="px-4 py-3">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-4 py-3">{r.id}</td>
                <td className="px-4 py-3">{r.name}</td>
                <td className="px-4 py-3">{r.phone}</td>
                <td className="px-4 py-3">{r.treatment}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-xs ${badge(r.status)}`}>{r.status}</span>
                </td>
                <td className="px-4 py-3">{r.prelim}</td>
                <td className="px-4 py-3">{r.actual}</td>
                <td className="px-4 py-3">
                  <button className="text-gray-500 hover:text-gray-700">🗑</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* пагинация */}
      <div className="mt-4 flex items-center justify-end gap-2">
        <button className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50">‹ Previous</button>
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-gray-900 text-white text-sm">1</span>
        <button className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50">Next ›</button>
      </div>
    </>
  );
}
