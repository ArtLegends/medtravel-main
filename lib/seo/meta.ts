// lib/seo/meta.ts
import type { Metadata } from 'next'

// Поддерживаемые локали
export type Locale = 'en' | 'ru' | 'pl'

export type LocationParts = {
  country?: string | null
  city?: string | null
  district?: string | null
}

// Country, City, District
function locToString(loc?: LocationParts) {
  if (!loc) return ''
  return [loc.country, loc.city, loc.district].filter(Boolean).join(', ')
}

// Быстрый детект локали из префикса пути (‘/ru/...’, ‘/pl/...’) — EN по умолчанию
export function localeFromPathname(pathname: string): Locale {
  if (pathname.startsWith('/ru/')) return 'ru'
  if (pathname === '/ru') return 'ru'
  if (pathname.startsWith('/pl/')) return 'pl'
  if (pathname === '/pl') return 'pl'
  return 'en'
}

// -------------------- ШАБЛОНЫ --------------------

// Категории верхнего уровня (dentists / hair-transplant / plastic-surgery)
function tplCategoryTitle(lng: Locale, catLabel: string, loc: string) {
  switch (lng) {
    case 'ru':
      // «Лучшие стоматологические клиники в Turkey, Istanbul ▷ ...»
      return `Лучшие ${catLabel} в ${loc} ▷ Доступная помощь за рубежом`
    case 'pl':
      return `Najlepsze ${catLabel} w ${loc} ▷ Tania opieka za granicą`
    default:
      return `Best ${catLabel} in ${loc} ▷ Affordable Care Abroad`
  }
}

function tplCategoryDesc(lng: Locale, catLabel: string, loc: string) {
  switch (lng) {
    case 'ru':
      return `Найдите лучшие ${catLabel} в ${loc} с проверенными отзывами пациентов. ✔️ Прозрачные цены, англоговорящие врачи и бесплатные консультации.`
    case 'pl':
      return `Odkryj najlepsze ${catLabel} w ${loc} z opiniami pacjentów. ✔️ Przejrzyste ceny, anglojęzyczni specjaliści i 100% darmowe konsultacje.`
    default:
      return `Discover best ${catLabel} in ${loc} with verified patient ratings. ✔️ Transparent costs, English-speaking doctors, and 100% free consultations.`
  }
}

// Страница «Treatment» (процедура) с диапазоном цен
function tplTreatmentTitle(lng: Locale, treatment: string, loc: string) {
  switch (lng) {
    case 'ru':
      return `${treatment} в ${loc} – Цены и лучшие клиники 2025`
    case 'pl':
      return `${treatment} w ${loc} – Ceny i najlepsze kliniki 2025`
    default:
      return `${treatment} in ${loc} – Prices and Top Clinics 2025`
  }
}

function tplTreatmentDesc(
  lng: Locale,
  treatment: string,
  loc: string,
  min?: number | null,
  max?: number | null,
  currency = '€'
) {
  const pricePart =
    min != null && max != null
      ? (lng === 'ru'
          ? `${treatment} в ${loc} стоит от ${min}${currency} до ${max}${currency}.`
          : lng === 'pl'
            ? `${treatment} w ${loc} kosztuje od ${min}${currency} do ${max}${currency}.`
            : `${treatment} in ${loc} costs from ${min}${currency} to ${max}${currency}.`)
      : (lng === 'ru'
          ? `Узнайте цены и сравните предложения.`
          : lng === 'pl'
            ? `Poznaj ceny i porównaj oferty.`
            : `See prices and compare offers.`)

  const tail =
    lng === 'ru'
      ? ` Сравните клиники с высокими рейтингами и получите бесплатную консультацию ★ Проверенные отзывы реальных пациентов.`
      : lng === 'pl'
        ? ` Porównaj najlepiej oceniane kliniki i uzyskaj darmową wycenę ★ Zweryfikowane opinie pacjentów.`
        : ` Compare top-rated clinics and get a free quote ★ Verified reviews from real patients.`

  return pricePart + tail
}

// Карточка клиники (детальная)
function tplClinicTitle(lng: Locale, clinicName: string, loc: string) {
  switch (lng) {
    case 'ru':
      return `${clinicName} в ${loc} – Отзывы и цены | Medtravel.me`
    case 'pl':
      return `${clinicName} w ${loc} – Opinie i ceny | Medtravel.me`
    default:
      return `${clinicName} in ${loc} – Reviews & Prices | Medtravel.me`
  }
}

