"use client";

type Clinic = {
  id: string;
  name: string;
  country?: string | null;
  city?: string | null;
  rating?: number | null;
  tags?: string[];
};

const DUMMY_CLINICS: Clinic[] = [
  { id: "1", name: "Premium Aesthetic Istanbul", country: "Turkey", city: "Istanbul", rating: 9.6, tags: ["hair-transplant", "dental-implants"] },
  { id: "2", name: "Ankara Dental Clinic", country: "Turkey", city: "Ankara", rating: 9.1, tags: ["crowns", "veneers"] },
  { id: "3", name: "MedPlast Warsaw", country: "Poland", city: "Warsaw", rating: 9.3, tags: ["plastic-surgery"] },
];

const POPULAR_LOCATIONS = ["Istanbul", "Ankara", "Antalya", "Warsaw", "Krakow"];
const POPULAR_TREATMENTS = ["Hair Transplant", "Dental Implants", "Veneers", "Rhinoplasty", "Crowns"];

export default function CategoryGrid({
  categorySlug,
}: { categorySlug: string }) {
  // TODO: заменить на данные с Supabase (items из RPC)
  const items = DUMMY_CLINICS;

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
              <a
                key={c.id}
                href={`/${categorySlug}/${encodeURIComponent(c.country ?? "")}/${encodeURIComponent(
                  c.city ?? ""
                )}/${encodeURIComponent(c.name.toLowerCase().replace(/\s+/g, "-"))}`}
                className="block rounded-2xl border bg-white p-5 transition hover:shadow-md"
              >
                <div className="text-lg font-semibold">{c.name}</div>
                <div className="mt-1 text-sm text-gray-600">
                  {[c.country, c.city].filter(Boolean).join(" • ")}
                </div>
                {c.rating != null && (
                  <div className="mt-2 text-sm">
                    Rating: <span className="font-medium">{c.rating.toFixed(1)}/10</span>
                  </div>
                )}
                {!!c.tags?.length && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {c.tags!.slice(0, 5).map((t) => (
                      <span key={t} className="rounded-full bg-gray-100 px-3 py-1 text-xs">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </a>
            ))
          )}
        </div>

        {/* Сайдбар */}
        <aside className="space-y-6">
          <div className="rounded-2xl border bg-white p-5">
            <div className="mb-3 text-sm font-semibold">Search locations</div>
            <input className="w-full rounded-xl border px-3 py-2" placeholder="Search locations" />
            <h3 className="mt-4 text-lg font-semibold">Popular locations</h3>
            {POPULAR_LOCATIONS.length === 0 ? (
              <div className="py-6 text-sm text-gray-500">No locations found</div>
            ) : (
              <ul className="mt-2 space-y-2">
                {POPULAR_LOCATIONS.map((l) => (
                  <li key={l}>
                    <a className="text-blue-600 hover:underline" href={`/${categorySlug}?city=${encodeURIComponent(l)}`}>{l}</a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border bg-white p-5">
            <div className="mb-3 text-sm font-semibold">Search treatments</div>
            <input className="w-full rounded-xl border px-3 py-2" placeholder="Search treatments" />
            <h3 className="mt-4 text-lg font-semibold">Popular treatments</h3>
            {POPULAR_TREATMENTS.length === 0 ? (
              <div className="py-6 text-sm text-gray-500">No treatments found</div>
            ) : (
              <ul className="mt-2 space-y-2">
                {POPULAR_TREATMENTS.map((t) => (
                  <li key={t}>
                    <a className="text-blue-600 hover:underline" href={`/${categorySlug}?service=${encodeURIComponent(t.toLowerCase().replace(/\s+/g, "-"))}`}>{t}</a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
