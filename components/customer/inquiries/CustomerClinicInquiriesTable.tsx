// components/customer/inquiries/CustomerClinicInquiriesTable.tsx
"use client";

import { useOptimistic, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  customerUpdateClinicInquiryStatusAction,
  customerDeleteClinicInquiryAction,
  customerDeleteAllClinicInquiriesAction,
} from "@/app/(customer)/customer/inquiries/actions";

export type Row = {
  id: string;
  created_at: string;
  clinic_id: string;
  clinic_name: string;
  clinic_slug: string;
  clinic_country?: string | null;
  clinic_province?: string | null;
  clinic_city?: string | null;
  clinic_district?: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  message: string | null;
  status: string | null;
};

type Props = {
  rows: Row[];
  total: number;
  page: number;
  pages: number;
  start?: string;
  end?: string;
  status?: string;
  limit: number;
};

function isoToDateInput(v?: string) {
  if (!v) return "";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export default function CustomerClinicInquiriesTable(props: Props) {
  const { rows, page, pages, start, end, status } = props;

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const basePath = pathname ?? "";

  const [startDate, setStartDate] = useState<string>(isoToDateInput(start));
  const [endDate, setEndDate] = useState<string>(isoToDateInput(end));
  const [statusFilter, setStatusFilter] = useState<string>(status || "all");

  const buildHref = useMemo(() => {
    return (p: number, s?: string, e?: string, st?: string) => {
      const qs = new URLSearchParams(searchParams?.toString() ?? "");
      qs.delete("page"); qs.delete("start"); qs.delete("end"); qs.delete("status");

      if (p > 1) qs.set("page", String(p));
      if (s) qs.set("start", new Date(s).toISOString());
      if (e) qs.set("end", new Date(e).toISOString());
      if (st && st !== "all") qs.set("status", st);

      const q = qs.toString();
      return q ? `${basePath}?${q}` : basePath;
    };
  }, [basePath, searchParams]);

  const [isPending, startTransition] = useTransition();

  const [state, apply] = useOptimistic(
    rows,
    (prev, upd: (Partial<Row> & { id: string }) | { id: string; _delete: true }) => {
      if ("_delete" in upd) return prev.filter((r) => r.id !== upd.id);
      return prev.map((r) => (r.id === upd.id ? { ...r, ...upd } : r));
    }
  );

  const onStatus = (id: string, next: string) => {
    startTransition(async () => {
      apply({ id, status: next });
      await customerUpdateClinicInquiryStatusAction(id, next);
    });
  };

  const onDelete = (id: string) => {
    if (!confirm("Delete this inquiry?")) return;
    startTransition(async () => {
      apply({ id, _delete: true });
      await customerDeleteClinicInquiryAction(id);
    });
  };

  const onDeleteAll = () => {
    if (!confirm("Delete ALL inquiries that match the current filter?")) return;
    if (!confirm("Are you absolutely sure? This cannot be undone.")) return;

    startTransition(async () => {
      await customerDeleteAllClinicInquiriesAction({
        start: startDate ? new Date(startDate).toISOString() : "",
        end: endDate ? new Date(endDate).toISOString() : "",
        status: statusFilter,
      });
    });
  };

  const applyFilters = () => {
    router.push(buildHref(1, startDate || undefined, endDate || undefined, statusFilter));
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setStatusFilter("all");
    router.push(basePath);
  };

  return (
    <div className="rounded-lg border bg-white">
      <div className="flex flex-wrap items-end justify-between gap-3 p-3">
        <div className="flex flex-wrap items-end gap-2">
          <div>
            <div className="text-xs text-gray-500 mb-1">Start date</div>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="rounded-md border px-2 py-1" />
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">End date</div>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="rounded-md border px-2 py-1" />
          </div>

          <div>
            <div className="text-xs text-gray-500 mb-1">Status</div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-md border px-2 py-1">
              <option value="all">All</option>
              <option>New</option>
              <option>In review</option>
              <option>Contacted</option>
              <option>Scheduled</option>
              <option>Done</option>
              <option>Rejected</option>
            </select>
          </div>

          <button onClick={applyFilters} className="rounded-md bg-emerald-600 px-3 py-1.5 text-white hover:bg-emerald-700">
            Apply
          </button>
          <button onClick={clearFilters} className="rounded-md border px-3 py-1.5 hover:bg-gray-50">
            Clear filters
          </button>
        </div>

        <button onClick={onDeleteAll} disabled={isPending} className="rounded-md bg-rose-600 px-3 py-1.5 text-white disabled:opacity-50">
          Delete all
        </button>
      </div>

      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left">
          <tr>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Contact</th>
            <th className="px-4 py-3">Message</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {state.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="px-4 py-2">{new Date(r.created_at).toLocaleString()}</td>

              <td className="px-4 py-2">{r.clinic_name}</td>

              <td className="px-4 py-2">{r.name ?? "—"}</td>

              <td className="px-4 py-2">
                <div className="space-y-0.5">
                  {r.phone ?? "—"}
                  {r.email ? <div className="text-xs text-gray-500">{r.email}</div> : null}
                </div>
              </td>

              <td className="px-4 py-2">{r.message ?? "—"}</td>

              <td className="px-4 py-2">
                <select
                  className="rounded-md border px-2 py-1"
                  defaultValue={r.status ?? "New"}
                  onChange={(e) => onStatus(r.id, e.target.value)}
                  disabled={isPending}
                >
                  <option>New</option>
                  <option>In review</option>
                  <option>Contacted</option>
                  <option>Scheduled</option>
                  <option>Done</option>
                  <option>Rejected</option>
                </select>
              </td>

              <td className="px-4 py-2 text-right">
                <button
                  className="rounded-md bg-rose-600 px-3 py-1.5 text-white hover:bg-rose-700 disabled:opacity-50"
                  onClick={() => onDelete(r.id)}
                  disabled={isPending}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {state.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                No inquiries yet
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="flex items-center justify-between border-t p-3 text-sm">
        <div>
          Page {page} of {pages} • {props.limit} per page • Total {props.total}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => router.push(buildHref(page - 1, startDate || undefined, endDate || undefined, statusFilter))}
            disabled={page <= 1}
            className="rounded-md border px-3 py-1.5 disabled:opacity-50"
          >
            Prev
          </button>
          <button
            onClick={() => router.push(buildHref(page + 1, startDate || undefined, endDate || undefined, statusFilter))}
            disabled={page >= pages}
            className="rounded-md border px-3 py-1.5 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
