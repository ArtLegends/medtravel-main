'use client';
import { useState } from 'react';
import { clinicPath } from '@/lib/clinic-url';

type Props = {
  clinicId: string;
  clinicName: string;
  clinicSlug?: string;
  clinicCountry?: string | null;
  clinicProvince?: string | null;
  clinicCity?: string | null;
  clinicDistrict?: string | null;
};

export default function ReviewForm({
  clinicId, clinicName,
  clinicSlug, clinicCountry, clinicProvince, clinicCity, clinicDistrict,
}: Props) {
  const [text, setText] = useState('');
  const [ratings, setRatings] = useState({
    doctor: 0, staff: 0, assistant: 0, support: 0, facilities: 0, overall: 0,
  });
  const [name, setName] = useState(''); const [email, setEmail] = useState('');
  const [phone, setPhone] = useState(''); const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false); const [error, setError] = useState<string | null>(null);

  const set = (key: keyof typeof ratings, v: number) =>
    setRatings(prev => ({ ...prev, [key]: v }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicId,
          review: text,
          ratings,
          name,
          email,
          phone,
          consent,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }

      // строим красивый путь, если есть данные; иначе — фолбэк на текущий
      const pretty =
        clinicPath({
          slug: clinicSlug ?? window.location.pathname.split('/').pop() ?? '',
          country: clinicCountry,
          province: clinicProvince,
          city: clinicCity,
          district: clinicDistrict,
        }) || window.location.pathname;

      const base = window.location.pathname.replace(/\/review\/?$/, '');
      window.location.href = `${base}#reviews`;

    } catch (err: any) {
      setError(err.message || 'Failed to send review');
    } finally {
      setSubmitting(false);
    }
  }

  const Stars = ({
    value, onChange, label,
  }: { value: number; onChange: (v: number) => void; label: string }) => (
    <div className="flex items-center gap-2">
      <div className="w-48 text-gray-700">{label}</div>
      <div className="flex items-center gap-1">
        {Array.from({ length: 10 }).map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`rate ${i + 1}`}
            onClick={() => onChange(i + 1)}
            className={`h-4 w-4 ${i < value ? 'text-amber-500' : 'text-gray-300'}`}
          >
            ★
          </button>
        ))}
      </div>
      <span className="text-xs text-gray-500">{value}/10</span>
    </div>
  );

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-semibold">Review “{clinicName}”</h1>

      <div>
        <label className="block text-sm text-gray-600 mb-1">Your review</label>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={6}
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      <div className="space-y-2">
        <Stars label="Rate the doctor" value={ratings.doctor} onChange={v => set('doctor', v)} />
        <Stars label="Rate the clinic staff" value={ratings.staff} onChange={v => set('staff', v)} />
        <Stars label="Rate the language assistant" value={ratings.assistant} onChange={v => set('assistant', v)} />
        <Stars label="Rate the support" value={ratings.support} onChange={v => set('support', v)} />
        <Stars label="Rate the facilities" value={ratings.facilities} onChange={v => set('facilities', v)} />
        <Stars label="Rate your overall experience" value={ratings.overall} onChange={v => set('overall', v)} />
      </div>

      <div className="pt-2">
        <div className="text-sm font-medium mb-2">
          Verify your details – for verification purposes only.
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Name"
            className="rounded-md border px-3 py-2"
          />
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            className="rounded-md border px-3 py-2"
          />
          <input
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="Phone Number"
            className="rounded-md border px-3 py-2"
          />
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={consent}
            onChange={e => setConsent(e.target.checked)}
          />
          I confirm that this review is my own, personal, honest account of my experience…
        </label>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {submitting ? 'Submitting…' : 'Submit Review'}
      </button>
    </form>
  );
}
