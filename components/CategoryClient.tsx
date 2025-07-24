// components/CategoryClient.tsx
// import React, { useState, useCallback } from 'react'
// import CategoryFilters from './CategoryFilters'
// import ClinicCard from './ClinicCard'
// import { Clinic } from '@/lib/supabase/requests'
// type FilterValues = {
//   treatments: string[]
//   countries: string[]
// }

// interface CategoryClientProps {
//   clinics: Clinic[]
// }

// export default function CategoryClient({ clinics }: CategoryClientProps) {
//   const [filters, setFilters] = useState<FilterValues>({
//     treatments: [],
//     countries: [],
//   })

//   const onFiltersChange = useCallback((newFilters: FilterValues) => {
//     setFilters(newFilters)
//   }, [])

//   return (
//     <>
//       <CategoryFilters values={filters} onChange={onFiltersChange} />
//       <div className="grid …">
//         {clinics.map((c) => (
//           <ClinicCard key={c.id} clinic={c} />
//         ))}
//       </div>
//     </>
//   )
// }


'use client'

import { useState, useMemo } from 'react'
import CategoryFilters from './CategoryFilters'         // без { FilterValues }
import ClinicCard from './ClinicCard'
import type { Clinic } from '@/lib/supabase/requests'

interface Props {
  cat: { id: number; name: string }
  clinics: Clinic[]
}

export default function CategoryClient({ cat, clinics }: Props) {
  // 1) локальные фильтры
  const [selectedCountry, setCountry] = useState<string | null>(null)
  const [selectedService, setService] = useState<string | null>(null)

  // 2) фильтрация
  const filteredClinics = useMemo(() => 
    clinics.filter(c =>
      (!selectedCountry || c.country === selectedCountry) &&
      (!selectedService || c.services.includes(selectedService))
    )
  , [clinics, selectedCountry, selectedService])

  return (
    <main className="container py-20 flex">
      {/* Передаём только то, что сейчас умеет CategoryFilters */}
      <CategoryFilters
        selectedCountry={selectedCountry}
        onCountryChange={setCountry}
        selectedService={selectedService}
        onServiceChange={setService}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 ml-8">
        {filteredClinics.map(c => (
          <ClinicCard key={c.id} clinic={c} />
        ))}
      </div>
    </main>
  )
}