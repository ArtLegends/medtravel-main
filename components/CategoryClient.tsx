// components/CategoryClient.tsx
'use client'

import { useState, useCallback } from 'react'
import CategoryFilters, { FilterValues } from './CategoryFilters'
import ClinicCard from './ClinicCard'

interface Clinic {
  id: string
  name: string
  slug: string
  country: string
  province: string
  city: string
  district: string
  cover_url: string | null
  services: string[]
}

interface Props {
  cat: { id: number; name: string }
  clinics: Clinic[]
}

export default function CategoryClient({ cat, clinics }: Props) {
  const [filtered, setFiltered] = useState(clinics)

  const handleFilter = useCallback((values: FilterValues) => {
    const { loc, svc } = values
    setFiltered(clinics.filter(c =>
      (loc.length  ? loc.includes(c.country || '') : true) &&
      (svc.length  ? svc.every(s => c.services.includes(s)) : true)
    ))
  }, [clinics])

  return (
    <main className="container py-20 flex">
      <CategoryFilters categoryId={cat.id} onFilter={handleFilter} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 ml-8">
        {filtered.map(c => <ClinicCard key={c.id} clinic={c} />)}
      </div>
    </main>
  )
}