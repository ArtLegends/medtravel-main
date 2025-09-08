// app/clinic/[slug]/page.tsx
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import ClinicDetailPage from '@/components/ClinicDetailPage'
import { getClinicBySlug } from '@/lib/mock/clinic'

// ВАЖНО: params теперь Promise
type Params = { slug: string }

export async function generateMetadata(
  { params }: { params: Promise<Params> }
): Promise<Metadata> {
  const { slug } = await params
  const clinic = getClinicBySlug(slug)
  if (!clinic) return { title: 'Clinic not found' }

  return {
    title: `${clinic.name} — ${clinic.city}, ${clinic.country} | MedTravel`,
    description: clinic.about.slice(0, 160),
    alternates: { canonical: `/clinic/${slug}` },
    openGraph: {
      title: clinic.name,
      description: clinic.about.slice(0, 160),
      images: (clinic.images ?? []).slice(0, 1).map((src) => ({ url: src })),
    },
  }
}

export default async function Page(
  { params }: { params: Promise<Params> }
) {
  const { slug } = await params
  const clinic = getClinicBySlug(slug)
  if (!clinic) return notFound()
  return <ClinicDetailPage clinic={clinic} />
}
