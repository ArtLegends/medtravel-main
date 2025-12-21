import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

function badge(status: string) {
  const s = (status || "").toLowerCase();
  if (s === "confirmed") return "bg-emerald-50 text-emerald-700";
  if (s === "cancelled") return "bg-red-50 text-red-700";
  if (s === "completed") return "bg-sky-50 text-sky-700";
  return "bg-amber-50 text-amber-700"; // pending
}

export default async function PatientBookingsPage() {
  const store = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => store.getAll().map((c) => ({ name: c.name, value: c.value })),
        setAll: () => {},
      },
    },
  );

  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) {
    redirect(`/login?as=PATIENT&next=${encodeURIComponent("/patient/bookings")}`);
  }

  // ВАЖНО: если в БД связи clinics/services не подхватятся (нет FK),
  // тогда сделаем отдельный view и будем читать из него.
  const { data: rows, error } = await supabase
    .from("patient_bookings")
    .select(
      `
      id,
      status,
      booking_method,
      preferred_date,
      preferred_time,
      created_at,
      clinics:clinic_id ( id, name, country, city ),
      services:service_id ( id, name )
    `,
    )
    .eq("patient_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    // чтобы сразу видеть проблему на UI (а не молча)
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Failed to load bookings: {error.message}
      </div>
    );
  }

  const bookings = rows ?? [];
  const hasBookings = bookings.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">My Bookings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your medical appointments and bookings
          </p>
        </div>

        <Link
          href="/patient/appointment"
          className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          + New appointment
        </Link>
      </div>

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-sm font-semibold text-gray-900">Your appointments</h2>
        </div>

        {!hasBookings ? (
          <div className="mt-8 flex flex-col items-center justify-center py-10 text-center text-sm text-gray-500">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-gray-300">
              <span className="text-xl">📅</span>
            </div>
            <div className="font-medium text-gray-700">You don’t have any bookings yet</div>
            <p className="mt-1 max-w-sm text-xs text-gray-500">
              When you book an appointment, it will appear here.
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
                  <th className="px-4 py-3">Clinic name</th>
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Method</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm text-gray-700">
                {bookings.map((b: any) => (
                  <tr key={b.id}>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {b.clinics?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3">{b.services?.name ?? "—"}</td>
                    <td className="px-4 py-3">
                      {b.clinics?.city ? `${b.clinics.city}, ` : ""}
                      {b.clinics?.country ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      {b.preferred_date ?? "—"}
                      {b.preferred_time ? `, ${b.preferred_time}` : ""}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${badge(b.status)}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold text-gray-700">
                        {b.booking_method === "manual" ? "Manual" : "Automatic"}
                      </span>
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
