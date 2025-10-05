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

    // простая валидация
    if (!data.clinicName || !data.firstName || !data.lastName || !data.email) {
      setErr('Please fill required fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/clinic-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Request failed');
      setOk('Thank you! We received your request.');
      setData(initial);
    } catch (e) {
      setErr('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const on = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setData((s) => ({ ...s, [k]: e.target.value }));

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-8"
      aria-describedby={err ? 'form-error' : undefined}
    >
      {/* Company */}
      <div className="rounded-xl border bg-white">
        <div className="border-b px-6 py-4 text-lg font-semibold">
          <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-md bg-blue-50 text-blue-600">
            🏢
          </span>
          Company
        </div>

        <div className="space-y-5 p-6">
          {/* Clinic Name */}
          <div>
            <label className="mb-1 block text-sm font-medium">Clinic Name</label>
            <input
              value={data.clinicName}
              onChange={on('clinicName')}
              placeholder="Enter clinic name"
              className="w-full rounded-md border px-4 py-2"
              required
            />
          </div>

          {/* Address */}
          <div>
            <label className="mb-1 block text-sm font-medium">Address</label>
            <input
              value={data.address}
              onChange={on('address')}
              placeholder="Enter address"
              className="w-full rounded-md border px-4 py-2"
            />
          </div>

          {/* Country + City */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Country</label>
              <input
                value={data.country}
                onChange={on('country')}
                placeholder="Enter country"
                className="w-full rounded-md border px-4 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">City</label>
              <input
                value={data.city}
                onChange={on('city')}
                placeholder="Enter city"
                className="w-full rounded-md border px-4 py-2"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contact Person */}
      <div className="rounded-xl border bg-white">
        <div className="border-b px-6 py-4 text-lg font-semibold">
          <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-md bg-blue-50 text-blue-600">
            👤
          </span>
          Contact Person
        </div>

        <div className="space-y-5 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">First Name</label>
              <input
                value={data.firstName}
                onChange={on('firstName')}
                placeholder="Enter first name"
                className="w-full rounded-md border px-4 py-2"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Last Name</label>
              <input
                value={data.lastName}
                onChange={on('lastName')}
                placeholder="Enter last name"
                className="w-full rounded-md border px-4 py-2"
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
                className="w-full rounded-md border px-4 py-2"
                type="tel"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <input
                value={data.email}
                onChange={on('email')}
                placeholder="Enter email"
                className="w-full rounded-md border px-4 py-2"
                type="email"
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="pt-2">
        <button
          disabled={loading}
          className="mx-auto block w-40 rounded-md bg-teal-600 px-4 py-2 font-medium text-white hover:bg-teal-700 disabled:opacity-60"
        >
          {loading ? 'Sending…' : 'Submit'}
        </button>

        {ok && <p className="mt-3 text-center text-sm text-emerald-600">{ok}</p>}
        {err && (
          <p id="form-error" className="mt-3 text-center text-sm text-rose-600">
            {err}
          </p>
        )}
      </div>
    </form>
  );
}