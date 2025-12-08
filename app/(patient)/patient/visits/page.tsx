// app/(patient)/patient/visits/page.tsx

import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PatientVisitHistoryPage() {
  // позже сюда — реальные визиты из Supabase
  const visits: any[] = []; // временный плейсхолдер

  const hasVisits = visits.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Visit History
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Track your previous medical visits and completed treatments.
          </p>
        </div>

        <Link
          href="/patient/appointment"
          className="inline-flex items-center rounded-lg border border-emerald-200 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
        >
          Book new appointment
        </Link>
      </div>

      {/* History list */}
      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-sm font-semibold text-gray-900">
            Past visits
          </h2>
          <div className="flex gap-2 text-xs text-gray-400">
            {/* место под фильтры (по году, клинике и т.п.) */}
            <span>All time</span>
          </div>
        </div>

        {!hasVisits ? (
          <div className="mt-8 flex flex-col items-center justify-center py-10 text-center text-sm text-gray-500">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-gray-300">
              <span className="text-xl">🩺</span>
            </div>
            <div className="font-medium text-gray-700">
              No visit history yet
            </div>
            <p className="mt-1 max-w-sm text-xs text-gray-500">
              After you complete your first appointment, details about the
              visit will appear here so you can easily review your medical
              journey over time.
            </p>
            <Link
              href="/patient/appointment"
              className="mt-4 inline-flex items-center rounded-lg border border-emerald-200 px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
            >
              Book your first visit →
            </Link>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Clinic</th>
                  <th className="px-4 py-3">Treatment</th>
                  <th className="px-4 py-3">Notes</th>
                  <th className="px-4 py-3 text-right">Documents</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm text-gray-700">
                {visits.map((visit) => (
                  <tr key={visit.id}>
                    <td className="px-4 py-3">
                      {/* TODO: форматировать дату */}
                      {visit.date}
                    </td>
                    <td className="px-4 py-3">{visit.clinic_name}</td>
                    <td className="px-4 py-3">{visit.treatment_name}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {visit.notes || "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {visit.has_report ? (
                        <button className="rounded border border-gray-200 px-2 py-1 text-xs hover:bg-gray-50">
                          View report
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">No files</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
