// components/customer/PatientsListClient.tsx
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

  lead_id: string | null;

  pre_cost: number | null;
  currency: string | null;
  actual_cost: number | null;

  created_at: string;
  clinic_name: string | null;

  xray_path: string | null;
  photo_path: string | null;

  preferred_date: string | null;
  preferred_time: string | null;
  scheduled_at: string | null;
};

const PAGE_SIZE = 15;

const RU_DT = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function fmtPreferred(d: string | null, t: string | null) {
  if (!d) return "—";

  const [yyyy, mm, dd] = d.split("-");
  const date = `${dd}.${mm}.${yyyy}`;

  if (!t) return date;

  const time = t.slice(0, 5);
  return `${date}, ${time}`;
}

function fmtScheduled(ts: string | null) {
  if (!ts) return "—";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return ts;
  return RU_DT.format(d);
}

function fmtMoney(v: number | null, cur: string | null) {
  if (v == null) return "—";
  return `${v} ${cur ?? "USD"}`;
}

function normalizeTime(t: string | null) {
  if (!t) return "";
  const m = t.match(/^(\d{2}:\d{2})/);
  return m ? m[1] : t;
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

  // attachments modal (like admin)
  const [attachOpen, setAttachOpen] = useState(false);
  const [attachUrls, setAttachUrls] = useState<string[]>([]);
  const [attachTitle, setAttachTitle] = useState<string>("Attachments");
  const [activeIdx, setActiveIdx] = useState(0);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const abortRef = useRef<AbortController | null>(null);

  // schedule modal
  const [schedOpen, setSchedOpen] = useState(false);
  const [schedBookingId, setSchedBookingId] = useState<string | null>(null);
  const [schedDate, setSchedDate] = useState<string>("");
  const [schedTime, setSchedTime] = useState<string>("");
  const [schedTitle, setSchedTitle] = useState<string>("Schedule appointment");

  // details modal
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRow, setDetailRow] = useState<Row | null>(null);

  // actual cost edit state (in modal)
  const [actualCostDraft, setActualCostDraft] = useState<string>("");
  const [currencyDraft, setCurrencyDraft] = useState<string>("USD");

  function openDetails(r: Row) {
    setDetailRow(r);
    setDetailOpen(true);

    setActualCostDraft(r.actual_cost == null ? "" : String(r.actual_cost));
    setCurrencyDraft((r.currency || "USD").toUpperCase());

    // schedule draft
    setSchedBookingId(r.booking_id);
    setSchedTitle(`Booking details — ${r.patient_name ?? "patient"}`);
    setSchedTime(normalizeTime(r.preferred_time));

    if (r.scheduled_at) {
      const d = new Date(r.scheduled_at);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const hh = String(d.getHours()).padStart(2, "0");
      const mi = String(d.getMinutes()).padStart(2, "0");
      setSchedDate(`${yyyy}-${mm}-${dd}`);
      setSchedTime(`${hh}:${mi}`);
    } else {
      setSchedDate(r.preferred_date ?? "");
      setSchedTime(r.preferred_time ?? "");
    }
  }

  function openSchedule(r: Row) {
    setSchedBookingId(r.booking_id);
    setSchedTitle(`Schedule for ${r.patient_name ?? "patient"}`);
    setSchedTime(normalizeTime(r.preferred_time));

    if (r.scheduled_at) {
      const d = new Date(r.scheduled_at);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const hh = String(d.getHours()).padStart(2, "0");
      const mi = String(d.getMinutes()).padStart(2, "0");
      setSchedDate(`${yyyy}-${mm}-${dd}`);
      setSchedTime(`${hh}:${mi}`);
    } else {
      setSchedDate(r.preferred_date ?? "");
      setSchedTime(r.preferred_time ?? "");
    }

    setSchedOpen(true);
  }

  async function saveActualCost() {
    if (!detailRow) return;

    const v = actualCostDraft.trim();
    const num = Number(v);

    if (!v || !Number.isFinite(num) || num < 0) {
      setErr("Invalid actual cost.");
      return;
    }

    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(`/api/customer/patients/${encodeURIComponent(detailRow.booking_id)}/actual-cost`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ actual_cost: num, currency: currencyDraft.trim() || null }),
      });
      if (!res.ok) throw new Error(await readError(res));

      const j = await res.json().catch(() => ({}));
      const updated = j?.booking ?? null;

      // ✅ обновляем rows в таблице и detailRow
      setItems((prev) =>
        prev.map((x) =>
          x.booking_id === detailRow.booking_id
            ? {
              ...x,
              actual_cost: updated?.actual_cost ?? num,
              currency: updated?.currency ?? currencyDraft,
            }
            : x
        )
      );

      setDetailRow((prev) =>
        prev
          ? {
            ...prev,
            actual_cost: updated?.actual_cost ?? num,
            currency: updated?.currency ?? currencyDraft,
          }
          : prev
      );
    } catch (e: any) {
      setErr(String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  }

  async function readError(res: Response) {
    const ct = res.headers.get("content-type") ?? "";
    if (ct.includes("application/json")) {
      const j = await res.json().catch(() => null);
      return j?.error ? String(j.error) : JSON.stringify(j);
    }
    return `${res.status} ${res.statusText}`;
  }

  async function saveSchedule() {
    if (!schedBookingId) return;

    const date = schedDate.trim();
    if (!date) {
      setErr("Please select a date.");
      return;
    }

    const time = (schedTime || "00:00").trim();
    const local = new Date(`${date}T${time}:00`);
    if (Number.isNaN(local.getTime())) {
      setErr("Invalid date/time.");
      return;
    }

    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(`/api/customer/patients/${encodeURIComponent(schedBookingId)}/schedule`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ scheduled_at: local.toISOString() }),
      });
      if (!res.ok) throw new Error(await readError(res));

      setItems((prev) =>
        prev.map((r) => (r.booking_id === schedBookingId ? { ...r, scheduled_at: local.toISOString() } : r))
      );

      setSchedOpen(false);
      setSchedBookingId(null);
    } catch (e: any) {
      setErr(String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  }

  async function openAttachment(r: Row) {
    setBusy(true);
    setErr(null);

    try {
      // 1) lead images first — только если это лид
      if (r.lead_id) {
        const res = await fetch(
          `/api/customer/patients/${encodeURIComponent(r.booking_id)}/lead-images`,
          { cache: "no-store" }
        );

        if (res.ok) {
          const j = await res.json().catch(() => ({}));
          const urls: string[] = (j?.urls ?? []).filter(Boolean);

          if (urls.length) {
            setAttachTitle("Lead images");
            setAttachUrls(urls);
            setActiveIdx(0);
            setAttachOpen(true);
            return;
          }
        }
      }

      // 2) classic xray/photo single
      let endpoint: string | null = null;
      if (r.xray_path) endpoint = `/api/customer/patients/${encodeURIComponent(r.booking_id)}/xray-url`;
      else if (r.photo_path) endpoint = `/api/customer/patients/${encodeURIComponent(r.booking_id)}/photo-url`;

      if (!endpoint) {
        setErr("No attachment for this booking.");
        return;
      }

      const res = await fetch(endpoint, { cache: "no-store" });
      if (!res.ok) throw new Error(await readError(res));

      const j = await res.json().catch(() => ({}));
      const url = j?.url ?? null;

      if (!url) {
        setErr("Attachment not found or not available.");
        return;
      }

      setAttachTitle(r.xray_path ? "X-ray attachment" : "Photo attachment");
      setAttachUrls([url]);
      setActiveIdx(0);
      setAttachOpen(true);
    } catch (e: any) {
      setErr(String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
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

  useEffect(() => {
    if (!attachOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAttachOpen(false);
        setAttachUrls([]);
        setActiveIdx(0);
      }
    };

    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [attachOpen]);

  useEffect(() => {
    if (!detailOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDetailOpen(false);
        setDetailRow(null);
      }
    };

    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [detailOpen]);

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
            <option value="cancelled_by_patient" disabled>
              Cancelled by Patient
            </option>
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
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Treatment</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
                    No patients added yet
                  </td>
                </tr>
              ) : (
                items.map((r) => {
                  const isLead = Boolean(r.lead_id);

                  return (
                    <tr key={r.booking_id} className="border-t">
                      <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">
                        {r.patient_public_id ? `#${r.patient_public_id}` : "—"}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span>{r.patient_name ?? "—"}</span>
                          {isLead ? (
                            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                              Landing lead
                            </span>
                          ) : null}
                        </div>
                      </td>

                      <td className="px-4 py-3">{r.service_name ?? "—"}</td>

                      <td className="px-4 py-3">
                        <span
                          className={[
                            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
                            r.status === "confirmed"
                              ? "bg-emerald-50 text-emerald-700"
                              : r.status === "completed"
                                ? "bg-sky-50 text-sky-700"
                                : r.status === "cancelled" || r.status === "cancelled_by_patient"
                                  ? "bg-rose-50 text-rose-700"
                                  : "bg-amber-50 text-amber-700",
                          ].join(" ")}
                        >
                          {r.status}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openDetails(r)}
                            className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                          >
                            View
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteOne(r.booking_id)}
                            disabled={busy}
                            className="inline-flex items-center rounded-md border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-60"
                          >
                            Delete
                          </button>
                        </div>
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
            <button
              disabled={busy || page <= 1}
              onClick={() => load(page - 1)}
              className="border rounded-md px-3 py-2 hover:bg-gray-50 disabled:opacity-60"
            >
              Prev
            </button>
            <button
              disabled={busy || page >= totalPages}
              onClick={() => load(page + 1)}
              className="border rounded-md px-3 py-2 hover:bg-gray-50 disabled:opacity-60"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Attachments modal (admin-like) */}
      {attachOpen && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4"
          onMouseDown={() => {
            setAttachOpen(false);
            setAttachUrls([]);
            setActiveIdx(0);
          }}
        >
          <div
            className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="text-sm font-semibold text-gray-900">{attachTitle}</div>

              <button
                type="button"
                onClick={() => {
                  setAttachOpen(false);
                  setAttachUrls([]);
                  setActiveIdx(0);
                }}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border hover:bg-gray-50"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="bg-gray-50 p-4">
              {!attachUrls.length ? (
                <div className="text-sm text-gray-600">No attachment.</div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center rounded-2xl border bg-white p-3">
                    <img
                      src={attachUrls[Math.min(activeIdx, attachUrls.length - 1)]}
                      alt="Attachment"
                      className="h-[60vh] w-full max-w-full rounded-xl object-contain"
                    />
                  </div>

                  {attachUrls.length > 1 ? (
                    <div className="flex max-w-full gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                      {attachUrls.map((u, i) => {
                        const active = i === activeIdx;
                        return (
                          <button
                            key={u}
                            type="button"
                            onClick={() => setActiveIdx(i)}
                            className={[
                              "shrink-0 overflow-hidden rounded-xl border bg-white",
                              active
                                ? "ring-2 ring-emerald-400 border-emerald-300"
                                : "hover:border-slate-300",
                            ].join(" ")}
                            style={{ width: 110, height: 80 }}
                            aria-label={`Open image ${i + 1}`}
                          >
                            <img
                              src={u}
                              alt="Attachment thumbnail"
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          </button>
                        );
                      })}
                    </div>
                  ) : null}

                  <div className="text-xs text-slate-500">
                    {activeIdx + 1} / {attachUrls.length}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Schedule modal */}
      {schedOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
          onMouseDown={() => {
            setSchedOpen(false);
            setSchedBookingId(null);
          }}
        >
          <div
            className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="text-sm font-semibold text-gray-900">{schedTitle}</div>
              <button
                type="button"
                onClick={() => {
                  setSchedOpen(false);
                  setSchedBookingId(null);
                }}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border hover:bg-gray-50"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 p-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <div className="mb-1 text-xs font-medium text-gray-600">Date</div>
                  <input
                    type="date"
                    value={schedDate}
                    onChange={(e) => setSchedDate(e.target.value)}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <div className="mb-1 text-xs font-medium text-gray-600">Time (optional)</div>
                  <input
                    type="time"
                    value={schedTime}
                    onChange={(e) => setSchedTime(e.target.value)}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSchedOpen(false);
                    setSchedBookingId(null);
                  }}
                  className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveSchedule}
                  disabled={busy}
                  className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  Save schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {detailOpen && detailRow && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4"
          onMouseDown={() => {
            setDetailOpen(false);
            setDetailRow(null);
          }}
        >
          <div
            className="relative flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl max-h-[calc(100vh-2rem)]"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-4 py-3 shrink-0">
              <div className="text-sm font-semibold text-gray-900">
                Booking #{detailRow.patient_public_id ?? "—"}
              </div>

              <button
                type="button"
                onClick={() => {
                  setDetailOpen(false);
                  setDetailRow(null);
                }}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border hover:bg-gray-50"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 p-4 overflow-y-auto">
              {/* top meta */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">Name</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">{detailRow.patient_name ?? "—"}</div>
                </div>

                <div className="rounded-xl border bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">Treatment</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">{detailRow.service_name ?? "—"}</div>
                </div>

                <div className="rounded-xl border bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">Phone</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">{detailRow.phone ?? "—"}</div>
                </div>

                <div className="rounded-xl border bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">Preferred</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">
                    {fmtPreferred(detailRow.preferred_date, detailRow.preferred_time)}
                  </div>
                </div>
              </div>

              {/* status */}
              {(() => {
                const locked = detailRow.status === "cancelled_by_patient";
                return (
                  <div className="rounded-2xl border p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="text-sm font-semibold text-slate-900">Status</div>

                      <select
                        disabled={busy || locked}
                        value={detailRow.status}
                        onChange={(e) => updateStatus(detailRow.booking_id, e.target.value as any)}
                        className={"rounded-md border px-3 py-2 text-sm " + (locked ? "opacity-60 cursor-not-allowed bg-gray-50" : "")}
                      >
                        <option value="pending">pending</option>
                        <option value="confirmed">confirmed</option>
                        <option value="cancelled">cancelled</option>
                        <option value="completed">completed</option>
                        <option value="cancelled_by_patient" disabled>
                          cancelled_by_patient
                        </option>
                      </select>
                    </div>

                    {locked ? (
                      <div className="mt-2 text-xs text-slate-500">
                        This booking was cancelled by patient. Editing is disabled.
                      </div>
                    ) : null}
                  </div>
                );
              })()}

              {/* schedule */}
              <div className="rounded-2xl border p-4">
                <div className="text-sm font-semibold text-slate-900">Schedule</div>
                <div className="mt-1 text-xs text-slate-500">
                  Current: {fmtScheduled(detailRow.scheduled_at)}
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="sm:col-span-2">
                    <div className="mb-1 text-xs font-medium text-gray-600">Date</div>
                    <input
                      type="date"
                      value={schedDate}
                      onChange={(e) => setSchedDate(e.target.value)}
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      disabled={busy || detailRow.status === "cancelled_by_patient" || detailRow.status === "cancelled" || detailRow.status === "completed"}
                    />
                  </div>

                  <div>
                    <div className="mb-1 text-xs font-medium text-gray-600">Time</div>
                    <input
                      type="time"
                      value={schedTime}
                      onChange={(e) => setSchedTime(e.target.value)}
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      disabled={busy || detailRow.status === "cancelled_by_patient" || detailRow.status === "cancelled" || detailRow.status === "completed"}
                    />
                  </div>
                </div>

                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={async () => {
                      await saveSchedule();
                      // подтянем локально detailRow.scheduled_at
                      setDetailRow((prev) => (prev ? { ...prev, scheduled_at: `${new Date(`${schedDate}T${(schedTime || "00:00").trim()}:00`).toISOString()}` } : prev));
                    }}
                    disabled={
                      busy ||
                      !schedDate ||
                      detailRow.status === "cancelled_by_patient" ||
                      detailRow.status === "cancelled" ||
                      detailRow.status === "completed"
                    }
                    className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                  >
                    Save schedule
                  </button>
                </div>
              </div>

              {/* pricing */}
              <div className="rounded-2xl border p-4">
                <div className="text-sm font-semibold text-slate-900">Pricing</div>

                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border bg-slate-50 p-3">
                    <div className="text-xs text-slate-500">Pre-cost</div>
                    <div className="mt-1 text-sm font-semibold text-slate-900">{fmtMoney(detailRow.pre_cost, detailRow.currency)}</div>
                  </div>

                  <div className="rounded-xl border bg-slate-50 p-3">
                    <div className="text-xs text-slate-500">Actual</div>
                    <div className="mt-1 text-sm font-semibold text-slate-900">{fmtMoney(detailRow.actual_cost, detailRow.currency)}</div>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_110px]">
                  <input
                    value={actualCostDraft}
                    onChange={(e) => setActualCostDraft(e.target.value)}
                    placeholder="Actual cost"
                    inputMode="decimal"
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    disabled={busy || detailRow.status === "cancelled_by_patient" || detailRow.status === "cancelled" || detailRow.status === "completed"}
                  />

                  <input
                    value={currencyDraft}
                    onChange={(e) => setCurrencyDraft(e.target.value.toUpperCase())}
                    placeholder="USD"
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    disabled={busy || detailRow.status === "cancelled_by_patient" || detailRow.status === "cancelled" || detailRow.status === "completed"}
                  />
                </div>

                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={saveActualCost}
                    disabled={
                      busy ||
                      detailRow.status === "cancelled_by_patient" ||
                      detailRow.status === "cancelled" ||
                      detailRow.status === "completed"
                    }
                    className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-60"
                  >
                    Save actual cost
                  </button>
                </div>
              </div>

              {/* attachments */}
              <div className="rounded-2xl border p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-900">Attachments</div>
                  <button
                    type="button"
                    onClick={() => openAttachment(detailRow)}
                    disabled={busy}
                    className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
                  >
                    View attachments
                  </button>
                </div>

                <div className="mt-2 text-xs text-slate-500">
                  If this is a landing lead, lead images will be shown first.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}