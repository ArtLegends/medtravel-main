// components/clinic/ReportModal.tsx
'use client';

import { useEffect, useRef, useState } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  clinicId: string;
};

export default function ReportModal({ open, onClose, clinicId }: Props) {
  const box = useRef<HTMLDivElement>(null);

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
    setName(''); setEmail(''); setPhone(''); setRelationship(''); setMessage('');
    setSubmitting(false); setDone(false); setError(null);
  }, [open]);

  // закрытие по ESC / клик мимо окна
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    const onClick = (e: MouseEvent) => {
      if (box.current && e.target instanceof Node && !box.current.contains(e.target)) onClose();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onClick);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('mousedown', onClick); };
  }, [open, onClose]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name || !email || !phone || !relationship || !message) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clinic_id: clinicId, name, email, phone, relationship, message }),
      });
      const json = await res.json();
      if (!res.ok || !json?.ok) throw new Error(json?.error || 'Failed to send');
      setDone(true);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/50 px-3">
      <div ref={box} className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
        <div className="mb-2 text-center">
          <h3 className="text-lg font-semibold">Let us know of any incorrect information and we will correct it as soon as possible</h3>
          <p className="mt-1 text-sm text-gray-500">
            Please fill out this form to report a problem with this clinic&apos;s listing.
          </p>
        </div>

        {done ? (
          <div className="rounded-md bg-emerald-50 p-3 text-emerald-700">
            Thanks for your report! We’ll review it shortly.
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Your name</label>
              <input className="w-full rounded border px-3 py-2" value={name} onChange={e=>setName(e.target.value)} placeholder="Name" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Your email</label>
              <input type="email" className="w-full rounded border px-3 py-2" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Your phone number</label>
              <input className="w-full rounded border px-3 py-2" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Phone number" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Your relationship to this clinic</label>
              <input className="w-full rounded border px-3 py-2" value={relationship} onChange={e=>setRelationship(e.target.value)} placeholder="e.g. patient, staff, owner" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">What is wrong</label>
              <textarea className="w-full rounded border px-3 py-2" rows={4} value={message} onChange={e=>setMessage(e.target.value)} placeholder="Describe the issue" />
            </div>

            {error && <div className="rounded-md bg-rose-50 p-2 text-sm text-rose-700">{error}</div>}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border px-4 py-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="ml-auto rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
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
