// app/(user)/settings/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import type { SupabaseContextType } from '@/lib/supabase/supabase-provider';
import { useSupabase } from '@/lib/supabase/supabase-provider';
import { useSearchParams } from "next/navigation";

type FormState = {
  firstName: string;
  lastName: string;
  displayName: string;
  secondaryEmail: string;
  timeZone: string;
  phone: string;
  preferredLanguage: string;
  marketingEmails: boolean;
};

export default function SettingsPage() {
  const { supabase, session } = useSupabase() as SupabaseContextType;
  const user = session?.user ?? null;

  const browserTz = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    } catch {
      return '';
    }
  }, []);

  const [state, setState] = useState<FormState>({
    firstName: '',
    lastName: '',
    displayName: '',
    secondaryEmail: '',
    timeZone: browserTz,
    phone: '',
    preferredLanguage: 'en',
    marketingEmails: true,
  });

  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const sp = useSearchParams();
  const passwordHint = sp.get("password") === "1"; // подсказка после magic link

  const [pw, setPw] = useState({
    newPassword: "",
    confirm: "",
  });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwStatus, setPwStatus] = useState<"idle" | "saved" | "error">("idle");
  const [pwError, setPwError] = useState<string | null>(null);

  // список таймзон (если платформа поддерживает — берём полный список)
  const timeZones = useMemo(() => {
    try {
      // @ts-ignore — поддержка может быть не везде
      if (typeof Intl.supportedValuesOf === 'function') {
        // @ts-ignore
        return Intl.supportedValuesOf('timeZone') as string[];
      }
    } catch {
      // ignore
    }
    return [
      'UTC',
      'Europe/London',
      'Europe/Berlin',
      'Europe/Moscow',
      'Asia/Istanbul',
      'Asia/Ho_Chi_Minh',
      'Asia/Bangkok',
      'America/New_York',
      'America/Los_Angeles',
    ];
  }, []);

  function validatePassword(p: string) {
    // минимально безопасно, без усложнений
    if (!p || p.length < 8) return "Password must be at least 8 characters.";
    return null;
  }

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
      data: {
        has_password: true,
      },
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

  // Инициализируем форму из user_metadata
  useEffect(() => {
    if (!user) return;
    const meta: any = user.user_metadata ?? {};

    setState(prev => ({
      ...prev,
      firstName: meta.first_name ?? meta.given_name ?? '',
      lastName: meta.last_name ?? meta.family_name ?? '',
      displayName:
        meta.display_name ??
        meta.name ??
        (user.email ? user.email.split('@')[0] : ''),
      secondaryEmail: meta.secondary_email ?? '',
      timeZone: meta.time_zone ?? prev.timeZone ?? browserTz,
      phone: meta.phone ?? '',
      preferredLanguage: meta.preferred_language ?? 'en',
      marketingEmails:
        typeof meta.marketing_emails === 'boolean'
          ? meta.marketing_emails
          : true,
    }));
  }, [user, browserTz]);

  const handleChange =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const target = e.target as HTMLInputElement;
      const value =
        target.type === 'checkbox' ? target.checked : target.value;
      setState(prev => ({ ...prev, [field]: value as any }));
      setStatus('idle');
      setErrorMsg(null);
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !user) return;

    setSaving(true);
    setStatus('idle');
    setErrorMsg(null);

    const { error } = await supabase.auth.updateUser({
      data: {
        first_name: state.firstName || null,
        last_name: state.lastName || null,
        display_name: state.displayName || null,
        secondary_email: state.secondaryEmail || null,
        time_zone: state.timeZone || null,
        phone: state.phone || null,
        preferred_language: state.preferredLanguage || null,
        marketing_emails: state.marketingEmails,
      },
    });

    if (error) {
      setStatus('error');
      setErrorMsg(error.message || 'Failed to update settings');
    } else {
      setStatus('saved');
    }
    setSaving(false);
  };

  if (!user) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-semibold mb-4">Settings</h1>
        <p className="text-default-500">
          Please sign in to manage your personal settings.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 space-y-8">
      <header>
        <h1 className="text-2xl font-semibold">My settings</h1>
        <p className="mt-1 text-sm text-default-500">
          Manage your personal profile and preferences. These settings apply
          only to your account.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Account info */}
        <section className="rounded-xl border bg-white p-6 space-y-4">
          <h2 className="text-lg font-semibold">Account</h2>
          <p className="text-xs text-default-500">
            Basic information about your account. Primary email is used for
            login and security notifications.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="text-sm text-gray-600">
                Primary email (read-only)
              </label>
              <input
                className="mt-1 w-full rounded-md border px-3 py-2 bg-default-100 text-default-600 cursor-not-allowed"
                value={user.email ?? ''}
                disabled
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">
                First name
              </label>
              <input
                className="mt-1 w-full rounded-md border px-3 py-2"
                value={state.firstName}
                onChange={handleChange('firstName')}
                autoComplete="given-name"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">
                Last name
              </label>
              <input
                className="mt-1 w-full rounded-md border px-3 py-2"
                value={state.lastName}
                onChange={handleChange('lastName')}
                autoComplete="family-name"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm text-gray-600">
                Display name
                <span className="ml-1 text-xs text-gray-400">
                  (shown in UI and communication)
                </span>
              </label>
              <input
                className="mt-1 w-full rounded-md border px-3 py-2"
                value={state.displayName}
                onChange={handleChange('displayName')}
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">
                Additional email{' '}
                <span className="text-gray-400">(optional)</span>
              </label>
              <input
                className="mt-1 w-full rounded-md border px-3 py-2"
                placeholder="name+medtravel@example.com"
                value={state.secondaryEmail}
                onChange={handleChange('secondaryEmail')}
                autoComplete="email"
              />
              <p className="mt-1 text-[11px] text-gray-400">
                Used for notifications and backup contact. We&apos;ll never
                share it with third parties.
              </p>
            </div>

            <div>
              <label className="text-sm text-gray-600">
                Time zone
              </label>
              <select
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                value={state.timeZone}
                onChange={handleChange('timeZone')}
              >
                <option value="">Select time zone</option>
                {timeZones.map(tz => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
              {browserTz && (
                <button
                  type="button"
                  onClick={() =>
                    setState(prev => ({ ...prev, timeZone: browserTz }))
                  }
                  className="mt-1 text-[11px] text-primary hover:underline"
                >
                  Use browser time zone ({browserTz})
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Personal & communication preferences */}
        <section className="rounded-xl border bg-white p-6 space-y-4">
          <h2 className="text-lg font-semibold">Contact & preferences</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm text-gray-600">
                Phone / WhatsApp
              </label>
              <input
                className="mt-1 w-full rounded-md border px-3 py-2"
                placeholder="+90 555 000 00 00"
                value={state.phone}
                onChange={handleChange('phone')}
                autoComplete="tel"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">
                Preferred language
              </label>
              <select
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                value={state.preferredLanguage}
                onChange={handleChange('preferredLanguage')}
              >
                <option value="en">English</option>
                <option value="ru">Russian</option>
                <option value="pl">Poland</option>
              </select>
            </div>
          </div>

          <div className="mt-2 flex items-start gap-2">
            <input
              id="marketingEmails"
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-gray-400"
              checked={state.marketingEmails}
              onChange={handleChange('marketingEmails')}
            />
            <label
              htmlFor="marketingEmails"
              className="text-sm text-gray-700"
            >
              Receive product updates and important news about MedTravel
              <span className="block text-[11px] text-gray-400">
                No spam – only essential updates a few times per year.
              </span>
            </label>
          </div>
        </section>

        {/* Password */}
        <section className="rounded-xl border bg-white p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Password</h2>
              <p className="text-xs text-default-500">
                Set or change your password for email sign-in.
              </p>
            </div>

            {/* подсказка только если пришли по magic link */}
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

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>

          {status === 'saved' && (
            <span className="text-xs text-emerald-600">
              Settings updated.
            </span>
          )}
          {status === 'error' && errorMsg && (
            <span className="text-xs text-red-600">{errorMsg}</span>
          )}
        </div>
      </form>
    </main>
  );
}
