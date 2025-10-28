// app/(customer)/customer/page.tsx
export default function CustomerDashboard() {
  return (
    <>
      <div className="mb-6">
        <div className="text-xs text-gray-500">Customer Panel</div>
        <h1 className="text-xl font-semibold mt-1">Welcome to Customer Panel!</h1>
        <p className="text-sm text-gray-500">Manage your medical practice efficiently</p>
      </div>

      {/* 4 мини-карты */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { title: "Doctors",  value: "0" },
          { title: "Patients", value: "0" },
          { title: "Bookings", value: "0" },
          { title: "Revenue",  value: "$0" },
        ].map((c) => (
          <div key={c.title} className="rounded-xl border p-4">
            <div className="text-sm text-gray-500">{c.title}</div>
            <div className="mt-1 text-2xl font-semibold">{c.value}</div>
          </div>
        ))}
      </div>

      {/* Графики */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border p-4">
          <div className="mb-3 text-sm text-gray-600">Revenue</div>
          <div className="h-64 rounded-lg border bg-white" />
        </div>

        <div className="rounded-xl border p-4">
          <div className="mb-3 text-sm text-gray-600">Status</div>
          <div className="h-64 rounded-lg border bg-white" />
          <div className="mt-3 flex items-center gap-4 text-xs text-gray-600">
            <span className="inline-flex items-center gap-1"><i className="h-2 w-2 rounded-sm bg-emerald-600 inline-block" /> confirmed</span>
            <span className="inline-flex items-center gap-1"><i className="h-2 w-2 rounded-sm bg-amber-500 inline-block" /> pending</span>
            <span className="inline-flex items-center gap-1"><i className="h-2 w-2 rounded-sm bg-rose-500 inline-block" /> canceled</span>
          </div>
        </div>
      </div>

      {/* Списки */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border p-4">
          <div className="mb-3 text-sm text-gray-600">Doctors List</div>
          <div className="rounded-lg border p-8 text-center text-sm text-gray-500">
            No doctors added yet
          </div>
        </div>

        <div className="rounded-xl border p-4">
          <div className="mb-3 text-sm text-gray-600">Patients List</div>
          <div className="rounded-lg border p-8 text-center text-sm text-gray-500">
            No patients added yet
          </div>
        </div>
      </div>
    </>
  );
}
