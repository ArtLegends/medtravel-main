"use client";

// app/(patient)/patient/page.tsx

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSupabase } from "@/lib/supabase/supabase-provider";

type BookingLite = {
  id: string;
  status: string | null;
  clinic_name: string | null;
  service_name: string | null;
  preferred_date: string | null;
  created_at: string | null;
  clinic_id: string | null;
  location: string | null;
};

type Stats = {
  upcomingAppointments: number; // confirmed
  totalVisits: number; // completed
  activeBookings: number; // pending
  notifications: number; // пока не трогаем
};

function normalizeStatus(s: string | null | undefined) {
  return (s || "").trim().toLowerCase();
}

function formatDate(d: string | null | undefined) {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return d; // если это date строка без TZ и не парсится нормально — покажем как есть
  return dt.toISOString().slice(0, 10); // YYYY-MM-DD
}

function StatusBadge({ status }: { status: string | null }) {
  const s = normalizeStatus(status);

  const cls =
    s === "confirmed"
      ? "bg-emerald-100 text-emerald-700"
      : s === "pending"
      ? "bg-amber-100 text-amber-700"
      : s === "completed"
      ? "bg-emerald-100 text-emerald-700"
      : s === "canceled" || s === "cancelled"
      ? "bg-rose-100 text-rose-700"
      : "bg-slate-100 text-slate-700";

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${cls}`}>
      {s || "—"}
    </span>
  );
}

async function fetchBookingsLite(supabase: any): Promise<BookingLite[]> {
  // 1) Пытаемся взять из patient_bookings + join clinics/services (идеальный вариант)
  const pb = await supabase
    .from("patient_bookings")
    .select(
      `
      id,
      status,
      preferred_date,
      created_at,
      clinic_id,
      clinics:clinics ( name, country, province, city, district ),
      services:services ( name )
    `
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (!pb.error && Array.isArray(pb.data)) {
    return (pb.data as any[]).map((r) => {
      const clinic = r.clinics || null;
      const service = r.services || null;

      const country = clinic?.country ?? null;
      const province = clinic?.province ?? null;
      const city = clinic?.city ?? null;
      const district = clinic?.district ?? null;

      const location = [city, district, province, country].filter(Boolean).join(", ");

      return {
        id: String(r.id),
        status: r.status ?? null,
        clinic_name: clinic?.name ?? null,
        service_name: service?.name ?? null,
        preferred_date: r.preferred_date ?? null,
        created_at: r.created_at ?? null,
        clinic_id: r.clinic_id ?? null,
        location: location || null,
      };
    });
  }

  // 2) Фолбек: v_customer_patients (у тебя точно есть схема)
  const vcp = await supabase
    .from("v_customer_patients")
    .select("booking_id, clinic_id, clinic_name, service_name, preferred_date, created_at, status")
    .order("created_at", { ascending: false })
    .limit(50);

  if (vcp.error || !Array.isArray(vcp.data)) {
    // возвращаем пусто, но не валим весь дашборд
    return [];
  }

  const rows = (vcp.data as any[]).map((r) => ({
    id: String(r.booking_id ?? ""),
    status: r.status ?? null,
    clinic_name: r.clinic_name ?? null,
    service_name: r.service_name ?? null,
    preferred_date: r.preferred_date ?? null,
    created_at: r.created_at ?? null,
    clinic_id: r.clinic_id ?? null,
    location: null as string | null,
  }));

  // добираем location пачкой по clinic_id (если получится)
  const clinicIds = Array.from(new Set(rows.map((x) => x.clinic_id).filter(Boolean))) as string[];
  if (clinicIds.length === 0) return rows;

  const clinicsRes = await supabase
    .from("clinics")
    .select("id, country, province, city, district")
    .in("id", clinicIds);

  if (clinicsRes.error || !Array.isArray(clinicsRes.data)) return rows;

  const map = new Map<string, any>();
  (clinicsRes.data as any[]).forEach((c) => map.set(String(c.id), c));

  return rows.map((x) => {
    const c = x.clinic_id ? map.get(String(x.clinic_id)) : null;
    const location = c ? [c.city, c.district, c.province, c.country].filter(Boolean).join(", ") : "";
    return { ...x, location: location || null };
  });
}

export default function PatientDashboardPage() {
  const { supabase } = useSupabase();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [bookings, setBookings] = useState<BookingLite[]>([]);
  const [stats, setStats] = useState<Stats>({
    upcomingAppointments: 0,
    totalVisits: 0,
    activeBookings: 0,
    notifications: 0, // пока не трогаем
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        // проверим, что пользователь авторизован (иначе RLS может вернуть 401/0)
        const {
          data: { user },
          error: userErr,
        } = await supabase.auth.getUser();

        if (userErr) throw userErr;
        if (!user) {
          setError("You are not authenticated.");
          return;
        }

        const rows = await fetchBookingsLite(supabase);
        if (cancelled) return;

        setBookings(rows);

        const upcoming = rows.filter((b) => normalizeStatus(b.status) === "confirmed").length;
        const visits = rows.filter((b) => normalizeStatus(b.status) === "completed").length;
        const active = rows.filter((b) => normalizeStatus(b.status) === "pending").length;

        setStats((prev) => ({
          ...prev,
          upcomingAppointments: upcoming,
          totalVisits: visits,
          activeBookings: active,
        }));
      } catch (e: any) {
        console.error(e);
        if (!cancelled) setError(e?.message ?? "Failed to load dashboard.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const recent = useMemo(() => bookings.slice(0, 3), [bookings]);
  const hasRecent = recent.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Overview of your upcoming appointments and medical visits.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Upcoming Appointments"
          value={stats.upcomingAppointments}
          helper="No upcoming appointments"
          loading={loading}
        />
        <StatCard
          label="Total Visits"
          value={stats.totalVisits}
          helper="Medical visits completed"
          loading={loading}
        />
        <StatCard
          label="Active Bookings"
          value={stats.activeBookings}
          helper="Pending appointments"
          loading={loading}
        />
        <StatCard
          label="Notifications"
          value={stats.notifications}
          helper="Unread messages"
          loading={loading}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <section className="lg:col-span-2 rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900">Recent Activity</h2>
          <p className="mt-1 text-xs text-gray-500">Your latest medical appointments and activities</p>

          {loading ? (
            <div className="mt-6 space-y-3">
              <div className="h-16 animate-pulse rounded-xl bg-gray-50" />
              <div className="h-16 animate-pulse rounded-xl bg-gray-50" />
              <div className="h-16 animate-pulse rounded-xl bg-gray-50" />
            </div>
          ) : !hasRecent ? (
            <div className="mt-8 flex flex-col items-center justify-center py-10 text-center text-sm text-gray-500">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-gray-300">
                <span className="text-xl">↻</span>
              </div>
              <div className="font-medium text-gray-700">No recent activity</div>
              <p className="mt-1 text-xs text-gray-500 max-w-sm">
                Your recent appointments and visits will appear here after you book or complete a consultation.
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {recent.map((b) => {
                const date = formatDate(b.preferred_date || b.created_at);
                return (
                  <div key={b.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 truncate">{b.clinic_name || "—"}</div>
                      <div className="text-sm text-gray-600 truncate">{b.service_name || "—"}</div>
                      <div className="text-xs text-gray-400">{date}</div>
                    </div>
                    <div className="ml-4 shrink-0">
                      <StatusBadge status={b.status} />
                    </div>
                  </div>
                );
              })}

              <Link
                href="/patient/bookings"
                className="inline-flex items-center text-sm font-medium text-emerald-700 hover:text-emerald-800"
              >
                View all bookings →
              </Link>
            </div>
          )}
        </section>

        {/* Quick Actions — НЕ ТРОГАЕМ */}
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900">Quick Actions</h2>
          <p className="mt-1 text-xs text-gray-500">Common tasks and shortcuts</p>

          <div className="mt-4 space-y-2">
            <QuickAction href="/patient/appointment" label="Book New Appointment">
              📅
            </QuickAction>
            <QuickAction href="/patient/visits" label="View Visit History">
              ⏱️
            </QuickAction>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard(props: {
  label: string;
  value: number;
  helper?: string;
  loading?: boolean;
}) {
  const { label, value, helper, loading } = props;

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </div>

      <div className="mt-3 text-2xl font-semibold text-gray-900">
        {loading ? (
          <span className="inline-block h-7 w-10 animate-pulse rounded bg-gray-200" />
        ) : (
          value
        )}
      </div>

      {helper && !loading && value === 0 && (
        <div className="mt-1 text-xs text-gray-500">{helper}</div>
      )}
    </div>
  );
}

function QuickAction({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children?: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
    >
      <span className="flex items-center gap-2">
        {children && (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-xs">
            {children}
          </span>
        )}
        {label}
      </span>
      <span className="text-xs text-gray-400">→</span>
    </a>
  );
}
