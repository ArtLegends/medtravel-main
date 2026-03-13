// app/(supervisor)/supervisor/partners/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/lib/supabase/supabase-provider";

type PartnerRow = {
  partner_user_id: string;
  partner_email: string | null;
  referrals_count: number;
  total_earnings: number;
  joined_at: string;
};

export default function SupervisorPartnersPage() {
  const { supabase, session } = useSupabase();
  const [loading, setLoading] = useState(true);
  const [partners, setPartners] = useState<PartnerRow[]>([]);
  const [refCode, setRefCode] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase || !session) return;
    let cancelled = false;

    (async () => {
      setLoading(true);

      // Get ref_code from dedicated column
      const { data: reqData } = await supabase
        .from("supervisor_registration_requests")
        .select("ref_code")
        .eq("user_id", session.user.id)
        .eq("status", "approved")
        .maybeSingle();

      if (reqData?.ref_code) setRefCode(reqData.ref_code);

      const { data: partnersData } = await supabase
        .rpc("supervisor_partners_list", { p_limit: 100, p_offset: 0 });

      if (!cancelled) {
        setPartners((partnersData ?? []) as PartnerRow[]);
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [supabase, session]);

  async function copyToClipboard(text: string) {
    try { await navigator.clipboard.writeText(text); } catch {}
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://medtravel.me").replace(/\/+$/, "");
  const referralLink = refCode ? `${siteUrl}/ref/sv/${refCode}` : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Partners</h1>
        <p className="text-gray-600">Partners you recruited and their performance.</p>
      </div>

      {/* Referral link */}
      <div className="rounded-xl border bg-white p-4">
        <h2 className="text-lg font-semibold mb-3">Your Recruitment Link</h2>
        {refCode ? (
          <div className="flex flex-col gap-2">
            <div className="text-sm text-gray-500">
              Share this link with potential affiliate partners. They will be redirected to register as a Partner and linked to your account.
            </div>
            <div className="flex items-center gap-2 mt-2">
              <code className="flex-1 rounded-md border bg-gray-50 px-3 py-2 text-sm break-all">
                {referralLink}
              </code>
              <button
                className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50 shrink-0"
                onClick={() => referralLink && copyToClipboard(referralLink)}
              >
                Copy link
              </button>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500">Code:</span>
              <code className="font-mono text-xs">{refCode}</code>
              <button
                className="text-xs text-primary hover:underline"
                onClick={() => copyToClipboard(refCode)}
              >
                Copy code
              </button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500">
            {loading ? "Loading..." : "No referral code assigned yet. Contact support."}
          </div>
        )}
      </div>

      {/* Partners table */}
      <div className="rounded-xl border bg-white p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recruited Partners</h2>
          {!loading && partners.length > 0 && (
            <span className="text-xs text-gray-500">Total: {partners.length}</span>
          )}
        </div>

        {loading ? (
          <div className="h-32 animate-pulse rounded-md bg-gray-50" />
        ) : partners.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No partners recruited yet. Share your referral link to start recruiting!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
                  <th className="px-3 py-2">Partner Email</th>
                  <th className="px-3 py-2">Their Referrals</th>
                  <th className="px-3 py-2">Your Earnings (1%)</th>
                  <th className="px-3 py-2">Joined</th>
                </tr>
              </thead>
              <tbody>
                {partners.map((p) => (
                  <tr key={p.partner_user_id} className="border-b last:border-0">
                    <td className="px-3 py-2">{p.partner_email || "—"}</td>
                    <td className="px-3 py-2">{p.referrals_count}</td>
                    <td className="px-3 py-2 font-semibold">
                      ${Number(p.total_earnings).toFixed(2)}
                    </td>
                    <td className="px-3 py-2 text-gray-500">
                      {new Date(p.joined_at).toLocaleDateString()}
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