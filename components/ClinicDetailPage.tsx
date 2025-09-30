'use client';

import Image from 'next/image';
import ConsultationModal from '@/components/clinic/ConsultationModal';
import { useMemo, useState } from 'react';
import SectionNav from '@/components/SectionNav';
import type { ClinicMock } from '@/lib/mock/clinic';

type Props = { clinic: ClinicMock };

// --- helpers ---
function buildMapEmbed(address?: string) {
  if (!address) return '';
  const q = encodeURIComponent(address);
  return `https://www.google.com/maps?q=${q}&output=embed`;
}

function normLangs(val?: string | string[]) {
  if (!val) return [];
  return Array.isArray(val) ? val : val.split(',').map(s => s.trim()).filter(Boolean);
}

export default function ClinicDetailPage({ clinic }: Props) {
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

  const imgs = clinic.images ?? [];

  const [modalOpen, setModalOpen] = useState(false);
  const [modalService, setModalService] = useState<string | undefined>(undefined);

  // массив названий услуг клиники (для селекта модалки)
  const serviceNames = useMemo(
    () => (clinic.services ?? []).map((s: any) => s.name).filter(Boolean),
    [clinic.services]
  );

  // хелперы
  function openModal(service?: string) {
    setModalService(service);
    setModalOpen(true);
  }
  function closeModal() {
    setModalOpen(false);
  }


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
      logo: a.logo_url ?? a.logo ?? '',
      meta: a.description ?? a.country ?? a.desc ?? '',
    }));
  }, [clinic]);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-10">
      {/* ===== HERO (фиксированные высоты — не «залипает» на весь экран) ===== */}
      <HeroGallery name={clinic.name} images={imgs} />

      {/* ===== ФИКСИРОВАННЫЙ NAVBAR СЕКЦИЙ (под хедером сайта) ===== */}
      <div className="relative inset-x-0 pt-2 z-[60]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="rounded-xl border bg-white/95 shadow-sm backdrop-blur pointer-events-auto">
            <SectionNav sections={sections} />
          </div>
        </div>
      </div>

      {/* ===== GRID: MAIN + SIDEBAR (sidebar не sticky, прокручивается) ===== */}
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
                    <th className="p-3">Price</th>
                    <th className="p-3">Description</th>
                    <th className="p-3" />
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {(clinic.services ?? []).map((s: any) => (
                    <tr key={s.name}>
                      <td className="p-3">{s.name}</td>
                      <td className="p-3">{s.price ?? '—'}</td>
                      <td className="p-3">{s.description ?? s.duration ?? '—'}</td>
                      <td className="p-3">
                        <button type="button"
                          onClick={() => openModal(s.name)}
                          className="rounded-md bg-primary px-3 py-2 text-white">
                          Request
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Doctors — верстка как на референсе */}
          <section id="staff" className="space-y-4 pt-10">
            <h2 className="text-2xl font-semibold">Doctors</h2>
            {doctors.length === 0 ? (
              <div className="rounded-xl border p-6 text-sm text-gray-500">No staff listed</div>
            ) : (
              <div className="space-y-4">
                {doctors.map((d, idx) => (
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
                        <button type="button"
                          onClick={() => openModal('Consultation')}
                          className="rounded-md bg-primary px-3 py-2 text-white">
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
              {(clinic.hours ?? []).map((h: any) => (
                <li key={h.day} className="rounded-md bg-gray-50 px-4 py-2">
                  <span className="font-semibold uppercase">{h.day}:</span>{' '}
                  {h.open && h.close ? `${h.open} - ${h.close}` : '—'}
                </li>
              ))}
            </ul>
          </section>

          {/* Location */}
          <section id="location" className="space-y-3 pt-10">
            <h2 className="text-2xl font-semibold">Location</h2>
            {clinic.location?.address && <div className="text-sm">{clinic.location.address}</div>}
            <div className="overflow-hidden rounded-lg border">
              <div className="aspect-[16/9]">
                <iframe
                  src={clinic.location?.mapEmbedUrl || buildMapEmbed(clinic.location?.address)}
                  className="h-full w-full"
                  loading="lazy"
                />
              </div>
            </div>
          </section>
        </main>

        {/* ---------- SIDEBAR (НЕ sticky) ---------- */}
        <aside className="space-y-4">
          <div className="rounded-2xl border p-4">
            {/* ЗЕЛЁНАЯ кнопка: переход на форму */}
            <a
              href={`/clinic/${clinic.slug}/inquiry`}
              className="block w-full rounded-md bg-emerald-600 px-4 py-3 text-center font-medium text-white hover:bg-emerald-700"
            >
              Claim Your Free Quote
            </a>

            {/* синяя — оставляем как есть, если нужна отдельно */}
            <button className="mt-3 w-full rounded-md bg-primary px-4 py-3 text-white">
              Start Your Personalized Treatment Plan Today
            </button>
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
        open={modalOpen}
        onClose={closeModal}
        services={serviceNames}
        preselectedService={modalService}
      />

    </div>
  );
}

/* ---------- HERO GALLERY ---------- */
function HeroGallery({ images, name }: { images: string[]; name: string }) {
  const list = images.slice(0, 5);
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
        {list.slice(1, 2 + 1).map((src) => (
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
