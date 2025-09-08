// // components/CategoryFilters.tsx
// 'use client'

// import { useState, useEffect } from 'react'
// import { createClient } from '@/lib/supabase/browserClient'

// export interface FilterValues {
//   loc: string[]
//   svc: string[]
// }

// interface Props {
//   categoryId: number
//   onFilter: (values: FilterValues) => void
// }

// export default function CategoryFilters({ categoryId, onFilter }: Props) {
//   const supabase = createClient()
//   const [locations, setLocations] = useState<string[]>([])
//   const [services,  setServices]  = useState<string[]>([])
//   const [selected, setSelected]  = useState<FilterValues>({ loc: [], svc: [] })

//   // загрузка уникальных локаций и сервисов для этой категории
//   useEffect(() => {
//     async function load() {
//       // 1) локации
//       const { data: clinics } = await supabase
//         .from('clinic_categories')
//         .select('clinics(country, province, city, district)')
//         .eq('category_id', categoryId)

//       const locSet = new Set<string>()
//       clinics?.forEach(({ clinics }) => {
//         const c = clinics as any
//         [c.country, c.province, c.city, c.district]
//           .filter(Boolean)
//           .forEach(v => locSet.add(v))
//       })
//       setLocations(Array.from(locSet))

//       // 2) сервисы
//       const { data: svcData } = await supabase
//         .from('clinic_categories')
//         .select('clinics(services)')
//         .eq('category_id', categoryId)

//       const svcSet = new Set<string>()
//       svcData?.forEach(({ clinics }) => {
//         const c = clinics as any
//         (c.services as string[]).forEach(s => svcSet.add(s))
//       })
//       setServices(Array.from(svcSet))
//     }
//     load()
//   }, [categoryId])

//   // при изменении selected вызываем onFilter
//   useEffect(() => {
//     onFilter(selected)
//   }, [selected, onFilter])

//   return (
//     <aside className="space-y-6">
//       <div>
//         <h3 className="font-semibold mb-1">Locations</h3>
//         {locations.map(loc => (
//           <label key={loc} className="block">
//             <input
//               type="checkbox"
//               value={loc}
//               checked={selected.loc.includes(loc)}
//               onChange={e => {
//                 const next = e.target.checked
//                   ? [...selected.loc, loc]
//                   : selected.loc.filter(x => x !== loc)
//                 setSelected(v => ({ ...v, loc: next }))
//               }}
//             />{' '}
//             {loc}
//           </label>
//         ))}
//       </div>
//       <div>
//         <h3 className="font-semibold mb-1">Services</h3>
//         {services.map(svc => (
//           <label key={svc} className="block">
//             <input
//               type="checkbox"
//               value={svc}
//               checked={selected.svc.includes(svc)}
//               onChange={e => {
//                 const next = e.target.checked
//                   ? [...selected.svc, svc]
//                   : selected.svc.filter(x => x !== svc)
//                 setSelected(v => ({ ...v, svc: next }))
//               }}
//             />{' '}
//             {svc}
//           </label>
//         ))}
//       </div>
//     </aside>
//   )
// }


// "use client";

// interface Props {
//   selectedCountry: string | null;
//   onCountryChange: (c: string | null) => void;
//   selectedService: string | null;
//   onServiceChange: (s: string | null) => void;
// }

// const COUNTRIES = ["Turkey", "Poland", "Germany", "Spain", "Mexico"];
// const SERVICES = ["test service", "Teeth Whitening", "Dental Implant", "Hair Transplant"];

// export default function CategoryFilters({
//   selectedCountry,
//   onCountryChange,
//   selectedService,
//   onServiceChange,
// }: Props) {
//   return (
//     <div className="flex flex-wrap gap-4">
//       <select
//         className="border rounded px-3 py-2"
//         value={selectedCountry ?? ""}
//         onChange={(e) => onCountryChange(e.currentTarget.value || null)}
//       >
//         <option value="">All countries</option>
//         {COUNTRIES.map((c) => (
//           <option key={c} value={c}>
//             {c}
//           </option>
//         ))}
//       </select>

