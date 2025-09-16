// app/[category]/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { clinics as ALL_CLINICS, getClinicsByCategory } from '@/lib/mock/clinic'

// вспомогалки
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

type Params = { category: string }

// ----------- metadata -----------
export async function generateMetadata(
  { params }: { params: Promise<Params> }
): Promise<Metadata> {
  const { category } = await params
  const title = `${capitalize(category)} Clinics | MedTravel`
  return {
    title,
    description: `Best ${category} clinics in popular destinations. Compare prices, read reviews and book a consultation.`,
    alternates: { canonical: `/${category}` },
    openGraph: {
      title,
      description: `Top ${category} clinics worldwide`,
    },
  }
}

// ----------- page -----------
export default async function Page(
  { params }: { params: Promise<Params> }
) {
  const { category } = await params
  const items = getClinicsByCategory(category)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold mb-6">{capitalize(category)}</h1>

      {/* cards */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((c) => (
          <Link
            key={c.slug}
            href={`/clinic/${c.slug}`}
            className="rounded-xl overflow-hidden border hover:shadow-md transition"
          >
            <div className="relative aspect-[16/9]">
              <Image
                src={c.images[0]}
                alt={c.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              />
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{c.name}</h3>
                {c.rating && (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200">
                    ★ {c.rating.toFixed(1)}
                  </span>
                )}
              </div>
              <div className="mt-1 text-sm text-gray-500">
                {c.city}, {c.country}
              </div>
              {typeof c.fromPrice === 'number' && (
                <div className="mt-2 text-sm">From ${c.fromPrice}</div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* запасной блок если фильтр ничего не нашёл */}
      {items.length === 0 && (
        <div className="text-sm text-gray-500">No clinics found for this category.</div>
      )}
    </div>
  )
}

