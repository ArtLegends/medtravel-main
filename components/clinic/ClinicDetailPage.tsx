// components/clinic/ClinicDetailPage.tsx
'use client';
import Link from 'next/link'
import Image from 'next/image';
import ConsultationModal from '@/components/clinic/ConsultationModal';
import ReportModal from '@/components/clinic/ReportModal';
import { useMemo, useState, useEffect } from 'react';
import SectionNav from '@/components/SectionNav';
import type { Clinic } from '@/lib/db/clinics';
import { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/browserClient';
import { clinicPath } from '@/lib/clinic-url'
import { clinicHref } from '@/lib/clinic-url';

type Props = { clinic: Clinic };

type ReviewRow = { id: string; review: string | null; rating_overall: number | null; created_at: string | null };

type AmenityItem = { label: string; icon?: string | null };

function normalizeAmenityArray(raw: any): AmenityItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (typeof item === 'string') return { label: item, icon: 'check' };
      if (!item) return null;
      const label = String(item.label ?? '').trim();
      if (!label) return null;
      const icon = item.icon ? String(item.icon) : 'check';
      return { label, icon };
    })
    .filter(Boolean) as AmenityItem[];
}

const iconMap: Record<string, JSX.Element> = {
  check: (
    <span className="inline-block h-5 w-5 rounded-full bg-emerald-100 text-emerald-600 text-[11px] leading-5 text-center">
      ✓
    </span>
  ),
  bed: (
    <span className="inline-block h-5 w-5 rounded-full bg-emerald-100 text-emerald-600 text-[11px] leading-5 text-center">
      B
    </span>
  ),
  tooth: (
    <span className="inline-block h-5 w-5 rounded-full bg-emerald-100 text-emerald-600 text-[11px] leading-5 text-center">
      T
    </span>
  ),
  airplane: (
    <span className="inline-block h-5 w-5 rounded-full bg-emerald-100 text-emerald-600 text-[11px] leading-5 text-center">
      ✈
    </span>
  ),
  car: (
    <span className="inline-block h-5 w-5 rounded-full bg-emerald-100 text-emerald-600 text-[11px] leading-5 text-center">
      🚗
    </span>
  ),
  hotel: (
    <span className="inline-block h-5 w-5 rounded-full bg-emerald-100 text-emerald-600 text-[11px] leading-5 text-center">
      H
    </span>
  ),
  language: (
    <span className="inline-block h-5 w-5 rounded-full bg-emerald-100 text-emerald-600 text-[11px] leading-5 text-center">
      🌐
    </span>
  ),
  globe: (
    <span className="inline-block h-5 w-5 rounded-full bg-emerald-100 text-emerald-600 text-[11px] leading-5 text-center">
      G
    </span>
  ),
};

function AmenityPill({ item }: { item: AmenityItem }) {
  const Icon =
    iconMap[item.icon || 'check'] ?? iconMap['check'];
  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm">
      {Icon}
      <span>{item.label}</span>
    </div>
  );
}

