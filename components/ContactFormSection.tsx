// components/ContactFormSection.tsx
'use client';

import React, { useState } from 'react';

const CONTACT_OPTIONS = ['Email', 'Phone', 'WhatsApp', 'Telegram'] as const;
const SERVICE_OPTIONS = [
  'Dental Implants',
  'Hair Transplant',
  'Plastic Surgery',
  'Dentistry',
  'Veneers',
  'Crowns',
] as const;

export default function ContactFormSection() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [contact, setContact] = useState<(typeof CONTACT_OPTIONS)[number] | ''>('');
  const [service, setService] = useState<(typeof SERVICE_OPTIONS)[number] | ''>('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<null | 'ok' | 'err'>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setDone(null);

    try {
      const payload = {
        name,
        phone,
        contact_method: contact.toLowerCase(), // 'email' | 'phone' | 'whatsapp' | 'telegram'
        service,
      };

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || data?.error) throw new Error(data?.error || 'Failed');

      setDone('ok');
      setName(''); setPhone(''); setContact(''); setService('');
    } catch {
      setDone('err');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="bg-teal-600 text-white py-20">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-8">
          Take the first step toward your perfect health — contact our experts now for personalized travel health care!
        </h2>

        <div className="max-w-2xl mx-auto bg-white text-gray-900 rounded-lg shadow-lg p-8">
          <h3 className="text-xl font-semibold mb-6 text-center">Request a Free Consultation</h3>

          <form className="space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="block mb-1 font-medium" htmlFor="name">Your Name</label>
              <input
                id="name"
                type="text"
                placeholder="Enter your name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium" htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium" htmlFor="contactMethod">Preferred Contact Method</label>
              <select
                id="contactMethod"
                required
                value={contact}
                onChange={(e) => setContact(e.target.value as any)}
                className="w-full border border-gray-300 rounded px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                <option value="">Select the best way to contact you</option>
                {CONTACT_OPTIONS.map((opt) => <option key={opt}>{opt}</option>)}
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium" htmlFor="service">Service Interested In</label>
              <select
                id="service"
                required
                value={service}
                onChange={(e) => setService(e.target.value as any)}
                className="w-full border border-gray-300 rounded px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                <option value="">The service that interested you</option>
                {SERVICE_OPTIONS.map((opt) => <option key={opt}>{opt}</option>)}
              </select>
            </div>

            <div className="text-center mt-6">
              <button
                type="submit"
                disabled={submitting}
                className="bg-teal-500 hover:bg-teal-600 disabled:opacity-60 text-white font-medium rounded px-6 py-3 transition"
              >
                {submitting ? 'Sending…' : 'Schedule Your Appointment'}
              </button>

              {done === 'ok' && (
                <div className="mt-3 text-sm text-emerald-600">Thanks! We’ll contact you shortly.</div>
              )}
              {done === 'err' && (
                <div className="mt-3 text-sm text-rose-600">Something went wrong. Please try again.</div>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
