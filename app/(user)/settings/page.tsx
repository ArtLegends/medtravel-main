// app/(user)/settings/page.tsx
"use client";

import { useEffect, useState } from "react";
import type { SupabaseContextType } from "@/lib/supabase/supabase-provider";
import { useSupabase } from "@/lib/supabase/supabase-provider";
import { useSearchParams } from "next/navigation";

export default function SettingsPage() {
  const { supabase, session } = useSupabase() as SupabaseContextType;
  const user = session?.user ?? null;
  const sp = useSearchParams();
  const passwordHint = sp.get("password") === "1";

  // OTP flow states
  const [otpStep, setOtpStep] = useState<"idle" | "sent" | "verified">("idle");
  const [otpCode, setOtpCode] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpCooldown, setOtpCooldown] = useState(0);

  // Password states (only active after OTP verified)
  const [pw, setPw] = useState({ newPassword: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwStatus, setPwStatus] = useState<"idle" | "saved" | "error">("idle");
  const [pwError, setPwError] = useState<string | null>(null);

  // Settings
  const [securityEmailAlerts, setSecurityEmailAlerts] = useState(true);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const meta: any = user.user_metadata ?? {};
    setSecurityEmailAlerts(typeof meta.security_email_alerts === "boolean" ? meta.security_email_alerts : true);
    setRememberDevice(typeof meta.sessions_remember_device === "boolean" ? meta.sessions_remember_device : true);
  }, [user]);

  // Cooldown timer
  useEffect(() => {
    if (otpCooldown <= 0) return;
    const t = setInterval(() => setOtpCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [otpCooldown]);

  const sendOtp = async () => {
    if (!user?.email) { setOtpError("No email on account"); return; }
    setOtpSending(true); setOtpError(null);
    try {
      const res = await fetch("/api/auth/email/send-otp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: user.email, purpose: "verify_email" }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Failed to send code");
      setOtpStep("sent");
      setOtpCooldown(60);
    } catch (e: any) { setOtpError(e?.message ?? "Error"); }
    finally { setOtpSending(false); }
  };

  const verifyOtp = async () => {
    if (!user?.email || otpCode.length !== 6) { setOtpError("Enter 6-digit code"); return; }
    setOtpVerifying(true); setOtpError(null);
    try {
      const res = await fetch("/api/auth/email/verify-otp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: user.email, token: otpCode, purpose: "verify_email" }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Invalid code");
      setOtpStep("verified");
    } catch (e: any) { setOtpError(e?.message ?? "Error"); }
    finally { setOtpVerifying(false); }
  };

  const handlePasswordSubmit = async () => {
    if (!supabase || !user) return;
    setPwStatus("idle"); setPwError(null);
    if (!pw.newPassword || pw.newPassword.length < 8) { setPwStatus("error"); setPwError("Password must be at least 8 characters."); return; }
    if (pw.newPassword !== pw.confirm) { setPwStatus("error"); setPwError("Passwords do not match."); return; }

    setPwSaving(true);
    const { error } = await supabase.auth.updateUser({ password: pw.newPassword, data: { has_password: true } });
    if (error) { setPwStatus("error"); setPwError(error.message); }
    else {
      setPwStatus("saved");
      await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("type", "set_password").eq("is_read", false);
      setPw({ newPassword: "", confirm: "" });
      // Reset OTP flow after successful change
      setTimeout(() => { setOtpStep("idle"); setOtpCode(""); }, 3000);
    }
    setPwSaving(false);
  };

  const handleSaveSettings = async () => {
    if (!supabase || !user) return;
    setSaving(true); setStatus("idle"); setErrorMsg(null);
    const { error } = await supabase.auth.updateUser({
      data: { security_email_alerts: securityEmailAlerts, sessions_remember_device: rememberDevice },
    });
    if (error) { setStatus("error"); setErrorMsg(error.message); } else { setStatus("saved"); }
    setSaving(false);
  };

  if (!user) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-semibold mb-4">Settings</h1>
        <p className="text-default-500">Please sign in to manage your settings.</p>
      </main>
    );
  }

  const hasEmail = !!user.email;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 space-y-8">
      <header>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="mt-1 text-sm text-default-500">Security and account preferences.</p>
      </header>

      {/* Password */}
      <section className="rounded-xl border bg-white p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Password</h2>
            <p className="text-xs text-default-500">Set or change your password for email sign-in.</p>
          </div>
          {passwordHint && (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">Recommended</span>
          )}
        </div>

        {passwordHint && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            You signed in via email link. For faster access next time, set a password now.
          </div>
        )}

        {!hasEmail && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Your account doesn't have an email address. Add one in your profile to set a password.
          </div>
        )}

        {hasEmail && (
          <div className="space-y-4">
            {/* Step 1: Send OTP */}
            {otpStep === "idle" && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  To change your password, we'll send a verification code to <span className="font-semibold">{user.email}</span>.
                </p>
                <button
                  type="button"
                  disabled={otpSending}
                  onClick={sendOtp}
                  className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                >
                  {otpSending ? "Sending..." : "Send verification code"}
                </button>
              </div>
            )}

            {/* Step 2: Enter OTP */}
            {otpStep === "sent" && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Enter the 6-digit code sent to <span className="font-semibold">{user.email}</span>
                </p>
                <div className="flex items-center gap-3">
                  <input
                    className="w-40 rounded-md border px-3 py-2 text-center text-lg font-mono tracking-widest"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => { setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6)); setOtpError(null); }}
                    placeholder="000000"
                    autoFocus
                  />
                  <button
                    type="button"
                    disabled={otpVerifying || otpCode.length !== 6}
                    onClick={verifyOtp}
                    className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                  >
                    {otpVerifying ? "Verifying..." : "Verify"}
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={otpCooldown > 0 || otpSending}
                    onClick={sendOtp}
                    className="text-xs text-primary hover:underline disabled:text-gray-400 disabled:no-underline"
                  >
                    Resend code{otpCooldown > 0 ? ` (${otpCooldown}s)` : ""}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setOtpStep("idle"); setOtpCode(""); setOtpError(null); }}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Set new password (OTP verified) */}
            {otpStep === "verified" && (
              <div className="space-y-4">
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 flex items-center gap-2">
                  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                  Identity verified. Set your new password below.
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm text-gray-600">New password</label>
                    <input className="mt-1 w-full rounded-md border px-3 py-2" type="password" value={pw.newPassword}
                      onChange={(e) => { setPw((p) => ({ ...p, newPassword: e.target.value })); setPwStatus("idle"); setPwError(null); }}
                      autoComplete="new-password" placeholder="At least 8 characters" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Confirm password</label>
                    <input className="mt-1 w-full rounded-md border px-3 py-2" type="password" value={pw.confirm}
                      onChange={(e) => { setPw((p) => ({ ...p, confirm: e.target.value })); setPwStatus("idle"); setPwError(null); }}
                      autoComplete="new-password" />
                  </div>
                </div>

                {pwStatus === "error" && pwError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{pwError}</div>
                )}
                {pwStatus === "saved" && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Password updated successfully.</div>
                )}

                <div className="flex items-center gap-3">
                  <button type="button" disabled={pwSaving} onClick={handlePasswordSubmit}
                    className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
                    {pwSaving ? "Saving…" : "Save new password"}
                  </button>
                  <button type="button" onClick={() => { setOtpStep("idle"); setOtpCode(""); setPw({ newPassword: "", confirm: "" }); setPwStatus("idle"); }}
                    className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
                </div>
              </div>
            )}

            {otpError && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{otpError}</div>}
          </div>
        )}
      </section>

      {/* Security & preferences */}
      <section className="rounded-xl border bg-white p-6 space-y-4">
        <h2 className="text-lg font-semibold">Security & preferences</h2>
        <p className="text-xs text-default-500">These options are stored in your account metadata.</p>
        <div className="space-y-3">
          <label className="flex items-start gap-2">
            <input type="checkbox" className="mt-1 h-4 w-4 rounded border-gray-400" checked={securityEmailAlerts}
              onChange={(e) => { setSecurityEmailAlerts(e.target.checked); setStatus("idle"); setErrorMsg(null); }} />
            <span className="text-sm text-gray-700">Security email alerts
              <span className="block text-[11px] text-gray-400">Get notified about sign-ins and important account actions.</span></span>
          </label>
          <label className="flex items-start gap-2">
            <input type="checkbox" className="mt-1 h-4 w-4 rounded border-gray-400" checked={rememberDevice}
              onChange={(e) => { setRememberDevice(e.target.checked); setStatus("idle"); setErrorMsg(null); }} />
            <span className="text-sm text-gray-700">Remember this device
              <span className="block text-[11px] text-gray-400">Improves convenience. You can revoke sessions later.</span></span>
          </label>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" disabled={saving} onClick={handleSaveSettings}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
            {saving ? "Saving…" : "Save settings"}</button>
          {status === "saved" && <span className="text-xs text-emerald-600">Settings updated.</span>}
          {status === "error" && errorMsg && <span className="text-xs text-red-600">{errorMsg}</span>}
        </div>
      </section>
    </main>
  );
}