// components/admin/ClinicOwnerManager.tsx
"use client";

import { useState } from "react";

type Props = {
  clinicId: string;
  currentOwnerId: string | null;
  currentOwnerEmail: string | null;
};

export default function ClinicOwnerManager({ clinicId, currentOwnerId, currentOwnerEmail }: Props) {
  const [ownerId, setOwnerId] = useState<string | null>(currentOwnerId);
  const [ownerEmail, setOwnerEmail] = useState<string | null>(currentOwnerEmail);
  const [emailInput, setEmailInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function assign() {
    if (!emailInput.trim()) { setError("Enter email"); return; }
    setBusy(true); setError(null); setSuccess(null);
    try {
      const res = await fetch("/api/admin/clinics/assign-owner", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ clinic_id: clinicId, owner_email: emailInput.trim(), action: "assign" }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Failed to assign");
      setOwnerId(json.owner?.id ?? null);
      setOwnerEmail(json.owner?.email ?? emailInput.trim());
      setEmailInput("");
      setSuccess("Owner assigned successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (e: any) { setError(String(e?.message ?? e)); }
    finally { setBusy(false); }
  }

  async function unassign() {
    if (!confirm("Remove owner from this clinic?")) return;
    setBusy(true); setError(null); setSuccess(null);
    try {
      const res = await fetch("/api/admin/clinics/assign-owner", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ clinic_id: clinicId, action: "unassign" }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Failed to unassign");
      setOwnerId(null); setOwnerEmail(null);
      setSuccess("Owner removed");
      setTimeout(() => setSuccess(null), 3000);
    } catch (e: any) { setError(String(e?.message ?? e)); }
    finally { setBusy(false); }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
        Clinic Owner
      </h2>

      {ownerId ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-bold text-emerald-700">
              {(ownerEmail?.[0] ?? "?").toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">{ownerEmail}</div>
              <div className="text-xs text-slate-400 font-mono">{ownerId}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={unassign}
            disabled={busy}
            className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-60"
          >
            {busy ? "..." : "Remove owner"}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
            <svg className="h-4 w-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-xs text-amber-700">No owner assigned — clinic is not managed by any customer.</span>
          </div>

          <div className="flex gap-2">
            <input
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="customer@email.com"
              className="flex-1 rounded-lg border px-3 py-2 text-sm"
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), assign())}
            />
            <button
              type="button"
              onClick={assign}
              disabled={busy || !emailInput.trim()}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-60"
            >
              {busy ? "..." : "Assign"}
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            Enter the email of a user with "customer" role. They'll become the owner and be able to manage this clinic.
          </p>
        </div>
      )}

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</div>}
      {success && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{success}</div>}
    </div>
  );
}