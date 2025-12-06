// components/clinic/ReportModal.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';

type Props = {
  open: boolean;
  onClose: () => void;
  clinicId: string;
};

export default function ReportModal({ open, onClose, clinicId }: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // reset при открытии
  useEffect(() => {
    if (!open) return;
    setName('');
    setEmail('');
    setPhone('');
    setRelationship('');
    setMessage('');
    setSubmitting(false);
    setDone(false);
    setError(null);

    // лёгкий автофокус
    const t = setTimeout(() => {
      nameInputRef.current?.focus();
    }, 50);
    return () => clearTimeout(t);
  }, [open]);

  // закрытие по ESC / клик мимо окна
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && e.target instanceof Node && !boxRef.current.contains(e.target)) {
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onClick);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousedown', onClick);
    };
  }, [open, onClose]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name || !email || !phone || !relationship || !message) {
      setError('Please fill in all fields before submitting the report.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinic_id: clinicId,
          name,
          email,
          phone,
          relationship,
          message,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || 'Failed to send report');
      }
      setDone(true);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/55 px-3">
      <div
        ref={boxRef}
        className="w-full max-w-[520px] rounded-2xl border border-slate-200 bg-white px-4 py-5 shadow-2xl md:px-6 md:py-6"
        role="dialog"
        aria-modal="true"
      >
        {/* header */}
        <div className="mb-4 flex items-start justify-between">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-700">
              <Icon
                icon="solar:shield-warning-bold"
                className="h-3.5 w-3.5"
                aria-hidden="true"
              />
              <span>Report an issue</span>
            </div>
            <h3 className="text-base font-semibold text-gray-900 md:text-lg">
              Let us know of any incorrect information
            </h3>
            <p className="text-xs text-gray-500 md:text-sm">
              Please fill out this form to report inaccurate details, outdated information,
              or anything suspicious about this clinic&apos;s listing.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="ml-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {done ? (
          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-xl bg-emerald-50 px-3 py-3 text-sm text-emerald-800">
              <Icon
                icon="solar:check-circle-bold"
                className="mt-0.5 h-5 w-5 flex-shrink-0"
              />
              <div>
                <p className="font-medium">Thank you for your report</p>
                <p className="text-xs md:text-sm">
                  Our team will review the information and make corrections as soon as
                  possible. We may contact you if we need any additional details.
                </p>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-700 md:text-sm">
                  Your name <span className="text-rose-500">*</span>
                </label>
                <input
                  ref={nameInputRef}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Name"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-700 md:text-sm">
                  Your email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Email"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-700 md:text-sm">
                Your phone number <span className="text-rose-500">*</span>
              </label>
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Phone number"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-700 md:text-sm">
                Your relationship to this clinic <span className="text-rose-500">*</span>
              </label>
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                value={relationship}
                onChange={e => setRelationship(e.target.value)}
                placeholder="e.g. patient, staff, owner"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-700 md:text-sm">
                What is wrong <span className="text-rose-500">*</span>
              </label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                rows={4}
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Describe what information is incorrect, missing or suspicious."
              />
            </div>

            {error && (
              <div className="rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-700 md:text-sm">
                {error}
              </div>
            )}

            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="ml-auto inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Submitting…' : 'Submit'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
