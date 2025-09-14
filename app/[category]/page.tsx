// app/[category]/page.tsx
export const runtime = 'nodejs';
export const dynamic = 'force-static';

import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getAllCategories, getClinicsByCategory } from '@/lib/mock/category';

type Params = { category: string };

export async function generateStaticParams() {
  return getAllCategories().map((c) => ({ category: c }));
}

export async function generateMetadata(
  { params }: { params: Promise<Params> }
): Promise<Metadata> {
  const { category } = await params;
  const title = `${capitalize(category)} clinics | MedTravel`;
  return {
    title,
    description: `Top ${category} clinics worldwide on MedTravel.`,
    alternates: { canonical: `/${category}` },
    openGraph: { title, description: `Find ${category} clinics.` },
  };
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { category } = await params;
  const clinics = getClinicsByCategory(category);

  return (
    <main className="container mx-auto py-10">
      <h1 className="text-3xl font-semibold mb-6 capitalize">{category}</h1>

      {clinics.length === 0 ? (
        <p className="text-gray-600">No clinics yet for this category.</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {clinics.map((c) => (
            <li key={c.slug} className="rounded-xl border overflow-hidden bg-white">
              <Link href={`/clinic/${c.slug}`}>
                <div className="relative h-48">
                  <Image
                    src={c.cover}
                    alt={c.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{c.name}</h3>
                    {c.rating ? (
                      <span className="text-sm rounded bg-amber-50 px-2 py-0.5 border border-amber-200">
                        ⭐ {c.rating.toFixed(1)}
                      </span>
                    ) : null}
                  </div>
                  <div className="text-sm text-gray-500">
                    {c.city}, {c.country}
                  </div>
                  {c.priceFrom ? (
                    <div className="text-sm text-gray-700">
                      From <span className="font-semibold">${c.priceFrom}</span>
                    </div>
                  ) : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
