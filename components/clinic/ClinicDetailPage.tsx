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

// --- helpers ---
function buildMapEmbed(address?: string | null) {
  if (!address) return null; // ← важно: не возвращаем пустую строку
  const q = encodeURIComponent(address);
  return `https://www.google.com/maps?q=${q}&output=embed`;
}

function normLangs(val?: string | string[]) {
  if (!val) return [];
  return Array.isArray(val) ? val : val.split(',').map(s => s.trim()).filter(Boolean);
}

export default function ClinicDetailPage({ clinic }: Props) {
  const base = clinicPath({
    slug: clinic.slug,
    country: clinic.country,
    province: clinic.province,
    city: clinic.city,
    district: clinic.district,
  }) || `/clinic/${clinic.slug}`

  const sections = useMemo(
    () => [
      { id: 'about', label: 'About the clinic' },
      { id: 'treatments', label: 'Treatments & Prices' },
      { id: 'staff', label: 'Staff' },
      { id: 'photos', label: 'Transformation photos' },
      { id: 'accreditations', label: 'Accreditations' },
      { id: 'hours', label: 'Operation Hours' },
      { id: 'location', label: 'Location' },
    ],
    []
  );

  // убираем пустые строки, чтобы <Image> не падал
  const imgs = (clinic.images ?? []).filter(Boolean);

  const [open, setOpen] = useState(false)
  const [clickedService, setClickedService] = useState<string>('')

  // из данных клиники получаем список названий услуг:
  const servicesFromClinic = useMemo(
    () =>
      Array.from(
        new Set((clinic?.services ?? []).map((s: any) => s?.name).filter(Boolean))
      ),
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
  const premises: string[] = services.premises ?? [];
  const clinicServices: string[] = services.clinic_services ?? [];
  const travelServices: string[] = services.travel_services ?? [];
  const languagesSpoken: string[] = services.languages_spoken ?? [];

  // Accreditations
  const accs = useMemo(() => {
    const list: any[] = (clinic as any).accreditations ?? [];
    return list.map(a => ({
      name: a.name ?? a.title ?? '',
      // было a.logo_url ?? a.logo — добавляем logoUrl
      logo: a.logoUrl ?? a.logo_url ?? a.logo ?? '',
      meta: a.description ?? a.country ?? a.desc ?? '',
    }));
  }, [clinic]);


  // ----- адрес и карта (без пустого src) -----
  const address =
    clinic.location?.address ||
    [clinic.country, clinic.city, clinic.district].filter(Boolean).join(', ') ||
    null;

  const mapSrc = clinic.location?.mapEmbedUrl ?? buildMapEmbed(address);

  const [reportOpen, setReportOpen] = useState(false);

  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const supabase = useMemo(() => createClient(), []);

  // показывать весь список или только первые 5
  const [showAllServices, setShowAllServices] = useState(false);
  const [showAllDoctors, setShowAllDoctors] = useState(false);

  // вью-массивы
  const allServices = (clinic.services ?? []) as any[];
  const visibleServices = showAllServices ? allServices : allServices.slice(0, 5);

  // есть ли вообще цены/описания среди услуг
  const hasPrice = allServices.some(s => String(s?.price ?? '').trim() !== '');
  const hasDesc = allServices.some(s => String(s?.description ?? s?.duration ?? '').trim() !== '');

  const allDoctors = doctors; // уже рассчитан useMemo выше
  const visibleDoctors = showAllDoctors ? allDoctors : allDoctors.slice(0, 5);

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
          <section id="about" className="space-y-3 pt-2">
            <div className="text-sm text-gray-500">
              {[clinic.country, clinic.city, clinic.district].filter(Boolean).join(', ')}
            </div>

            <h1 className="flex flex-wrap items-center gap-3 text-3xl font-semibold">
              {clinic.name}
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
            </h1>

            {clinic.about && <p className="text-gray-700">{clinic.about}</p>}
          </section>

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
                    return (
                      <tr key={s.name}>
                        <td className="p-3">{s.name}</td>
                        {hasPrice && <td className="p-3">{s.price ?? '—'}</td>}
                        {hasDesc && <td className="p-3">{desc || '—'}</td>}
                        <td className="p-3">
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
          </section>

          {/* Doctors */}
          <section id="staff" className="space-y-4 pt-10">
            <h2 className="text-2xl font-semibold">Doctors</h2>
            {doctors.length === 0 ? (
              <div className="rounded-xl border p-6 text-sm text-gray-500">No staff listed</div>
            ) : (
              <div className="space-y-4">
                {visibleDoctors.map((d, idx) => (
                  <article
                    key={`${d.name}-${idx}`}
                    className="grid gap-4 rounded-xl border p-4 sm:grid-cols-[1fr_180px]"
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
                            <span className="font-semibold">Biography:</span>{' '}
                            <span>{d.bio}</span>
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

                    <div className="sm:justify-self-end">
                      <div className="aspect-square w-[140px] overflow-hidden rounded-lg bg-gray-100 sm:w-[180px]">
                        {d.photo && (
                          <Image
                            src={d.photo}
                            alt={d.name}
                            width={360}
                            height={360}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                    </div>
                  </article>
                ))}
                {allDoctors.length > 5 && (
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => setShowAllDoctors(v => !v)}
                      className="text-sm px-3 py-2 rounded-md border hover:bg-gray-50"
                    >
                      {showAllDoctors ? 'Show less' : `View all (${allDoctors.length})`}
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Photos */}
          <section id="photos" className="space-y-4 pt-10">
            <h2 className="text-2xl font-semibold">Transformation photos</h2>
            {imgs.length === 0 ? (
              <div className="rounded-xl border p-6 text-sm text-gray-500">No photos yet</div>
            ) : (
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
            )}
          </section>

          {/* Additional Services */}
          {(premises.length || clinicServices.length || travelServices.length || languagesSpoken.length) ? (
            <section className="space-y-6 pt-10">
              <h2 className="text-2xl font-semibold">Additional Services</h2>

              <div className="grid gap-6 md:grid-cols-2">
                {premises.length > 0 && <CardList title="Premises" items={premises} />}
                {clinicServices.length > 0 && <CardList title="Clinic services" items={clinicServices} />}
                {travelServices.length > 0 && <CardList title="Travel services" items={travelServices} />}
                {languagesSpoken.length > 0 && <CardList title="Languages spoken" items={languagesSpoken} />}
              </div>
            </section>
          ) : null}

          {/* Accreditations */}
          <section id="accreditations" className="space-y-4 pt-10">
            <h2 className="text-2xl font-semibold">Accreditations</h2>
            {accs.length === 0 ? (
              <div className="rounded-xl border p-6 text-sm text-gray-500">No accreditations listed</div>
            ) : (
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
            )}
          </section>

          {/* Hours */}
          <section id="hours" className="space-y-4 pt-10">
            <h2 className="text-2xl font-semibold">Operation Hours</h2>
            <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {(clinic.hours ?? []).map((h: any, idx: number) => {
                const isClosed = !h.open && !h.close; // день закрыт
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

          {/* Location */}
          <section id="location" className="space-y-3 pt-10">
            <h2 className="text-2xl font-semibold">Location</h2>
            {address && <div className="text-sm">{address}</div>}
            {mapSrc ? (
              <div className="overflow-hidden rounded-lg border">
                <div className="aspect-[16/9]">
                  <iframe
                    src={mapSrc}
                    className="h-full w-full"
                    loading="lazy"
                  />
                </div>
              </div>
            ) : (
              <div className="rounded-lg border p-4 text-sm text-gray-500">
                Map is not available for this clinic.
              </div>
            )}
          </section>

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
        <aside className="space-y-4">
          <div className="rounded-2xl border p-4">
            <div className="mb-3 w-full rounded-md px-4 py-3 text-primary text-center font-semibold text-lg">
              Start Your<br></br> Personalized Treatment Plan Today
            </div>

            <Link
              href={clinicHref(clinic, 'inquiry')}
              className="block w-full rounded-md bg-emerald-600 px-4 py-3 text-center font-medium text-white hover:bg-emerald-700"
            >
              Claim Your Free Quote
            </Link>
          </div>

          {clinic.payments?.length ? (
            <div className="rounded-2xl border p-4">
              <div className="mb-2 text-sm font-semibold">Accepted payment methods</div>
              <div className="flex flex-wrap gap-2">
                {clinic.payments.map((p: string) => (
                  <span key={p} className="rounded-full border px-2.5 py-1 text-xs">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
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
