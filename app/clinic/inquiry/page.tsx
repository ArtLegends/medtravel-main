// app/clinic/inquiry/page.tsx
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';
import { clinicHref, clinicPath } from '@/lib/clinic-url'

type Search = { slug?: string };

export const dynamic = 'force-dynamic';

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<Search>
}) {
  const sp = (await searchParams) ?? {}
  const slug = sp.slug?.trim()

  if (slug) {
    // 1) находим клинику и собираем красивый путь для редиректа
    const { data: c } = await supabaseServer
      .from('clinics')
      .select('slug, country, province, city, district')
      .eq('slug', slug)
      .maybeSingle()

    const pretty = c
      ? `${clinicPath({
        slug: c.slug,
        country: c.country,
        province: c.province,
        city: c.city,
        district: c.district,
      })}/inquiry`
      : `/clinic/${encodeURIComponent(slug)}/inquiry`

    redirect(pretty)
  }

  // 2) список клиник для выбора (добавили нужные поля)
  const { data: clinics, error } = await supabaseServer
    .from('clinics')
    .select('name, slug, country, province, city, district')
    .order('name', { ascending: true })
    .limit(100)

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="mb-3 text-2xl font-semibold">Inquiry</h1>
        <p className="text-red-600">Failed to load clinics list.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-semibold">Choose a clinic</h1>
      <p className="mb-6 text-sm text-gray-500">
        Opened without a specific clinic. Pick one below to request a free quote.
      </p>

      <ul className="divide-y rounded-xl border bg-white">
        {(clinics ?? []).map((c) => {
          const pretty = `${clinicPath({
            slug: c.slug,
            country: c.country,
            province: c.province,
            city: c.city,
            district: c.district,
          })}/inquiry`
          return (
            <li key={c.slug} className="flex items-center justify-between p-4">
              <div className="min-w-0">
                <div className="truncate font-medium">{c.name}</div>
                <div className="truncate text-xs text-gray-500">
                  {clinicPath({ country: c.country, province: c.province || undefined, city: c.city, district: c.district || undefined, slug: c.slug })}/inquiry
                </div>
              </div>
              <Link
                href={clinicHref({ slug: c.slug, country: c.country, province: c.province, city: c.city, district: c.district }, 'inquiry')}
                prefetch
                className="shrink-0 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
              >
                Request
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
