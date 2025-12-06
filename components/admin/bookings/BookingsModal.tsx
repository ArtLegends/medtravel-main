// components/bookings/admin/BookingsModal.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';

const CONTACT_VALUES = ['Email', 'Phone', 'WhatsApp', 'Telegram'] as const;
type ContactOpt = (typeof CONTACT_VALUES)[number];

const PHONE_STORAGE_KEY = 'mt_phone_history';

export default function BookingsModal({
  open,
  onClose,
  preselectedService,
}: {
  open: boolean;
  onClose: () => void;
  preselectedService?: string;
}) {
  const dlgRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [contact, setContact] = useState<ContactOpt | ''>('');
  const [service, setService] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<null | 'ok' | 'err'>(null);

  // подсказки по телефонам
  const [storedPhones, setStoredPhones] = useState<string[]>([]);
  const [showPhoneSuggestions, setShowPhoneSuggestions] = useState(false);

  // загрузить историю телефонов при первом открытии
  useEffect(() => {
    if (!open) return;
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
      // игнорим
    }
  }, [open]);

  // сброс при открытии + проставляем выбранную категорию
  useEffect(() => {
    if (!open) return;
    setName('');
    setPhone('');
    setContact('');
    setService(preselectedService ?? '');
    setDone(null);
    setLoading(false);
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

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setDone(null);
    try {
      const contact_method = (contact || '').toString().toLowerCase(); // api ждёт в нижнем регистре
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, contact_method, service }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed');
      setDone('ok');
      rememberPhone(phone);
    } catch {
      setDone('err');
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 px-4">
      <div
        ref={dlgRef}
        className="w-full max-w-[640px] rounded-2xl bg-white p-6 shadow-2xl md:p-8"
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="flex items-center gap-2 text-xl font-semibold md:text-2xl">
              <Icon
                icon="solar:calendar-linear"
                className="h-5 w-5 text-emerald-600"
                aria-hidden="true"
              />
              <span>Request a Free Consultation</span>
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Leave your contact details and we’ll help you schedule a suitable time.
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

        <form className="space-y-4" onSubmit={submit}>
          <div>
            <label
              htmlFor="admin-booking-name"
              className="mb-1 block text-sm font-medium text-gray-800"
            >
              Your Name
            </label>
            <input
              id="admin-booking-name"
              name="name"
              autoComplete="name"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label
              htmlFor="admin-booking-phone"
              className="mb-1 block text-sm font-medium text-gray-800"
            >
              Phone Number
            </label>
            <div className="relative">
              <input
                id="admin-booking-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onFocus={() => storedPhones.length && setShowPhoneSuggestions(true)}
                onBlur={() => {
                  // небольшая задержка, чтобы успеть кликнуть по подсказке
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
              We may contact you by call or messenger depending on your preference.
            </p>
          </div>

          <div>
            <label
              htmlFor="admin-booking-contact"
              className="mb-1 block text-sm font-medium text-gray-800"
            >
              Preferred Contact Method
            </label>
            <div className="relative">
              <select
                id="admin-booking-contact"
                name="contact_method"
                className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                value={contact}
                onChange={(e) => setContact(e.target.value as ContactOpt | '')}
                required
              >
                <option value="">Select the best way to contact you</option>
                {CONTACT_VALUES.map((v) => (
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
              htmlFor="admin-booking-service"
              className="mb-1 block text-sm font-medium text-gray-800"
            >
              Service Interested In
            </label>
            <input
              id="admin-booking-service"
              name="service"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              placeholder="The service that interested you"
              value={service}
              onChange={(e) => setService(e.target.value)}
              required
            />
          </div>

          {done === 'ok' && (
            <div className="rounded-md bg-emerald-50 p-2 text-sm text-emerald-700">
              Thanks! We’ll contact you shortly.
            </div>
          )}
          {done === 'err' && (
            <div className="rounded-md bg-rose-50 p-2 text-sm text-rose-700">
              Something went wrong. Please try again.
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Sending…' : 'Schedule Your Appointment'}
          </button>
        </form>
      </div>
    </div>
  );
}
