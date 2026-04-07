// app/(customer)/customer/transactions/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/lib/supabase/supabase-provider";

type TransactionRow = {
  transaction_id: string;
  booking_id: string | null;
  clinic_id: string;
  type: string;
  rate_pct: number;
  amount: number;
  currency: string;
  status: string;
  description: string | null;
  created_at: string;
  patient_name: string | null;
  booking_actual_cost: number | null;
  service_name: string | null;
};

type DashboardData = {
  total_owed: number;
  total_paid: number;
  total_void: number;
  total_all: number;
  total_bookings_revenue: number;
  revenue_after_commission: number;
  transaction_count: number;
  currency: string;
  limit_reached: boolean;
};

type CommissionTerm = {
  rule_id: string;
  rule_type: string;
  rate_pct: number | null;
  fixed_amount: number | null;
  threshold_min: number | null;
  threshold_max: number | null;
  currency: string;
  service_name: string | null;
  service_id: number | null;
  is_clinic_wide: boolean;
  label: string | null;
};

function statusBadge(status: string) {
  const map: Record<string, { label: string; className: string }> = {
    pending: { label: "Pending", className: "bg-amber-50 text-amber-700" },
    confirmed: { label: "Confirmed", className: "bg-blue-50 text-blue-700" },
    paid: { label: "Paid", className: "bg-emerald-50 text-emerald-700" },
    void: { label: "Void", className: "bg-gray-100 text-gray-500" },
  };
  const info = map[status] ?? { label: status, className: "bg-gray-50 text-gray-600" };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${info.className}`}>
      {info.label}
    </span>
  );
}

function fmtMoney(v: number, cur: string) {
  return `$${Number(v).toFixed(2)} ${cur}`;
}

export default function TransactionsPage() {
  const { supabase } = useSupabase();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [commissionTerms, setCommissionTerms] = useState<CommissionTerm[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  async function loadData() {
    try {
      setLoading(true);
      setError(null);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) { setError("Not authenticated."); return; }

      // Get clinic ID
      const { data: clinicRow } = await supabase
        .from("clinics")
        .select("id")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const clinicId = (clinicRow as any)?.id;
      if (!clinicId) {
        setError("No clinic linked to your account.");
        return;
      }

      // Load everything in parallel
      const [txRes, dashRes, termsRes] = await Promise.all([
        supabase
          .from("v_customer_transactions")
          .select("*")
          .eq("clinic_id", clinicId)
          .order("created_at", { ascending: false }),
        supabase.rpc("customer_commission_dashboard"),
        supabase.rpc("customer_commission_terms"),
      ]);

      if (txRes.error) throw txRes.error;
      setTransactions((txRes.data ?? []) as TransactionRow[]);

      if (dashRes.data) {
        const d = Array.isArray(dashRes.data) ? dashRes.data[0] : dashRes.data;
        if (d) setDashboard(d as DashboardData);
      }

      setCommissionTerms((termsRes.data ?? []) as CommissionTerm[]);
    } catch (e: any) {
      console.error(e);
      setError(e.message ?? "Failed to load transactions.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, [supabase]);

  useEffect(() => {
    const channel = supabase
      .channel("customer-transactions-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "transactions" }, () => loadData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  const filtered = statusFilter === "all"
    ? transactions
    : transactions.filter((t) => t.status === statusFilter);

  const cur = dashboard?.currency ?? "USD";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Transactions</h1>
        <p className="text-gray-600 mt-1">Platform commissions for completed bookings</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* Limit warning */}
      {dashboard?.limit_reached && (
        <div className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-3">
          <div className="font-semibold text-rose-800">Commission limit reached</div>
          <div className="text-sm text-rose-600 mt-1">
            Your outstanding balance has reached $1,000. New patient assignments may be paused until the balance is settled.
            Please contact support to arrange payment.
          </div>
        </div>
      )}

      {/* Dashboard metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <MetricCard
          label="Outstanding Balance"
          value={loading ? "..." : fmtMoney(dashboard?.total_owed ?? 0, cur)}
          color={(dashboard?.total_owed ?? 0) > 0 ? "text-rose-600" : "text-gray-900"}
          prefix="-"
        />
        <MetricCard
          label="Total Revenue"
          value={loading ? "..." : fmtMoney(dashboard?.total_bookings_revenue ?? 0, cur)}
          color="text-gray-900"
        />
        <MetricCard
          label="Revenue After Commission"
          value={loading ? "..." : fmtMoney(dashboard?.revenue_after_commission ?? 0, cur)}
          color="text-emerald-700"
        />
        <MetricCard
          label="Total Commissions"
          value={loading ? "..." : fmtMoney(dashboard?.total_all ?? 0, cur)}
          color="text-gray-600"
          sublabel={`${dashboard?.transaction_count ?? 0} transactions`}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <MetricCard
          label="Paid"
          value={loading ? "..." : fmtMoney(dashboard?.total_paid ?? 0, cur)}
          color="text-emerald-600"
        />
        <MetricCard
          label="Pending"
          value={loading ? "..." : fmtMoney(dashboard?.total_owed ?? 0, cur)}
          color="text-amber-600"
        />
        <MetricCard
          label="Voided"
          value={loading ? "..." : fmtMoney(dashboard?.total_void ?? 0, cur)}
          color="text-gray-400"
        />
      </div>

      {/* Commission terms */}
      <div className="rounded-xl border bg-white p-4">
        <div className="text-sm font-semibold text-gray-900 mb-2">Your Commission Terms</div>

        {commissionTerms.length > 0 ? (
          <div className="space-y-2">
            {commissionTerms.map((t, i) => (
              <div key={t.rule_id ?? i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                <div>
                  <span className="font-medium">
                    {t.rule_type === "percentage" ? `${t.rate_pct}%` : `${t.fixed_amount} ${t.currency} fixed`}
                  </span>
                  {t.threshold_min != null || t.threshold_max != null ? (
                    <span className="text-gray-500">
                      {" "}when cost{" "}
                      {t.threshold_min != null ? `≥ ${t.threshold_min}` : ""}
                      {t.threshold_min != null && t.threshold_max != null ? " and " : ""}
                      {t.threshold_max != null ? `< ${t.threshold_max}` : ""}{" "}
                      {t.currency}
                    </span>
                  ) : null}
                  {t.service_name ? (
                    <span className="ml-1.5 inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                      {t.service_name}
                    </span>
                  ) : (
                    <span className="ml-1.5 text-xs text-gray-400">(all services)</span>
                  )}
                  {t.label ? <span className="ml-1 text-xs text-gray-400">— {t.label}</span> : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            Default platform commission: 10% on completed bookings
          </p>
        )}
      </div>

      {/* Filters */}
      <div className="rounded-xl border bg-white p-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
            onClick={() => loadData()}
          >
            Refresh
          </button>
          <select
            className="rounded-md border px-3 py-2 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="paid">Paid</option>
            <option value="void">Void</option>
          </select>
          <span className="ml-auto text-xs text-gray-500">
            {filtered.length} transaction{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-white overflow-hidden">
        {loading ? (
          <div className="p-8 text-center"><div className="h-32 animate-pulse rounded-md bg-gray-50" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {transactions.length === 0
              ? "No commissions yet. Commissions are created when bookings are marked as completed."
              : "No transactions match the selected filter."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Booking Cost</th>
                  <th className="px-4 py-3">Rate</th>
                  <th className="px-4 py-3">Commission</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.transaction_id} className="border-b last:border-0">
                    <td className="px-4 py-3">{t.patient_name || "—"}</td>
                    <td className="px-4 py-3">{t.service_name || "—"}</td>
                    <td className="px-4 py-3">
                      {t.booking_actual_cost != null ? `$${Number(t.booking_actual_cost).toFixed(2)} ${t.currency}` : "—"}
                    </td>
                    <td className="px-4 py-3">{t.rate_pct}%</td>
                    <td className="px-4 py-3 font-semibold text-rose-600">
                      -${Number(t.amount).toFixed(2)} {t.currency}
                    </td>
                    <td className="px-4 py-3">{statusBadge(t.status)}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(t.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  color,
  prefix,
  sublabel,
}: {
  label: string;
  value: string;
  color?: string;
  prefix?: string;
  sublabel?: string;
}) {
  return (
    <div className="rounded-xl border bg-white px-4 py-3">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</div>
      <div className={`mt-1 text-xl font-bold ${color ?? "text-gray-900"}`}>
        {prefix && value !== "..." ? prefix : ""}{value}
      </div>
      {sublabel && <div className="mt-0.5 text-xs text-gray-400">{sublabel}</div>}
    </div>
  );
}