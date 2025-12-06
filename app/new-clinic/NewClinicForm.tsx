// app/new-clinic/NewClinicForm.tsx
'use client';

import { useState } from 'react';

type FormState = {
  clinicName: string;
  address: string;
  country: string;
  city: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
};

const initial: FormState = {
  clinicName: '',
  address: '',
  country: '',
  city: '',
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
};

export default function NewClinicForm() {
  const [data, setData] = useState<FormState>(initial);
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setOk(null);
    setErr(null);

    if (!data.clinicName || !data.firstName || !data.lastName || !data.email) {
      setErr('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/new-clinic-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Request failed');
      setOk('Thank you! We received your request and will get back to you soon.');
      setData(initial);
    } catch {
      setErr('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const on =
    (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setData((s) => ({ ...s, [k]: e.target.value }));

  const inputClasses =
    'w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100';

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto max-w-4xl space-y-8"
      aria-describedby={err ? 'new-clinic-error' : undefined}
    >
      {/* Company */}
      <section className="rounded-2xl border bg-white shadow-sm">
        <header className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-lg">
              🏥
            </span>
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                Company
              </h2>
              <p className="text-xs text-gray-500">
                Basic information about your clinic.
              </p>
            </div>
          </div>
        </header>

        <div className="space-y-5 p-6">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Clinic Name <span className="text-red-500">*</span>
            </label>
            <input
              value={data.clinicName}
              onChange={on('clinicName')}
              placeholder="Enter clinic name"
              className={inputClasses}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Address</label>
            <input
              value={data.address}
              onChange={on('address')}
              placeholder="Enter address"
              className={inputClasses}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Country</label>
              <input
                value={data.country}
                onChange={on('country')}
                placeholder="Enter country"
                className={inputClasses}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">City</label>
              <input
                value={data.city}
                onChange={on('city')}
                placeholder="Enter city"
                className={inputClasses}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Person */}
      <section className="rounded-2xl border bg-white shadow-sm">
        <header className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-lg">
              👤
            </span>
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                Contact Person
              </h2>
              <p className="text-xs text-gray-500">
                Who should we contact regarding this application?
              </p>
            </div>
          </div>
        </header>

        <div className="space-y-5 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                value={data.firstName}
                onChange={on('firstName')}
                placeholder="Enter first name"
                className={inputClasses}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                value={data.lastName}
                onChange={on('lastName')}
                placeholder="Enter last name"
                className={inputClasses}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Phone Number</label>
              <input
                value={data.phone}
                onChange={on('phone')}
                placeholder="Enter phone number"
                className={inputClasses}
                type="tel"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                value={data.email}
                onChange={on('email')}
                placeholder="Enter email"
                className={inputClasses}
                type="email"
                required
              />
            </div>
          </div>
        </div>
      </section>

      {/* Submit */}
      <div className="pt-2 text-center">
        <button
          disabled={loading}
          className="inline-flex w-full items-center justify-center rounded-lg bg-teal-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-teal-700 disabled:opacity-60 md:w-48"
        >
          {loading ? 'Sending…' : 'Submit'}
        </button>

        {ok && (
          <p className="mt-3 text-sm text-emerald-600" role="status">
            {ok}
          </p>
        )}
        {err && (
          <p
            id="new-clinic-error"
            className="mt-3 text-sm text-rose-600"
            role="alert"
          >
            {err}
          </p>
        )}

        <p className="mt-2 text-xs text-gray-500">
          By submitting this form, you agree that MedTravel may contact you
          regarding partnership details.
        </p>
      </div>
    </form>
  );
}
