"use client";

import { useEffect, useMemo, useState } from "react";
import { useSupabase } from "@/lib/supabase/supabase-provider";
import type { SupabaseContextType } from "@/lib/supabase/supabase-provider";

type ApprovedProgram = {
  program_key: string;
  ref_code: string;
  created_at: string;
};

type ClickRow = { ref_code: string; program_key: string; created_at: string };
type ReferralRow = { ref_code: string; program_key: string; patient_user_id: string; created_at: string };

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://medtravel.me").replace(/\/+$/, "");
}

export default function MyReferrals() {
  const { supabase, session } = useSupabase() as SupabaseContextType;

  const [approved, setApproved] = useState<ApprovedProgram[]>([]);
  const [clicks, setClicks] = useState<ClickRow[]>([]);
  const [refs, setRefs] = useState<ReferralRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase || !session) return;

    let cancelled = false;

    (async () => {
      setLoading(true);

      const { data: programs } = await supabase
        .from("partner_program_requests")
        .select("program_key, ref_code, created_at")
        .eq("user_id", session.user.id)
        .eq("status", "approved")
        .not("ref_code", "is", null)
        .order("created_at", { ascending: false });

      const { data: clickRows } = await supabase
        .from("partner_referral_clicks")
        .select("ref_code, program_key, created_at")
        .order("created_at", { ascending: false })
        .limit(500);

      const { data: refRows } = await supabase
        .from("partner_referrals")
        .select("ref_code, program_key, patient_user_id, created_at")
        .order("created_at", { ascending: false })
        .limit(500);

      if (cancelled) return;

      setApproved((programs ?? []) as any);
      setClicks((clickRows ?? []) as any);
      setRefs((refRows ?? []) as any);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
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
              const link = `${siteUrl()}/ref/${code}`;
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

      <section className="rounded-xl border bg-white p-4">
        <h2 className="text-lg font-semibold">Latest registered referrals</h2>

        {loading ? (
          <p className="mt-3 text-sm text-gray-500">Loading…</p>
        ) : refs.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">No referrals yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
                  <th className="px-3 py-2">Program</th>
                  <th className="px-3 py-2">Ref code</th>
                  <th className="px-3 py-2">Patient</th>
                  <th className="px-3 py-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {refs.map((r, i) => (
                  <tr key={`${r.patient_user_id}_${i}`} className="border-b last:border-0">
                    <td className="px-3 py-2">{r.program_key}</td>
                    <td className="px-3 py-2">
                      <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">{r.ref_code}</code>
                    </td>
                    <td className="px-3 py-2">
                      <span className="font-mono text-xs">{r.patient_user_id}</span>
                    </td>
                    <td className="px-3 py-2">{new Date(r.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
