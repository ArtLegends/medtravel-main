"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export type PatientRow = {
  booking_id: string;
  patient_id: string | null;
  patient_public_id: number | null;

  patient_name: string | null;
  phone: string | null;

  service_name: string | null;

  country: string | null;
  province: string | null;
  city: string | null;
  district: string | null;

  preferred_date: string | null; // date
  created_at: string | null; // timestamptz

  status: string | null;
  pre_cost: number | string | null;
  actual_cost: number | string | null;
  currency: string | null;
  booking_method: string | null;

  clinic_name: string | null;

  total_count: number;
};

function fmtLoc(r: PatientRow) {
  const parts = [r.city, r.province, r.country].filter(Boolean);
  return parts.join(", ");
}

function fmtMoney(v: any, currency?: string | null) {
  const raw = v == null ? "" : String(v).trim();
  if (!raw) return "—";
  const cur = (currency ?? "").trim();
  return cur ? `${raw} ${cur}` : raw;
}

function fmtDate(d?: string | null) {
  if (!d) return "—";
  // d может быть date или timestamp — покажем YYYY-MM-DD
  return String(d).slice(0, 10);
}

function buildNextSearchParams(
  current: URLSearchParams,
  patch: Record<string, string>
) {
  const sp = new URLSearchParams(current.toString());
  for (const [k, v] of Object.entries(patch)) {
    if (v === "") sp.delete(k);
    else sp.set(k, v);
  }
  return sp;
}

export default function PatientsClient({
  items,
  page,
  totalPages,
  totalCount,
  pageSize,
  statusOptions,
  initialFilters,
}: {
  items: PatientRow[];
  page: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  statusOptions: string[];
  initialFilters: { status: string; start: string; end: string };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState(initialFilters.status || "all");
  const [start, setStart] = useState(initialFilters.start || "");
  const [end, setEnd] = useState(initialFilters.end || "");

  const activeCountLabel = useMemo(() => {
    const from = (page - 1) * pageSize + 1;
    const to = Math.min(page * pageSize, totalCount);
    if (totalCount === 0) return "0";
    return `${from}-${to} of ${totalCount}`;
  }, [page, pageSize, totalCount]);

  const applyFilters = () => {
    const sp = buildNextSearchParams(searchParams ?? new URLSearchParams(), {
      status,
      start,
      end,
      page: "1",
    });
    router.push(`?${sp.toString()}`);
  };

  const resetFilters = () => {
    setStatus("all");
    setStart("");
    setEnd("");
    router.push(`?page=1`);
  };

  const goToPage = (nextPage: number) => {
    const sp = buildNextSearchParams(searchParams ?? new URLSearchParams(), {
      page: String(nextPage),
    });
    router.push(`?${sp.toString()}`);
  };

  const deleteOne = async (bookingId: string) => {
    const ok1 = confirm("Delete this patient booking?");
    if (!ok1) return;
    const ok2 = confirm("Are you absolutely sure? This cannot be undone.");
    if (!ok2) return;

    const res = await fetch("/api/admin/patients/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ booking_id: bookingId }),
    });

    if (!res.ok) {
      const txt = await res.text();
      alert(`Delete failed: ${txt}`);
      return;
    }

    router.refresh();
  };

  const deleteAll = async () => {
    const ok1 = confirm("Delete ALL records that match current filters?");
    if (!ok1) return;

    const ok2 = confirm(
      `This will remove patient bookings from database.\n\nCurrent page range: ${activeCountLabel}\n\nProceed?`
    );
    if (!ok2) return;

    const res = await fetch("/api/admin/patients/delete-all", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: status && status !== "all" ? status : null,
        start: start || null,
        end: end || null,
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      alert(`Delete all failed: ${txt}`);
      return;
    }

    router.push(`?page=1`);
    router.refresh();
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Patients</h1>
          <div className="text-sm text-gray-500">Showing {activeCountLabel}</div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
            onClick={resetFilters}
          >
            Reset
          </button>
          <button
            className="rounded-md bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700"
            onClick={deleteAll}
            disabled={totalCount === 0}
            title="Delete all records matching filters"
          >
            Delete all
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border bg-white p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <label className="text-sm">
            <div className="mb-1 text-gray-600">Status</div>
            <select
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s === "all" ? "All statuses" : s}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm">
            <div className="mb-1 text-gray-600">Start date</div>
            <input
              type="date"
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </label>

          <label className="text-sm">
            <div className="mb-1 text-gray-600">End date</div>
            <input
              type="date"
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </label>

          <div className="flex items-end">
            <button
              className="w-full rounded-md bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-700"
              onClick={applyFilters}
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="min-w-[1100px] w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Patient Name</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Service</th>
              <th className="p-3">Location</th>
              <th className="p-3">Date</th>
              <th className="p-3">Status</th>
              <th className="p-3">Pre-cost</th>
              <th className="p-3">Actual</th>
              <th className="p-3">Method</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {items.length === 0 ? (
              <tr>
                <td className="p-6 text-gray-500" colSpan={10}>
                  No records found
                </td>
              </tr>
            ) : (
              items.map((r) => (
                <tr key={r.booking_id}>
                  <td className="p-3">
                    <div className="font-medium text-gray-900">
                      {r.patient_name || "—"}
                    </div>
                    {r.clinic_name ? (
                      <div className="text-xs text-gray-500">{r.clinic_name}</div>
                    ) : null}
                  </td>
                  <td className="p-3">{r.phone || "—"}</td>
                  <td className="p-3">{r.service_name || "—"}</td>
                  <td className="p-3">{fmtLoc(r) || "—"}</td>
                  <td className="p-3">
                    {/* date = preferred_date; если нет — created_at */}
                    {fmtDate(r.preferred_date ?? r.created_at)}
                  </td>
                  <td className="p-3">
                    <span className="inline-flex rounded-full border px-2 py-1 text-xs">
                      {r.status || "—"}
                    </span>
                  </td>
                  <td className="p-3">{fmtMoney(r.pre_cost, r.currency)}</td>
                  <td className="p-3">{fmtMoney(r.actual_cost, r.currency)}</td>
                  <td className="p-3">{r.booking_method || "—"}</td>
                  <td className="p-3">
                    <button
                      className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-700 hover:bg-red-100"
                      onClick={() => deleteOne(r.booking_id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2">
        <button
          className="rounded-full border px-3 py-1 text-sm disabled:opacity-50"
          onClick={() => goToPage(Math.max(1, page - 1))}
          disabled={page <= 1}
        >
          ← Prev
        </button>
        <span className="text-sm text-gray-600">
          Page {page} of {totalPages}
        </span>
        <button
          className="rounded-full border px-3 py-1 text-sm disabled:opacity-50"
          onClick={() => goToPage(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
