// app/(supervisor)/supervisor/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/lib/supabase/supabase-provider";

type BalanceData = {
  total_earned: number;
  available_for_withdrawal: number;
  currency: string;
};

type StatsData = {
  total_partners: number;
  total_referrals: number;
  pending_bookings: number;
  completed_bookings: number;
};

function StatCard({ title, value, color }: { title: string; value: string; color?: string }) {
  return (
    <div className="rounded-xl border bg-white px-4 py-4">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">{title}</div>
      <div className={`mt-2 text-2xl font-semibold ${color ?? "text-gray-900"}`}>{value}</div>
    </div>
  );
}

function formatMonthYear(date: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(date);
}

export default function SupervisorDashboardPage() {
  const { supabase, session } = useSupabase();
  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase || !session) return;

    (async () => {
      setLoading(true);

      const [balRes, statsRes] = await Promise.all([
        supabase.rpc("supervisor_balance"),
        supabase.rpc("supervisor_stats"),
      ]);

      if (balRes.data && Array.isArray(balRes.data) && balRes.data.length > 0) {
        setBalance(balRes.data[0] as BalanceData);
      }
      if (statsRes.data && Array.isArray(statsRes.data) && statsRes.data.length > 0) {
        setStats(statsRes.data[0] as StatsData);
      }

      setLoading(false);
    })();
  }, [supabase, session]);

  const today = new Date();
  const thisMonthLabel = formatMonthYear(today);
  const lastMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastMonthLabel = formatMonthYear(lastMonthDate);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome to Supervisor Panel!</h1>
        <p className="text-gray-600">Track your partners performance and payouts.</p>
      </div>

      {/* Earnings */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Earned (1%)"
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
      {balance && balance.available_for_withdrawal >= 500 && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="font-semibold text-emerald-800">
            You have ${balance.available_for_withdrawal.toFixed(2)} available for withdrawal
          </div>
          <div className="text-sm text-emerald-600 mt-1">Contact support to arrange a payout.</div>
        </div>
      )}

      {balance && balance.total_earned > 0 && balance.available_for_withdrawal < 500 && (
        <div className="rounded-xl border bg-gray-50 p-4 text-sm text-gray-600">
          Minimum withdrawal amount is $500. Your available balance: ${balance.available_for_withdrawal.toFixed(2)}.
        </div>
      )}

      {/* Network stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Recruited Partners"
          value={loading ? "..." : String(stats?.total_partners ?? 0)}
        />
        <StatCard
          title="Their Referrals"
          value={loading ? "..." : String(stats?.total_referrals ?? 0)}
        />
        <StatCard
          title="Pending Bookings"
          value={loading ? "..." : String(stats?.pending_bookings ?? 0)}
          color="text-amber-600"
        />
        <StatCard
          title="Completed Bookings"
          value={loading ? "..." : String(stats?.completed_bookings ?? 0)}
          color="text-sky-600"
        />
      </div>

      {/* How it works */}
      <div className="rounded-xl border bg-white p-4 space-y-3">
        <h2 className="text-lg font-semibold">How it works</h2>
        <div className="text-sm text-gray-600 space-y-2">
          <p>1. Share your recruitment link with potential affiliate partners</p>
          <p>2. When they register and get approved, they appear in your "My Partners" section</p>
          <p>3. When their referred patients complete procedures, you earn 1% of the procedure cost</p>
          <p>4. Your earnings update automatically when bookings are marked as completed</p>
        </div>
      </div>
    </div>
  );
}