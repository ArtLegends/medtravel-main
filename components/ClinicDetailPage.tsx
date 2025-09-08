'use client';

import Image from 'next/image';
import { useMemo } from 'react';
import SectionNav from '@/components/SectionNav';
import type { ClinicMock } from '@/lib/mock/clinic';

type Props = { clinic: ClinicMock };

// Простейший конструктор embed-URL для адреса, когда нет готового mapEmbedUrl
function buildMapEmbed(address?: string) {
  if (!address) return '';
  const q = encodeURIComponent(address);
  return `https://www.google.com/maps?q=${q}&output=embed`;
}

export default function ClinicDetailPage({ clinic }: Props) {
  const sections = useMemo(
    () => [
      { id: 'about',          label: 'About the clinic' },
      { id: 'treatments',     label: 'Treatments & Prices' },
      { id: 'staff',          label: 'Staff' },
      { id: 'photos',         label: 'Transformation photos' },
      { id: 'accreditations', label: 'Accreditations' },
      { id: 'hours',          label: 'Operation Hours' },
      { id: 'location',       label: 'Location' },
    ],
    []
  );

  const imgs = clinic.images ?? [];

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* HERO: сетка из 4 изображений во всю ширину контейнера */}
      <div className="grid grid-cols-12 gap-3">
        {imgs.slice(0, 4).map((src, i) => (
          <div
            key={src}
            className={i === 0 ? 'col-span-12 md:col-span-8' : 'col-span-12 md:col-span-4'}
          >
            <div className="relative w-full overflow-hidden rounded-lg">
              <Image
                src={src}
                alt={`${clinic.name} photo ${i + 1}`}
                // держим приятные пропорции (чтобы не «прыгало»)
                width={i === 0 ? 1200 : 800}
                height={i === 0 ? 675 : 450}
                className="h-full w-full object-cover"
                priority={i === 0}
              />
            </div>
          </div>
        ))}
      </div>

      {/* CTA — под галереей */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button className="w-full sm:w-auto rounded-md bg-primary px-5 py-3 text-white">
          Start Your Personalized Treatment Plan Today
        </button>
        <button className="w-full sm:w-auto rounded-md border px-5 py-3">
          Claim Your Free Quote
        </button>
      </div>

      {/* Навигация по секциям — статичная, без sticky */}
      <SectionNav sections={sections} />

      {/* About */}
      <section id="about" className="space-y-3">
        <div className="text-sm text-gray-500">
          {clinic.country}, {clinic.city}
          {clinic.district ? `, ${clinic.district}` : ''}
        </div>

        <h1 className="text-3xl font-semibold flex flex-wrap items-center gap-3">
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

        <p className="text-gray-700">{clinic.about}</p>
      </section>

      {/* Treatments & Prices */}
      <section id="treatments" className="space-y-3 pt-8">
        <h2 className="text-2xl font-semibold">Treatments & Prices</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border divide-y rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Procedure</th>
                <th className="p-3 text-left">Price</th>
                <th className="p-3 text-left">Duration</th>
                <th className="p-3 text-left" />
              </tr>
            </thead>
            <tbody>
              {(clinic.services ?? []).map((s) => (
                <tr key={s.name} className="divide-x">
                  <td className="p-3">{s.name}</td>
                  <td className="p-3">{s.price ?? '-'}</td>
                  <td className="p-3">{s.duration ?? '-'}</td>
                  <td className="p-3">
                    <button className="rounded-md bg-primary px-3 py-2 text-white">
                      Request
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Staff */}
      <section id="staff" className="space-y-3 pt-8">
        <h2 className="text-2xl font-semibold">Doctors</h2>
        <div className="space-y-4">
          {(clinic.staff ?? []).map((d) => (
            <article key={d.name} className="rounded-lg border p-4">
              <h3 className="text-lg font-medium">{d.name}</h3>
              <div className="text-sm text-gray-500">{d.position}</div>
              <div className="mt-2 text-sm">
                {d.experienceYears ? <>Experience: {d.experienceYears} years<br/></> : null}
                {d.languages?.length ? <>Languages: {d.languages.join(', ')}<br/></> : null}
                {d.specialisations?.length ? <>Specialisations: {d.specialisations.join(', ')}</> : null}
              </div>
              <div className="mt-3">
                <button className="rounded-md bg-primary px-3 py-2 text-white">
                  Request Appointment
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Photos */}
      <section id="photos" className="space-y-3 pt-8">
        <h2 className="text-2xl font-semibold">Transformation photos</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {imgs.map((src) => (
            <Image
              key={src}
              src={src}
              alt="Clinic photo"
              width={800}
              height={600}
              className="rounded-lg object-cover w-full h-auto"
            />
          ))}
        </div>
      </section>

      {/* Accreditations */}
      <section id="accreditations" className="space-y-3 pt-8">
        <h2 className="text-2xl font-semibold">Accreditations</h2>
        <ul className="space-y-3">
          {(clinic.accreditations ?? []).map((a, idx) => (
            <li key={idx} className="rounded-lg border p-4">
              <div className="font-medium">{a.title}</div>
              <div className="text-sm text-gray-500">{a.country}</div>
            </li>
          ))}
        </ul>
      </section>

      {/* Hours */}
      <section id="hours" className="space-y-3 pt-8">
        <h2 className="text-2xl font-semibold">Operation Hours</h2>
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {(clinic.hours ?? []).map((h) => (
            <li key={h.day} className="rounded-md bg-gray-50 px-3 py-2">
              <span className="font-medium">{h.day}:</span>{' '}
              {h.open && h.close ? `${h.open} - ${h.close}` : '-'}
            </li>
          ))}
        </ul>
      </section>

      {/* Location */}
      <section id="location" className="space-y-3 pt-8">
        <h2 className="text-2xl font-semibold">Location</h2>
        <div className="text-sm">{clinic.location?.address}</div>
        <iframe
          src={clinic.location?.mapEmbedUrl || buildMapEmbed(clinic.location?.address)}
          width="100%"
          height={380}
          loading="lazy"
          className="rounded-lg border"
        />
      </section>
    </div>
  );
}
