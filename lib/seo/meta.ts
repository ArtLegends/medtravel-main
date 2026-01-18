// lib/seo/meta.ts
import type { Metadata } from 'next'

// Поддерживаемые локали
export type Locale = 'en' | 'ru' | 'pl'

export type LocationParts = {
  country?: string | null
  province?: string | null
  city?: string | null
  district?: string | null
}

function locToString(loc?: LocationParts) {
  if (!loc) return ''
  return [loc.country, loc.province, loc.city, loc.district].filter(Boolean).join(', ')
}

// Быстрый детект локали из префикса пути (‘/ru/...’, ‘/pl/...’) — EN по умолчанию
export function localeFromPathname(pathname: string): Locale {
  if (pathname.startsWith('/ru/')) return 'ru'
  if (pathname === '/ru') return 'ru'
  if (pathname.startsWith('/pl/')) return 'pl'
  if (pathname === '/pl') return 'pl'
  return 'en'
}

function formatCurrencySymbol(code?: string | null) {
  if (!code) return '€'
  const c = code.toUpperCase()
  switch (c) {
    case 'EUR': return '€'
    case 'USD': return '$'
    case 'GBP': return '£'
    case 'TRY': return '₺'
    case 'PLN': return 'zł'
    default:    return c
  }
}

// -------------------- ШАБЛОНЫ --------------------

// Категории верхнего уровня (dentists / hair-transplant / plastic-surgery)
function tplCategoryTitle(lng: Locale, catLabel: string, loc?: string) {
  const hasLoc = !!loc && loc.trim().length > 0;

  switch (lng) {
    case 'ru':
      return hasLoc
        ? `Лучшие ${catLabel} в ${loc} ▷ Доступная помощь за рубежом`
        : `Лучшие ${catLabel} с Medtravel ▷ Доступная помощь за рубежом`
    case 'pl':
      return hasLoc
        ? `Najlepsze ${catLabel} w ${loc} ▷ Tania opieka za granicą`
        : `Najlepsze ${catLabel} z Medtravel ▷ Tania opieka za granicą`
    default:
      return hasLoc
        ? `Best ${catLabel} in ${loc} ▷ Affordable Care Abroad`
        : `Best ${catLabel} ▷ Affordable Care Abroad`;
  }
}

function tplCategoryDesc(lng: Locale, catLabel: string, loc?: string) {
  const hasLoc = !!loc && loc.trim().length > 0;

  if (hasLoc) {
    switch (lng) {
      case 'ru':
        return `Найдите лучшие ${catLabel} в ${loc} с проверенными отзывами пациентов. ✔️ Прозрачные цены, англоговорящие врачи и бесплатные консультации.`
      case 'pl':
        return `Odkryj najlepsze ${catLabel} w ${loc} z opiniami pacjentów. ✔️ Przejrzyste ceny, anglojęzyczni specjaliści i 100% darmowe konsultacje.`
      default:
        return hasLoc
        ? `Discover best ${catLabel.toLowerCase()} in ${loc} with verified patient ratings. ✔️ Transparent costs, English-speaking doctors, and 100% free consultations.`
        : `Discover best ${catLabel.toLowerCase()} with verified patient ratings. ✔️ Transparent costs, English-speaking doctors, and 100% free consultations.`
    }
  }

  // без локации
  switch (lng) {
    case 'ru':
      return `Найдите лучшие ${catLabel} с Medtravel. ✔️ Прозрачные цены, англоговорящие врачи и бесплатные консультации по всему миру.`
    case 'pl':
      return `Odkryj najlepsze ${catLabel} z Medtravel. ✔️ Przejrzyste ceny, anglojęzyczni specjaliści i darmowe konsultacje w popularnych destynacjach.`
    default:
      return `Discover best ${catLabel.toLowerCase()} with verified patient ratings. ✔️ Transparent costs, English-speaking doctors, and 100% free consultations.`
  }
}

// Страница «Treatment» (процедура) с диапазоном цен
function tplTreatmentTitle(lng: Locale, treatment: string, loc: string) {
  switch (lng) {
    case 'ru':
      return `${treatment} в ${loc} – Цены и лучшие клиники 2026`
    case 'pl':
      return `${treatment} w ${loc} – Ceny i najlepsze kliniki 2026`
    default:
      return `${treatment} in ${loc} – Prices and Top Clinics 2026`
  }
}

function tplTreatmentDesc(
  lng: Locale,
  treatment: string,
  loc: string,
  min?: number | null,
  max?: number | null,
  currency?: string | null
) {
  const cur = formatCurrencySymbol(currency)

  // именно "costs from ... to ..."
  const pricePart =
    min != null && max != null
      ? (lng === 'ru'
          ? `стоит от ${min}${cur} до ${max}${cur}. `
          : lng === 'pl'
            ? `kosztuje od ${min}${cur} do ${max}${cur}. `
            : `costs from ${min}${cur} to ${max}${cur}. `)
      : (lng === 'ru'
          ? `цены зависят от клиники. `
          : lng === 'pl'
            ? `ceny zależą od kliniki. `
            : `costs vary by clinic. `)

  const head =
    lng === 'ru'
      ? `${treatment} в ${loc} ${pricePart}`
      : lng === 'pl'
        ? `${treatment} w ${loc} ${pricePart}`
        : `${treatment} in ${loc} ${pricePart}`

  const tail =
    lng === 'ru'
      ? `Сравните клиники с высокими рейтингами и получите бесплатный расчёт сегодня ★ Проверенные отзывы реальных пациентов.`
      : lng === 'pl'
        ? `Porównaj najlepiej oceniane kliniki i uzyskaj darmową wycenę już dziś ★ Zweryfikowane opinie pacjentów.`
        : `Compare top-rated clinics and get a free quote today ★ Verified reviews from real patients.`

  return head + tail
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
  address?: string | null,
  currency?: string | null
) {
  const cur = formatCurrencySymbol(currency)

  const minPart =
    min != null
      ? (lng === 'ru'
          ? `Цены от ${min}${cur}`
          : lng === 'pl'
            ? `Ceny od ${min}${cur}`
            : `Prices from ${min}${cur}`)
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
    categoryLabelEn: string
    categoryLabelRu?: string
    categoryLabelPl?: string
    location?: LocationParts
  }
): Metadata {
  const locale = localeFromPathname(pathname)
  const loc = locToString(params.location)

  const catLabel =
    locale === 'ru'
      ? (params.categoryLabelRu ?? params.categoryLabelEn)
      : locale === 'pl'
        ? (params.categoryLabelPl ?? params.categoryLabelEn)
        : params.categoryLabelEn

  const title = tplCategoryTitle(locale, catLabel, loc)
  const description = tplCategoryDesc(locale, catLabel, loc)

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
    currency?: string | null
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
    params.currency ?? null
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
    currency?: string | null
  }
): Metadata {
  const locale = localeFromPathname(pathname)
  const loc = locToString(params.location) || ''
  const title = tplClinicTitle(locale, params.clinicName, loc)
  const description = tplClinicDesc(
    locale,
    params.clinicName,
    params.minPrice ?? null,
    params.address ?? null,
    params.currency ?? null
  )
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
