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

type BalanceData = {
  total_owed: number;
  currency: string;
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

export default function TransactionsPage() {
  const { supabase } = useSupabase();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [balance, setBalance] = useState<BalanceData | null>(null);
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
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const clinicId = (clinicRow as any)?.id;
      if (!clinicId) {
        setError("No published clinic linked to your account.");
        return;
      }

      // Load transactions from view
      const { data: txRows, error: txError } = await supabase
        .from("v_customer_transactions")
        .select("*")
        .eq("clinic_id", clinicId)
        .order("created_at", { ascending: false });

      if (txError) throw txError;

      // Load balance
      const { data: balanceData, error: balError } = await supabase.rpc("customer_clinic_balance");
      if (balError) throw balError;

      setTransactions((txRows ?? []) as TransactionRow[]);

      if (balanceData && Array.isArray(balanceData) && balanceData.length > 0) {
        setBalance(balanceData[0] as BalanceData);
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message ?? "Failed to load transactions.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [supabase]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("customer-transactions-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "transactions" }, () => {
        loadData();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  const filtered = statusFilter === "all"
    ? transactions
    : transactions.filter((t) => t.status === statusFilter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Transactions</h1>
        <p className="text-gray-600 mt-2">Platform commissions for completed bookings</p>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Balance */}
      <div className="rounded-xl border bg-white p-4">
        <div className="text-sm font-medium text-gray-500">Outstanding Balance</div>
        {loading ? (
          <div className="mt-1 h-8 w-32 animate-pulse rounded bg-gray-100" />
        ) : (
          <div className="mt-1 text-2xl font-bold">
            {balance ? (
              <span className={balance.total_owed > 0 ? "text-rose-600" : "text-gray-900"}>
                -${balance.total_owed.toFixed(2)} {balance.currency}
              </span>
            ) : (
              "$0.00"
            )}
          </div>
        )}
        <p className="mt-1 text-xs text-gray-400">
          10% platform commission on completed bookings
        </p>
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
          <div className="p-8 text-center">
            <div className="h-32 animate-pulse rounded-md bg-gray-50" />
          </div>
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
                      {t.booking_actual_cost != null
                        ? `$${Number(t.booking_actual_cost).toFixed(2)} ${t.currency}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3">{t.rate_pct}%</td>
                    <td className="px-4 py-3 font-semibold text-rose-600">
                      -${Number(t.amount).toFixed(2)} {t.currency}
                    </td>
                    <td className="px-4 py-3">{statusBadge(t.status)}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(t.created_at).toLocaleDateString()}
                    </td>
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