// --- helpers ---
function buildMapEmbedFromAny(input?: string | null, fallbackAddress?: string | null) {
  const raw = (input ?? '').trim();
  const address = (fallbackAddress ?? '').trim();

  // 1) если пользователь вставил готовый <iframe ... src="..."> — выдернем src
  const m = raw.match(/src\s*=\s*["']([^"']+)["']/i);
  if (m?.[1]) return m[1];

  // 2) короткие ссылки лучше не встраивать — строим по адресу
  const isShort = /^https?:\/\/(maps\.app\.goo\.gl|goo\.gl)\/.+/i.test(raw);
  if (isShort && address) {
    return `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
  }

  // 3) “длинные” урлы Google Maps — большинство работает, но унифицируем
  const looksLikeGmaps = /^https?:\/\/(www\.)?google\.[^/]+\/maps/i.test(raw);
  if (looksLikeGmaps) {
    return `https://www.google.com/maps?q=${encodeURIComponent(raw)}&output=embed`;
  }

  // 4) просто текстовый адрес или пусто — используем адрес
  if (raw) {
    return `https://www.google.com/maps?q=${encodeURIComponent(raw)}&output=embed`;
  }
  if (address) {
    return `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
  }
  return null;
}

function normLangs(val?: string | string[]) {
  if (!val) return [];
  return Array.isArray(val) ? val : val.split(',').map(s => s.trim()).filter(Boolean);
}

function ClampText({
  text,
  lines = 3,
  className = '',
  minCharsToToggle = 140,
}: { text: string; lines?: 2 | 3 | 4; className?: string; minCharsToToggle?: number }) {
  const [expanded, setExpanded] = useState(false);
  const clampClass =
    lines === 2 ? 'line-clamp-2' :
      lines === 4 ? 'line-clamp-4' :
        'line-clamp-3';

  const showToggle = (text?.trim()?.length ?? 0) > minCharsToToggle;

  return (
    <div className={className}>
      <p className={expanded ? 'text-gray-700' : `text-gray-700 ${clampClass}`}>
        {text}
      </p>
      {showToggle && (
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          className="mt-1 text-sm font-medium text-emerald-700 hover:underline"
        >
          {expanded ? 'Read less' : 'Read more'}
        </button>
      )}
    </div>
  );
}

export default function ClinicDetailPage({ clinic }: Props) {
  const base = clinicPath({
    slug: clinic.slug,
    country: clinic.country,
    province: clinic.province,
    city: clinic.city,
    district: clinic.district,
  }) || `/clinic/${clinic.slug}`

  // нормализуем картинки из разных полей (images / gallery)
  const extra = clinic as any;

  const rawImages: any[] = [
    ...(Array.isArray(extra.images) ? extra.images : []),
    ...(Array.isArray(extra.gallery) ? extra.gallery : []),
  ];

  const imgs: string[] = rawImages
    .map((v) => {
      if (typeof v === 'string') return v;
      if (v && typeof v.url === 'string') return v.url;
      if (v && typeof v.image === 'string') return v.image;
      if (v && typeof v.src === 'string') return v.src;
      return null;
    })
    .filter((v): v is string => !!v && v.trim().length > 0);

    const paymentMethods: string[] = Array.isArray(extra.payments)
    ? Array.from(
        new Set(
          extra.payments
            .map((p: any) => {
              if (typeof p === 'string') return p;
              if (p && typeof p.method === 'string') return p.method;
              if (p && typeof p.name === 'string') return p.name;
              return null;
            })
            .filter(
              (v: unknown): v is string =>
                typeof v === 'string' && v.trim().length > 0
            ),
        ),
      )
    : [];
  
    const [open, setOpen] = useState(false)
  const [clickedService, setClickedService] = useState<string>('')

  // из данных клиники получаем список названий услуг:
  const servicesFromClinic = useMemo(
    () => Array.from(new Set((clinic?.services ?? []).map((s: any) => s?.name).filter(Boolean))),
    [clinic?.services]
  );

  // Doctors: поддержка старого и нового форматов
  const doctors = useMemo(() => {
    const src = (clinic as any).staff ?? (clinic as any).doctors ?? [];
    return (src as any[]).map((d, i) => ({
      name: d.name ?? d.full_name ?? `Doctor ${i + 1}`,
      title: d.position ?? d['Job Title'] ?? '',
      languages: normLangs(d.languages ?? d['Languages']),
      bio: d.bio ?? d['Biography'] ?? '',
      photo: d.photo_url ?? d.photo ?? d.image ?? d.avatar ?? '',
    }));
  }, [clinic]);

  // Additional services
  const services = (clinic as any).additionalServices ?? (clinic as any).servicesExtra ?? {};

  const amenities = (clinic as any).amenities || {};

const premises = normalizeAmenityArray(amenities.premises);
const clinicServices = normalizeAmenityArray(amenities.clinic_services);
const travelServices = normalizeAmenityArray(amenities.travel_services);
const languagesSpoken = normalizeAmenityArray(amenities.languages_spoken);

  // Accreditations
  const accs = useMemo(() => {
    const list: any[] = (clinic as any).accreditations ?? [];
    return list.map(a => ({
      name: a.name ?? a.title ?? '',
      logo: a.logoUrl ?? a.logo_url ?? a.logo ?? '',
      meta: a.description ?? a.country ?? a.desc ?? '',
    }));
  }, [clinic]);


  // адрес для отображения рядом с картой
  const address =
    clinic.location?.address ||
    [clinic.country, clinic.city, clinic.district].filter(Boolean).join(', ') || null;

  const mapSrc = useMemo(() => {
    const link =
      (clinic as any).map_embed_url ??
      (clinic as any).mapEmbedUrl ??
      clinic.location?.mapEmbedUrl ??
      '';
    return buildMapEmbedFromAny(link, address);
  }, [clinic, address]);

  const hasAbout = Boolean(clinic.about && clinic.about.trim());
  const allServices = (clinic.services ?? []) as any[];
  const hasTreatments = allServices.length > 0;
  const hasDoctors = doctors.length > 0;
  const hasPhotos = imgs.length > 0;
  const hasAccreditations = accs.length > 0;
  const hasHours = Array.isArray((clinic as any).hours) && (clinic as any).hours.length > 0;
  const hasLocation = Boolean(mapSrc || address);

  const sections = useMemo(() => {
    const s: { id: string; label: string }[] = [];
    if (hasAbout) s.push({ id: 'about', label: 'About the clinic' });
    if (hasTreatments) s.push({ id: 'treatments', label: 'Treatments & Prices' });
    if (hasDoctors) s.push({ id: 'staff', label: 'Staff' });
    if (hasPhotos) s.push({ id: 'photos', label: 'Transformation photos' });
    if (hasAccreditations) s.push({ id: 'accreditations', label: 'Accreditations' });
    if (hasHours) s.push({ id: 'hours', label: 'Operation Hours' });
    if (hasLocation) s.push({ id: 'location', label: 'Location' });
    return s;
  }, [hasAbout, hasTreatments, hasDoctors, hasPhotos, hasAccreditations, hasHours, hasLocation]);

  const [reportOpen, setReportOpen] = useState(false);

  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const supabase = useMemo(() => createClient(), []);

  const [showAllServices, setShowAllServices] = useState(false);
  const [showAllDoctors, setShowAllDoctors] = useState(false);

  const visibleServices = showAllServices ? allServices : allServices.slice(0, 5);
  const hasPrice = allServices.some(s => String(s?.price ?? '').trim() !== '');
  const hasDesc = allServices.some(s => String(s?.description ?? s?.duration ?? '').trim() !== '');

  const allDoctorsArr = doctors;
  const visibleDoctors = showAllDoctors ? allDoctorsArr : allDoctorsArr.slice(0, 5);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('reviews')
        .select('id, review, rating_overall, created_at')
        .eq('clinic_id', clinic.id)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(3);
      if (!cancelled) setReviews(data ?? []);
    })();
    return () => { cancelled = true; };
  }, [supabase, clinic.id]);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-10">
      {/* ===== HERO ===== */}
      <HeroGallery name={clinic.name} images={imgs} />

      {/* ===== NAVBAR СЕКЦИЙ ===== */}
      <div className="relative inset-x-0 pt-2 z-[60]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="rounded-xl border bg-white/95 shadow-sm backdrop-blur pointer-events-auto">
            <SectionNav sections={sections} />
          </div>
        </div>
      </div>

      {/* ===== GRID ===== */}
      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* ---------- MAIN ---------- */}
        <main className="min-w-0">
          {/* About */}
          {hasAbout && (
            <section id="about" className="space-y-3 pt-2">
              <div className="text-sm text-gray-500">
                {[clinic.country, clinic.city, clinic.district].filter(Boolean).join(', ')}
              </div>

              <h1 className="flex flex-wrap items-center gap-3 text-3xl font-semibold">
                {clinic.name}
              </h1>

              <div className="flex flex-wrap items-center gap-3">
                {clinic.verifiedByMedtravel && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                    ✓ Verified by medtravel.me
                  </span>
                )}
                {clinic.isOfficialPartner && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">
                    ✓ Official partner of medtravel.me
                  </span>
                )}
              </div>

              <ClampText text={clinic.about!} lines={4} />
            </section>
          )}

          {/* Treatments & Prices */}
          <section id="treatments" className="space-y-3 pt-10">
            <h2 className="text-2xl font-semibold">Treatments & Prices</h2>
            <div className="overflow-x-auto rounded-xl border">
              <table className="min-w-full divide-y">
                <thead className="bg-gray-50 text-left text-sm">
                  <tr>
                    <th className="p-3">Procedure</th>
                    {hasPrice && <th className="p-3">Price</th>}
                    {hasDesc && <th className="p-3">Description</th>}
                    <th className="p-3" />
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {visibleServices.map((s: any) => {
                    const desc = s?.description ?? s?.duration ?? '';
                    const priceText = s?.price
                      ? `${s.price}${s.currency ? ` ${s.currency}` : ''}`
                      : '—';

                    return (
                      <tr key={s.name}>
                        <td className="p-3 align-top">{s.name}</td>
                        {hasPrice && <td className="p-3 align-top">{priceText}</td>}
                        {hasDesc && (
                          <td className="p-3 align-top">
                            {desc
                              ? <ClampText text={desc} lines={3} minCharsToToggle={120} />
                              : '—'}
                          </td>
                        )}
                        <td className="p-3 align-top">
                          <button
                            className="rounded-md bg-primary px-3 py-2 text-white"
                            onClick={() => { setClickedService(s.name); setOpen(true); }}
                          >
                            Request
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {allServices.length > 5 && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setShowAllServices(v => !v)}
                  className="text-sm px-3 py-2 rounded-md border hover:bg-gray-50"
                >
                  {showAllServices ? 'Show less' : `View all (${allServices.length})`}
                </button>
              </div>
            )}

            {/* Accepted payment methods под таблицей */}
            {paymentMethods.length > 0 && (
              <div className="pt-4">
                <div className="mb-2 text-sm font-semibold">
                  Accepted payment methods
                </div>
                <div className="flex flex-wrap gap-2">
                  {paymentMethods.map((m) => (
                    <span
                      key={m}
                      className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs md:text-sm"
                    >
                      {/* здесь можно позже навесить иконки по ключевым словам */}
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>



          {/* Doctors */}
          <section id="staff" className="space-y-4 pt-10">
            <h2 className="text-2xl font-semibold">Doctors</h2>
            {doctors.length === 0 ? (
              <div className="rounded-xl border p-6 text-sm text-gray-500">No staff listed</div>
            ) : (
              <div className="space-y-4">
                {visibleDoctors.map((d, idx) => {
                  const hasPhoto = Boolean(d.photo);
                  return (
                    <article
                      key={`${d.name}-${idx}`}
                      className={`grid gap-4 rounded-xl border p-4 ${hasPhoto ? 'sm:grid-cols-[1fr_180px]' : ''}`}
                    >
                      <div>
                        <h3 className="text-lg font-medium">{d.name}</h3>
                        {d.title && <div className="text-sm text-gray-500">{d.title}</div>}

                        <div className="mt-3 space-y-2 text-sm">
                          {d.languages.length > 0 && (
                            <div>
                              <span className="font-semibold">Language Spoken:</span>
                              <ul className="ml-4 mt-1 list-disc">
                                {d.languages.map(l => <li key={l}>{l}</li>)}
                              </ul>
                            </div>
                          )}

                          {d.bio && (
                            <div>
                              <span className="font-semibold">Biography:</span>
                              <ClampText text={d.bio} lines={3} className="inline-block" />
                            </div>
                          )}
                        </div>

                        <div className="mt-3">
                          <button
                            type="button"
                            onClick={() => { setClickedService(''); setOpen(true) }}
                            className="rounded-md bg-primary px-3 py-2 text-white"
                          >
                            Request Appointment
                          </button>
                        </div>
                      </div>

                      {hasPhoto && (
                        <div className="sm:justify-self-end">
                          <div className="aspect-square w-[140px] overflow-hidden rounded-lg bg-gray-100 sm:w-[180px]">
                            <Image
                              src={d.photo}
                              alt={d.name}
                              width={360}
                              height={360}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
                {allDoctorsArr.length > 3 && (
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => setShowAllDoctors(v => !v)}
                      className="text-sm px-3 py-2 rounded-md border hover:bg-gray-50"
                    >
                      {showAllDoctors ? 'Show less' : `View all (${allDoctorsArr.length})`}
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Photos */}
          {hasPhotos && (
            <section id="photos" className="space-y-4 pt-10">
              <h2 className="text-2xl font-semibold">Transformation photos</h2>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {imgs.map(src => (
                  <div key={src} className="relative aspect-[4/3] overflow-hidden rounded-lg">
                    <Image
                      src={src}
                      alt="Clinic photo"
                      fill
                      sizes="(min-width:1024px) 33vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Additional Services */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Additional Services</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {premises.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-semibold">Premises</h3>
                  <div className="space-y-2">
                    {premises.map((a, i) => (
                      <AmenityPill key={i} item={a} />
                    ))}
                  </div>
                </div>
              )}
              {premises.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-semibold">Clinic Services</h3>
                  <div className="space-y-2">
                    {clinicServices.map((a, i) => (
                      <AmenityPill key={i} item={a} />
                    ))}
                  </div>
                </div>
              )}
              {premises.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-semibold">Travel Services</h3>
                  <div className="space-y-2">
                    {travelServices.map((a, i) => (
                      <AmenityPill key={i} item={a} />
                    ))}
                  </div>
                </div>
              )}
              {premises.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-semibold">Languages Spoken</h3>
                  <div className="space-y-2">
                    {languagesSpoken.map((a, i) => (
                      <AmenityPill key={i} item={a} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Accreditations */}
          {hasAccreditations && (
            <section id="accreditations" className="space-y-4 pt-10">
              <h2 className="text-2xl font-semibold">Accreditations</h2>
              <ul className="divide-y rounded-xl border">
                {accs.map((a, i) => (
                  <li key={`${a.name}-${i}`} className="flex items-center gap-4 p-4">
                    <div className="grid h-11 w-11 place-items-center overflow-hidden rounded-full bg-gray-100">
                      {a.logo ? (
                        <Image
                          src={a.logo}
                          alt={a.name}
                          width={44}
                          height={44}
                          className="object-contain"
                        />
                      ) : (
                        <span className="text-xs text-gray-400">•</span>
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{a.name}</div>
                      {a.meta && <div className="text-sm text-gray-500">{a.meta}</div>}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Hours */}
          {hasHours && (
            <section id="hours" className="space-y-4 pt-10">
              <h2 className="text-2xl font-semibold">Operation Hours</h2>
              <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {(clinic.hours ?? []).map((h: any, idx: number) => {
                  const isClosed = !h.open && !h.close;
                  return (
                    <li key={h.day ?? idx} className="rounded-md bg-gray-50 px-4 py-2">
                      <span className="font-semibold uppercase">
                        {h.day ?? h.weekday ?? ''}:
                      </span>{' '}
                      {isClosed ? 'Closed' : `${h.open} - ${h.close}`}
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {/* Location */}
          {hasLocation && (
            <section id="location" className="space-y-3 pt-10">
              <h2 className="text-2xl font-semibold">Location</h2>
              {address && <div className="text-sm">{address}</div>}
              {mapSrc ? (
                <div className="overflow-hidden rounded-lg border">
                  <div className="aspect-[16/9]">
                    <iframe
                      src={mapSrc!}
                      className="h-full w-full"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </div>
              ) : null}
            </section>
          )}

          {/* Reports */}
          <div className="pt-4">
            <button
              type="button"
              onClick={() => setReportOpen(true)}
              className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
            >
              Report
            </button>
          </div>

          {/* ====== Reviews (preview) ====== */}
          <section id="reviews" className="pt-10">
            <h2 className="text-2xl font-semibold mb-3">Reviews</h2>

            {reviews.length === 0 ? (
              <div className="rounded-xl border p-6 text-sm text-gray-500">No reviews yet.</div>
            ) : (
              <ul className="grid gap-4 md:grid-cols-2">
                {reviews.map(r => (
                  <li key={r.id} className="rounded-xl border p-4 bg-white">
                    <div className="flex items-center gap-2 text-amber-500 mb-2">
                      <Stars value={r.rating_overall ?? 0} />
                      <span className="text-xs text-gray-500">
                        {r.created_at ? new Date(r.created_at).toLocaleDateString() : ''}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-5">{r.review || '—'}</p>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-4">
              <Link
                href={clinicHref(clinic, 'review')}
                className="inline-flex rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
              >
                Write a Review
              </Link>
            </div>
          </section>
        </main>

        {/* ---------- SIDEBAR ---------- */}
        <aside className="space-y-4 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-auto">
          <div className="rounded-2xl border p-4">
            <div className="mb-3 w-full rounded-md px-4 py-3 text-primary text-center font-semibold text-lg">
              Start Your<br /> Personalized Treatment Plan Today
            </div>
            <Link
              href={clinicHref(clinic, 'inquiry')}
              className="block w-full rounded-md bg-emerald-600 px-4 py-3 text-center font-medium text-white hover:bg-emerald-700"
            >
              Claim Your Free Quote
            </Link>
          </div>
        </aside>
      </div>

      <ConsultationModal
        open={open}
        onClose={() => setOpen(false)}
        clinicId={clinic.id}                // uuid клиники
        services={servicesFromClinic}       // список названий
        preselectedService={clickedService}
      />

      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        clinicId={clinic.id}
      />

    </div>
  );
}

/* ---------- HERO GALLERY ---------- */
function HeroGallery({ images, name }: { images: string[]; name: string }) {
  const list = images.filter(Boolean).slice(0, 5);
  if (list.length === 0) return null;

  return (
    <div className="relative z-0 grid grid-cols-12 gap-3 pt-6">
      {/* big */}
      <div className="col-span-12 md:col-span-8">
        <div className="relative overflow-hidden rounded-2xl">
          <Image
            src={list[0]}
            alt={`${name} main photo`}
            width={1600}
            height={900}
            priority
            className="block w-full h-[340px] md:h-[420px] object-cover"
          />
        </div>
      </div>

      {/* right column - up to 2 thumbs */}
      <div className="col-span-12 grid gap-3 md:col-span-4">
        {list.slice(1, 3).map((src) => (
          <div key={src} className="relative overflow-hidden rounded-2xl">
            <Image
              src={src}
              alt={`${name} photo`}
              width={800}
              height={800}
              className="block w-full h-[160px] md:h-[200px] object-cover"
            />
          </div>
        ))}
      </div>

      {/* bottom thumbnails (up to 2 more) */}
      {list.slice(3).map((src) => (
        <div key={src} className="col-span-6 md:col-span-3">
          <div className="relative overflow-hidden rounded-2xl">
            <Image
              src={src}
              alt={`${name} photo`}
              width={800}
              height={800}
              className="block w-full h-[160px] md:h-[200px] object-cover"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Small card list for Additional Services ---------- */
function CardList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border p-6">
      <div className="mb-3 text-lg font-semibold">{title}</div>
      <ul className="space-y-2">
        {items.map(v => (
          <li key={v} className="flex items-start gap-2">
            <span className="mt-0.5 text-emerald-600">✓</span>
            <span>{v}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Stars({ value }: { value: number }) {
  const v = Math.max(0, Math.min(10, Math.round(value)));
  return (
    <div className="flex items-center" aria-label={`Rating ${v} out of 10`}>
      {Array.from({ length: 10 }).map((_, i) => (
        <svg
          key={i}
          className={`h-4 w-4 ${i < v ? 'fill-amber-500' : 'fill-gray-200'}`}
          viewBox="0 0 20 20"
        >
          <path d="M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L10 14.9 4.7 17.6l1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
        </svg>
      ))}
    </div>
  );
}
