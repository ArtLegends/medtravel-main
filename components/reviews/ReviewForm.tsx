// components/reviews/ReviewForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
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

const CRITERIA = [
  { key: 'rating_doctor', label: 'Rate the doctor' },
  { key: 'rating_staff', label: 'Rate the clinic staff' },
  { key: 'rating_assistant', label: 'Rate the language assistant' },
  { key: 'rating_support', label: 'Rate the support' },
  { key: 'rating_facilities', label: 'Rate the facilities' },
  { key: 'rating_overall', label: 'Rate your overall experience' },
] as const;

type RatingKey = (typeof CRITERIA)[number]['key'];

export default function ReviewForm({
  clinicId,
  clinicName,
  clinicSlug,
  clinicCountry,
  clinicProvince,
  clinicCity,
  clinicDistrict,
}: Props) {
  const router = useRouter();

  const [review, setReview] = useState('');
  const [ratings, setRatings] = useState<Record<RatingKey, number>>({
    rating_doctor: 0,
    rating_staff: 0,
    rating_assistant: 0,
    rating_support: 0,
    rating_facilities: 0,
    rating_overall: 0,
  });

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [consent, setConsent] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setRating = (key: RatingKey, value: number) =>
    setRatings(prev => ({ ...prev, [key]: value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!ratings.rating_overall) {
      setError('Please rate your overall experience.');
      return;
    }
    if (!consent) {
      setError('Please confirm that your review is honest and based on your experience.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        clinic_id: clinicId,
        review,
        ...ratings,
        consent_privacy: consent,
        _contact: {
          name: name || null,
          email: email || null,
          phone: phone || null,
        },
      };

      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(txt || `Request failed (${res.status})`);
      }

      // красивый путь до клиники (если есть данные)
      const pretty =
        clinicPath({
          slug: clinicSlug ?? '',
          country: clinicCountry ?? undefined,
          province: clinicProvince ?? undefined,
          city: clinicCity ?? undefined,
          district: clinicDistrict ?? undefined,
        }) || window.location.pathname.replace(/\/review\/?$/, '');

      router.replace(`${pretty}#reviews`);
    } catch (err: any) {
      setError(err?.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl rounded-2xl border bg-white p-5 shadow-sm md:p-6">
      {/* HEADER */}
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1.5">
          <p className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
            <Icon icon="solar:star-fall-linear" className="h-3.5 w-3.5" />
            Your experience
          </p>
          <h1 className="text-xl font-semibold md:text-2xl">
            Review “{clinicName}”
          </h1>
          <p className="text-sm text-gray-500">
            Share your honest feedback to help other patients choose the right clinic. Your
            contact details are used only for verification and will not be published.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* REVIEW TEXT */}
        <div>
          <label
            htmlFor="review-text"
            className="mb-1 block text-sm font-medium text-gray-800"
          >
            Your review
          </label>
          <textarea
            id="review-text"
            value={review}
            onChange={e => setReview(e.target.value)}
            rows={6}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            placeholder="Describe your treatment, communication with the clinic, and anything that might help other patients."
          />
          <p className="mt-1 text-xs text-gray-400">
            Please avoid sharing personal contact details or sensitive information in the text.
          </p>
        </div>

        {/* RATINGS */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-800">
            Rate different aspects of your visit
          </h2>
          <div className="space-y-2">
            {CRITERIA.map(item => (
              <div
                key={item.key}
                className="flex flex-col items-start gap-2 sm:flex-row sm:items-center"
              >
                <div className="w-full text-sm text-gray-700 sm:w-56">
                  {item.label}
                </div>
                <StarRatingInput
                  value={ratings[item.key]}
                  onChange={v => setRating(item.key, v)}
                />
              </div>
            ))}
          </div>
        </section>

        {/* CONTACT / VERIFICATION */}
        <section className="space-y-3 border-t pt-4">
          <h2 className="text-sm font-semibold text-gray-800">
            Verify your details – for verification purposes only
          </h2>
          <p className="text-xs text-gray-500">
            We may contact you to confirm that you were a real patient. Your name and contact
            details will not be shown publicly.
          </p>

          <div className="grid gap-3 md:grid-cols-3">
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Name"
              className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email"
              className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            />
            <input
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="Phone number"
              className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            />
          </div>

          <label className="mt-2 flex items-start gap-2 text-xs text-gray-600 md:text-sm">
            <input
              type="checkbox"
              checked={consent}
              onChange={e => setConsent(e.target.checked)}
              className="mt-0.5"
            />
            <span>
              I confirm that this review is my own, personal, honest account of my experience,
              and that I am not associated with this clinic or one of its competitors.
            </span>
          </label>
        </section>

        {/* ERROR + SUBMIT */}
        {error && (
          <div className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="pt-1">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Submitting review…' : 'Submit Review'}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ---------- STAR INPUT ---------- */

function StarRatingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const v = Math.max(0, Math.min(10, Math.round(value)));

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 10 }).map((_, i) => {
          const filled = i < v;
          return (
            <button
              key={i}
              type="button"
              aria-label={`Set rating to ${i + 1} out of 10`}
              onClick={() => onChange(i + 1)}
              className="p-0.5"
            >
              <svg
                className={`h-4 w-4 md:h-5 md:w-5 ${
                  filled ? 'fill-amber-400' : 'fill-gray-200'
                }`}
                viewBox="0 0 20 20"
              >
                <path d="M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L10 14.9 4.7 17.6l1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
              </svg>
            </button>
          );
        })}
      </div>
      <span className="text-xs text-gray-500">{v}/10</span>
    </div>
  );
}
