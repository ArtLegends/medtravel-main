// app/(partner)/partner/finance/payouts-history/page.tsx
"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";

type BookingPayoutRow = {
  id: string;
  programName: string;
  bookingDate: string; // ISO
  earnings: number;
};

type MonthPayout = {
  id: string; // например "2025-11"
  year: number;
  monthIndex: number; // 0-11
  amount: number;
  method: string | null;
  invoiceComment: string | null;
  bookings: BookingPayoutRow[];
};

function formatCurrency(amount: number) {
  return `$${amount.toFixed(2)}`;
}

function getMonthLabel(monthIndex: number, short = false) {
  return new Intl.DateTimeFormat("en-US", {
    month: short ? "short" : "long",
  }).format(new Date(2000, monthIndex, 1));
}

export default function PayoutsHistoryPage() {
  const now = useMemo(() => new Date(), []);
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // 👉 сюда позже подставим реальные выплаты из Supabase
  const months: MonthPayout[] = useMemo(
    () => [
      {
        id: `${currentYear}-${currentMonth + 1}`,
        year: currentYear,
        monthIndex: currentMonth,
        amount: 0,
        method: null,
        invoiceComment: null,
        bookings: [],
      },
    ],
    [currentYear, currentMonth]
  );

  const [selectedMonthId, setSelectedMonthId] = useState<string>(months[0]?.id);

  const selectedMonth =
    months.find((m) => m.id === selectedMonthId) ?? months[0];

  const sidebarYears = useMemo(() => {
    const map = new Map<
      number,
      { year: number; months: { id: string; label: string; amount: number }[] }
    >();

    for (const m of months) {
      if (!map.has(m.year)) {
        map.set(m.year, { year: m.year, months: [] });
      }
      map.get(m.year)!.months.push({
        id: m.id,
        label: getMonthLabel(m.monthIndex, true),
        amount: m.amount,
      });
    }

    // сортируем годы по убыванию (на будущее)
    return Array.from(map.values()).sort((a, b) => b.year - a.year);
  }, [months]);

  // состояние раскрытия годов (как селект Finance)
  const [expandedYears, setExpandedYears] = useState<Record<number, boolean>>(
    () => {
      const initial: Record<number, boolean> = {};
      for (const y of sidebarYears) {
        // по умолчанию раскрываем год, в котором есть выбранный месяц
        const hasSelected = y.months.some((m) => m.id === selectedMonthId);
        initial[y.year] = hasSelected;
      }
      return initial;
    }
  );

  const toggleYear = (year: number) => {
    setExpandedYears((prev) => ({ ...prev, [year]: !prev[year] }));
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <h1 className="text-2xl font-bold">Payouts history</h1>
        <p className="text-gray-600">
          Track your monthly payouts and see which bookings were included in
          each payment.
        </p>
      </div>

      <div className="flex flex-col gap-6 md:flex-row">
        {/* Левая колонка: годы с выпадающим списком месяцев */}
        <aside className="w-full rounded-xl border bg-white p-3 text-sm md:w-60">
          {sidebarYears.map((yearBlock) => {
            const isExpanded = expandedYears[yearBlock.year];
            return (
              <div key={yearBlock.year} className="mb-2 last:mb-0">
                {/* шапка года как селект с иконкой */}
                <button
                  type="button"
                  onClick={() => toggleYear(yearBlock.year)}
                  className="flex w-full items-center justify-between rounded-md px-3 py-2 text-xs font-semibold text-gray-800 hover:bg-gray-50"
                >
                  <span>{yearBlock.year}</span>
                  <ChevronDown
                    className={[
                      "h-4 w-4 text-gray-500 transition-transform",
                      isExpanded ? "rotate-180" : "",
                    ].join(" ")}
                  />
                </button>

                {isExpanded && (
                  <div className="mt-1 space-y-1">
                    {yearBlock.months.map((m) => {
                      const active = m.id === selectedMonthId;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setSelectedMonthId(m.id)}
                          className={[
                            "flex w-full items-center justify-between rounded-md px-3 py-2 text-xs transition",
                            active
                              ? "bg-gray-900 text-white"
                              : "text-gray-700 hover:bg-gray-100",
                          ].join(" ")}
                        >
                          <span>{m.label}</span>
                          <span className="font-semibold">
                            {formatCurrency(m.amount)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </aside>

        {/* Правая часть: детали выбранного месяца */}
        <section className="flex-1 space-y-4">
          {/* Шапка месяца */}
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">
              {getMonthLabel(selectedMonth.monthIndex)} {selectedMonth.year}
            </h2>
          </div>

          {/* Amount / Method / Invoice comment */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl border bg-white p-4">
              <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Amount
              </div>
              <div className="mt-2 text-2xl font-semibold text-gray-900">
                {formatCurrency(selectedMonth.amount)}
              </div>
            </div>

            <div className="rounded-xl border bg-white p-4">
              <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Method
              </div>
              <div className="mt-2 text-sm font-medium text-gray-900">
                {selectedMonth.method ?? "No payment method yet."}
              </div>
            </div>

            <div className="rounded-xl border bg-white p-4">
              <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Invoice comment
              </div>
              <div className="mt-2 text-sm text-gray-700">
                {selectedMonth.invoiceComment ?? "No invoice comment yet."}
              </div>
            </div>
          </div>

          {/* Таблица Bookings and earnings */}
          <div className="space-y-3 rounded-xl border bg-white p-4 md:p-5">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Bookings and earnings
              </h3>
              <p className="text-xs text-gray-500">
                We&apos;ll show bookings that were included in this payout once
                you start receiving payouts.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
                    <th className="px-3 py-2">Program</th>
                    <th className="px-3 py-2">Booking date</th>
                    <th className="px-3 py-2">Earnings</th>
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {selectedMonth.bookings.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-3 py-4 text-sm text-gray-500"
                      >
                        No bookings in this payout yet.
                      </td>
                    </tr>
                  ) : (
                    selectedMonth.bookings.map((row) => (
                      <tr key={row.id} className="border-b last:border-0">
                        <td className="px-3 py-2">{row.programName}</td>
                        <td className="px-3 py-2">
                          {new Date(row.bookingDate).toLocaleString()}
                        </td>
                        <td className="px-3 py-2">
                          {formatCurrency(row.earnings)}
                        </td>
                        <td className="px-3 py-2 text-right text-xs font-medium text-blue-600">
                          Details
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
