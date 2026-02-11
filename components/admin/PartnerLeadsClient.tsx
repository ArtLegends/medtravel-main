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
};

function fmt(dt?: string | null) {
  if (!dt) return "—";
  try {
    return new Date(dt).toLocaleString();
  } catch {
    return dt;
  }
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

  // modal
  const [attachOpen, setAttachOpen] = useState(false);
  const [attachUrls, setAttachUrls] = useState<string[]>([]);
  const [attachTitle, setAttachTitle] = useState("Images");
  const [activeIdx, setActiveIdx] = useState(0);

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
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(queryUrl, { cache: "no-store" });
      if (!res.ok) throw new Error(await readError(res));
      const json = await res.json().catch(() => ({}));
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

    async function openImages(r: Row) {
        setBusy(true);
        setError(null);

        try {
            const paths = (r.image_paths ?? [])
                .map((p) => String(p ?? "").trim())
                .filter(Boolean)
                .slice(0, 3);

            if (!paths.length) {
                setAttachTitle(`Images for ${r.full_name}`);
                setAttachUrls([]);
                setAttachOpen(true);
                return;
            }

            // ВАЖНО: endpoint возвращает image bytes, поэтому URL = сам endpoint с path
            const urls = paths.map(
                (p) => `/api/admin/partner-leads/images?path=${encodeURIComponent(p)}`
            );

            setAttachTitle(`Images for ${r.full_name}`);
            setAttachUrls(urls);
            setActiveIdx(0);
            setAttachOpen(true);
        } catch (e: any) {
            setError(String(e?.message ?? e));
        } finally {
            setBusy(false);
        }
    }

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

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Partner Leads</h1>
          <p className="text-sm text-slate-500">Leads from landing forms</p>
        </div>

        <button
          onClick={() => load()}
          disabled={busy}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-60"
        >
          Refresh
        </button>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="rounded-2xl border bg-white p-4 space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="flex gap-2 flex-wrap">
            {(["all", "new"] as const).map((s) => (
              <button
                key={s}
                onClick={() => {
                  setOffset(0);
                  setStatus(s);
                }}
                className={[
                  "rounded-full px-3 py-1 text-sm border",
                  status === s ? "bg-emerald-600 text-white border-emerald-600" : "border-slate-200 hover:bg-slate-50",
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
              placeholder="Search by name / phone / email..."
              className="h-9 w-72 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
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
                <th className="py-2 pr-3">Name</th>
                <th className="py-2 pr-3">Phone</th>
                <th className="py-2 pr-3">Email</th>
                <th className="py-2 pr-3">Age</th>
                <th className="py-2 pr-3">Created</th>
                <th className="py-2 pr-3">Images</th>
                <th className="py-2 pr-3">Source</th>
              </tr>
            </thead>

            <tbody>
              {items.map((r) => (
                <tr key={r.id} className="border-b last:border-b-0">
                  <td className="py-3 pr-3">
                    <div className="font-medium text-slate-900">{r.full_name}</div>
                    <div className="text-xs text-slate-500">{r.id}</div>
                  </td>
                  <td className="py-3 pr-3">{r.phone}</td>
                  <td className="py-3 pr-3">{r.email}</td>
                  <td className="py-3 pr-3">{r.age ?? "—"}</td>
                  <td className="py-3 pr-3">{fmt(r.created_at)}</td>

                  <td className="py-3 pr-3">
                    {r.image_paths?.length ? (
                      <button
                        type="button"
                        onClick={() => openImages(r)}
                        disabled={busy}
                        className="inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-60"
                      >
                        View ({Math.min(3, r.image_paths.length)})
                      </button>
                    ) : (
                      <span className="text-xs text-slate-500">—</span>
                    )}
                  </td>

                  <td className="py-3 pr-3 text-slate-600">{r.source}</td>
                </tr>
              ))}

              {!items.length ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No leads found
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

      {attachOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
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
                <div className="text-sm text-gray-600">No images.</div>
              ) : (
                <div className="space-y-4">
                  {/* Main viewer */}
                  <div className="flex items-center justify-center rounded-2xl border bg-white p-3">
                    <img
                      src={attachUrls[Math.min(activeIdx, attachUrls.length - 1)]}
                      alt="Lead image"
                      className="h-[60vh] w-full max-w-full rounded-xl object-contain"
                    />
                  </div>

                  {/* Thumbnails row */}
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
                            active ? "ring-2 ring-emerald-400 border-emerald-300" : "hover:border-slate-300",
                          ].join(" ")}
                          style={{ width: 110, height: 80 }}
                          aria-label={`Open image ${i + 1}`}
                        >
                          <img
                            src={u}
                            alt="Lead thumbnail"
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </button>
                      );
                    })}
                  </div>

                  <div className="text-xs text-slate-500">
                    {activeIdx + 1} / {attachUrls.length}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}