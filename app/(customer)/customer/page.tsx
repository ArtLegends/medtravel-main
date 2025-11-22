"use client";

import { useEffect, useState } from "react";
import CustomerStat from "@/components/customer/CustomerStat";
import MiniLineChart from "@/components/customer/MiniLineChart";
import StatusLegend from "@/components/customer/StatusLegend";
import { useSupabase } from "@/lib/supabase/supabase-provider";

type DoctorRow = {
  id: string;
  full_name: string | null;
  specialty: string | null;
};

type BookingRow = {
  id: string;
  status: string | null;
};

type StatusCounts = {
  confirmed: number;
  pending: number;
  canceled: number;
  other: number;
};

export default function CustomerDashboard() {
  const { supabase } = useSupabase();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [doctors, setDoctors] = useState<DoctorRow[]>([]);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    confirmed: 0,
    pending: 0,
    canceled: 0,
    other: 0,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError(null);

        // 1. Текущий пользователь
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;
        if (!user) {
          setError("You are not authenticated.");
          return;
        }

        const userId = user.id;

        // 2. Клиника, которой владеет пользователь (published)
        const { data: clinicRow, error: clinicError } = await supabase
          .from("clinics")
          .select("id")
          .eq("owner_id", userId)
          .eq("status", "published")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (clinicError && clinicError.code !== "PGRST116") {
          throw clinicError;
        }

        const clinicId = (clinicRow as any)?.id as string | undefined;

        if (!clinicId) {
          setError(
            "No published clinic is linked to your account yet. Please publish your clinic profile first."
          );
          return;
        }

        // 3. Доктора и заявки по этой клинике
        const [doctorsRes, bookingsRes] = await Promise.all([
          // 👈 правильная таблица: clinic_staff
          supabase
            .from("clinic_staff")
            .select("id, clinic_id, name, title, position")
            .eq("clinic_id", clinicId),
          supabase
            .from("v_customer_clinic_requests")
            .select("id, clinic_id, status")
            .eq("clinic_id", clinicId),
        ]);

        if (doctorsRes.error) throw doctorsRes.error;
        if (bookingsRes.error) throw bookingsRes.error;

        const doctorsData = (doctorsRes.data || []) as any[];
        const bookingsData = (bookingsRes.data || []) as any[];

        if (cancelled) return;

        // маппим докторов
        setDoctors(
          doctorsData.map((d) => ({
            id: d.id,
            full_name: d.name ?? null,
            specialty: d.title ?? d.position ?? null,

          }))
        );

        // маппим заявки
        const bookingRows: BookingRow[] = bookingsData.map((b) => ({
          id: b.id,
          status: b.status,
        }));
        setBookings(bookingRows);

        // 4. Статусы заявок
        const counts: StatusCounts = {
          confirmed: 0,
          pending: 0,
          canceled: 0,
          other: 0,
        };

        for (const b of bookingRows) {
          const s = (b.status || "").toLowerCase();
          if (s === "confirmed") counts.confirmed++;
          else if (s === "pending") counts.pending++;
          else if (s === "canceled" || s === "cancelled") counts.canceled++;
          else counts.other++;
        }

        setStatusCounts(counts);
      } catch (e: any) {
        console.error(e);
        if (!cancelled) setError(e.message ?? "Failed to load dashboard.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const doctorsCount = doctors.length;
  const bookingsCount = bookings.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome to Customer Panel!</h1>
        <p className="text-gray-600">
          Manage your medical practice efficiently
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <CustomerStat title="Doctors" value={doctorsCount} />
        {/* пока Patients заглушка */}
        <CustomerStat title="Patients" value={0} />
        <CustomerStat title="Bookings" value={bookingsCount} />
        <CustomerStat title="Revenue" value={"$0"} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenue — мини-чарт-заглушка */}
        <MiniLineChart title="Revenue" />

        {/* Статусы заявок */}
        <div className="rounded-xl border bg-white p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold">Status</div>
            <StatusLegend />
          </div>

          {loading ? (
            <div className="h-24 animate-pulse rounded-md bg-gray-50" />
          ) : bookingsCount === 0 ? (
            <div className="text-sm text-gray-500">
              No bookings yet. Once you start receiving requests, you&apos;ll
              see their status here.
            </div>
          ) : (
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-green-50 px-3 py-2">
                <dt className="flex items-center gap-2 text-xs font-medium text-green-800">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Confirmed
                </dt>
                <dd className="mt-1 text-lg font-semibold text-green-900">
                  {statusCounts.confirmed}
                </dd>
              </div>
              <div className="rounded-lg bg-amber-50 px-3 py-2">
                <dt className="flex items-center gap-2 text-xs font-medium text-amber-800">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  Pending
                </dt>
                <dd className="mt-1 text-lg font-semibold text-amber-900">
                  {statusCounts.pending}
                </dd>
              </div>
              <div className="rounded-lg bg-red-50 px-3 py-2">
                <dt className="flex items-center gap-2 text-xs font-medium text-red-800">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  Canceled
                </dt>
                <dd className="mt-1 text-lg font-semibold text-red-900">
                  {statusCounts.canceled}
                </dd>
              </div>
              {statusCounts.other > 0 && (
                <div className="rounded-lg bg-slate-50 px-3 py-2">
                  <dt className="flex items-center gap-2 text-xs font-medium text-slate-800">
                    <span className="h-2 w-2 rounded-full bg-slate-400" />
                    Other
                  </dt>
                  <dd className="mt-1 text-lg font-semibold text-slate-900">
                    {statusCounts.other}
                  </dd>
                </div>
              )}
            </dl>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* DOCTORS LIST */}
        <div className="rounded-xl border bg-white p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-lg font-semibold">Doctors List</div>
            {!loading && doctorsCount > 0 && (
              <div className="text-xs text-gray-500">Total: {doctorsCount}</div>
            )}
          </div>

          {loading ? (
            <div className="h-32 animate-pulse rounded-md bg-gray-50" />
          ) : doctorsCount === 0 ? (
            <div className="text-center py-6 text-gray-500">
              No doctors added yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase">
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Position</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.map((doc) => (
                    <tr key={doc.id} className="border-b last:border-0">
                      <td className="px-3 py-2">{doc.full_name || "—"}</td>
                      <td className="px-3 py-2">{doc.specialty || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Patients пока заглушка */}
        <div className="rounded-xl border bg-white p-4">
          <div className="mb-4 text-lg font-semibold">Patients List</div>
          <div className="text-center py-6 text-gray-500">
            No patients added yet
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4">
        <div className="mb-4 text-lg font-semibold">Appointment List</div>
        <div className="text-center py-6 text-gray-500">
          No appointments scheduled yet
        </div>
      </div>
    </div>
  );
}
