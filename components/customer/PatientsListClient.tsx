"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/browserClient";

type Status = "pending" | "confirmed" | "cancelled" | "completed" | "cancelled_by_patient";

type Row = {
  booking_id: string;
  patient_id: string;
  patient_public_id: number | null;
  patient_name: string | null;
  phone: string | null;
  service_name: string | null;
  status: Status;
  pre_cost: number | null;
  currency: string | null;
  actual_cost: number | null;
  created_at: string;
  clinic_name: string | null;
};

const PAGE_SIZE = 15;

function fmtMoney(v: number | null, cur: string | null) {
  if (v == null) return "—";
  return `${v} ${cur ?? "USD"}`;
}

export default function PatientsListClient() {
  const supabase = useMemo(() => createClient(), []);
  const [items, setItems] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);

  const [status, setStatus] = useState<
    "all" | "pending" | "confirmed" | "cancelled" | "completed" | "cancelled_by_patient"
  >("all");

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const abortRef = useRef<AbortController | null>(null);

  async function readError(res: Response) {
    const ct = res.headers.get("content-type") ?? "";
    if (ct.includes("application/json")) {
      const j = await res.json().catch(() => null);
      return j?.error ? String(j.error) : JSON.stringify(j);
    }
    return `${res.status} ${res.statusText}`;
  }

  async function load(p = page) {
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setBusy(true);
    setErr(null);

    try {
      const q = new URLSearchParams();
      q.set("page", String(p));
      q.set("limit", String(PAGE_SIZE));
      q.set("status", status);
      if (startDate) q.set("startDate", startDate);
      if (endDate) q.set("endDate", endDate);

      const res = await fetch(`/api/customer/patients?${q.toString()}`, {
        cache: "no-store",
        signal: abortRef.current.signal,
      });

      if (!res.ok) throw new Error(await readError(res));
      const json = await res.json();

      setItems(json.items ?? []);
      setTotal(json.total ?? 0);
      setPage(json.page ?? p);
    } catch (e: any) {
      if (e?.name !== "AbortError") setErr(String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    setPage(1);
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, startDate, endDate]);

  useEffect(() => {
    const channel = supabase
      .channel("customer-patients-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "patient_bookings" }, () => {
        setTimeout(() => load(1), 150);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, status, startDate, endDate]);

  async function updateStatus(bookingId: string, next: Status) {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(`/api/customer/patients/${encodeURIComponent(bookingId)}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error(await readError(res));
      setItems((prev) => prev.map((r) => (r.booking_id === bookingId ? { ...r, status: next } : r)));
    } catch (e: any) {
      setErr(String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  }

  async function deleteOne(bookingId: string) {
    if (!confirm("Delete this patient record? This action cannot be undone.")) return;

    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(`/api/customer/patients/${encodeURIComponent(bookingId)}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await readError(res));
      await load(page);
    } catch (e: any) {
      setErr(String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  }

  async function deleteAll() {
    if (!confirm("Delete ALL patient records for current filters? This action cannot be undone.")) return;
    if (!confirm("Are you absolutely sure?")) return;

    setBusy(true);
    setErr(null);
    try {
      const q = new URLSearchParams();
      q.set("status", status);
      if (startDate) q.set("startDate", startDate);
      if (endDate) q.set("endDate", endDate);

      const res = await fetch(`/api/customer/patients?${q.toString()}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await readError(res));
      await load(1);
    } catch (e: any) {
      setErr(String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {err && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <div className="max-h-40 overflow-auto whitespace-pre-wrap break-words">{err}</div>
        </div>
      )}

      <div className="rounded-xl border bg-white p-4 space-y-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={deleteAll}
            disabled={busy}
            className="rounded-md px-3 py-2 text-sm bg-rose-500 text-white hover:bg-rose-600 disabled:opacity-60"
          >
            Delete All
          </button>
          <div className="ml-auto text-sm text-gray-500 flex items-center gap-2">
            {busy ? "Updating…" : "Live updates enabled"}
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
            <option value="cancelled_by_patient">Cancelled by patient</option>
          </select>

          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
        </div>
      </div>

      <div className="rounded-xl border bg-white overflow-hidden">
        <div className="p-4 border-b">
          <div className="text-lg font-semibold">Patients ({total})</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left">Patient ID</th>
                <th className="px-4 py-3 text-left">Patient Name</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-left">Treatment</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Pre-cost</th>
                <th className="px-4 py-3 text-left">Actual</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-gray-500">
                    No patients added yet
                  </td>
                </tr>
              ) : (
                items.map((r) => {
                  const isLocked = r.status === "cancelled_by_patient";

                  return (
                    <tr key={r.booking_id} className="border-t">
                      <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">
                        {r.patient_public_id ? `#${r.patient_public_id}` : "—"}
                      </td>
                      <td className="px-4 py-3">{r.patient_name ?? "—"}</td>
                      <td className="px-4 py-3">{r.phone ?? "—"}</td>
                      <td className="px-4 py-3">{r.service_name ?? "—"}</td>

                      <td className="px-4 py-3">
                        <select
                          disabled={busy || isLocked}
                          value={r.status}
                          onChange={(e) => updateStatus(r.booking_id, e.target.value as any)}
                          className={"border rounded-md px-2 py-1 " + (isLocked ? "opacity-60 cursor-not-allowed bg-gray-50" : "")}
                        >
                          <option value="pending">pending</option>
                          <option value="confirmed">confirmed</option>
                          <option value="cancelled">cancelled</option>
                          <option value="completed">completed</option>
                          <option value="cancelled_by_patient">cancelled by patient</option>
                        </select>
                      </td>

                      <td className="px-4 py-3">{fmtMoney(r.pre_cost, r.currency)}</td>
                      <td className="px-4 py-3">{fmtMoney(r.actual_cost, r.currency)}</td>

                      <td className="px-4 py-3">
                        <button
                          onClick={() => deleteOne(r.booking_id)}
                          disabled={busy}
                          className="text-rose-600 hover:underline disabled:opacity-60"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 text-sm text-gray-500 flex items-center justify-between">
          <div>
            Showing {total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
          </div>
          <div className="flex gap-2">
            <button disabled={busy || page <= 1} onClick={() => load(page - 1)} className="border rounded-md px-3 py-2 hover:bg-gray-50 disabled:opacity-60">
              Prev
            </button>
            <button disabled={busy || page >= totalPages} onClick={() => load(page + 1)} className="border rounded-md px-3 py-2 hover:bg-gray-50 disabled:opacity-60">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
