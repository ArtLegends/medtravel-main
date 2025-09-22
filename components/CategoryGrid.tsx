"use client";

import Link from "next/link";
import { getClinicsByCategory, type ClinicMock } from "@/lib/mock/clinic";

export default function CategoryGrid({ categorySlug }: { categorySlug: string }) {
  // берём клиники из нашего mock по категории
  const items: ClinicMock[] = getClinicsByCategory(categorySlug);

  return (
    <section className="bg-gray-50">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-10 lg:grid-cols-[1fr_360px]">
        {/* Листинг */}
        <div className="space-y-4">
          {items.length === 0 ? (
            <div className="rounded-2xl border bg-white p-10 text-center text-gray-600">
              No clinics found
            </div>
          ) : (
            items.map((c) => (
              <Link
                key={c.slug}
                href={`/clinic/${c.slug}`}
                className="block rounded-2xl border bg-white p-5 transition hover:shadow-md"
              >
                <div className="text-lg font-semibold">{c.name}</div>
                <div className="mt-1 text-sm text-gray-600">
                  {[c.country, c.city].filter(Boolean).join(" • ")}
                </div>

                {!!c.tags?.length && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {c.tags.slice(0, 5).map((t) => (
                      <span key={t} className="rounded-full bg-gray-100 px-3 py-1 text-xs">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))
          )}
        </div>

        {/* Сайдбар */}
        <aside className="space-y-6">
          <div className="rounded-2xl border bg-white p-5">
            <div className="mb-3 text-sm font-semibold">Search locations</div>
            <input className="w-full rounded-xl border px-3 py-2" placeholder="Search locations" />
            <h3 className="mt-4 text-lg font-semibold">Popular locations</h3>
            <ul className="mt-2 space-y-2">
              {["Istanbul", "Ankara", "Antalya", "Warsaw", "Krakow"].map((l) => (
                <li key={l}>
                  <Link className="text-blue-600 hover:underline" href={`/${categorySlug}?city=${encodeURIComponent(l)}`}>
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border bg-white p-5">
            <div className="mb-3 text-sm font-semibold">Search treatments</div>
            <input className="w-full rounded-xl border px-3 py-2" placeholder="Search treatments" />
            <h3 className="mt-4 text-lg font-semibold">Popular treatments</h3>
            <ul className="mt-2 space-y-2">
              {["Hair Transplant", "Dental Implants", "Veneers", "Rhinoplasty", "Crowns"].map((t) => (
                <li key={t}>
                  <Link
                    className="text-blue-600 hover:underline"
                    href={`/${categorySlug}?service=${encodeURIComponent(t.toLowerCase().replace(/\s+/g, "-"))}`}
                  >
                    {t}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}
