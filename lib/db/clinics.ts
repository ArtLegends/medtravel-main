// lib/db/clinics.ts
import { supabaseServer } from '@/lib/supabase/server'

/** Карточка для листинга по категории */
export type ClinicListItem = {
  slug: string
  name: string
  country?: string
  city?: string
  district?: string
  tags?: string[]
}

/** Полный объект клиники, который потребляет UI */
export type Clinic = {
  prices: never[]
  id: string
  slug: string
  name: string
  about?: string
  country?: string
  province?: string
  city?: string
  district?: string

  verifiedByMedtravel?: boolean
  isOfficialPartner?: boolean

  images: string[]

  services: Array<{
    name: string
    price?: number
    currency?: string
    description?: string
  }>

  hours: Array<{
    day: string         // Mon..Sun
    open?: string       // HH:MM
    close?: string      // HH:MM
  }>

  staff: Array<{
    name: string
    position?: string
    languages: string[]
    bio?: string
    photo?: string
    // совместимость со старым UI
    experienceYears?: number
    specialisations?: string[]
  }>

  accreditations: Array<{
    name: string
    logoUrl?: string
    // для совместимости с текущим UI — дублируем:
    // @ts-ignore
    logo_url?: string
    description?: string
  }>

  additionalServices?: {
    premises?: string[]
    clinic_services?: string[]
    travel_services?: string[]
    languages_spoken?: string[]
  }

  payments: { method: string }[] | null;
  location?: { address?: string; mapEmbedUrl?: string }
}

/* ===== «сырые» строки из БД ===== */
type DBClinic = {
  id: string
  slug: string
  name: string
  country: string | null
  province: string | null
  city: string | null
  district: string | null
  about: string | null
  status: string | null
  amenities: any | null
  verified_by_medtravel: boolean | null
  is_official_partner?: boolean | null
  official_partner?: boolean | null
  address?: string | null
  map_embed_url?: string | null
}

type DBImage = { url: string | null; title?: string | null; sort?: number | null } | null

// связующая таблица clinic_services
type DBServiceLink = {
  service_id: number | null
  price: number | null
  currency: string | null
} | null

// каталог услуг (таблица services)
type DBServiceCatalog = {
  id: number
  name: string
  description: string | null
} | null

// «готовый» элемент сервисов, который передаём в toClinic
type DBService = {
  name: string
  price: number | null
  currency: string | null
  description: string | null
} | null

type DBHour = { weekday: number | null; open: string | null; close: string | null; is_closed: boolean | null } | null
type DBStaff = { name: string; position: string | null; languages: string[] | null; bio: string | null; photo_url: string | null } | null
type DBAccr = { id: number; name: string; logo_url: string | null; description: string | null } | null

/* ===== утилиты форматирования ===== */
const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const hhmm = (v: string | null | undefined) => (v ? v.slice(0, 5) : undefined)

/** формируем объект Clinic из «сырых» данных */
function toClinic(row: DBClinic, parts: {
  images: DBImage[] | null
  services: DBService[] | null
  hours: DBHour[] | null
  staff: DBStaff[] | null
  accreditations: DBAccr[] | null
}): Clinic {
  const clean = (v?: string | null) => (v && v.trim() ? v.trim() : undefined)

  const address =
  clean(row.address) ??
  clean([row.country, row.city, row.district].filter(Boolean).join(', ')) ??
  undefined

  const images = (parts.images ?? [])
    .map(i => (i?.url || '').trim())
    .filter(Boolean) as string[]

  const services = (parts.services ?? [])
    .map(s => ({
      name: s?.name ?? '',
      price: s?.price ?? undefined,
      currency: s?.currency ?? undefined,
      description: s?.description ?? ''
    }))
    .filter(s => s.name.trim().length > 0)

  // Всегда 7 дней (БД хранит 1..7)
  const hours: Clinic['hours'] = []
  const byW = new Map<number, DBHour>()
  ;(parts.hours ?? []).forEach(h => {
    const w = h?.weekday ?? null
    if (w !== null) byW.set(w, h!)
  })
  for (let w = 1; w <= 7; w++) {
    const h = byW.get(w)
    const day = DOW[(w - 1) % 7]
    if (!h || h.is_closed) hours.push({ day })
    else hours.push({ day, open: hhmm(h.open), close: hhmm(h.close) })
  }

  const staff = (parts.staff ?? []).map(p => ({
    name: p?.name ?? '',
    position: p?.position ?? '',
    languages: p?.languages ?? [],
    bio: p?.bio ?? '',
    photo: p?.photo_url ?? undefined,
    experienceYears: undefined,
    specialisations: undefined
  }))

  // кладём и logoUrl, и logo_url — ради совместимости текущего UI
  const accreditations = (parts.accreditations ?? []).map(a => {
    const logo = a?.logo_url ?? undefined
    return {
      name: a?.name ?? '',
      logoUrl: logo,
      // @ts-ignore
      logo_url: logo,
      description: a?.description ?? ''
    }
  })

  return {
  id: row.id,
  slug: row.slug,
  name: row.name,
  about: row.about ?? undefined,
  country: row.country ?? undefined,
  city: row.city ?? undefined,
  district: row.district ?? undefined,

  verifiedByMedtravel: !!row.verified_by_medtravel,
  isOfficialPartner: (row.is_official_partner ?? row.official_partner) ?? false,

  images,
  services,
  hours,
  staff,
  accreditations,

  additionalServices: row.amenities ?? undefined,

  payments: [],
  location: (address || row.map_embed_url) ? {
    address,
    mapEmbedUrl: row.map_embed_url ?? undefined
  } : undefined,
  prices: [],
}
}

