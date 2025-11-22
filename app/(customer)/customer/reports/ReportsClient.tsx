"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { useSupabase } from "@/lib/supabase/supabase-provider";
import {
  updateReportStatusAction,
  deleteReportAction,
  deleteAllReportsAction,
} from "./actions";

type ReportRow = {
  id: string;
  clinic_id: string;
  created_at: string;
  reporter: string | null;
  contact: string | null;
  relationship: string | null;
  details: string | null;
  status: string | null;
};

const STATUS_OPTIONS = ["New", "Processed", "Rejected"] as const;
type StatusOption = (typeof STATUS_OPTIONS)[number];

const PAGE_SIZE = 10;

function normalizeStatus(raw: string | null | undefined): StatusOption {
  const s = (raw ?? "").toLowerCase();
  if (s === "processed") return "Processed";
  if (s === "rejected") return "Rejected";
  return "New";
}

export default function ReportsClient() {
  const { supabase } = useSupabase();

  const [clinicId, setClinicId] = useState<string | null>(null);
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // фильтры
  const [statusFilter, setStatusFilter] = useState<StatusOption | "">("");
  const [startDate, setStartDate] = useState(""); // YYYY-MM-DD
  const [endDate, setEndDate] = useState(""); // YYYY-MM-DD

  const [page, setPage] = useState(1);
  const [isPending, startTransition] = useTransition();

  const loadReports = useCallback(
    async (cid: string, silent = false) => {
      if (!silent) setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("v_customer_reports" as any)
        .select("*")
        .eq("clinic_id", cid)
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setRows((data ?? []) as ReportRow[]);
      }
      if (!silent) setLoading(false);
    },
    [supabase]
  );

  // первый запрос: узнаём пользователя → его клинику → репорты
  useEffect(() => {
    let active = true;

    async function init() {
      try {
        setLoading(true);
        setError(null);

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;
        if (!user) {
          if (!active) return;
          setError("You are not authenticated.");
          return;
        }

        const { data: clinicRow, error: clinicError } = await supabase
          .from("clinics")
          .select("id")
          .eq("owner_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (clinicError) throw clinicError;

        const cid = (clinicRow as any)?.id as string | undefined;
        if (!cid) {
          if (!active) return;
          setError(
            "No clinic is linked to this account yet. Please contact MedTravel support."
          );
          return;
        }

        if (!active) return;
        setClinicId(cid);
        await loadReports(cid);
      } catch (e: any) {
        if (!active) return;
        console.error(e);
        setError(e?.message ?? "Failed to load reports.");
      } finally {
        if (!active) return;
        setLoading(false);
      }
    }

    init();
    return () => {
      active = false;
    };
  }, [supabase, loadReports]);

  // realtime: любые INSERT/UPDATE/DELETE по reports для этой клиники → мягко перезагружаем список
  useEffect(() => {
    if (!clinicId) return;

    const channel = supabase
      .channel(`customer-reports-${clinicId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "reports",
          filter: `clinic_id=eq.${clinicId}`,
        },
        () => {
          // без спиннера — тихое обновление
          loadReports(clinicId, true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, clinicId, loadReports]);

  // сбрасываем страницу при изменении фильтров
  useEffect(() => {
    setPage(1);
  }, [statusFilter, startDate, endDate]);

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const normalized = normalizeStatus(r.status);

      if (statusFilter && normalized !== statusFilter) return false;

      if (startDate || endDate) {
        const d = r.created_at ? r.created_at.slice(0, 10) : "";
        if (startDate && d < startDate) return false;
        if (endDate && d > endDate) return false;
      }

      return true;
    });
  }, [rows, statusFilter, startDate, endDate]);

  const total = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [filteredRows, currentPage]);

  function resetFilters() {
    setStatusFilter("");
    setStartDate("");
    setEndDate("");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-gray-500">
            User-submitted reports for your clinic
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* единственная кнопка Delete All с подтверждением */}
          <button
            onClick={() => {
              if (
                !window.confirm(
                  "Are you sure you want to delete ALL reports? This action cannot be undone."
                )
              ) {
                return;
              }
              startTransition(async () => {
                await deleteAllReportsAction();
                setRows([]);
              });
            }}
            className="inline-flex items-center gap-2 rounded-md bg-rose-500 px-3 py-2 text-sm text-white hover:bg-rose-600 disabled:opacity-60"
            disabled={isPending || rows.length === 0}
          >
            <Trash2 className="h-4 w-4" />
            Delete All
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="rounded-xl border bg-white p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[220px,1fr,1fr,auto]">
          <div className="space-y-1">
            <label className="text-sm font-medium">All Statuses</label>
            <select
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as StatusOption | "")
              }
            >
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Start Date</label>
            <input
              type="date"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">End Date</label>
            <input
              type="date"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="flex items-end justify-end">
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-white">
        <div className="flex items-center justify-between px-4 py-3 text-sm text-gray-500">
          <div>
            Total: {total}
            {total !== rows.length ? ` (filtered from ${rows.length})` : ""}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Reporter</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Relationship</th>
                <th className="px-4 py-3">Details</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="p-6 text-center text-gray-400 text-sm"
                  >
                    Loading reports…
                  </td>
                </tr>
              ) : paginatedRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="p-6 text-center text-gray-500 text-sm"
                  >
                    No reports found.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((r) => (
                  <ReportRowItem
                    key={r.id}
                    row={r}
                    onDeleted={() =>
                      setRows((prev) => prev.filter((x) => x.id !== r.id))
                    }
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3 text-sm text-gray-600">
            <div>
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() =>
                  setPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ReportRowItem({
  row,
  onDeleted,
}: {
  row: ReportRow;
  onDeleted: () => void;
}) {
  const [status, setStatus] = useState<StatusOption>(
    normalizeStatus(row.status)
  );
  const [isPending, startTransition] = useTransition();

  const created = row.created_at
    ? new Date(row.created_at).toLocaleString()
    : "—";

  return (
    <tr>
      <td className="px-4 py-3 whitespace-nowrap">{created}</td>
      <td className="px-4 py-3">{row.reporter ?? "—"}</td>
      <td className="px-4 py-3">{row.contact ?? "—"}</td>
      <td className="px-4 py-3">{row.relationship ?? "—"}</td>
      <td
        className="px-4 py-3 max-w-[420px] truncate"
        title={row.details ?? undefined}
      >
        {row.details ?? "—"}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <select
            className="rounded border px-2 py-1 text-sm"
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as StatusOption)
            }
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                await updateReportStatusAction(row.id, status);
              });
            }}
            className="rounded border px-2 py-1 text-xs hover:bg-gray-50 disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Save"}
          </button>
        </div>
      </td>
      <td className="px-4 py-3 text-right">
        <button
          type="button"
          onClick={() => {
            if (
              !window.confirm(
                "Delete this report? This action cannot be undone."
              )
            ) {
              return;
            }
            startTransition(async () => {
              await deleteReportAction(row.id);
              onDeleted();
            });
          }}
          className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700 disabled:opacity-50"
          disabled={isPending}
        >
          Delete
        </button>
      </td>
    </tr>
  );
}
