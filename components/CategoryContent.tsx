"use client";

import { useState, useEffect } from "react";
import SearchBar from "./SearchBar";
import CategoryFilters from "./CategoryFilters";
import ClinicList from "./ClinicList";
// import { createBrowserClient } from "@/lib/supabase/browserClient";
import { createClient } from "@/lib/supabase/browserClient";
import type { Clinic } from "@/lib/supabase/requests";

interface Props {
  categoryId: number;
}

export default function CategoryContent({ categoryId }: Props) {
  const supabase = createClient();

  // 1️⃣ состояния фильтров
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState<string | null>(null);
  const [service, setService] = useState<string | null>(null);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(false);

  // 2️⃣ при изменении фильтров — рефетчим список
  useEffect(() => {
    setLoading(true);
    supabase
      .from("clinic_categories")
      .select(`
        clinic:clinic_id (
          id, name, slug, about, address,
          country, city, province, district,
          services
        )
      `)
      .eq("category_id", categoryId)
      // фильтруем по имени
      .ilike("clinic.name", `%${search}%`)
      // фильтруем по стране
      .eq("clinic.country", country ?? undefined)
      // фильтруем по услугам (если services — массив текстов)
      .contains("clinic.services", service ? [service] : [])
      .then(({ data, error }) => {
        if (!error && Array.isArray(data)) {
          // извлекаем clinic из каждой строки
          setClinics(
            data
              .map((r) => r.clinic as unknown as Clinic)
              .map((c) => ({
                ...c,
                services: c.services ?? [],
              }))
          );
        }
        setLoading(false);
      });
  }, [search, country, service, categoryId, supabase]);

  return (
    <div className="space-y-6">
      <SearchBar value={search} onChangeAction={setSearch} />
      <CategoryFilters
        facets={undefined} // если у тебя есть локальная переменная с фасетами, иначе передай undefined
        selected={{
          country: country ?? undefined,
          province: undefined,   // если у тебя есть состояние для province/city/district — подставь его
          city: undefined,
          district: undefined,
          services: service ? [service] : [],
          sort: "name_asc",
        }}
        onChangeAction={(chg) => {
          // маппим пропсы нового API в твои useState
          if ("country" in chg) setCountry(chg.country ?? null);
          if ("province" in chg) {/* setProvince(chg.province ?? null); */ }
          if ("city" in chg) {/* setCity(chg.city ?? null); */ }
          if ("district" in chg) {/* setDistrict(chg.district ?? null); */ }
          if ("services" in chg) setService((chg.services?.[0] ?? null));
          if ("sort" in chg) { /* setSort(chg.sort) — если хранится в стейте */ }
        }}
        onResetAction={() => {
          setCountry(null);
          // setProvince?.(null); setCity?.(null); setDistrict?.(null);
          setService(null);
          setSearch("");
          // при желании сбрось и сортировку/страницу
        }}
      />
      {loading ? (
        <p className="text-center">Loading…</p>
      ) : (
        <ClinicList clinics={clinics} />
      )}
    </div>
  );
}
