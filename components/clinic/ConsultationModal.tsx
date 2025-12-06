// components/clinic/ConsultationModal.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@iconify/react';

type UiContact = 'Email' | 'Phone' | 'WhatsApp' | 'Telegram';

const CONTACT_OPTIONS: ReadonlyArray<UiContact> = [
  'Email',
  'Phone',
  'WhatsApp',
  'Telegram',
];

type Props = {
  open: boolean;
  onClose: () => void;
  clinicId: string;
  services: string[];
  preselectedService?: string;
};

const PHONE_STORAGE_KEY = 'mt_phone_history';

export default function ConsultationModal({
  open,
  onClose,
  clinicId,
  services,
  preselectedService,
}: Props) {
  const dlgRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [contact, setContact] = useState<UiContact | ''>('');
  const [service, setService] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [storedPhones, setStoredPhones] = useState<string[]>([]);
  const [showPhoneSuggestions, setShowPhoneSuggestions] = useState(false);

  const serviceOptions = useMemo(
    () => Array.from(new Set((services ?? []).filter(Boolean))),
    [services],
  );

  // при открытии — подтянуть историю телефонов и сбросить форму
  useEffect(() => {
    if (!open) return;

    setError(null);
    setDone(false);
    setLoading(false);
    setName('');
    setPhone('');
    setContact('');
    setService(preselectedService ?? '');

    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(PHONE_STORAGE_KEY);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          setStoredPhones(
            arr
              .map((v) => String(v).trim())
              .filter(Boolean)
              .slice(0, 5),
          );
        }
      }
    } catch {
      // ignore
    }
  }, [open, preselectedService]);

  // закрытие по ESC/клик снаружи
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    const onClick = (e: MouseEvent) => {
      if (dlgRef.current && e.target instanceof Node && !dlgRef.current.contains(e.target)) {
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

  function rememberPhone(value: string) {
    if (typeof window === 'undefined') return;
    const trimmed = value.trim();
    if (!trimmed) return;

    setStoredPhones((prev) => {
      const next = [trimmed, ...prev.filter((p) => p !== trimmed)].slice(0, 5);
      try {
        window.localStorage.setItem(PHONE_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name || !phone || !contact || !service) {
      setError('Please fill in all the fields.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/clinic-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinic_id: clinicId,
          service,
          doctor_id: null,
          name,
          phone,
          // ВАЖНО: отправляем ровно как требует CHECK
          contact_method: contact, // 'Email' | 'Phone' | 'WhatsApp' | 'Telegram'
          origin: 'service', // допустимое значение по CHECK
        }),
      });
      const json = await res.json();
      if (!res.ok || !json?.ok) throw new Error(json?.error || 'Request failed');

      rememberPhone(phone);
      setDone(true);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 px-4">
      <div
        ref={dlgRef}
        className="w-full max-w-[640px] rounded-2xl bg-white p-5 shadow-2xl md:p-8"
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h3 className="flex items-center gap-2 text-xl font-semibold md:text-2xl">
              <Icon
                icon="solar:stethoscope-linear"
                className="h-5 w-5 text-emerald-600"
                aria-hidden="true"
              />
              <span>Sign up for a consultation</span>
            </h3>
            <p className="text-sm text-gray-500">
              Tell us a bit about yourself and the treatment you’re interested in. We’ll match you
              with the best option.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close"
          >
            <Icon icon="solar:close-circle-linear" className="h-5 w-5" />
          </button>
        </div>

        {done ? (
          <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
            Your request has been sent. We’ll contact you shortly to clarify the details.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="clinic-consult-name"
                className="mb-1 block text-sm font-medium text-gray-800"
              >
                Your Name
              </label>
              <input
                id="clinic-consult-name"
                name="name"
                autoComplete="name"
                type="text"
                placeholder="Enter your name"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label
                htmlFor="clinic-consult-phone"
                className="mb-1 block text-sm font-medium text-gray-800"
              >
                Phone Number
              </label>
              <div className="relative">
                <input
                  id="clinic-consult-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="Enter your phone number"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onFocus={() => storedPhones.length && setShowPhoneSuggestions(true)}
                  onBlur={() => {
                    setTimeout(() => setShowPhoneSuggestions(false), 120);
                  }}
                  required
                />

                {showPhoneSuggestions && storedPhones.length > 0 && (
                  <ul className="absolute left-0 right-0 z-10 mt-1 max-h-48 overflow-auto rounded-lg border border-gray-200 bg-white text-sm shadow-lg">
                    {storedPhones.map((p) => (
                      <li key={p}>
                        <button
                          type="button"
                          className="flex w-full px-3 py-2 text-left hover:bg-gray-50"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setPhone(p);
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
              <p className="mt-1 text-xs text-gray-500">
                Saved numbers will appear here as suggestions if you’ve used this form before.
              </p>
            </div>

            <div>
              <label
                htmlFor="clinic-consult-contact"
                className="mb-1 block text-sm font-medium text-gray-800"
              >
                Preferred Contact Method
              </label>
              <div className="relative">
                <select
                  id="clinic-consult-contact"
                  name="contact_method"
                  className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  value={contact}
                  onChange={(e) => setContact(e.target.value as UiContact | '')}
                >
                  <option value="">Select the best way to contact you</option>
                  {CONTACT_OPTIONS.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  ▾
                </span>
              </div>
            </div>

            <div>
              <label
                htmlFor="clinic-consult-service"
                className="mb-1 block text-sm font-medium text-gray-800"
              >
                Service Interested In
              </label>
              <select
                id="clinic-consult-service"
                name="service"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                value={service}
                onChange={(e) => setService(e.target.value)}
                required
              >
                <option value="">The service that interested you</option>
                {serviceOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="rounded-md bg-rose-50 p-2 text-sm text-rose-700">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Sending…' : 'Schedule Your Appointment'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