//       <select
//         className="border rounded px-3 py-2"
//         value={selectedService ?? ""}
//         onChange={(e) => onServiceChange(e.currentTarget.value || null)}
//       >
//         <option value="">All services</option>
//         {SERVICES.map((s) => (
//           <option key={s} value={s}>
//             {s}
//           </option>
//         ))}
//       </select>
//     </div>
//   );
// }




// app/[category]/CategoryFilters.tsx  (или твой текущий путь)

"use client";

type Facets = {
  countries?: string[] | null;
  provinces?: string[] | null;
  cities?: string[] | null;
  districts?: string[] | null;
  services?: string[] | null;
};

type Selected = {
  country?: string;
  province?: string;
  city?: string;
  district?: string;
  services: string[];
  sort: "name_asc" | "name_desc";
};

export default function CategoryFilters({
  facets,
  selected,
  onChangeAction,
  onResetAction,
}: {
  facets: Facets | undefined | null;
  selected: Selected;
  onChangeAction: (change: Partial<Selected>) => void;
  onResetAction: () => void;
}) {
  const countries = facets?.countries ?? [];
  const provinces = facets?.provinces ?? [];
  const cities = facets?.cities ?? [];
  const districts = facets?.districts ?? [];
  const services = facets?.services ?? [];

  const toggleService = (slug: string) => {
    const set = new Set(selected.services);
    set.has(slug) ? set.delete(slug) : set.add(slug);
    onChangeAction({ services: Array.from(set) });
  };

  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {/* Country */}
        <select
          className="rounded-xl border px-3 py-2"
          value={selected.country ?? ""}
          onChange={(e) => onChangeAction({ country: e.target.value || undefined })}
        >
          <option value="">Country</option>
          {countries?.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>

        {/* Province */}
        <select
          className="rounded-xl border px-3 py-2"
          value={selected.province ?? ""}
          onChange={(e) => onChangeAction({ province: e.target.value || undefined })}
          disabled={!provinces?.length}
        >
          <option value="">Province</option>
          {provinces?.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>

        {/* City */}
        <select
          className="rounded-xl border px-3 py-2"
          value={selected.city ?? ""}
          onChange={(e) => onChangeAction({ city: e.target.value || undefined })}
          disabled={!cities?.length}
        >
          <option value="">City</option>
          {cities?.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>

        {/* District */}
        <select
          className="rounded-xl border px-3 py-2"
          value={selected.district ?? ""}
          onChange={(e) => onChangeAction({ district: e.target.value || undefined })}
          disabled={!districts?.length}
        >
          <option value="">District</option>
          {districts?.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>

        {/* Sort */}
        <select
          className="rounded-xl border px-3 py-2"
          value={selected.sort}
          onChange={(e) => onChangeAction({ sort: e.target.value as Selected["sort"] })}
        >
          <option value="name_asc">Name ↑</option>
          <option value="name_desc">Name ↓</option>
        </select>

        {/* Reset */}
        <button
          className="rounded-xl border px-3 py-2"
          onClick={onResetAction}
          type="button"
        >
          Reset
        </button>
      </div>

      {/* Services */}
      <div className="mt-4">
        <div className="mb-2 text-sm font-semibold">Services</div>
        <div className="flex flex-wrap gap-2">
          {services?.map((s) => {
            const active = selected.services.includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => toggleService(s)}
                className={`rounded-full border px-3 py-1 text-sm ${active ? "bg-gray-900 text-white" : "bg-white"}`}
              >
                {s}
              </button>
            );
          })}
          {!services?.length && (
            <div className="text-sm text-gray-500">Нет доступных услуг для выбранных условий.</div>
          )}
        </div>
      </div>
    </div>
  );
}