/* ================= ПУБЛИЧНЫЕ ФУНКЦИИ ================= */

/** Детальная клиники по slug — данные только из Supabase */
export async function fetchClinicBySlug(slug: string): Promise<Clinic | null> {
  const sb = supabaseServer

  const { data: clinicRow, error: clinicErr } = await sb
    .from('clinics')
    .select('*')
    .eq('slug', slug)
    .maybeSingle<DBClinic>()

  if (clinicErr) {
    console.error('fetchClinicBySlug[clinics]:', clinicErr)
    return null
  }
  if (!clinicRow) return null

  const clinicId = clinicRow.id

  const [
    { data: imagesData } = { data: [] as DBImage[] },
    { data: svcLinks } = { data: [] as DBServiceLink[] },              // <-- clinic_services
    { data: hoursData } = { data: [] as DBHour[] },
    { data: staffData } = { data: [] as DBStaff[] },
    { data: linkAccrs } = { data: [] as { accreditation_id: number }[] }
  ] = await Promise.all([
    sb.from('clinic_images')
      .select('url,title,sort')
      .eq('clinic_id', clinicId)
      .order('sort', { ascending: true }) as any,

    sb.from('clinic_services')
      .select('service_id,price,currency')
      .eq('clinic_id', clinicId) as any,

    sb.from('clinic_hours')
      .select('weekday,open,close,is_closed')
      .eq('clinic_id', clinicId) as any,

    sb.from('clinic_staff')
      .select('name,position,languages,bio,photo_url')
      .eq('clinic_id', clinicId) as any,

    sb.from('clinic_accreditations')
      .select('accreditation_id')
      .eq('clinic_id', clinicId) as any
  ])

  /* ----- услуги: подтягиваем названия/описания из services ----- */
  let servicesData: DBService[] = []
  const ids: number[] = (svcLinks ?? [])
    .map((l: DBServiceLink) => l?.service_id)
    .filter((v: number | null | undefined): v is number => typeof v === 'number')

  if (ids.length) {
    const { data: catalog } = await sb
      .from('services')
      .select('id,name,description')
      .in('id', ids)

    const byId = new Map<number, NonNullable<DBServiceCatalog>>(
      (catalog ?? []).map(r => [r!.id, r!])
    )

    servicesData = (svcLinks ?? []).map((link: DBServiceLink): DBService => {
      const cat = link?.service_id != null ? byId.get(link.service_id) : undefined
      return {
        name: cat?.name ?? '',
        description: cat?.description ?? '',
        price: link?.price ?? null,
        currency: link?.currency ?? null
      }
    })
  }

  /* ----- аккредитации ----- */
  let accrsData: DBAccr[] = []
  const accrIds: number[] = (linkAccrs ?? [])
    .map((x: { accreditation_id: number }) => x.accreditation_id)
    .filter((v: number | undefined): v is number => typeof v === 'number')

  if (accrIds.length) {
    const { data } = await sb
      .from('accreditations')
      .select('id,name,logo_url,description')
      .in('id', accrIds)
    accrsData = (data ?? []) as DBAccr[]
  }

  return toClinic(clinicRow, {
    images: imagesData ?? [],
    services: servicesData ?? [],             // <-- со склеенными именами/описаниями
    hours: hoursData ?? [],
    staff: staffData ?? [],
    accreditations: accrsData ?? []
  })
}

/** Список клиник для страницы категории — также из Supabase */
export async function fetchClinicsByCategory(
  categorySlug: string,
  limit = 24
): Promise<ClinicListItem[]> {
  const sb = supabaseServer

  const { data: cat } = await sb
    .from('categories')
    .select('id')
    .eq('slug', categorySlug)
    .maybeSingle()

  if (!cat?.id) return []

  const { data: links } = await sb
    .from('clinic_categories')
    .select('clinic_id')
    .eq('category_id', cat.id)
    .limit(500)

  const clinicIds = (links ?? []).map(l => l.clinic_id).filter(Boolean)
  if (!clinicIds.length) return []

  const { data: rows } = await sb
    .from('clinics')
    .select('slug,name,country,city,district')
    .in('id', clinicIds)
    .limit(limit)

  return (rows ?? []).map(r => ({
    slug: r.slug,
    name: r.name,
    country: r.country ?? undefined,
    city: r.city ?? undefined,
    district: r.district ?? undefined,
    tags: []
  }))
}
