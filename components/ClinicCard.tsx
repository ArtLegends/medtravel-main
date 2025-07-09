'use client'
// components/ClinicCard.tsx
import Link from "next/link"
import Image from "next/image"
// import type { Clinic as ClinicType } from "@/lib/supabase/requests"

export interface Clinic {
  id: string
  name: string
  slug: string
  country: string
  province: string
  city: string
  district: string
  cover_url?: string | null
  services: string[]
}

interface Props { clinic: Clinic }
export default function ClinicCard({ clinic }: Props) {
  return (
    <Link
      href={`/${clinic.slug}`}
      className="block overflow-hidden rounded-lg bg-white shadow-md hover:shadow-lg transition p-4"
    >
      {clinic.cover_url && (
        <div className="h-48 w-full relative">
          <Image
            src={clinic.cover_url}
            alt={clinic.name}
            fill
            className="object-cover rounded-md"
          />
        </div>
      )}
      <h3 className="mt-4 text-xl font-semibold">{clinic.name}</h3>
      <p className="text-sm text-gray-500">
        {clinic.city ?? clinic.province ?? clinic.country}
      </p>
    </Link>
  )
}