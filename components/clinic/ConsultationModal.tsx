// components/clinic/ConsultationModal.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  services: string[];          // список услуг клиники
  preselectedService?: string; // предзадать услугу (например из таблицы)
};

export default function ConsultationModal({
  open,
  onClose,
  services,
  preselectedService,
}: Props) {
  const dlgRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [contact, setContact] = useState<'email' | 'phone' | 'whatsapp' | 'telegram' | ''>('');
  const [service, setService] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // нормализованный список услуг (уникальные + без пустых)
  const serviceOptions = useMemo(
    () => Array.from(new Set((services ?? []).filter(Boolean))),
    [services]
  );

  // при открытии модалки — сбросить состояние + установить предвыбранную услугу
  useEffect(() => {
    if (open) {
      setError(null);
      setDone(false);
      setLoading(false);
      setName('');
      setPhone('');
      setContact('');
      setService(preselectedService ?? '');
    }
  }, [open, preselectedService]);

  // закрытие по ESC/клику на фон
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name || !phone || !contact || !service) {
      setError('Please fill in all the fields.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          contact_method: contact,
          service,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Request failed');

      setDone(true);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-3">
      <div
        ref={dlgRef}
        className="max-w-[480px] rounded-lg bg-white p-4 shadow-xl md:p-6"
        role="dialog"
        aria-modal="true"
      >
        {/* header */}
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-center text-xl font-semibold md:text-2xl">
              Sign up for a consultation
            </h3>
            <p className="mt-1 text-center text-sm text-gray-500">
              We will find the best solution to your problem
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-3 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {done ? (
          <div className="rounded-md bg-emerald-50 p-4 text-sm text-emerald-700">
            Your request has been sent. We’ll contact you shortly.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* name */}
            <div>
              <label className="mb-1 block text-sm font-medium">Your Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                className="w-full rounded border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-teal-400"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* phone */}
            <div>
              <label className="mb-1 block text-sm font-medium">Phone Number</label>
              <input
                type="tel"
                placeholder="Enter your phone number"
                className="w-full rounded border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-teal-400"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            {/* contact method */}
            <div>
              <label className="mb-1 block text-sm font-medium">Preferred Contact Method</label>
              <div className="relative">
                <select
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-teal-400"
                  value={contact}
                  onChange={(e) => setContact(e.target.value as any)}
                >
                  <option value="">Select the best way to contact you</option>
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="telegram">Telegram</option>
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 select-none text-gray-400">▾</span>
              </div>
            </div>

            {/* service */}
            <div>
              <label className="mb-1 block text-sm font-medium">Service Interested In</label>
              <div className="relative">
                <select
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-teal-400"
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                >
                  <option value="">The service that interested you</option>
                  {serviceOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 select-none text-gray-400">▾</span>
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-rose-50 p-2 text-sm text-rose-700">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded bg-teal-500 px-4 py-3 font-medium text-white transition hover:bg-teal-600 disabled:opacity-60"
            >
              {loading ? 'Sending…' : 'Schedule Your Appointment'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
