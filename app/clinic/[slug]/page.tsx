// app/clinic/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ClinicDetailPage from "@/components/clinic/ClinicDetailPage";
import { getClinicBySlug } from "@/lib/mock/clinic";

type Params = { slug: string };

export async function generateMetadata(
  { params }: { params: Promise<Params> }
): Promise<Metadata> {
  const { slug } = await params;
  const clinic = getClinicBySlug(slug);
  if (!clinic) {
    return {
      title: "Clinic not found | MedTravel",
      description: "Requested clinic could not be found."
    };
  }

  const title = `${clinic.name} — ${clinic.city}, ${clinic.country} | MedTravel`;
  const description = clinic.about?.slice(0, 160) ?? "";

  return {
    title,
    description,
    alternates: { canonical: `/clinic/${slug}` },
    openGraph: {
      title,
      description,
      images: (clinic.images ?? []).slice(0, 1).map((src) => ({ url: src })),
    },
  };
}

export default async function Page(
  { params }: { params: Promise<Params> }
) {
  const { slug } = await params;
  const clinic = getClinicBySlug(slug);
  if (!clinic) return notFound();

  return <ClinicDetailPage clinic={clinic} />;
}
