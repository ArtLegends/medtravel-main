// app/(partner)/partner/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/lib/supabase/supabase-provider";

type BalanceData = {
  total_earned: number;
  available_for_withdrawal: number;
  currency: string;
};

function StatCard({ title, value, color }: { title: string; value: string; color?: string }) {
  return (
    <div className="rounded-xl border bg-white px-4 py-4">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {title}
      </div>
      <div className={`mt-2 text-2xl font-semibold ${color ?? "text-gray-900"}`}>
        {value}
      </div>
    </div>
  );
}

function formatMonthYear(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export default function PartnerDashboardPage() {
  const { supabase, session } = useSupabase();
  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase || !session) return;

    (async () => {
      setLoading(true);
      const { data } = await supabase.rpc("partner_balance");
      if (data && Array.isArray(data) && data.length > 0) {
        setBalance(data[0] as BalanceData);
      }
      setLoading(false);
    })();
  }, [supabase, session]);

  const today = new Date();
  const thisMonthLabel = formatMonthYear(today);
  const lastMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastMonthLabel = formatMonthYear(lastMonthDate);

  const currency = balance?.currency ?? "USD";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome to Partner Panel!</h1>
        <p className="text-gray-600">
          Track your referral performance and payouts.
        </p>
      </div>

      {/* Balance overview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Earned"
          value={loading ? "..." : `$${(balance?.total_earned ?? 0).toFixed(2)}`}
        />
        <StatCard
          title="Available for Withdrawal"
          value={loading ? "..." : `$${(balance?.available_for_withdrawal ?? 0).toFixed(2)}`}
          color="text-emerald-600"
        />
        <StatCard title={thisMonthLabel} value="$0" />
        <StatCard title={lastMonthLabel} value="$0" />
      </div>

      {/* Withdrawal info */}
      {balance && balance.available_for_withdrawal > 0 && balance.available_for_withdrawal >= 300 && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-emerald-800">
                You have ${balance.available_for_withdrawal.toFixed(2)} available for withdrawal
              </div>
              <div className="text-sm text-emerald-600 mt-1">
                Contact support to arrange a payout.
              </div>
            </div>
          </div>
        </div>
      )}

      {balance && balance.total_earned > 0 && balance.available_for_withdrawal < 300 && (
        <div className="rounded-xl border bg-gray-50 p-4 text-sm text-gray-600">
          Minimum withdrawal amount is $300. Your available balance: ${balance.available_for_withdrawal.toFixed(2)} {currency}.
        </div>
      )}

      {/* Programs Performance — placeholder for now */}
      <div className="rounded-xl border bg-white p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Programs Performance</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
                <th className="px-3 py-2">Landing page</th>
                <th className="px-3 py-2">Clicks</th>
                <th className="px-3 py-2">Registrations</th>
                <th className="px-3 py-2">Pending</th>
                <th className="px-3 py-2">Completed</th>
                <th className="px-3 py-2">Payout</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b bg-gray-50 font-semibold">
                <td className="px-3 py-2">Total</td>
                <td className="px-3 py-2">0</td>
                <td className="px-3 py-2">0</td>
                <td className="px-3 py-2">0</td>
                <td className="px-3 py-2">0</td>
                <td className="px-3 py-2">${(balance?.total_earned ?? 0).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-xs text-gray-400">
          Detailed per-program stats coming soon.
        </p>
      </div>
    </div>
  );
}