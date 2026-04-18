// components/admin/PartnerLeadsClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

type Row = {
  id: string;
  source: string;
  full_name: string;
  phone: string;
  email: string;
  age: number | null;
  image_paths: string[];
  status: string;
  admin_note: string | null;
  created_at: string;
  quiz_answers?: Array<{ question: string; answer: string }> | null;

  assigned_partner_id?: string | null;
  assigned_at?: string | null;
  assigned_by?: string | null;
  assigned_note?: string | null;
};

type Partner = { id: string; name: string; email: string };

function fmt(dt?: string | null) {
  if (!dt) return "—";
  try { return new Date(dt).toLocaleString(); } catch { return dt; }
}

export default function PartnerLeadsClient() {
  const [status, setStatus] = useState<"all" | "new">("all");
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const [offset, setOffset] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [assignTo, setAssignTo] = useState<Record<string, string>>({});

  // image modal
  const [attachOpen, setAttachOpen] = useState(false);
  const [attachUrls, setAttachUrls] = useState<string[]>([]);
  const [attachTitle, setAttachTitle] = useState("Images");
  const [activeIdx, setActiveIdx] = useState(0);

  // detail modal
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRow, setDetailRow] = useState<Row | null>(null);

  const canPrev = offset > 0;
  const canNext = offset + limit < total;

  const queryUrl = useMemo(() => {
    const sp = new URLSearchParams();
    sp.set("status", status);
    if (q.trim()) sp.set("q", q.trim());
    sp.set("limit", String(limit));
    sp.set("offset", String(offset));
    return `/api/admin/partner-leads?${sp.toString()}`;
  }, [status, q, limit, offset]);

  async function readError(res: Response) {
    const ct = res.headers.get("content-type") ?? "";
    if (ct.includes("application/json")) {
      const j = await res.json().catch(() => null);
      return j?.error ? String(j.error) : JSON.stringify(j);
    }
    return `${res.status} ${res.statusText}`;
  }

  async function load() {
    setError(null); setBusy(true);
    try {
      const res = await fetch(queryUrl, { cache: "no-store" });
      if (!res.ok) throw new Error(await readError(res));
      const json = await res.json().catch(() => ({}));
      setItems(json.items ?? []);
      setTotal(Number(json.total ?? 0));
    } catch (e: any) { setError(String(e?.message ?? e)); }
    finally { setBusy(false); }
  }

  async function loadPartners() {
    try {
      const res = await fetch("/api/admin/partners", { cache: "no-store" });
      if (!res.ok) throw new Error(await readError(res));
      const j = await res.json().catch(() => ({}));
      setPartners(j?.items ?? []);
    } catch (e: any) { setError(String(e?.message ?? e)); }
  }

  async function assignLead(leadId: string) {
    const partnerId = String(assignTo[leadId] ?? "").trim();
    if (!partnerId) { setError("Select partner first"); return; }
    setBusy(true); setError(null);
    try {
      const res = await fetch("/api/admin/partner-leads/assign", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ lead_id: leadId, partner_id: partnerId }),
      });
      if (!res.ok) throw new Error(await readError(res));
      const j = await res.json().catch(() => ({}));
      const updated: Row | null = j?.item ?? null;
      if (updated?.id) {
        setItems((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      } else { await load(); }
    } catch (e: any) { setError(String(e?.message ?? e)); }
    finally { setBusy(false); }
  }

  useEffect(() => { load(); }, [queryUrl]);
  useEffect(() => { loadPartners(); }, []);

  async function openImages(r: Row) {
    setBusy(true); setError(null);
    try {
      const paths = (r.image_paths ?? []).map((p) => String(p ?? "").trim()).filter(Boolean).slice(0, 3);
      if (!paths.length) { setAttachTitle(`Images for ${r.full_name}`); setAttachUrls([]); setAttachOpen(true); return; }
      const urls = paths.map((p) => `/api/admin/partner-leads/images?path=${encodeURIComponent(p)}`);
      setAttachTitle(`Images for ${r.full_name}`);
      setAttachUrls(urls); setActiveIdx(0); setAttachOpen(true);
    } catch (e: any) { setError(String(e?.message ?? e)); }
    finally { setBusy(false); }
  }

  function openDetail(r: Row) { setDetailRow(r); setDetailOpen(true); }

  useEffect(() => {
    if (!attachOpen && !detailOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAttachOpen(false); setAttachUrls([]); setActiveIdx(0);
        setDetailOpen(false); setDetailRow(null);
      }
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [attachOpen, detailOpen]);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Partner Leads</h1>
          <p className="text-sm text-slate-500">Leads from landing forms</p>
        </div>
        <button onClick={() => load()} disabled={busy}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-60">Refresh</button>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="rounded-2xl border bg-white p-4 space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="flex gap-2 flex-wrap">
            {(["all", "new"] as const).map((s) => (
              <button key={s} onClick={() => { setOffset(0); setStatus(s); }}
                className={["rounded-full px-3 py-1 text-sm border", status === s ? "bg-emerald-600 text-white border-emerald-600" : "border-slate-200 hover:bg-slate-50"].join(" ")}>{s}</button>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name / phone / email..."
              className="h-9 w-72 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200" />
            <button disabled={busy} onClick={() => { setOffset(0); load(); }}
              className="h-9 rounded-lg border border-slate-200 px-3 text-sm hover:bg-slate-50 disabled:opacity-60">Search</button>
          </div>
        </div>

        <div className="text-sm text-slate-500">Showing <b>{items.length}</b> of <b>{total}</b></div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-3">Name</th>
                <th className="py-2 pr-3">Phone</th>
                <th className="py-2 pr-3">Email</th>
                <th className="py-2 pr-3">Created</th>
                <th className="py-2 pr-3">Source</th>
                <th className="py-2 pr-3">Assign</th>
                <th className="py-2 pr-3">Assigned</th>
                <th className="py-2 pr-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id} className="border-b last:border-b-0">
                  <td className="py-3 pr-3">
                    <div className="font-medium text-slate-900">{r.full_name}</div>
                    <div className="text-xs text-slate-500">{r.id.slice(0, 8)}…</div>
                  </td>
                  <td className="py-3 pr-3">{r.phone}</td>
                  <td className="py-3 pr-3">{r.email || "—"}</td>
                  <td className="py-3 pr-3 text-xs">{fmt(r.created_at)}</td>
                  <td className="py-3 pr-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                      r.source?.includes("quiz") ? "bg-indigo-50 text-indigo-700" :
                      r.source?.includes("flexbe") ? "bg-sky-50 text-sky-700" :
                      "bg-slate-100 text-slate-600"
                    }`}>{r.source}</span>
                  </td>
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-2">
                      <select value={assignTo[r.id] ?? r.assigned_partner_id ?? ""}
                        onChange={(e) => setAssignTo((m) => ({ ...m, [r.id]: e.target.value }))}
                        disabled={busy} className="h-8 w-40 rounded-lg border border-slate-200 bg-white px-2 text-xs">
                        <option value="">Select partner…</option>
                        {partners.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
                      </select>
                      <button type="button" disabled={busy || !(assignTo[r.id] ?? r.assigned_partner_id)} onClick={() => assignLead(r.id)}
                        className="h-8 rounded-lg border border-slate-200 px-3 text-xs font-semibold hover:bg-slate-50 disabled:opacity-60">Assign</button>
                    </div>
                  </td>
                  <td className="py-3 pr-3 text-xs text-slate-600">
                    {r.assigned_partner_id ? (
                      <div className="space-y-0.5">
                        <div className="font-semibold text-slate-800">{partners.find((p) => p.id === r.assigned_partner_id)?.name ?? "Assigned"}</div>
                        <div className="text-slate-500">{fmt(r.assigned_at ?? null)}</div>
                      </div>
                    ) : "—"}
                  </td>
                  <td className="py-3 pr-3">
                    <button type="button" onClick={() => openDetail(r)}
                      className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50">
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {!items.length && (
                <tr><td colSpan={8} className="py-8 text-center text-slate-500">No leads found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between">
          <button disabled={busy || !canPrev} onClick={() => setOffset((o) => Math.max(0, o - limit))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-60">← Prev</button>
          <div className="text-sm text-slate-500">Page {Math.floor(offset / limit) + 1} / {Math.max(1, Math.ceil(total / limit))}</div>
          <button disabled={busy || !canNext} onClick={() => setOffset((o) => o + limit)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-60">Next →</button>
        </div>
      </div>

      {/* ── Detail Modal ── */}
      {detailOpen && detailRow && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
          onMouseDown={() => { setDetailOpen(false); setDetailRow(null); }}>
          <div className="relative w-full max-w-2xl max-h-[calc(100vh-2rem)] flex flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
            onMouseDown={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b px-5 py-4 shrink-0">
              <div>
                <div className="text-base font-semibold text-gray-900">{detailRow.full_name}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    detailRow.source?.includes("quiz") ? "bg-indigo-50 text-indigo-700" :
                    detailRow.source?.includes("flexbe") ? "bg-sky-50 text-sky-700" :
                    "bg-slate-100 text-slate-600"
                  }`}>{detailRow.source}</span>
                  <span className="ml-2">{fmt(detailRow.created_at)}</span>
                </div>
              </div>
              <button type="button" onClick={() => { setDetailOpen(false); setDetailRow(null); }}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border hover:bg-gray-50" aria-label="Close">✕</button>
            </div>

            <div className="overflow-y-auto p-5 space-y-4">
              {/* Contact info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">Phone</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">{detailRow.phone || "—"}</div>
                </div>
                <div className="rounded-xl border bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">Email</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">{detailRow.email || "—"}</div>
                </div>
                <div className="rounded-xl border bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">Age</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">{detailRow.age ?? "—"}</div>
                </div>
                <div className="rounded-xl border bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">Status</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">{detailRow.status}</div>
                </div>
              </div>

              {/* Assignment */}
              {detailRow.assigned_partner_id && (
                <div className="rounded-xl border bg-emerald-50 p-3">
                  <div className="text-xs text-emerald-700 font-medium">Assigned to</div>
                  <div className="mt-1 text-sm font-semibold text-emerald-900">
                    {partners.find((p) => p.id === detailRow.assigned_partner_id)?.name ?? detailRow.assigned_partner_id}
                  </div>
                  <div className="text-xs text-emerald-600 mt-0.5">{fmt(detailRow.assigned_at)}</div>
                </div>
              )}

              {/* Images */}
              {detailRow.image_paths?.length > 0 && (
                <div className="rounded-xl border p-3">
                  <div className="text-xs text-slate-500 mb-2">Images ({detailRow.image_paths.length})</div>
                  <button type="button" onClick={() => openImages(detailRow)}
                    className="inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100">
                    View images
                  </button>
                </div>
              )}

              {/* Quiz Answers */}
              {detailRow.quiz_answers && detailRow.quiz_answers.length > 0 && (
                <div className="rounded-xl border p-4">
                  <div className="text-sm font-semibold text-gray-900 mb-3">Quiz Answers</div>
                  <div className="space-y-3">
                    {detailRow.quiz_answers.map((qa, i) => (
                      <div key={i} className="rounded-lg bg-slate-50 p-3">
                        <div className="text-xs font-medium text-slate-500">{qa.question}</div>
                        <div className="mt-1 text-sm text-slate-900">{qa.answer}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin note */}
              {detailRow.admin_note && (
                <div className="rounded-xl border p-3">
                  <div className="text-xs text-slate-500">Admin Note</div>
                  <div className="mt-1 text-sm text-slate-900">{detailRow.admin_note}</div>
                </div>
              )}

              {/* Lead ID */}
              <div className="text-xs text-slate-400 font-mono break-all">ID: {detailRow.id}</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Image Modal ── */}
      {attachOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4"
          onMouseDown={() => { setAttachOpen(false); setAttachUrls([]); setActiveIdx(0); }}>
          <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl"
            onMouseDown={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="text-sm font-semibold text-gray-900">{attachTitle}</div>
              <button type="button" onClick={() => { setAttachOpen(false); setAttachUrls([]); setActiveIdx(0); }}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border hover:bg-gray-50" aria-label="Close">✕</button>
            </div>
            <div className="bg-gray-50 p-4">
              {!attachUrls.length ? (<div className="text-sm text-gray-600">No images.</div>) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center rounded-2xl border bg-white p-3">
                    <img src={attachUrls[Math.min(activeIdx, attachUrls.length - 1)]} alt="Lead image"
                      className="h-[60vh] w-full max-w-full rounded-xl object-contain" />
                  </div>
                  {attachUrls.length > 1 && (
                    <div className="flex max-w-full gap-3 overflow-x-auto pb-1">
                      {attachUrls.map((u, i) => (
                        <button key={u} type="button" onClick={() => setActiveIdx(i)}
                          className={["shrink-0 overflow-hidden rounded-xl border bg-white",
                            i === activeIdx ? "ring-2 ring-emerald-400 border-emerald-300" : "hover:border-slate-300"].join(" ")}
                          style={{ width: 110, height: 80 }}>
                          <img src={u} alt="" className="h-full w-full object-cover" loading="lazy" />
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="text-xs text-slate-500">{activeIdx + 1} / {attachUrls.length}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}