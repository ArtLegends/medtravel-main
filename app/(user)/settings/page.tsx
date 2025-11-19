// app/(user)/settings/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import type { SupabaseContextType } from '@/lib/supabase/supabase-provider';
import { useSupabase } from '@/lib/supabase/supabase-provider';

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
