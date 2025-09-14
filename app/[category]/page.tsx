// app/[category]/page.tsx
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

// ⚠️ подстрой под свои мок-экспорты:
import { clinics as ALL_CLINICS } from '@/lib/mock/clinic';
// import { getClinicsByCategory } from '@/lib/mock/clinic'

type PageProps = { params: { category: string } };

// ------- helpers -------
function star(rating?: number) {
  return (
    <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs bg-amber-100 text-amber-700 border border-amber-200">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .587l3.668 7.431L24 9.748l-6 5.848L19.335 24 12 19.897 4.665 24 6 15.596 0 9.748l8.332-1.73z"/></svg>
      {rating?.toFixed(1) ?? '—'}
    </span>
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const title = params.category
    ? `${capitalize(params.category)} Clinics | MedTravel`
    : 'Clinics | MedTravel';

  return {
    title,
    description: `Best ${params.category} clinics in popular destinations. Compare prices, read reviews and book a consultation.`,
    alternates: { canonical: `/${params.category}` },
    openGraph: { title, description: `Top ${params.category} clinics worldwide` },
  };
}

export default function CategoryPage({ params }: PageProps) {
  const { category } = params;

  // 1) Забирать готовой функцией, если есть:
  // const items = getClinicsByCategory(category)

  // 2) Или на моках — простая фильтрация, чтобы работало "из коробки".
  // Пример: считаем матчем, если в services встречается ключевое слово категории
  const items = (ALL_CLINICS ?? []).filter((c: any) => {
    const pool = (c?.services ?? []).map((s: any) => (s?.name ?? '').toLowerCase());
    return pool.some((name: string) => name.includes(category.toLowerCase()));
  }).slice(0, 12); // ограничим

  return (
    <div className="min-h-screen">
      {/* HERO */}
      <section className="bg-slate-900 text-white">
        <div className="container mx-auto px-4">
          <div className="py-12 md:py-16">
            <h1 className="max-w-3xl text-3xl md:text-5xl font-semibold leading-tight">
              Best {capitalize(category)} Clinics in Popular
              <br className="hidden md:block" /> Destinations
            </h1>

            <div className="mt-6">
              <Link
                href="/#lead"
                className="inline-flex items-center justify-center rounded-md bg-emerald-500 hover:bg-emerald-600 px-5 py-3 text-white font-medium transition"
              >
                Receive a Personalized Offer on Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold text-center mb-6">Why Choose Us?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FeatureCard n="1" text="We are medical tourism professionals" />
          <FeatureCard n="2" text="We will help you find the clinic and doctor that best suits your needs" />
          <FeatureCard n="3" text="We will provide quick and easy access to all the information you need" />
        </div>
      </section>

      {/* GRID: list + sidebar */}
      <section className="container mx-auto px-4 pb-14">
        <div className="grid grid-cols-12 gap-6">
          {/* left */}
          <div className="col-span-12 lg:col-span-8 space-y-4">
            {items.map((clinic: any) => (
              <article key={clinic.slug} className="rounded-xl border bg-white">
                <div className="grid grid-cols-12 gap-0 md:gap-4">
                  {/* image */}
                  <div className="col-span-12 md:col-span-5">
                    <div className="relative aspect-[16/9] md:aspect-video md:h-full">
                      <Image
                        src={(clinic.images?.[0]) ?? '/placeholder.jpg'}
                        alt={clinic.name}
                        fill
                        className="object-cover rounded-t-xl md:rounded-l-xl md:rounded-tr-none"
                        sizes="(max-width: 768px) 100vw, 40vw"
                        priority={false}
                      />
                    </div>
                  </div>

                  {/* content */}
                  <div className="col-span-12 md:col-span-7 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link href={`/clinic/${clinic.slug}`} className="text-lg font-medium hover:underline">
                          {clinic.name}
                        </Link>
                        <div className="text-sm text-gray-500">
                          {clinic.city}, {clinic.country}
                        </div>
                      </div>
                      {star(clinic.rating)}
                    </div>

                    {typeof clinic.fromPrice === 'number' && (
                      <div className="mt-1 text-sm text-gray-700">
                        From <span className="font-medium">${clinic.fromPrice}</span>
                      </div>
                    )}

                    <div className="mt-3 flex flex-wrap gap-2">
                      {(clinic.tags ?? clinic.services ?? [])
                        .slice(0, 4)
                        .map((t: any, i: number) => (
                          <span
                            key={i}
                            className="inline-block rounded-full border bg-gray-50 px-2.5 py-1 text-xs capitalize"
                          >
                            {typeof t === 'string' ? t : (t?.name ?? '')}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
              </article>
            ))}

            {items.length === 0 && (
              <div className="rounded-lg border p-6 text-center text-gray-600">
                No clinics found for “{category}”. (Using mock data)
              </div>
            )}
          </div>

          {/* sidebar */}
          <aside className="col-span-12 lg:col-span-4 space-y-4">
            <Card title="Search locations">
              <input
                type="text"
                placeholder="Search locations"
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
              <div className="mt-4">
                <SidebarLink href="/istanbul">Istanbul</SidebarLink>
                <SidebarLink href="/ankara">Ankara</SidebarLink>
                <SidebarLink href="/antalya">Antalya</SidebarLink>
                <SidebarLink href="/warsaw">Warsaw</SidebarLink>
                <SidebarLink href="/krakow">Krakow</SidebarLink>
              </div>
            </Card>

            <Card title="Search treatments">
              <input
                type="text"
                placeholder="Search treatments"
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
              <div className="mt-4">
                <SidebarLink href="/hair-transplant">Hair Transplant</SidebarLink>
                <SidebarLink href="/dental-implants">Dental Implants</SidebarLink>
                <SidebarLink href="/veneers">Veneers</SidebarLink>
                <SidebarLink href="/rhinoplasty">Rhinoplasty</SidebarLink>
                <SidebarLink href="/crowns">Crowns</SidebarLink>
              </div>
            </Card>
          </aside>
        </div>
      </section>
    </div>
  );
}

// ------- small components -------

function FeatureCard({ n, text }: { n: string; text: string }) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold">
        {n}
      </div>
      <div className="text-gray-800">{text}</div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="mb-3 text-sm font-semibold">{title}</div>
      {children}
    </div>
  );
}

function SidebarLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="block py-1.5 text-sm text-sky-700 hover:underline">
      {children}
    </Link>
  );
}

function capitalize(s?: string) {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export const dynamic = 'force-static'; // стабильный рендер на Vercel (моки)
