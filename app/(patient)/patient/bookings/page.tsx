// app/(patient)/patient/bookings/page.tsx

import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PatientBookingsPage() {
  // сюда позже подтянем реальные данные из Supabase
  const bookings: any[] = []; // временный плейсхолдер

  const hasBookings = bookings.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            My Bookings
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your upcoming medical bookings and appointments.
          </p>
        </div>

        <Link
          href="/patient/appointment"
          className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Book new appointment
        </Link>
      </div>

      {/* Table / list */}
      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-sm font-semibold text-gray-900">
            Upcoming bookings
          </h2>
          {/* фильтры сделаем позже, оставим под них место */}
          <div className="flex gap-2 text-xs text-gray-400">
            <span>All</span>
            <span>•</span>
            <span>Upcoming</span>
            <span>•</span>
            <span>Past</span>
          </div>
        </div>

        {!hasBookings ? (
          <div className="mt-8 flex flex-col items-center justify-center py-10 text-center text-sm text-gray-500">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-gray-300">
              <span className="text-xl">📅</span>
            </div>
            <div className="font-medium text-gray-700">
              You don’t have any bookings yet
            </div>
            <p className="mt-1 max-w-sm text-xs text-gray-500">
              When you book an appointment, it will appear here so you can
              quickly review details, reschedule, or cancel if needed.
            </p>
            <Link
              href="/patient/appointment"
              className="mt-4 inline-flex items-center rounded-lg border border-emerald-200 px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
            >
              Book your first appointment →
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
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm text-gray-700">
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="px-4 py-3">
                      {/* TODO: форматировать дату */}
                      {booking.date}
                    </td>
                    <td className="px-4 py-3">{booking.clinic_name}</td>
                    <td className="px-4 py-3">{booking.treatment_name}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-2 text-xs">
                        <button className="rounded border border-gray-200 px-2 py-1 hover:bg-gray-50">
                          View
                        </button>
                        <button className="rounded border border-gray-200 px-2 py-1 hover:bg-gray-50">
                          Reschedule
                        </button>
                        <button className="rounded border border-red-100 px-2 py-1 text-red-600 hover:bg-red-50">
                          Cancel
                        </button>
                      </div>
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
