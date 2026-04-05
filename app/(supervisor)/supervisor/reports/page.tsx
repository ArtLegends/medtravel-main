// app/(supervisor)/supervisor/reports/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSupabase } from "@/lib/supabase/supabase-provider";

type ReportRow = {
  report_date: string;
  leads_total: number;
  leads_pending: number;
  leads_cancelled: number;
  leads_paid: number;
  leads_in_progress: number;
  potential_profit: number;
  confirmed_profit: number;
};

type Totals = Omit<ReportRow, "report_date">;

type PartnerOption = { partner_user_id: string; partner_email: string };
type FilterOptions = { device_types: string[]; countries: string[]; referrer_domains: string[] };

function fmtDate(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit", month: "2-digit", year: "numeric",
  }).format(d);
}

function fmtMoney(v: number) {
  return `$${Number(v).toFixed(2)}`;
}

function defaultStart() {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().slice(0, 10);
}

function defaultEnd() {
  return new Date().toISOString().slice(0, 10);
}

export default function SupervisorReportsPage() {
  const { supabase, session } = useSupabase();

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [totals, setTotals] = useState<Totals | null>(null);

  // Filter state
  const [partners, setPartners] = useState<PartnerOption[]>([]);
  const [filterOpts, setFilterOpts] = useState<FilterOptions>({ device_types: [], countries: [], referrer_domains: [] });
  const [partnerId, setPartnerId] = useState("all");
  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [deviceType, setDeviceType] = useState("all");
  const [country, setCountry] = useState("all");
  const [referrerDomain, setReferrerDomain] = useState("all");

  // Load filter options once
  useEffect(() => {
    if (!supabase || !session) return;
    (async () => {
      const [pRes, fRes] = await Promise.all([
        supabase.rpc("supervisor_partners_select"),
        supabase.rpc("supervisor_filter_options"),
      ]);
      if (pRes.data) setPartners(pRes.data as PartnerOption[]);
      if (fRes.data) {
        const d = Array.isArray(fRes.data) ? fRes.data[0] : fRes.data;
        if (d) setFilterOpts(d as FilterOptions);
      }
    })();
  }, [supabase, session]);

  // Load report data when filters change
  useEffect(() => {
    if (!supabase || !session) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      const params: Record<string, any> = {};
      if (startDate) params.p_start_date = startDate;
      if (endDate) params.p_end_date = endDate;
      if (partnerId !== "all") params.p_partner_id = partnerId;
      if (deviceType !== "all") params.p_device_type = deviceType;
      if (country !== "all") params.p_user_country = country;
      if (referrerDomain !== "all") params.p_referrer_domain = referrerDomain;

      const [reportRes, totalsRes] = await Promise.all([
        supabase.rpc("supervisor_report", params),
        supabase.rpc("supervisor_report_totals", params),
      ]);

      if (!cancelled) {
        setRows((reportRes.data ?? []) as ReportRow[]);
        const t = totalsRes.data;
        setTotals(Array.isArray(t) && t.length > 0 ? (t[0] as Totals) : null);
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [supabase, session, startDate, endDate, partnerId, deviceType, country, referrerDomain]);

  const dateRange = useMemo(() => {
    if (!startDate || !endDate) return "";
    return `${fmtDate(startDate)} — ${fmtDate(endDate)}`;
  }, [startDate, endDate]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Reports</h1>
        <p className="text-gray-600">Detailed performance analytics for your partner network.</p>
      </div>

      {/* Filters */}
      <div className="rounded-xl border bg-white p-4 space-y-4">
        {/* Row 1: Dates + Partner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <FilterField label="Start Date">
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm" />
          </FilterField>
          <FilterField label="End Date">
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm" />
          </FilterField>
          <FilterField label="Partner">
            <select value={partnerId} onChange={(e) => setPartnerId(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm">
              <option value="all">All Partners</option>
              {partners.map((p) => (
                <option key={p.partner_user_id} value={p.partner_user_id}>{p.partner_email}</option>
              ))}
            </select>
          </FilterField>
          <FilterField label="Date Range">
            <div className="w-full rounded-md border bg-gray-50 px-3 py-2 text-sm text-gray-600">
              {dateRange || "Select dates"}
            </div>
          </FilterField>
        </div>

        {/* Row 2: Device, Country, Referrer */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <FilterField label="Device Type">
            <select value={deviceType} onChange={(e) => setDeviceType(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm">
              <option value="all">All Devices</option>
              {filterOpts.device_types.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </FilterField>
          <FilterField label="Country">
            <select value={country} onChange={(e) => setCountry(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm">
              <option value="all">All Countries</option>
              {filterOpts.countries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </FilterField>
          <FilterField label="Referrer Domain">
            <select value={referrerDomain} onChange={(e) => setReferrerDomain(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm">
              <option value="all">All Domains</option>
              {filterOpts.referrer_domains.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </FilterField>
        </div>
      </div>

      {/* Summary cards */}
      {totals && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <SummaryCard label="Total Leads" value={String(totals.leads_total)} />
          <SummaryCard label="Pending" value={String(totals.leads_pending)} color="text-amber-600" />
          <SummaryCard label="In Progress" value={String(totals.leads_in_progress)} color="text-blue-600" />
          <SummaryCard label="Paid" value={String(totals.leads_paid)} color="text-emerald-600" />
          <SummaryCard label="Cancelled" value={String(totals.leads_cancelled)} color="text-rose-600" />
          <SummaryCard label="Potential Profit" value={fmtMoney(totals.potential_profit)} />
          <SummaryCard label="Confirmed Profit" value={fmtMoney(totals.confirmed_profit)} color="text-emerald-700" />
        </div>
      )}

      {/* Report table */}
      <div className="rounded-xl border bg-white overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Daily Breakdown</h2>
          {!loading && <span className="text-xs text-gray-500">{rows.length} days</span>}
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading report data...</div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No data for the selected period and filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-center">Total</th>
                  <th className="px-4 py-3 text-center">Pending</th>
                  <th className="px-4 py-3 text-center">In Progress</th>
                  <th className="px-4 py-3 text-center">Cancelled</th>
                  <th className="px-4 py-3 text-center">Paid</th>
                  <th className="px-4 py-3 text-right">Potential Profit</th>
                  <th className="px-4 py-3 text-right">Profit</th>
                </tr>
              </thead>
              <tbody>
                {totals && (
                  <tr className="border-b bg-slate-50 font-semibold">
                    <td className="px-4 py-3 text-gray-900">TOTAL</td>
                    <td className="px-4 py-3 text-center">{totals.leads_total}</td>
                    <td className="px-4 py-3 text-center text-amber-600">{totals.leads_pending}</td>
                    <td className="px-4 py-3 text-center text-blue-600">{totals.leads_in_progress}</td>
                    <td className="px-4 py-3 text-center text-rose-600">{totals.leads_cancelled}</td>
                    <td className="px-4 py-3 text-center text-emerald-600">{totals.leads_paid}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{fmtMoney(totals.potential_profit)}</td>
                    <td className="px-4 py-3 text-right text-emerald-700">{fmtMoney(totals.confirmed_profit)}</td>
                  </tr>
                )}

                {rows.map((r) => (
                  <tr key={r.report_date} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-900 font-medium whitespace-nowrap">{fmtDate(r.report_date)}</td>
                    <td className="px-4 py-3 text-center">{r.leads_total}</td>
                    <td className="px-4 py-3 text-center"><CNum v={r.leads_pending} c="text-amber-600" /></td>
                    <td className="px-4 py-3 text-center"><CNum v={r.leads_in_progress} c="text-blue-600" /></td>
                    <td className="px-4 py-3 text-center"><CNum v={r.leads_cancelled} c="text-rose-600" /></td>
                    <td className="px-4 py-3 text-center"><CNum v={r.leads_paid} c="text-emerald-600" b /></td>
                    <td className="px-4 py-3 text-right whitespace-nowrap text-gray-700">
                      {r.potential_profit > 0 ? fmtMoney(r.potential_profit) : <span className="text-gray-300">$0.00</span>}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {r.confirmed_profit > 0
                        ? <span className="text-emerald-700 font-semibold">{fmtMoney(r.confirmed_profit)}</span>
                        : <span className="text-gray-300">$0.00</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info block */}
      <div className="rounded-xl border bg-white p-4 space-y-2">
        <h3 className="text-sm font-semibold text-gray-900">How profit is calculated</h3>
        <div className="text-xs text-gray-500 space-y-1">
          <p><span className="font-medium text-gray-700">Potential Profit</span> — estimated from the clinic&apos;s preliminary price: pre_cost × 40% (platform commission) × 10% (your share) = 4% of pre_cost.</p>
          <p><span className="font-medium text-gray-700">Confirmed Profit</span> — calculated from the actual payment after the procedure is completed: actual_cost × 40% × 10% = 4% of actual_cost.</p>
          <p>Your balance is updated when bookings reach &quot;completed&quot; or &quot;sent_ticket&quot; status.</p>
        </div>
      </div>
    </div>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-xl border bg-white px-3 py-3">
      <div className="text-[10px] font-medium uppercase tracking-wider text-gray-500">{label}</div>
      <div className={`mt-1 text-lg font-semibold ${color ?? "text-gray-900"}`}>{value}</div>
    </div>
  );
}

function CNum({ v, c, b }: { v: number; c: string; b?: boolean }) {
  if (v > 0) return <span className={`${c} ${b ? "font-semibold" : "font-medium"}`}>{v}</span>;
  return <span className="text-gray-300">0</span>;
}