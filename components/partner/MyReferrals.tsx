// components/partner/MyReferrals.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSupabase } from "@/lib/supabase/supabase-provider";
import type { SupabaseContextType } from "@/lib/supabase/supabase-provider";

type ReferralBookingRow = {
  program_key: string;
  patient_public_id: number;
  status: string;
  partner_earning: number | null;
  earning_status: string | null;
  currency: string | null;
  created_at: string;
};

type ApprovedProgram = {
  program_key: string;
  ref_code: string;
  created_at: string;
};

type ClickRow = { ref_code: string; program_key: string; created_at: string };
type ReferralRow = { ref_code: string; program_key: string; patient_user_id: string; created_at: string };

type BalanceData = {
  total_earned: number;
  available_for_withdrawal: number;
  currency: string;
};

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://medtravel.me").replace(/\/+$/, "");
}

function formatEarningStatus(status: string | null) {
  if (!status) return null;
  const map: Record<string, { label: string; className: string }> = {
    pending: { label: "Pending", className: "bg-amber-50 text-amber-700" },
    confirmed: { label: "Confirmed", className: "bg-emerald-50 text-emerald-700" },
    paid: { label: "Paid", className: "bg-sky-50 text-sky-700" },
    void: { label: "Void", className: "bg-gray-50 text-gray-500" },
  };
  return map[status] ?? { label: status, className: "bg-gray-50 text-gray-600" };
}

