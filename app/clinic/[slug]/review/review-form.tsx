'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { clinicPath } from '@/lib/clinic-url'

type Props = { clinicId: string; clinicSlug: string; clinicCountry?: string | null; clinicProvince?: string | null; clinicCity?: string | null; clinicDistrict?: string | null };
const CRITERIA = [
  { key: 'rating_doctor', label: 'Rate the doctor' },
  { key: 'rating_staff', label: 'Rate the clinic staff' },
  { key: 'rating_assistant', label: 'Rate the language assistant' },
  { key: 'rating_support', label: 'Rate the support' },
  { key: 'rating_facilities', label: 'Rate the facilities' },
  { key: 'rating_overall', label: 'Rate your overall experience' },
] as const;
type Keys = typeof CRITERIA[number]['key'];

export default function ReviewForm({ clinicId, clinicSlug, clinicCountry, clinicProvince, clinicCity, clinicDistrict }: Props) {
  const router = useRouter();
  const [review, setReview] = useState('');
  const [ratings, setRatings] = useState<Record<Keys, number>>({
    rating_doctor: 0, rating_staff: 0, rating_assistant: 0,
    rating_support: 0, rating_facilities: 0, rating_overall: 0,
  });
  const [name, setName] = useState(''); const [email, setEmail] = useState('');
  const [phone, setPhone] = useState(''); const [consent, setConsent] = useState(false);
  const [pending, setPending] = useState(false); const [error, setError] = useState<string | null>(null);

  const setRate = (k: Keys, v: number) => setRatings(s => ({ ...s, [k]: v }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!consent) return setError('Please confirm the consent checkbox.')
    if (!ratings.rating_overall) return setError('Please set your overall experience rating.')
    setPending(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clinic_id: clinicId, review, ...ratings, consent_privacy: consent, _contact: { name, email, phone } }),
      })
      if (!res.ok) throw new Error(await res.text())

      const pretty = clinicPath({
        slug: clinicSlug,
        country: clinicCountry,
        province: clinicProvince,
        city: clinicCity,
        district: clinicDistrict,
      })
      router.replace(`${pretty}#reviews`) // красивый путь
    } catch (e: any) {
      setError(e?.message || 'Submission failed.')
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-1">Your review</label>
        <textarea className="w-full rounded-md border px-3 py-2" rows={6}
          placeholder="Write about your experience..." value={review} onChange={e => setReview(e.target.value)} />
      </div>

      <div className="space-y-3">
        {CRITERIA.map(c => (
          <div key={c.key} className="flex items-center gap-4">
            <div className="w-64 text-sm">{c.label}</div>
            <StarInput value={ratings[c.key]} onChange={v => setRate(c.key, v)} />
          </div>
        ))}
      </div>

      <div className="pt-4">
        <h3 className="font-semibold mb-2">Verify your details – for verification purposes only.</h3>
        <div className="grid gap-3 md:grid-cols-3">
          <input className="rounded-md border px-3 py-2" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
          <input className="rounded-md border px-3 py-2" placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          <input className="rounded-md border px-3 py-2" placeholder="Phone number" value={phone} onChange={e => setPhone(e.target.value)} />
        </div>
        <label className="mt-3 flex items-start gap-2 text-sm">
          <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-1" />
          <span>I confirm that this review is my own, personal, honest account of my experience…</span>
        </label>
      </div>

      <div className="pt-2">
        <button disabled={pending} className="rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-60">
          {pending ? 'Submitting…' : 'Submit Review'}
        </button>
      </div>
      {error && <p className="text-sm text-rose-600">{error}</p>}
    </form>
  );
}

function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void; }) {
  const v = Math.max(0, Math.min(10, Math.round(value)));
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 10 }).map((_, i) => {
        const filled = i < v;
        return (
          <button key={i} type="button" aria-label={`Set ${i + 1} of 10`} onClick={() => onChange(i + 1)} className="p-0.5">
            <svg className={`h-5 w-5 ${filled ? 'fill-amber-500' : 'fill-gray-200'}`} viewBox="0 0 20 20">
              <path d="M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L10 14.9 4.7 17.6l1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
            </svg>
          </button>
        );
      })}
      <span className="ml-2 text-xs text-gray-500">{v}/10</span>
    </div>
  );
}
