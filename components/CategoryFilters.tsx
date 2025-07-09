// components/CategoryFilters.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/browserClient'

export interface FilterValues {
  loc: string[]
  svc: string[]
}

interface Props {
  categoryId: number
  onFilter: (values: FilterValues) => void
}

export default function CategoryFilters({ categoryId, onFilter }: Props) {
  const supabase = createClient()
  const [locations, setLocations] = useState<string[]>([])
  const [services,  setServices]  = useState<string[]>([])
  const [selected, setSelected]  = useState<FilterValues>({ loc: [], svc: [] })

  // загрузка уникальных локаций и сервисов для этой категории
  useEffect(() => {
    async function load() {
      // 1) локации
      const { data: clinics } = await supabase
        .from('clinic_categories')
        .select('clinics(country, province, city, district)')
        .eq('category_id', categoryId)

      const locSet = new Set<string>()
      clinics?.forEach(({ clinics }) => {
        const c = clinics as any
        [c.country, c.province, c.city, c.district]
          .filter(Boolean)
          .forEach(v => locSet.add(v))
      })
      setLocations(Array.from(locSet))

      // 2) сервисы
      const { data: svcData } = await supabase
        .from('clinic_categories')
        .select('clinics(services)')
        .eq('category_id', categoryId)

      const svcSet = new Set<string>()
      svcData?.forEach(({ clinics }) => {
        const c = clinics as any
        (c.services as string[]).forEach(s => svcSet.add(s))
      })
      setServices(Array.from(svcSet))
    }
    load()
  }, [categoryId])

  // при изменении selected вызываем onFilter
  useEffect(() => {
    onFilter(selected)
  }, [selected, onFilter])

  return (
    <aside className="space-y-6">
      <div>
        <h3 className="font-semibold mb-1">Locations</h3>
        {locations.map(loc => (
          <label key={loc} className="block">
            <input
              type="checkbox"
              value={loc}
              checked={selected.loc.includes(loc)}
              onChange={e => {
                const next = e.target.checked
                  ? [...selected.loc, loc]
                  : selected.loc.filter(x => x !== loc)
                setSelected(v => ({ ...v, loc: next }))
              }}
            />{' '}
            {loc}
          </label>
        ))}
      </div>
      <div>
        <h3 className="font-semibold mb-1">Services</h3>
        {services.map(svc => (
          <label key={svc} className="block">
            <input
              type="checkbox"
              value={svc}
              checked={selected.svc.includes(svc)}
              onChange={e => {
                const next = e.target.checked
                  ? [...selected.svc, svc]
                  : selected.svc.filter(x => x !== svc)
                setSelected(v => ({ ...v, svc: next }))
              }}
            />{' '}
            {svc}
          </label>
        ))}
      </div>
    </aside>
  )
}
