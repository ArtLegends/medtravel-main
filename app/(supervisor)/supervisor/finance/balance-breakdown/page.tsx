// app/(partner)/partner/finance/balance-breakdown/page.tsx
"use client";

import { useState, ChangeEvent } from "react";

type BookingStatus = "pending" | "confirmed" | "cancelled";

type BalanceRow = {
  id: string;
  programSlug: string;
  programName: string;
  date: string; // ISO string
  description: string;
  status: BookingStatus;
  bookingValue: number;
  earnings: number;
};

type FilterState = {
  dateFrom: string; // yyyy-mm-dd
  dateTo: string;
  status: "all" | BookingStatus;
  program: "all" | string;
};

// 👉 пока данных нет, поэтому пустой массив,
// но тип и логика готовы под реальные записи из Supabase
const INITIAL_ROWS: BalanceRow[] = [];

const PROGRAM_OPTIONS = [
  { slug: "dentistry", name: "Dentistry" },
  { slug: "hair-transplant", name: "Hair Transplant" },
  { slug: "plastic-surgery", name: "Plastic Surgery" },
];

const STATUS_OPTIONS: { value: FilterState["status"]; label: string }[] = [
  { value: "all", label: "Any statuses" },
  { value: "confirmed", label: "Confirmed" },
  { value: "pending", label: "Pending" },
  { value: "cancelled", label: "Cancelled" },
];

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}

export default function BalanceBreakdownPage() {
  const [filters, setFilters] = useState<FilterState>({
    dateFrom: "",
    dateTo: "",
    status: "all",
    program: "all",
  });

  const handleDateChange =
    (field: "dateFrom" | "dateTo") =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setFilters((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setFilters((prev) => ({
      ...prev,
      status: event.target.value as FilterState["status"],
    }));
  };

  const handleProgramChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setFilters((prev) => ({
      ...prev,
      program: event.target.value as FilterState["program"],
    }));
  };

  // фильтрация по дате / статусу / программе — сейчас массив пустой,
  // но логика готова для реальных данных
  const filteredRows = INITIAL_ROWS.filter((row) => {
    if (filters.program !== "all" && row.programSlug !== filters.program) {
      return false;
    }

    if (filters.status !== "all" && row.status !== filters.status) {
      return false;
    }

    if (filters.dateFrom) {
      if (new Date(row.date) < new Date(filters.dateFrom)) return false;
    }

    if (filters.dateTo) {
      const to = new Date(filters.dateTo);
      to.setHours(23, 59, 59, 999);
      if (new Date(row.date) > to) return false;
    }

    return true;
  });

  const totals = filteredRows.reduce(
    (acc, row) => {
      acc.bookingValue += row.bookingValue;
      acc.earnings += row.earnings;
      return acc;
    },
    { bookingValue: 0, earnings: 0 }
  );

  return (
    <div className="space-y-6">
      {/* Заголовок страницы */}
      <div>
        <h1 className="text-2xl font-bold">Balance breakdown</h1>
        <p className="text-gray-600">
          Bookings and earnings overview. You&apos;ll receive these earnings with
          your next payouts.
        </p>
      </div>

      {/* Карточка с фильтрами и таблицей */}
      <div className="rounded-xl border bg-white p-4 md:p-5 space-y-4">
        {/* Фильтры */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Даты */}
          <div className="flex flex-col gap-1 text-sm text-gray-700">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Select dates
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="date"
                value={filters.dateFrom}
                onChange={handleDateChange("dateFrom")}
                className="h-9 rounded-md border border-gray-300 px-2 text-sm outline-none focus:border-gray-500 focus:ring-0"
              />
              <span className="text-xs text-gray-500">to</span>
              <input
                type="date"
                value={filters.dateTo}
                onChange={handleDateChange("dateTo")}
                className="h-9 rounded-md border border-gray-300 px-2 text-sm outline-none focus:border-gray-500 focus:ring-0"
              />
            </div>
          </div>

          {/* Статусы */}
          <div className="flex flex-col gap-1 text-sm text-gray-700">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Status
            </span>
            <select
              value={filters.status}
              onChange={handleStatusChange}
              className="h-9 min-w-[160px] rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-gray-500 focus:ring-0"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Программы */}
          <div className="flex flex-col gap-1 text-sm text-gray-700">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Program
            </span>
            <select
              value={filters.program}
              onChange={handleProgramChange}
              className="h-9 min-w-[180px] rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-gray-500 focus:ring-0"
            >
              <option value="all">All programs</option>
              {PROGRAM_OPTIONS.map((program) => (
                <option key={program.slug} value={program.slug}>
                  {program.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Таблица */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
                <th className="px-3 py-2">Program</th>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Description</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Bookings Value</th>
                <th className="px-3 py-2">Earnings</th>
              </tr>
            </thead>
            <tbody>
              {/* Итоговая строка Totals — всегда первая */}
              <tr className="border-b bg-gray-50 font-semibold">
                <td className="px-3 py-2">Total</td>
                <td className="px-3 py-2" />
                <td className="px-3 py-2" />
                <td className="px-3 py-2" />
                <td className="px-3 py-2">
                  {formatCurrency(totals.bookingValue)}
                </td>
                <td className="px-3 py-2">
                  {formatCurrency(totals.earnings)}
                </td>
              </tr>

              {/* Строки с букингами — пока данных нет, но структура готова */}
              {filteredRows.length === 0 ? (
                <tr className="border-b last:border-0">
                  <td
                    className="px-3 py-4 text-sm text-gray-500"
                    colSpan={6}
                  >
                    No bookings yet. Once you start receiving traffic and
                    conversions, they&apos;ll appear here.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => (
                  <tr key={row.id} className="border-b last:border-0">
                    <td className="px-3 py-2">{row.programName}</td>
                    <td className="px-3 py-2">
                      {new Date(row.date).toLocaleString()}
                    </td>
                    <td className="px-3 py-2">{row.description}</td>
                    <td className="px-3 py-2 capitalize">{row.status}</td>
                    <td className="px-3 py-2">
                      {formatCurrency(row.bookingValue)}
                    </td>
                    <td className="px-3 py-2">
                      {formatCurrency(row.earnings)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
