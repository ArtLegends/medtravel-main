// app/clinic/[slug]/page.tsx
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import ClinicDetailPage from '@/components/clinic/ClinicDetailPage'
import { fetchClinicBySlug } from '@/lib/db/clinics'

type Params = { slug: string }

export async function generateMetadata(
  { params }: { params: Promise<Params> }
): Promise<Metadata> {
  const { slug } = await params
  const clinic = await fetchClinicBySlug(slug)
  const title = clinic ? clinic.name : 'Clinic'
  return {
    title,
    alternates: { canonical: `/clinic/${slug}` },
    openGraph: {
      title,
      description: clinic?.about ?? '',
      images: (clinic?.images ?? []).slice(0, 1).map((src) => ({ url: src })),
    },
  }
}

export default async function Page(
  { params }: { params: Promise<Params> }
) {
  const { slug } = await params
  const clinic = await fetchClinicBySlug(slug)
  if (!clinic) return notFound()
  return <ClinicDetailPage clinic={clinic} />
}
