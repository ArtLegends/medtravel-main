// app/(user)/settings/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import type { SupabaseContextType } from "@/lib/supabase/supabase-provider";
import { useSupabase } from "@/lib/supabase/supabase-provider";
import { useSearchParams } from "next/navigation";

export default function SettingsPage() {
  const { supabase, session } = useSupabase() as SupabaseContextType;
  const user = session?.user ?? null;

  const sp = useSearchParams();
  const passwordHint = sp.get("password") === "1";

  const [pw, setPw] = useState({ newPassword: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwStatus, setPwStatus] = useState<"idle" | "saved" | "error">("idle");
  const [pwError, setPwError] = useState<string | null>(null);

  // Extra settings
  const [securityEmailAlerts, setSecurityEmailAlerts] = useState(true);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function validatePassword(p: string) {
    if (!p || p.length < 8) return "Password must be at least 8 characters.";
    return null;
  }

  // init from metadata
  useEffect(() => {
    if (!user) return;
    const meta: any = user.user_metadata ?? {};
    setSecurityEmailAlerts(
      typeof meta.security_email_alerts === "boolean" ? meta.security_email_alerts : true
    );
    setRememberDevice(
      typeof meta.sessions_remember_device === "boolean" ? meta.sessions_remember_device : true
    );
  }, [user]);

  const handlePasswordSubmit = async () => {
    if (!supabase || !user) return;

    setPwStatus("idle");
    setPwError(null);

    const v = validatePassword(pw.newPassword);
    if (v) {
      setPwStatus("error");
      setPwError(v);
      return;
    }
    if (pw.newPassword !== pw.confirm) {
      setPwStatus("error");
      setPwError("Passwords do not match.");
      return;
    }

    setPwSaving(true);
    const { error } = await supabase.auth.updateUser({
      password: pw.newPassword,
      data: { has_password: true },
    });

    if (error) {
      setPwStatus("error");
      setPwError(error.message || "Failed to update password.");
    } else {
      setPwStatus("saved");
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("type", "set_password")
        .eq("is_read", false);

      setPw({ newPassword: "", confirm: "" });
    }
    setPwSaving(false);
  };

  const handleSaveSettings = async () => {
    if (!supabase || !user) return;

    setSaving(true);
    setStatus("idle");
    setErrorMsg(null);

    const { error } = await supabase.auth.updateUser({
      data: {
        security_email_alerts: securityEmailAlerts,
        sessions_remember_device: rememberDevice,
      },
    });

    if (error) {
      setStatus("error");
      setErrorMsg(error.message || "Failed to update settings");
    } else {
      setStatus("saved");
    }
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

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 space-y-8">
      <header>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="mt-1 text-sm text-default-500">
          Security and account preferences.
        </p>
      </header>

      {/* Password */}
      <section className="rounded-xl border bg-white p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Password</h2>
            <p className="text-xs text-default-500">Set or change your password for email sign-in.</p>
          </div>

          {passwordHint ? (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
              Recommended
            </span>
          ) : null}
        </div>

        {passwordHint ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            You signed in via email link. For faster access next time, set a password now.
          </div>
        ) : null}

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm text-gray-600">New password</label>
              <input
                className="mt-1 w-full rounded-md border px-3 py-2"
                type="password"
                value={pw.newPassword}
                onChange={(e) => {
                  setPw((p) => ({ ...p, newPassword: e.target.value }));
                  setPwStatus("idle");
                  setPwError(null);
                }}
                autoComplete="new-password"
                placeholder="At least 8 characters"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Confirm password</label>
              <input
                className="mt-1 w-full rounded-md border px-3 py-2"
                type="password"
                value={pw.confirm}
                onChange={(e) => {
                  setPw((p) => ({ ...p, confirm: e.target.value }));
                  setPwStatus("idle");
                  setPwError(null);
                }}
                autoComplete="new-password"
              />
            </div>
          </div>

          {pwStatus === "error" && pwError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {pwError}
            </div>
          ) : null}

          {pwStatus === "saved" ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              Password updated.
            </div>
          ) : null}

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={pwSaving}
              onClick={handlePasswordSubmit}
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {pwSaving ? "Saving…" : "Save password"}
            </button>

            <span className="text-[11px] text-gray-400">
              If you use Google sign-in, password is optional.
            </span>
          </div>
        </div>
      </section>

      {/* Security & preferences */}
      <section className="rounded-xl border bg-white p-6 space-y-4">
        <h2 className="text-lg font-semibold">Security & preferences</h2>
        <p className="text-xs text-default-500">
          These options are stored in your account metadata.
        </p>

        <div className="space-y-3">
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-gray-400"
              checked={securityEmailAlerts}
              onChange={(e) => {
                setSecurityEmailAlerts(e.target.checked);
                setStatus("idle");
                setErrorMsg(null);
              }}
            />
            <span className="text-sm text-gray-700">
              Security email alerts
              <span className="block text-[11px] text-gray-400">
                Get notified about sign-ins and important account actions.
              </span>
            </span>
          </label>

          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-gray-400"
              checked={rememberDevice}
              onChange={(e) => {
                setRememberDevice(e.target.checked);
                setStatus("idle");
                setErrorMsg(null);
              }}
            />
            <span className="text-sm text-gray-700">
              Remember this device
              <span className="block text-[11px] text-gray-400">
                Improves convenience. You can revoke sessions later (feature-ready).
              </span>
            </span>
          </label>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={saving}
            onClick={handleSaveSettings}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save settings"}
          </button>

          {status === "saved" && <span className="text-xs text-emerald-600">Settings updated.</span>}
          {status === "error" && errorMsg && <span className="text-xs text-red-600">{errorMsg}</span>}
        </div>
      </section>
    </main>
  );
}