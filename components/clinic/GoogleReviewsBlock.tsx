// components/clinic/GoogleReviewsBlock.tsx
// Display Google reviews cached in google_reviews table
'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Icon } from '@iconify/react';
import { createClient } from '@/lib/supabase/browserClient';

type GoogleReview = {
  id: string;
  google_author_name: string;
  google_author_photo_url: string | null;
  google_profile_url: string | null;
  rating: number;
  text: string | null;
  language: string | null;
  relative_time_description: string | null;
  publish_time: string | null;
};

type Props = {
  clinicId: string;
  googleRating?: number | null;
  googleReviewsCount?: number | null;
};

function GoogleStars({ value }: { value: number }) {
  const v = Math.max(0, Math.min(5, Math.round(value)));
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating ${value} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`h-4 w-4 ${i < v ? 'fill-amber-400' : 'fill-gray-200'}`}
          viewBox="0 0 20 20"
        >
          <path d="M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L10 14.9 4.7 17.6l1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
        </svg>
      ))}
    </div>
  );
}

export default function GoogleReviewsBlock({ clinicId, googleRating, googleReviewsCount }: Props) {
  const supabase = useMemo(() => createClient(), []);
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('google_reviews')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('publish_time', { ascending: false })
        .limit(5);
      if (!cancelled) {
        setReviews((data ?? []) as GoogleReview[]);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [supabase, clinicId]);

  if (!googleRating && reviews.length === 0 && !loading) return null;

  return (
    <div className="space-y-4">
      {/* Google Rating Summary */}
      {googleRating != null && (
        <div className="flex items-center gap-3 rounded-xl border bg-white p-4">
          <Image
            src="https://img.icons8.com/?size=512&id=17949&format=png"
            alt="Google"
            width={28}
            height={28}
            className="shrink-0"
          />
          <div className="flex items-center gap-2">
            <GoogleStars value={googleRating} />
            <span className="text-lg font-semibold">{googleRating}</span>
          </div>
          {googleReviewsCount != null && googleReviewsCount > 0 && (
            <span className="text-sm text-gray-500">
              ({googleReviewsCount} Google {googleReviewsCount === 1 ? 'review' : 'reviews'})
            </span>
          )}
        </div>
      )}

      {/* Google Reviews List */}
      {loading && reviews.length === 0 && (
        <div className="text-sm text-gray-400 py-4 text-center">Loading Google reviews...</div>
      )}

      {reviews.length > 0 && (
        <ul className="grid gap-4 md:grid-cols-2">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-xl border bg-white p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {r.google_author_photo_url ? (
                    <Image
                      src={r.google_author_photo_url}
                      alt={r.google_author_name}
                      width={36}
                      height={36}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm font-semibold">
                      {r.google_author_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-medium">
                      {r.google_profile_url ? (
                        <a
                          href={r.google_profile_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {r.google_author_name}
                        </a>
                      ) : (
                        r.google_author_name
                      )}
                    </div>
                    {r.relative_time_description && (
                      <div className="text-xs text-gray-400">{r.relative_time_description}</div>
                    )}
                  </div>
                </div>
                <Image
                  src="https://img.icons8.com/?size=512&id=17949&format=png"
                  alt="Google"
                  width={20}
                  height={20}
                  className="opacity-60"
                />
              </div>

              {/* Stars */}
              <div className="mb-2">
                <GoogleStars value={r.rating} />
              </div>

              {/* Text */}
              {r.text && (
                <p className="text-sm text-gray-700 line-clamp-4">{r.text}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}