function tplClinicDesc(
  lng: Locale,
  clinicName: string,
  min?: number | null,
  address?: string | null
) {
  const minPart =
    min != null
      ? (lng === 'ru'
          ? `Цены от ${min}€`
          : lng === 'pl'
            ? `Ceny od ${min}€`
            : `Prices from ${min}€`)
      : (lng === 'ru'
          ? `Прозрачные цены`
          : lng === 'pl'
            ? `Przejrzyste ceny`
            : `Transparent prices`)

  const body =
    lng === 'ru'
      ? `Бесплатная консультация ★ ${minPart} – Получите быстрый расчёт ★ Узнайте о процедурах в ${clinicName} ★ Отзывы пациентов и прозрачные цены | Medtravel.me – сравнивайте клиники и получайте помощь экспертов.`
      : lng === 'pl'
        ? `Bezpłatna konsultacja ★ ${minPart} – Uzyskaj szybką wycenę ★ Poznaj zabiegi w ${clinicName} ★ Opinie pacjentów i przejrzyste ceny | Medtravel.me – porównuj kliniki i uzyskaj pomoc ekspertów.`
        : `Free consultation ★ ${minPart} – Get a quick quote ★ Discover treatments at ${clinicName} ★ Patient reviews & transparent prices | Medtravel.me – compare clinics and get expert assistance.`

  const addr =
    address
      ? (lng === 'ru'
          ? ` ✔ Адрес: ${address}`
          : lng === 'pl'
            ? ` ✔ Adres: ${address}`
            : ` ✔ Address: ${address}`)
      : ''

  return body + addr
}

// -------------------- ПУБЛИЧНОЕ API --------------------

// 1) Категория (верхний уровень)
export function buildCategoryMetadata(
  pathname: string,
  params: {
    // читаемое название категории для шаблона (Dentistry, Hair Transplant, Plastic Surgery ...)
    categoryLabelEn: string
    // переводы ярлыка категории для RU/PL (если есть)
    categoryLabelRu?: string
    categoryLabelPl?: string
    location?: LocationParts
  }
): Metadata {
  const locale = localeFromPathname(pathname)
  const loc = locToString(params.location)

  // корректный ярлык категории под локаль
  const catLabel =
    locale === 'ru'
      ? (params.categoryLabelRu ?? params.categoryLabelEn)
      : locale === 'pl'
        ? (params.categoryLabelPl ?? params.categoryLabelEn)
        : params.categoryLabelEn

  const title = tplCategoryTitle(locale, catLabel, loc || 'Popular Destinations')
  const description = tplCategoryDesc(locale, catLabel, loc || 'popular destinations')

  return duplicateToOgAndTwitter({ title, description })
}

// 2) Treatment (процедура внутри категории)
export function buildTreatmentMetadata(
  pathname: string,
  params: {
    treatmentLabel: string
    location?: LocationParts
    minPrice?: number | null
    maxPrice?: number | null
    currency?: string // по умолчанию €
  }
): Metadata {
  const locale = localeFromPathname(pathname)
  const loc = locToString(params.location) || 'Popular Destinations'
  const title = tplTreatmentTitle(locale, params.treatmentLabel, loc)
  const description = tplTreatmentDesc(
    locale,
    params.treatmentLabel,
    loc,
    params.minPrice ?? null,
    params.maxPrice ?? null,
    params.currency ?? '€'
  )
  return duplicateToOgAndTwitter({ title, description })
}

// 3) Карточка клиники
export function buildClinicMetadata(
  pathname: string,
  params: {
    clinicName: string
    location?: LocationParts
    minPrice?: number | null
    address?: string | null
  }
): Metadata {
  const locale = localeFromPathname(pathname)
  const loc = locToString(params.location) || ''
  const title = tplClinicTitle(locale, params.clinicName, loc)
  const description = tplClinicDesc(locale, params.clinicName, params.minPrice ?? null, params.address ?? null)
  return duplicateToOgAndTwitter({ title, description })
}

// Дублируем Title/Description в OG и Twitter, как просили
function duplicateToOgAndTwitter(base: { title: string; description: string }): Metadata {
  return {
    title: base.title,
    description: base.description,
    openGraph: {
      title: base.title,
      description: base.description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: base.title,
      description: base.description,
    },
  }
}
