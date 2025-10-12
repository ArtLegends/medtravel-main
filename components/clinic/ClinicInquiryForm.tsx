'use client';

import { useState } from 'react';

type Props = {
  clinicId: string;        // ← НОВОЕ
  clinicSlug: string;
  clinicName: string;
};

export default function ClinicInquiryForm({ clinicId, clinicSlug, clinicName }: Props) {
  const [pending, setPending] = useState(false);
  const [ok, setOk] = useState<null | boolean>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setOk(null);
    setErr(null);

    const form = e.currentTarget;                 // <- не null
    const fd = new FormData(form);
    const payload = {
      clinic_id: clinicId,
      name: (fd.get('name') || '').toString(),
      email: (fd.get('email') || '').toString() || null,
      phone: (fd.get('phone') || '').toString(),
      message: (fd.get('message') || '').toString() || null,
    };

    try {
      const res = await fetch('/api/clinic-inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Bad response');
      setOk(true);
      form.reset();                               // ← больше не падает
    } catch (e) {
      setOk(false);
      setErr('Failed to send the enquiry. Please try again later.');
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <label className="block text-sm font-medium">Name <span className="text-red-500">*</span></label>
          <input name="name" required className="w-full rounded-md border px-3 py-2 outline-none focus:ring" />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium">E-mail</label>
          <input type="email" name="email" className="w-full rounded-md border px-3 py-2 outline-none focus:ring" />
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium">Phone Number <span className="text-red-500">*</span></label>
        <input name="phone" required className="w-full rounded-md border px-3 py-2 outline-none focus:ring" />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium">Your message to the clinic</label>
        <textarea name="message" rows={6} className="w-full rounded-md border px-3 py-2 outline-none focus:ring" />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-emerald-600 px-4 py-3 font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {pending ? 'Sending…' : 'Send Enquiry'}
      </button>

      {ok === true && <div className="text-sm text-emerald-700">Your enquiry has been sent. We’ll get back to you shortly.</div>}
      {ok === false && <div className="text-sm text-rose-600">{err}</div>}
    </form>
  );
}
