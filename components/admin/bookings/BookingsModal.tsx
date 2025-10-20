// components/bookings/admin/BookingsModal.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

const CONTACT_VALUES = ['Email', 'Phone', 'WhatsApp', 'Telegram'] as const;
type ContactOpt = (typeof CONTACT_VALUES)[number];

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
    } catch {
      setDone('err');
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-3">
      <div
        ref={dlgRef}
        className="w-100 max-w-[560px] rounded-lg bg-white p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-4 flex items-start justify-between">
          <h3 className="text-xl font-semibold">Request a Free Consultation</h3>
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form className="space-y-4" onSubmit={submit}>
          <div>
            <label className="mb-1 block text-sm font-medium">Your Name</label>
            <input
              className="w-full rounded border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-teal-400"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Phone Number</label>
            <input
              className="w-full rounded border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-teal-400"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Preferred Contact Method</label>
            <select
              className="w-full rounded border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-teal-400"
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
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Service Interested In</label>
            <input
              className="w-full rounded border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-teal-400"
              placeholder="The service that interested you"
              value={service}
              onChange={(e) => setService(e.target.value)}
              required
            />
            {/* это input, а не select: нам важна простая категория/название; приходит в /api/bookings как service */}
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
            className="w-full rounded bg-teal-500 px-4 py-3 font-medium text-white transition hover:bg-teal-600 disabled:opacity-60"
          >
            {loading ? 'Sending…' : 'Schedule Your Appointment'}
          </button>
        </form>
      </div>
    </div>
  );
}
