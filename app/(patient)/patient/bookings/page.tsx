import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

function badge(status: string) {
  const s = (status || "").toLowerCase();
  if (s === "confirmed") return "bg-emerald-50 text-emerald-700";
  if (s === "cancelled" || s === "cancelled_by_patient") return "bg-red-50 text-red-700";
  if (s === "completed") return "bg-sky-50 text-sky-700";
  return "bg-amber-50 text-amber-700";
}

function patientStatusLabel(status: string) {
  const s = (status || "").toLowerCase();
  if (s === "cancelled_by_patient") return "cancelled";
  return status;
}

function fmtMoney(v: any, cur: any) {
  if (v == null) return "—";
  return `${v} ${cur ?? "USD"}`;
}

async function cancelBooking(formData: FormData) {
  "use server";

  const bookingId = String(formData.get("booking_id") || "");
  if (!bookingId) return;

  const store = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => store.getAll().map((c) => ({ name: c.name, value: c.value })),
        setAll: () => {},
      },
    }
  );

  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) redirect(`/login?as=PATIENT&next=${encodeURIComponent("/patient/bookings")}`);

  const { error } = await supabase.rpc("patient_cancel_booking", { p_booking_id: bookingId });

  // ВАЖНО: не валим рендер 500 в проде без текста — лучше мягко.
  if (error) {
    // вариант 1: просто редирект с кодом (можно потом красиво вывести)
    redirect(`/patient/bookings?cancel_error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/patient/bookings");
  revalidatePath("/patient/visits");
}

export default async function PatientBookingsPage({
  searchParams,
}: {
  searchParams?: { cancel_error?: string };
}) {
  const store = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => store.getAll().map((c) => ({ name: c.name, value: c.value })),
        setAll: () => {},
      },
    }
  );

  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) {
    redirect(`/login?as=PATIENT&next=${encodeURIComponent("/patient/bookings")}`);
  }

  // читаем из VIEW, чтобы pre_cost/currency совпадали с customer panel
  const { data: rows, error } = await supabase
    .from("v_customer_patients")
    .select(
      `
      booking_id,
      status,
      booking_method,
      preferred_date,
      preferred_time,
      created_at,
      pre_cost,
      currency,
      actual_cost,
      clinics:clinic_id ( id, name, country, city ),
      services:service_id ( id, name )
    `
    )
    .eq("patient_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
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
      {searchParams?.cancel_error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Cancel failed: {decodeURIComponent(searchParams.cancel_error)}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">My Bookings</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your medical appointments and bookings</p>
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
            <p className="mt-1 max-w-sm text-xs text-gray-500">When you book an appointment, it will appear here.</p>
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
                  <th className="px-4 py-3">Pre-cost</th>
                  <th className="px-4 py-3">Actual cost</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y text-sm text-gray-700">
                {bookings.map((b: any) => {
                  const s = String(b.status || "").toLowerCase();
                  const canCancel = s === "pending" || s === "confirmed";

                  return (
                    <tr key={b.booking_id}>
                      <td className="px-4 py-3 font-medium text-gray-900">{b.clinics?.name ?? "—"}</td>
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
                          {patientStatusLabel(b.status)}
                        </span>
                      </td>

                      <td className="px-4 py-3">{fmtMoney(b.pre_cost, b.currency)}</td>
                      <td className="px-4 py-3">{fmtMoney(b.actual_cost, b.currency)}</td>

                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold text-gray-700">
                          {b.booking_method === "manual" ? "Manual" : "Automatic"}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        {canCancel ? (
                          <form action={cancelBooking}>
                            <input type="hidden" name="booking_id" value={b.booking_id} />
                            <button type="submit" className="text-xs font-semibold text-red-600 hover:underline">
                              Cancel
                            </button>
                          </form>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
