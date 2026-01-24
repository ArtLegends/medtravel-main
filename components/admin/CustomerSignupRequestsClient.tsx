"use client";

import { useEffect, useMemo, useState } from "react";

type Row = {
  id: string;
  user_id: string;
  email: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  decided_at: string | null;
  admin_note: string | null;
};

function fmt(dt?: string | null) {
  if (!dt) return "—";
  try {
    return new Date(dt).toLocaleString();
  } catch {
    return dt;
  }
}

export default function CustomerSignupRequestsClient() {
  const [status, setStatus] = useState<"pending" | "approved" | "rejected" | "all">("all");
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);

  const [limit] = useState(20);
  const [offset, setOffset] = useState(0);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const canPrev = offset > 0;
  const canNext = offset + limit < total;

  const queryUrl = useMemo(() => {
    const sp = new URLSearchParams();
    sp.set("status", status);
    if (q.trim()) sp.set("q", q.trim());
    sp.set("limit", String(limit));
    sp.set("offset", String(offset));
    return `/api/admin/customer-signup-requests?${sp.toString()}`;
  }, [status, q, limit, offset]);

  async function load() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(queryUrl, { cache: "no-store" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Failed to load");
      setItems(json.items ?? []);
      setTotal(Number(json.total ?? 0));
    } catch (e: any) {
      setError(String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryUrl]);

  async function approve(id: string) {
    if (!confirm("Approve this customer request?")) return;
    setToast(null);
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/admin/customer-signup-requests/approve", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Approve failed");
      setToast("Approved and email sent.");
      await load();
    } catch (e: any) {
      setError(String(e?.message ?? e));
    } finally {
      setBusy(false);
      setTimeout(() => setToast(null), 2500);
    }
  }

  async function reject(id: string) {
    const note = prompt("Reject note (optional):", "") ?? "";
    if (!confirm("Reject this customer request?")) return;

    setToast(null);
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/admin/customer-signup-requests/reject", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, note: note.trim() || null }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Reject failed");
      setToast("Rejected and email sent.");
      await load();
    } catch (e: any) {
      setError(String(e?.message ?? e));
    } finally {
      setBusy(false);
      setTimeout(() => setToast(null), 2500);
    }
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Customer signup requests</h1>
          <p className="text-sm text-slate-500">
            Approve or reject clinic (customer) registration requests
          </p>
        </div>

        <button
          onClick={() => load()}
          disabled={busy}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-60"
        >
          Refresh
        </button>
      </div>

      {toast ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {toast}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="rounded-2xl border bg-white p-4 space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="flex gap-2 flex-wrap">
            {(["pending", "approved", "rejected", "all"] as const).map((s) => (
              <button
                key={s}
                onClick={() => {
                  setOffset(0);
                  setStatus(s);
                }}
                className={[
                  "rounded-full px-3 py-1 text-sm border",
                  status === s
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "border-slate-200 hover:bg-slate-50",
                ].join(" ")}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by email..."
              className="h-9 w-64 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
            <button
              disabled={busy}
              onClick={() => {
                setOffset(0);
                load();
              }}
              className="h-9 rounded-lg border border-slate-200 px-3 text-sm hover:bg-slate-50 disabled:opacity-60"
            >
              Search
            </button>
          </div>
        </div>

        <div className="text-sm text-slate-500">
          Showing <b>{items.length}</b> of <b>{total}</b>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-3">Email</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Created</th>
                <th className="py-2 pr-3">Decided</th>
                <th className="py-2 pr-3">Note</th>
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {items.map((r) => (
                <tr key={r.id} className="border-b last:border-b-0">
                  <td className="py-3 pr-3">
                    <div className="font-medium text-slate-900">{r.email}</div>
                    <div className="text-xs text-slate-500">{r.user_id}</div>
                  </td>

                  <td className="py-3 pr-3">
                    <span
                      className={[
                        "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold",
                        r.status === "pending"
                          ? "bg-amber-50 text-amber-700"
                          : r.status === "approved"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-700",
                      ].join(" ")}
                    >
                      {r.status}
                    </span>
                  </td>

                  <td className="py-3 pr-3">{fmt(r.created_at)}</td>
                  <td className="py-3 pr-3">{fmt(r.decided_at)}</td>
                  <td className="py-3 pr-3 text-slate-600">{r.admin_note || "—"}</td>

                  <td className="py-3 text-right">
                    {r.status === "pending" ? (
                      <div className="inline-flex gap-2">
                        <button
                          disabled={busy}
                          onClick={() => approve(r.id)}
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                        >
                          Approve
                        </button>
                        <button
                          disabled={busy}
                          onClick={() => reject(r.id)}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs hover:bg-slate-50 disabled:opacity-60"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500">—</span>
                    )}
                  </td>
                </tr>
              ))}

              {!items.length ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No requests found
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between">
          <button
            disabled={busy || !canPrev}
            onClick={() => setOffset((o) => Math.max(0, o - limit))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-60"
          >
            ← Prev
          </button>

          <div className="text-sm text-slate-500">
            Page {Math.floor(offset / limit) + 1} / {Math.max(1, Math.ceil(total / limit))}
          </div>

          <button
            disabled={busy || !canNext}
            onClick={() => setOffset((o) => o + limit)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-60"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