export default function MyReferrals() {
  const { supabase, session } = useSupabase() as SupabaseContextType;

  const [approved, setApproved] = useState<ApprovedProgram[]>([]);
  const [clicks, setClicks] = useState<ClickRow[]>([]);
  const [refs, setRefs] = useState<ReferralRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [bookingRows, setBookingRows] = useState<ReferralBookingRow[]>([]);
  const [balance, setBalance] = useState<BalanceData | null>(null);

  useEffect(() => {
    if (!supabase || !session) return;

    let cancelled = false;

    (async () => {
      setLoading(true);

      const [programsRes, clicksRes, refsRes, bookingsRes, balanceRes] = await Promise.all([
        supabase
          .from("partner_program_requests")
          .select("program_key, ref_code, created_at")
          .eq("user_id", session.user.id)
          .eq("status", "approved")
          .not("ref_code", "is", null)
          .order("created_at", { ascending: false }),

        supabase
          .from("partner_referral_clicks")
          .select("ref_code, program_key, created_at")
          .eq("partner_user_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(500),

        supabase
          .from("partner_referrals")
          .select("ref_code, program_key, patient_user_id, created_at")
          .eq("partner_user_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(500),

        supabase.rpc("partner_referral_bookings_list", { p_limit: 200, p_offset: 0 }),

        supabase.rpc("partner_balance"),
      ]);

      if (cancelled) return;

      setApproved((programsRes.data ?? []) as any);
      setClicks((clicksRes.data ?? []) as any);
      setRefs((refsRes.data ?? []) as any);
      setBookingRows((bookingsRes.data ?? []) as any);

      if (balanceRes.data && Array.isArray(balanceRes.data) && balanceRes.data.length > 0) {
        setBalance(balanceRes.data[0] as BalanceData);
      }

      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [supabase, session]);

  // Realtime subscription for booking changes
  useEffect(() => {
    if (!supabase || !session) return;

    const channel = supabase
      .channel("partner-referrals-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "patient_bookings" }, () => {
        (async () => {
          try {
            const [bookingsRes, balanceRes] = await Promise.all([
              supabase.rpc("partner_referral_bookings_list", { p_limit: 200, p_offset: 0 }),
              supabase.rpc("partner_balance"),
            ]);
            setBookingRows((bookingsRes.data ?? []) as any);
            if (balanceRes.data && Array.isArray(balanceRes.data) && balanceRes.data.length > 0) {
              setBalance(balanceRes.data[0] as BalanceData);
            }
          } catch {
            // ignore
          }
        })();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, session]);

  const statsByCode = useMemo(() => {
    const map = new Map<string, { clicks: number; signups: number }>();

    for (const c of clicks) {
      const k = `${c.program_key}__${c.ref_code}`;
      map.set(k, { ...(map.get(k) ?? { clicks: 0, signups: 0 }), clicks: (map.get(k)?.clicks ?? 0) + 1 });
    }
    for (const r of refs) {
      const k = `${r.program_key}__${r.ref_code}`;
      map.set(k, { ...(map.get(k) ?? { clicks: 0, signups: 0 }), signups: (map.get(k)?.signups ?? 0) + 1 });
    }
    return map;
  }, [clicks, refs]);

  async function copy(v: string) {
    try {
      await navigator.clipboard.writeText(v);
    } catch {}
  }

  if (!session) {
    return <div className="rounded-xl border bg-white p-4">Please sign in.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My referrals</h1>
        <p className="text-gray-600">Referral links, clicks and registered patients.</p>
      </div>

      {/* Balance card */}
      {balance && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border bg-white p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Total Earned</div>
            <div className="mt-1 text-2xl font-bold">
              ${balance.total_earned.toFixed(2)} {balance.currency}
            </div>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Available for Withdrawal</div>
            <div className="mt-1 text-2xl font-bold text-emerald-600">
              ${balance.available_for_withdrawal.toFixed(2)} {balance.currency}
            </div>
            {balance.available_for_withdrawal < 300 && balance.total_earned > 0 && (
              <div className="mt-1 text-xs text-gray-500">Minimum withdrawal: $300</div>
            )}
          </div>
        </div>
      )}

      {/* Referral links */}
      <section className="rounded-xl border bg-white p-4">
        <h2 className="text-lg font-semibold">Your referral links</h2>

        {loading ? (
          <p className="mt-3 text-sm text-gray-500">Loading…</p>
        ) : approved.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">No approved programs yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {approved.map((p) => {
              const code = String(p.ref_code || "");
              const link =
                p.program_key === "hair-transplant"
                  ? `${siteUrl()}/ru/hair-transplant/lp/${code}`
                  : `${siteUrl()}/ref/${code}`;
              const key = `${p.program_key}__${code}`;
              const s = statsByCode.get(key) ?? { clicks: 0, signups: 0 };
              const conv = s.clicks > 0 ? Math.round((s.signups / s.clicks) * 1000) / 10 : 0;

              return (
                <div key={key} className="rounded-lg border p-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="text-sm font-semibold">{p.program_key}</div>
                      <div className="mt-1 text-xs text-gray-500">
                        Code: <span className="font-mono">{code}</span>
                      </div>
                      <div className="mt-1 text-xs text-gray-500 break-all">{link}</div>
                    </div>
                    <div className="flex gap-2">
                      <button className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50" onClick={() => copy(code)}>
                        Copy code
                      </button>
                      <button className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50" onClick={() => copy(link)}>
                        Copy link
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-3">
                    <div className="rounded-md bg-gray-50 p-3 text-sm">
                      <div className="text-xs text-gray-500">Clicks</div>
                      <div className="font-semibold">{s.clicks}</div>
                    </div>
                    <div className="rounded-md bg-gray-50 p-3 text-sm">
                      <div className="text-xs text-gray-500">Registrations</div>
                      <div className="font-semibold">{s.signups}</div>
                    </div>
                    <div className="rounded-md bg-gray-50 p-3 text-sm">
                      <div className="text-xs text-gray-500">Conversion</div>
                      <div className="font-semibold">{conv}%</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Referral bookings table */}
      <section className="rounded-xl border bg-white p-4">
        <h2 className="text-lg font-semibold">Latest registered referrals</h2>

        {loading ? (
          <p className="mt-3 text-sm text-gray-500">Loading…</p>
        ) : bookingRows.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">No referrals yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
                  <th className="px-3 py-2">Program</th>
                  <th className="px-3 py-2">Patient</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Your Earning</th>
                  <th className="px-3 py-2">Created</th>
                </tr>
              </thead>

              <tbody>
                {bookingRows.map((r, i) => {
                  const earningInfo = formatEarningStatus(r.earning_status);

                  return (
                    <tr key={`${r.program_key}_${r.patient_public_id}_${r.created_at}_${i}`} className="border-b last:border-0">
                      <td className="px-3 py-2">{r.program_key}</td>

                      <td className="px-3 py-2 font-mono text-xs">
                        #{r.patient_public_id ?? 0}
                      </td>

                      <td className="px-3 py-2">
                        <span
                          className={[
                            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
                            r.status === "confirmed"
                              ? "bg-emerald-50 text-emerald-700"
                              : r.status === "completed"
                                ? "bg-sky-50 text-sky-700"
                                : r.status === "cancelled" || r.status === "cancelled_by_patient"
                                  ? "bg-rose-50 text-rose-700"
                                  : "bg-amber-50 text-amber-700",
                          ].join(" ")}
                        >
                          {r.status}
                        </span>
                      </td>

                      <td className="px-3 py-2">
                        {r.partner_earning != null ? (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">
                              ${Number(r.partner_earning).toFixed(2)} {r.currency ?? "USD"}
                            </span>
                            {earningInfo && (
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${earningInfo.className}`}>
                                {earningInfo.label}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>

                      <td className="px-3 py-2">
                        {new Date(r.created_at).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}