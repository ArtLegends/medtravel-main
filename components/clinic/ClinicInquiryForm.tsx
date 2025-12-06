'use client';

import { useState } from 'react';
import { Icon } from '@iconify/react';

type Props = {
  clinicId: string;
  clinicSlug: string;
  clinicName: string;
};

const PHONE_STORAGE_KEY = 'mt_phone_history';

export default function ClinicInquiryForm({ clinicId, clinicSlug, clinicName }: Props) {
  const [pending, setPending] = useState(false);
  const [ok, setOk] = useState<null | boolean>(null);
  const [err, setErr] = useState<string | null>(null);

  const [phoneSuggestions, setPhoneSuggestions] = useState<string[]>([]);
  const [showPhoneSuggestions, setShowPhoneSuggestions] = useState(false);

  function loadPhoneHistory() {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(PHONE_STORAGE_KEY);
      if (!raw) return;
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr)) return;
      setPhoneSuggestions(
        arr
          .map((v) => String(v).trim())
          .filter(Boolean)
          .slice(0, 5),
      );
    } catch {
      // ignore
    }
  }

  function rememberPhone(value: string) {
    if (typeof window === 'undefined') return;
    const trimmed = value.trim();
    if (!trimmed) return;

    try {
      const raw = window.localStorage.getItem(PHONE_STORAGE_KEY);
      const arr = raw ? (JSON.parse(raw) as unknown[]) : [];
      const next = [trimmed, ...arr.map((v) => String(v).trim()).filter((p) => p && p !== trimmed)];
      window.localStorage.setItem(PHONE_STORAGE_KEY, JSON.stringify(next.slice(0, 5)));
    } catch {
      // ignore
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setOk(null);
    setErr(null);

    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      clinic_id: clinicId,
      name: (fd.get('name') || '').toString(),
      email: ((fd.get('email') || '') as string) || null,
      phone: (fd.get('phone') || '').toString(),
      message: ((fd.get('message') || '') as string) || null,
    };

    try {
      const res = await fetch('/api/clinic-inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Bad response');
      setOk(true);
      rememberPhone(payload.phone);
      form.reset();
    } catch (e) {
      setOk(false);
      setErr('Failed to send the enquiry. Please try again later.');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm md:p-6">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50">
          <Icon
            icon="solar:chat-round-dots-linear"
            className="h-5 w-5 text-emerald-600"
            aria-hidden="true"
          />
        </div>
        <div>
          <h2 className="text-lg font-semibold md:text-xl">
            Send a message to <span className="text-emerald-700">{clinicName}</span>
          </h2>
          <p className="mt-1 text-xs text-gray-500 md:text-sm">
            Fill in the form below and our coordinators will help the clinic respond to your enquiry.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label
              htmlFor="inquiry-name"
              className="block text-sm font-medium text-gray-800"
            >
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="inquiry-name"
              name="name"
              required
              autoComplete="name"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              placeholder="Enter your full name"
            />
          </div>
          <div className="space-y-1">
            <label
              htmlFor="inquiry-email"
              className="block text-sm font-medium text-gray-800"
            >
              E-mail
            </label>
            <input
              id="inquiry-email"
              type="email"
              name="email"
              autoComplete="email"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              placeholder="Enter your email (optional)"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label
            htmlFor="inquiry-phone"
            className="block text-sm font-medium text-gray-800"
          >
            Phone Number <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="inquiry-phone"
              name="phone"
              type="tel"
              required
              autoComplete="tel"
              inputMode="tel"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              placeholder="+1 555 000 0000"
              onFocus={() => {
                loadPhoneHistory();
                if (phoneSuggestions.length) setShowPhoneSuggestions(true);
              }}
              onBlur={() => {
                setTimeout(() => setShowPhoneSuggestions(false), 120);
              }}
            />
            {showPhoneSuggestions && phoneSuggestions.length > 0 && (
              <ul className="absolute left-0 right-0 z-10 mt-1 max-h-48 overflow-auto rounded-lg border border-gray-200 bg-white text-sm shadow-lg">
                {phoneSuggestions.map((p) => (
                  <li key={p}>
                    <button
                      type="button"
                      className="flex w-full px-3 py-2 text-left hover:bg-gray-50"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        const input = document.getElementById(
                          'inquiry-phone',
                        ) as HTMLInputElement | null;
                        if (input) input.value = p;
                        setShowPhoneSuggestions(false);
                      }}
                    >
                      {p}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <p className="text-xs text-gray-500">
            We’ll use this number to contact you about your enquiry.
          </p>
        </div>

        <div className="space-y-1">
          <label
            htmlFor="inquiry-message"
            className="block text-sm font-medium text-gray-800"
          >
            Your message to the clinic
          </label>
          <textarea
            id="inquiry-message"
            name="message"
            rows={6}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            placeholder="Describe your situation, preferred dates, or any questions you have."
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="mt-1 w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? 'Sending…' : 'Send Enquiry'}
        </button>

        {ok === true && (
          <div className="mt-3 rounded-md bg-emerald-50 p-3 text-sm text-emerald-800">
            Your enquiry has been sent. We’ll get back to you as soon as the clinic responds.
          </div>
        )}
        {ok === false && (
          <div className="mt-3 rounded-md bg-rose-50 p-3 text-sm text-rose-700">
            {err}
          </div>
        )}
      </form>
    </div>
  );
}
