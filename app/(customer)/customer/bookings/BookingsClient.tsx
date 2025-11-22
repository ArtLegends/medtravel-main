"use client";

import React, {
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import clsx from "clsx";
import { Calendar, Download, Trash2 } from "lucide-react";
import {
  updateCustomerRequestStatusAction,
  deleteCustomerRequestAction,
  deleteAllCustomerRequestsAction,
} from "./actions";
import { useSupabase } from "@/lib/supabase/supabase-provider";

export type Row = {
  id: string;
  clinic_id: string | null;
  name: string | null;
  phone: string | null;
  contact_method: string | null;
  service: string | null;
  status: string | null;
  created_at: string | null;
};

type Props = {
  clinicId: string;
  initialRows: Row[];
};

const STATUS_OPTIONS = [
  "New",
  "In review",
  "Contacted",
  "Scheduled",
  "Done",
  "Rejected",
];

function OutlineBtn(
  props: React.ButtonHTMLAttributes<HTMLButtonElement>
) {
  const { className, type, children, ...rest } = props;
  return (
    <button
      type={type ?? "button"}
      className={clsx(
        "inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-gray-50",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

function mapDbRowToRow(db: any): Row {
  return {
    id: db.id,
    clinic_id: db.clinic_id ?? null,
    name: db.name ?? null,
    phone: db.phone ?? null,
    contact_method: db.contact_method ?? null,
    service: db.service ?? null,
    status: db.status ?? null,
    created_at: db.created_at ?? null,
  };
}

export default function BookingsClient({ clinicId, initialRows }: Props) {
  const { supabase } = useSupabase();

  const [rows, setRows] = useState<Row[]>(initialRows);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [statusDrafts, setStatusDrafts] = useState<Record<string, string>>(
    () => {
      const next: Record<string, string> = {};
      initialRows.forEach((r) => {
        next[r.id] = r.status ?? "New";
      });
      return next;
    }
  );

  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeletingAll, startDeleteAll] = useTransition();

  // держим драфты статусов в синке с новыми строками
  useEffect(() => {
    setStatusDrafts((prev) => {
      const next: Record<string, string> = {};
      rows.forEach((r) => {
        next[r.id] = prev[r.id] ?? r.status ?? "New";
      });
      return next;
    });
  }, [rows]);

  // Realtime: слушаем изменения в clinic_requests
  useEffect(() => {
    if (!supabase || !clinicId) return;

    const channel = supabase
      .channel(`customer-bookings-${clinicId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "clinic_requests",
          filter: `clinic_id=eq.${clinicId}`,
        },
        (payload) => {
          const fresh = mapDbRowToRow(payload.new);
          setRows((prev) => {
            if (prev.some((r) => r.id === fresh.id)) return prev;
            return [fresh, ...prev];
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "clinic_requests",
          filter: `clinic_id=eq.${clinicId}`,
        },
        (payload) => {
          const updated = mapDbRowToRow(payload.new);
          setRows((prev) =>
            prev.map((r) => (r.id === updated.id ? updated : r))
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "clinic_requests",
          filter: `clinic_id=eq.${clinicId}`,
        },
        (payload) => {
          const id = (payload.old as any)?.id;
          if (!id) return;
          setRows((prev) => prev.filter((r) => r.id !== id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, clinicId]);

  const serviceOptions = useMemo(
    () =>
      Array.from(
        new Set(
          rows
            .map((r) => r.service)
            .filter((s): s is string => !!s && s.trim().length > 0)
        )
      ),
    [rows]
  );

  const methodOptions = useMemo(
    () =>
      Array.from(
        new Set(
          rows
            .map((r) => r.contact_method)
            .filter((s): s is string => !!s && s.trim().length > 0)
        )
      ),
    [rows]
  );

  const filteredRows = useMemo(() => {
    const s = search.trim().toLowerCase();

    const fromTs = fromDate ? new Date(fromDate).getTime() : null;
    const toTs = toDate
      ? new Date(toDate + "T23:59:59").getTime()
      : null;

    return rows.filter((r) => {
      // search
      if (s) {
        const inName = (r.name ?? "").toLowerCase().includes(s);
        const inPhone = (r.phone ?? "").toLowerCase().includes(s);
        if (!inName && !inPhone) return false;
      }

      // status
      if (statusFilter !== "all") {
        if ((r.status ?? "New") !== statusFilter) return false;
      }

      // service
      if (serviceFilter !== "all") {
        if ((r.service ?? "") !== serviceFilter) return false;
      }

      // method
      if (methodFilter !== "all") {
        if ((r.contact_method ?? "") !== methodFilter) return false;
      }

      // dates
      if (fromTs || toTs) {
        if (!r.created_at) return false;
        const t = new Date(r.created_at).getTime();
        if (fromTs && t < fromTs) return false;
        if (toTs && t > toTs) return false;
      }

      return true;
    });
  }, [
    rows,
    search,
    statusFilter,
    serviceFilter,
    methodFilter,
    fromDate,
    toDate,
  ]);

  // сбрасываем страницу при изменении фильтров
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, serviceFilter, methodFilter, fromDate, toDate]);

  const total = filteredRows.length;
  const totalPages = total === 0 ? 1 : Math.ceil(total / pageSize);
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const pageRows = filteredRows.slice(
    startIndex,
    startIndex + pageSize
  );

  async function handleSaveStatus(id: string) {
    const val = statusDrafts[id] ?? "New";
    setSavingId(id);
    try {
      await updateCustomerRequestStatusAction(id, val);
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: val } : r))
      );
    } catch (e) {
      console.error(e);
      alert("Failed to update status. Please try again.");
    } finally {
      setSavingId(null);
    }
  }

  async function handleDeleteRow(id: string) {
    if (!window.confirm("Delete this booking request?")) return;
    setDeletingId(id);
    try {
      await deleteCustomerRequestAction(id);
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      console.error(e);
      alert("Failed to delete booking. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  function handleExportCsv() {
    if (!filteredRows.length) {
      alert("There are no bookings to export.");
      return;
    }

    const headers = [
      "Name",
      "Phone",
      "Contact method",
      "Service",
      "Status",
      "Created at",
    ];

    const lines = filteredRows.map((r) => {
      const values = [
        r.name ?? "",
        r.phone ?? "",
        r.contact_method ?? "",
        r.service ?? "",
        r.status ?? "",
        r.created_at
          ? new Date(r.created_at).toISOString()
          : "",
      ];
      return values
        .map((v) => {
          const s = String(v).replace(/"/g, '""');
          return /[",\n]/.test(s) ? `"${s}"` : s;
        })
        .join(",");
    });

    const csv = [headers.join(","), ...lines].join("\n");
    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bookings-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleResetFilters() {
    setSearch("");
    setStatusFilter("all");
    setServiceFilter("all");
    setMethodFilter("all");
    setFromDate("");
    setToDate("");
  }

  function handleClearDates() {
    setFromDate("");
    setToDate("");
  }

  async function handleDeleteAll() {
    if (!rows.length) return;
    if (
      !window.confirm(
        "Delete ALL booking requests for this clinic?"
      )
    )
      return;
    if (
      !window.confirm(
        "Are you absolutely sure? This action cannot be undone."
      )
    )
      return;

    startDeleteAll(async () => {
      try {
        await deleteAllCustomerRequestsAction();
        setRows([]);
        setPage(1);
      } catch (e) {
        console.error(e);
        alert("Failed to delete all bookings. Please try again.");
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bookings</h1>
          <p className="text-gray-500">
            Manage booking requests for your clinic
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <OutlineBtn onClick={handleExportCsv}>
            <Download className="h-4 w-4" />
            Export CSV
          </OutlineBtn>

          <button
            onClick={handleDeleteAll}
            disabled={isDeletingAll || rows.length === 0}
            className={clsx(
              "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-white",
              rows.length === 0
                ? "bg-rose-400 cursor-not-allowed"
                : "bg-rose-500 hover:bg-rose-600"
            )}
          >
            <Trash2 className="h-4 w-4" />
            {isDeletingAll ? "Deleting..." : "Delete All"}
          </button>
        </div>
      </div>

      {/* Filters card */}
      <div className="rounded-xl border bg-white p-4">
        {/* Dates row */}
        <div className="mb-4 flex flex-wrap gap-2">
          <label className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
            <Calendar className="h-4 w-4" />
            <span>From</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border-0 bg-transparent text-sm outline-none"
            />
          </label>
          <label className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
            <Calendar className="h-4 w-4" />
            <span>To</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border-0 bg-transparent text-sm outline-none"
            />
          </label>
          <OutlineBtn onClick={handleClearDates}>
            Clear Dates
          </OutlineBtn>
        </div>

        {/* Inputs row */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Search</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or phone..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">All Statuses</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">All Services</label>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Services</option>
              {serviceOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">All Methods</label>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Methods</option>
              {methodOptions.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <OutlineBtn onClick={handleResetFilters}>
            Reset Filters
          </OutlineBtn>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border">
        <div className="flex items-center justify-between px-4 py-3 text-sm text-gray-500">
          <div>Total: {total}</div>
          <div>
            Page {currentPage} of {totalPages}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Contact Method</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created At</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {pageRows.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3">{r.name ?? "—"}</td>
                  <td className="px-4 py-3">{r.phone ?? "—"}</td>
                  <td className="px-4 py-3">
                    {r.contact_method ?? "—"}
                  </td>
                  <td className="px-4 py-3">{r.service ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <select
                        value={
                          statusDrafts[r.id] ?? r.status ?? "New"
                        }
                        onChange={(e) =>
                          setStatusDrafts((prev) => ({
                            ...prev,
                            [r.id]: e.target.value,
                          }))
                        }
                        className="rounded border px-2 py-1"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleSaveStatus(r.id)}
                        disabled={savingId === r.id}
                        className="rounded border px-2 py-1 text-xs"
                      >
                        {savingId === r.id ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {r.created_at
                      ? new Date(r.created_at).toLocaleString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDeleteRow(r.id)}
                      disabled={deletingId === r.id}
                      className="rounded-md bg-rose-600 px-3 py-1.5 text-white hover:bg-rose-700 disabled:bg-rose-400"
                    >
                      {deletingId === r.id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}

              {pageRows.length === 0 && (
                <tr>
                  <td
                    className="p-6 text-center text-gray-500"
                    colSpan={7}
                  >
                    No booking records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 text-sm text-gray-600">
          <div>
            {total === 0 ? (
              "Showing 0 of 0"
            ) : (
              <>
                Showing{" "}
                <span className="font-medium">
                  {startIndex + 1}
                </span>{" "}
                –{" "}
                <span className="font-medium">
                  {Math.min(startIndex + pageSize, total)}
                </span>{" "}
                of <span className="font-medium">{total}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              className="rounded border px-3 py-1 disabled:opacity-40"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
            >
              Prev
            </button>
            <button
              className="rounded border px-3 py-1 disabled:opacity-40"
              onClick={() =>
                setPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={currentPage >= totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
