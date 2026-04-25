// lib/clinic-url.ts

// Нормализация сегмента URL: латиница/цифры, дефисы, без диакритики
const norm = (s?: string | null): string =>
  (s ?? '')
    .toLowerCase()
    .trim()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');

export type ClinicUrlBits = {
  slug: string;
  country?: string | null;
  province?: string | null;
  city?: string | null;
  district?: string | null;
};

/**
 * Базовый путь к клинике:
 *  /country/province?/city/district?/slug
 * Если нет минимально нужных данных (country + city + slug), даём фолбэк /clinic/:slug
 */
export function clinicPath(c: ClinicUrlBits): string {
  const country = norm(c.country);
  const city    = norm(c.city);
  const province = norm(c.province);
  const district = norm(c.district);
  const slug     = encodeURIComponent(c.slug);

  // минимально нужно: country + city + slug
  if (!country || !city || !c.slug) {
    return `/clinic/${slug}`;
  }

  // province и district — строго опциональны и могут отсутствовать независимо друг от друга
  const segs = [country];
  if (province) segs.push(province);
  segs.push(city);
  if (district) segs.push(district);

  return `/${segs.join('/')}/${slug}`;
}

/**
 * Полный href, с опциональным «хвостом»:
 *   clinicHref(bits)                -> /country/.../slug
 *   clinicHref(bits, 'review')      -> /country/.../slug/review
 *   clinicHref(bits, 'inquiry')     -> /country/.../slug/inquiry
 * Фолбэк на /clinic/:slug[/:tail] при нехватке данных.
 */
export function clinicHref(
  c: ClinicUrlBits,
  tail?: 'review' | 'inquiry'
): string {
  const base = clinicPath(c);

  // если ушли в фолбэк /clinic/:slug — всё равно корректно добавим хвост
  return tail ? `${base.replace(/\/$/, '')}/${tail}` : base;
}

export { norm };
