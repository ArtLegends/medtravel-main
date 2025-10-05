// components/category/CategoryFilters.tsx
"use client";

type Facets = {
  countries?: string[] | null;
  provinces?: string[] | null;
  cities?: string[] | null;
  districts?: string[] | null;
  services?: string[] | null;
};

type Selected = {
  country?: string;
  province?: string;
  city?: string;
  district?: string;
  services: string[];
  sort: "name_asc" | "name_desc";
};

export default function CategoryFilters({
  facets,
  selected,
  onChangeAction,
  onResetAction,
}: {
  facets: Facets | undefined | null;
  selected: Selected;
  onChangeAction: (change: Partial<Selected>) => void;
  onResetAction: () => void;
}) {
  const countries = facets?.countries ?? [];
  const provinces = facets?.provinces ?? [];
  const cities = facets?.cities ?? [];
  const districts = facets?.districts ?? [];
  const services = facets?.services ?? [];

  const toggleService = (slug: string) => {
    const set = new Set(selected.services);
    set.has(slug) ? set.delete(slug) : set.add(slug);
    onChangeAction({ services: Array.from(set) });
  };

  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {/* Country */}
        <select
          className="rounded-xl border px-3 py-2"
          value={selected.country ?? ""}
          onChange={(e) => onChangeAction({ country: e.target.value || undefined })}
        >
          <option value="">Country</option>
          {countries?.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>

        {/* Province */}
        <select
          className="rounded-xl border px-3 py-2"
          value={selected.province ?? ""}
          onChange={(e) => onChangeAction({ province: e.target.value || undefined })}
          disabled={!provinces?.length}
        >
          <option value="">Province</option>
          {provinces?.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>

        {/* City */}
        <select
          className="rounded-xl border px-3 py-2"
          value={selected.city ?? ""}
          onChange={(e) => onChangeAction({ city: e.target.value || undefined })}
          disabled={!cities?.length}
        >
          <option value="">City</option>
          {cities?.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>

        {/* District */}
        <select
          className="rounded-xl border px-3 py-2"
          value={selected.district ?? ""}
          onChange={(e) => onChangeAction({ district: e.target.value || undefined })}
          disabled={!districts?.length}
        >
          <option value="">District</option>
          {districts?.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>

        {/* Sort */}
        <select
          className="rounded-xl border px-3 py-2"
          value={selected.sort}
          onChange={(e) => onChangeAction({ sort: e.target.value as Selected["sort"] })}
        >
          <option value="name_asc">Name ↑</option>
          <option value="name_desc">Name ↓</option>
        </select>

        {/* Reset */}
        <button
          className="rounded-xl border px-3 py-2"
          onClick={onResetAction}
          type="button"
        >
          Reset
        </button>
      </div>

      {/* Services */}
      <div className="mt-4">
        <div className="mb-2 text-sm font-semibold">Services</div>
        <div className="flex flex-wrap gap-2">
          {services?.map((s) => {
            const active = selected.services.includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => toggleService(s)}
                className={`rounded-full border px-3 py-1 text-sm ${active ? "bg-gray-900 text-white" : "bg-white"}`}
              >
                {s}
              </button>
            );
          })}
          {!services?.length && (
            <div className="text-sm text-gray-500">Нет доступных услуг для выбранных условий.</div>
          )}
        </div>
      </div>
    </div>
  );
}
