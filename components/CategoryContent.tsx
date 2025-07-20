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
      <SearchBar value={search} onChange={setSearch} />
      <CategoryFilters
        selectedCountry={country}
        onCountryChange={setCountry}
        selectedService={service}
        onServiceChange={setService}
      />
      {loading ? (
        <p className="text-center">Loading…</p>
      ) : (
        <ClinicList clinics={clinics} />
      )}
    </div>
  );
}
