// app/[category]/[country]/[city]/[clinic]/page.tsx
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { clinicsBySlug } from '@/lib/mock/clinic';

// -------- types (минимально нужное) ----------
type Params = {
  category: string;
  country: string;
  city: string;
  clinic: string; // slug клиники
};

// ---------- SEO ----------
export async function generateMetadata(
  { params }: { params: Params }
): Promise<Metadata> {
  const clinic = clinicsBySlug[params.clinic];
  if (!clinic) return { title: 'Clinic not found' };

  return {
    title: `${clinic.name} — ${clinic.city}, ${clinic.country} | MedTravel`,
    description: clinic.about.slice(0, 160),
    alternates: {
      canonical: `/${params.category}/${params.country}/${params.city}/${params.clinic}`,
    },
    openGraph: {
      title: clinic.name,
      description: clinic.about,
      images: clinic.images?.slice(0, 1)?.map((src) => ({ url: src })) ?? [],
    },
  };
}

// ---------- Страница ----------
export default function ClinicPage({ params }: { params: Params }) {
  const clinic = clinicsBySlug[params.clinic];
  if (!clinic) return notFound();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 1) Галерея */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="col-span-4 md:col-span-2 aspect-[16/9] relative rounded-lg overflow-hidden">
          <Image src={clinic.images[0]} alt={clinic.name} fill className="object-cover" />
        </div>
        {clinic.images.slice(1, 4).map((src, i) => (
          <div key={i} className="hidden md:block aspect-[16/9] relative rounded-lg overflow-hidden">
            <Image src={src} alt={`${clinic.name} ${i + 2}`} fill className="object-cover" />
          </div>
        ))}
      </div>

      {/* 2) Навигация по секциям */}
      <nav className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b mb-6">
        <ul className="flex flex-wrap gap-4 py-3 text-sm">
          {[
            ['about', 'About'],
            ['treatments', 'Treatments & Prices'],
            ['staff', 'Staff'],
            ['photos', 'Transformation photos'],
            ['accreditations', 'Accreditations'],
            ['reviews', 'Reviews'],
            ['location', 'Location'],
          ].map(([id, label]) => (
            <li key={id}>
              <a href={`#${id}`} className="hover:text-primary transition">{label}</a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Левый основной контент */}
        <main className="lg:col-span-2 space-y-12">
          {/* Шапка */}
          <section id="about" className="space-y-2">
            <div className="text-sm text-gray-500">
              {clinic.country}, {clinic.city}
              {clinic.district ? `, ${clinic.district}` : ''}
            </div>

            <h1 className="text-3xl font-bold">{clinic.name}</h1>

            {/* Бейджи: Verified / Official partner */}
            <div className="flex items-center gap-3">
              {clinic.verified && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-green-50 text-green-700 border border-green-200">
                  <span className="i">✔</span> Verified by medtravel.me
                </span>
              )}
              {clinic.partner && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  <span className="i">✔</span> Official partner of medtravel.me
                </span>
              )}
            </div>

            <p className="text-gray-700 leading-relaxed mt-4">{clinic.about}</p>
          </section>

          {/* Treatments & prices */}
          <section id="treatments" className="space-y-4">
            <h2 className="text-xl font-semibold">Treatments & Prices</h2>
            <div className="overflow-x-auto rounded-lg border">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-2">Procedure</th>
                    <th className="text-left px-4 py-2">Price</th>
                    <th className="text-left px-4 py-2">Duration</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {clinic.treatments.map((t) => (
                    <tr key={t.name} className="border-t">
                      <td className="px-4 py-2">{t.name}</td>
                      <td className="px-4 py-2">${t.price}</td>
                      <td className="px-4 py-2">{t.duration}</td>
                      <td className="px-4 py-2">
                        <button className="px-3 py-1 rounded bg-primary text-white hover:opacity-90">
                          Request
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Accepted payment methods (упрощённо) */}
            <div className="space-y-2">
              <h3 className="font-medium">Accepted payment methods</h3>
              <div className="flex flex-wrap gap-2 text-xs">
                {clinic.payments.map((p) => (
                  <span key={p} className="px-2 py-1 rounded border bg-white">{p}</span>
                ))}
              </div>
            </div>
          </section>

          {/* Staff */}
          <section id="staff" className="space-y-4">
            <h2 className="text-xl font-semibold">Doctors</h2>
            <div className="space-y-4">
              {clinic.doctors.map((d) => (
                <article key={d.name} className="rounded-lg border p-4 flex items-start gap-4">
                  <div className="size-20 shrink-0 rounded bg-gray-100" />
                  <div className="space-y-1">
                    <h3 className="font-medium">{d.name}</h3>
                    <div className="text-sm text-gray-600">{d.position}</div>
                    <div className="text-sm">Experience: {d.experience} years</div>
                    <div className="text-sm">Language spoken: {d.languages.join(', ')}</div>
                    <div className="text-sm">
                      Specialisations: {d.specialisations.join(', ')}
                    </div>
                    <button className="mt-2 px-3 py-1 rounded bg-primary text-white">
                      Request Appointment
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Transformation photos */}
          <section id="photos" className="space-y-4">
            <h2 className="text-xl font-semibold">Transformation photos</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {clinic.images.map((src, i) => (
                <div key={i} className="aspect-[4/3] relative rounded-lg overflow-hidden">
                  <Image src={src} alt={`${clinic.name} ${i + 1}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          </section>

          {/* Additional services */}
          <section className="space-y-6">
            <h2 className="text-xl font-semibold">Additional Services</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <ul className="space-y-2">
                <h3 className="font-medium">Premises</h3>
                {clinic.premises.map((x) => <li key={x}>✓ {x}</li>)}
              </ul>
              <ul className="space-y-2">
                <h3 className="font-medium">Clinic services</h3>
                {clinic.services.map((x) => <li key={x}>✓ {x}</li>)}
              </ul>
              <ul className="space-y-2">
                <h3 className="font-medium">Travel services</h3>
                {clinic.travel.map((x) => <li key={x}>✓ {x}</li>)}
              </ul>
              <ul className="space-y-2">
                <h3 className="font-medium">Languages spoken</h3>
                {clinic.languages.map((x) => <li key={x}>✓ {x}</li>)}
              </ul>
            </div>
          </section>

          {/* Accreditations */}
          <section id="accreditations" className="space-y-4">
            <h2 className="text-xl font-semibold">Accreditations</h2>
            <ul className="divide-y rounded-lg border">
              {clinic.accreditations.map((a) => (
                <li key={a.name} className="p-4">
                  <div className="font-medium">{a.name}</div>
                  <div className="text-sm text-gray-600">{a.country}, {a.note}</div>
                </li>
              ))}
            </ul>
          </section>

          {/* Reviews (болванка) */}
          <section id="reviews" className="space-y-2">
            <h2 className="text-xl font-semibold">Patient Reviews</h2>
            <p className="text-gray-500 text-sm">No reviews yet.</p>
          </section>

          {/* Operation hours */}
          <section className="space-y-2">
            <h2 className="text-xl font-semibold">Operation Hours (UTC+02)</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-y-2 text-sm">
              {clinic.hours.map((h) => (
                <div key={h.day} className="flex justify-between pr-4">
                  <span className="text-gray-600">{h.day}</span>
                  <span>{h.time}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Location */}
          <section id="location" className="space-y-3">
            <h2 className="text-xl font-semibold">Location</h2>
            <div className="text-gray-700">{clinic.address}</div>
            <div className="aspect-[16/9]">
              <iframe
                className="w-full h-full rounded-lg border"
                loading="lazy"
                allowFullScreen
                src={clinic.mapIframeSrc}
              />
            </div>
          </section>
        </main>

        {/* Правый сайдбар — 2 кнопки, «прилипают» при скролле */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24 space-y-3">
            <button className="w-full h-11 rounded bg-primary text-white hover:opacity-90">
              Start Your Personalized Treatment Plan Today
            </button>
            <button className="w-full h-11 rounded border hover:bg-gray-50">
              Claim Your Free Quote
            </button>

            {/* мини-поиск/ссылки можно добавить позже при необходимости */}
            <div className="mt-6 text-sm text-gray-500">
              <Link href={`/${params.category}`}>← Back to {params.category}</Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}





// // app/[category]/[country]/[province]/[city]/[district]/[clinic]/page.tsx

// import { createServerClient } from "@/lib/supabase/serverClient"
// import ClinicDetail from "@/components/ClinicDetail"
// import type { Category } from "@/lib/supabase/requests"

// export const revalidate = 3600

// /**
//  * Аналогично: и params, и searchParams — Promise
//  */
// type ClinicPageProps = {
//   params: Promise<{
//     category: string
//     country: string
//     province: string
//     city: string
//     district: string
//     clinic: string
//   }>
//   searchParams: Promise<Record<string, string | string[]>>
// }

// export default async function ClinicPage({
//   params,
//   searchParams, // обязателен для соответствия типам Next.js
// }: ClinicPageProps) {
//   // распаковываем реальные значения
//   const {
//     category,
//     country,
//     province,
//     city,
//     district,
//     clinic: clinicSlug,
//   } = await params

//   // const qs = await searchParams

//   const supabase = createServerClient()

//   // 1) Основные данные
//   const { data: clinic, error: clinicErr } = await supabase
//     .from("clinics")
//     .select(
//       `
//       id,
//       name,
//       slug,
//       about,
//       country,
//       city,
//       province,
//       district,
//       cover_url,
//       services,
//       websites,
//       phone,
//       email
//     `
//     )
//     .eq("slug", clinicSlug)
//     .single()

//   if (clinicErr || !clinic) {
//     return <p>Клиника не найдена</p>
//   }

//   // 2) Категории
//   interface ClinicCategory {
//     categories: Category[]
//   }
//   const { data: rawCcats } = await supabase
//     .from("clinic_categories")
//     .select("categories(id, name, slug)")
//     .eq("clinic_id", clinic.id)
//   const ccats = (rawCcats ?? []) as ClinicCategory[]
//   const categories = ccats.flatMap((c) => c.categories)

//   // 3) Языки
//   const { data: langs } = await supabase
//     .from("clinic_languages")
//     .select("language")
//     .eq("clinic_id", clinic.id)

//   // 4) Аккредитации
//   const { data: accs } = await supabase
//     .from("clinic_accreditations")
//     .select("accreditation")
//     .eq("clinic_id", clinic.id)

//   // 5) Отзывы
//   const { data: reviews } = await supabase
//     .from("reviews")
//     .select("id, author_name, rating, text, created_at")
//     .eq("clinic_id", clinic.id)
//     .order("created_at", { ascending: false })

//   // Преобразуем clinic к типу Clinic, сопоставляя about -> description
//   const clinicForDetail = {
//     ...clinic,
//     description: clinic.about,
//   }

//   return (
//     <ClinicDetail
//       clinic={clinicForDetail}
//       categories={categories}
//       languages={langs?.map((l) => l.language) ?? []}
//       accreditations={accs?.map((a) => a.accreditation) ?? []}
//       reviews={reviews ?? []}
//     />
//   )
// }


