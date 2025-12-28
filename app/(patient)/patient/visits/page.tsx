// app/(patient)/patient/visits/page.tsx

import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";

type ClinicMini = {
  name: string | null;
  country: string | null;
  province: string | null;
  city: string | null;
  district: string | null;
};

type ServiceMini = {
  name: string | null;
};

type BookingRow = {
  id: string;
  status: string | null;
  preferred_date: string | null; // date (YYYY-MM-DD)
  preferred_time: string | null; // text (e.g. "10:00")
  clinic: ClinicMini | null;
  service: ServiceMini | null;
};

function buildLocation(c: ClinicMini | null) {
  if (!c) return "—";
  const parts = [c.city, c.country].filter(Boolean);
  // на твоем скрине достаточно City, Country
  return parts.length ? parts.join(", ") : "—";
}

function formatVisitDate(preferred_date: string | null, preferred_time: string | null) {
  if (!preferred_date) return "—";

  // preferred_date приходит как "YYYY-MM-DD"
  // preferred_time может быть "10:00" (или пусто)
  const time = preferred_time && preferred_time.trim() ? preferred_time.trim() : "00:00";
  const dt = new Date(`${preferred_date}T${time}:00`);

  // если Date вдруг не распарсился — покажем дату как есть
  if (Number.isNaN(dt.getTime())) return preferred_time ? `${preferred_date}, ${preferred_time}` : preferred_date;

  const dateStr = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(dt);

  // на скрине время не обязательно, но можно добавить если есть
  return preferred_time ? `${dateStr}, ${preferred_time}` : dateStr;
}

function StatusPill({ status }: { status: string | null }) {
  const s = (status || "").toLowerCase();

  // тут по задаче будут только completed, но пусть будет безопасно
  const isCompleted = s === "completed";

  return (
    <span
      className={
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium " +
        (isCompleted
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200"
          : "bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-200")
      }
    >
      <span className={"h-1.5 w-1.5 rounded-full " + (isCompleted ? "bg-emerald-500" : "bg-gray-400")} />
      {status || "—"}
    </span>
  );
}

export default async function PatientVisitHistoryPage() {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          return (await cookieStore).get(name)?.value;
        },
        // В server component мы не пишем cookies — сделаем no-op,
        // для чтения сессии этого достаточно.
        set() {},
        remove() {},
      },
    }
  );

  // 1) Текущий пользователь
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    return (
      <div className="rounded-xl border bg-white p-5 text-sm text-red-700">
        {userError.message}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-3 rounded-2xl border bg-white p-5">
        <div className="text-lg font-semibold text-gray-900">Visit History</div>
        <p className="text-sm text-gray-600">You are not authenticated.</p>
        <Link
          href="/login"
          className="inline-flex items-center rounded-lg border border-emerald-200 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
        >
          Go to login
        </Link>
      </div>
    );
  }

  // 2) Completed визиты пациента
  const { data, error } = await supabase
    .from("patient_bookings")
    .select(
      `
      id,
      status,
      preferred_date,
      preferred_time,
      clinic:clinics ( name, country, province, city, district ),
      service:services ( name )
    `
    )
    .eq("patient_id", user.id)
    .eq("status", "completed")
    .order("preferred_date", { ascending: false });

  if (error) {
    return (
      <div className="rounded-xl border bg-white p-5 text-sm text-red-700">
        {error.message}
      </div>
    );
  }

  const visits = (data || []) as unknown as BookingRow[];
  const hasVisits = visits.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Visit History</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track your previous medical visits and completed treatments.
          </p>
        </div>

        <Link
          href="/patient/appointment"
          className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          + New appointment
        </Link>
      </div>

      {/* History list */}
      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-lg font-semibold text-gray-900">Medical Visit History</div>
            <div className="text-sm text-gray-500">Your complete medical visit records</div>
          </div>
          <div className="text-xs text-gray-400">All time</div>
        </div>

        {!hasVisits ? (
          <div className="mt-8 flex flex-col items-center justify-center py-10 text-center text-sm text-gray-500">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-gray-300">
              <span className="text-xl">🩺</span>
            </div>
            <div className="font-medium text-gray-700">No visit history yet</div>
            <p className="mt-1 max-w-sm text-xs text-gray-500">
              After you complete your first appointment, details about the visit will appear here so you
              can easily review your medical journey over time.
            </p>
            <Link
              href="/patient/appointment"
              className="mt-4 inline-flex items-center rounded-lg border border-emerald-200 px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
            >
              Book your first visit →
            </Link>
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b text-xs font-semibold text-gray-500">
                <tr>
                  <th className="px-4 py-3">Clinic</th>
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y text-sm text-gray-800">
                {visits.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {v.clinic?.name || "—"}
                    </td>
                    <td className="px-4 py-3">{v.service?.name || "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{buildLocation(v.clinic)}</td>
                    <td className="px-4 py-3">{formatVisitDate(v.preferred_date, v.preferred_time)}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={v.status} />
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
