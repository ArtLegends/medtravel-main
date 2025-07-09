// components/ClinicDetail.tsx
'use client'
import Image from 'next/image'
import Link from 'next/link'
import type { Clinic, Category } from '@/lib/supabase/requests'


interface Props {
  clinic: Clinic
  categories: Category[]
  languages: string[]
  accreditations: string[]
  reviews: {
    id: number
    author_name: string
    rating: number
    text: string
    created_at: string
  }[]
}

export default function ClinicDetail({ clinic, categories, languages, accreditations, reviews }: Props) {
  return (
    <div className="container mx-auto py-20 space-y-12">
      {clinic.cover_url && (
        <div className="relative w-full h-64">
          <Image src={clinic.cover_url} fill className="object-cover" alt={clinic.name}/>
        </div>
      )}
      <h1 className="text-4xl font-bold mt-8">{clinic.name}</h1>
      <p className="mt-4 text-gray-600">{clinic.description}</p>

      <section className="mt-8">
        <h2 className="text-2xl font-semibold">Категории</h2>
        <div className="flex gap-4 mt-2">
          {categories.map(c=> (
            <Link key={c.id} href={`/${c.slug}`} className="badge">
              {c.name}
            </Link>
          ))}
        </div>
      </section>

          {/* Секция шапки с обложкой и названием */}
      <header className="flex flex-col md:flex-row items-center gap-8">
        {clinic.cover_url && <img src={clinic.cover_url} className="w-full md:w-1/2 rounded-lg" />}
        <div>
          <h1 className="text-4xl font-bold">{clinic.name}</h1>
          <p className="text-gray-500">{[clinic.city, clinic.province, clinic.country].filter(Boolean).join(', ')}</p>
        </div>
      </header>

      {/* Описание */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Описание</h2>
        <p>{clinic.description}</p>
      </section>

      {/* Категории */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Услуги</h2>
        <ul className="flex flex-wrap gap-2">
          {categories.map(c => (
            <li key={c.id} className="px-3 py-1 bg-gray-100 rounded">{c.name}</li>
          ))}
        </ul>
      </section>

      {/* Языки */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Языки общения</h2>
        <ul className="flex flex-wrap gap-2">
          {languages.map((lang, i) => (
            <li key={i} className="px-3 py-1 bg-gray-100 rounded">{lang}</li>
          ))}
        </ul>
      </section>

      {/* Аккредитации */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Аккредитации</h2>
        <ul className="flex flex-wrap gap-2">
          {accreditations.map((acc, i) => (
            <li key={i} className="px-3 py-1 bg-gray-100 rounded">{acc}</li>
          ))}
        </ul>
      </section>

      {/* Отзывы */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Отзывы пациентов</h2>
        {reviews.length === 0
          ? <p>Пока нет отзывов.</p>
          : (
            <div className="space-y-6">
              {reviews.map(r => (
                <div key={r.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">{r.author_name}</span>
                    <span className="text-yellow-500">{'★'.repeat(r.rating)}</span>
                  </div>
                  <p className="mb-2">{r.text}</p>
                  <time className="text-sm text-gray-400">{new Date(r.created_at).toLocaleDateString()}</time>
                </div>
              ))}
            </div>
          )
        }
      </section>
      
    </div>
  )
}
