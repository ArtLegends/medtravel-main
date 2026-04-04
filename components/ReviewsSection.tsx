// components/ReviewsSection.tsx
// Server Component — fetches real Google reviews from DB
// Falls back to null if no reviews exist yet

import { supabaseServer } from '@/lib/supabase/server';
import Image from 'next/image';

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-5 h-5 ${i < rating ? 'fill-yellow-400' : 'fill-gray-200'}`}
          viewBox="0 0 20 20"
        >
          <path d="M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L10 14.9 4.7 17.6l1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
        </svg>
      ))}
    </div>
  );
}

export default async function ReviewsSection() {
  let reviews: any[] = [];

  try {
    const { data } = await supabaseServer
      .from('google_reviews')
      .select('id, google_author_name, google_author_photo_url, rating, text, relative_time_description, clinic_id')
      .gte('rating', 4)
      .not('text', 'is', null)
      .order('publish_time', { ascending: false })
      .limit(6);

    reviews = data ?? [];
  } catch {
    // no-op — table might not have data yet
  }

  // If no Google reviews, don't render the section at all
  if (reviews.length === 0) return null;

  // Fetch clinic names for the reviews
  const clinicIds = [...new Set(reviews.map((r) => r.clinic_id).filter(Boolean))];
  let clinicNames: Record<string, string> = {};

  if (clinicIds.length > 0) {
    try {
      const { data: clinics } = await supabaseServer
        .from('clinics')
        .select('id, name')
        .in('id', clinicIds);

      clinicNames = Object.fromEntries(
        (clinics ?? []).map((c: any) => [c.id, c.name])
      );
    } catch {}
  }

  return (
    <section className="container mx-auto py-20 space-y-8">
      <h2 className="text-3xl font-bold text-center">What Our Patients Say</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map((r: any) => (
          <div
            key={r.id}
            className="bg-white p-6 rounded-lg shadow-sm flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                {r.google_author_photo_url ? (
                  <Image
                    src={r.google_author_photo_url}
                    alt={r.google_author_name}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-semibold text-lg">
                    {r.google_author_name?.charAt(0)?.toUpperCase() ?? '?'}
                  </div>
                )}
                <div className="ml-3 text-sm">
                  <p className="font-semibold">{r.google_author_name}</p>
                  <p className="text-gray-500">
                    {clinicNames[r.clinic_id] ?? ''}
                  </p>
                </div>
              </div>
              {/* Google icon */}
              <Image
                src="https://img.icons8.com/?size=512&id=17949&format=png"
                alt="Google"
                width={28}
                height={28}
              />
            </div>

            {/* Stars */}
            <div className="flex items-center mb-2">
              <Stars rating={r.rating} />
            </div>

            {/* Text */}
            <p className="text-gray-600 flex-1 line-clamp-4">
              {r.text || '—'}
            </p>

            {r.relative_time_description && (
              <p className="mt-3 text-xs text-gray-400">
                {r.relative_time_description}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}