"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Category = { id: string; name: string; slug?: string | null };

type SubcategoryNode = { id: number; name: string; clinics_count: number };
type CountryNode = { id: number; country: string; clinics_count: number };
type CityNode = { id: number; city: string; clinics_count: number };

type ClinicRow = { clinic_id: string; clinic_name: string; country: string; city: string };

type ClinicServiceRow = { service_id: string; service_name: string };


type BookingMethod = "manual" | "automatic";

function Stepper({ step }: { step: 1 | 2 | 3 | 4 }) {
  const items = [1, 2, 3, 4] as const;

  return (
    <div className="flex items-center justify-center gap-3">
      {items.map((n, idx) => {
        const done = n < step;
        const active = n === step;
        return (
          <div key={n} className="flex items-center gap-3">
            <div
              className={[
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold",
                done ? "bg-emerald-600 text-white" : "",
                active ? "border-2 border-emerald-600 text-emerald-700 bg-white" : "",
                !done && !active ? "bg-gray-100 text-gray-500" : "",
              ].join(" ")}
            >
              {done ? "✓" : n}
            </div>
            {idx !== items.length - 1 && (
              <div className={["h-[2px] w-12", done ? "bg-emerald-600" : "bg-gray-200"].join(" ")} />
            )}
          </div>
        );
      })}
    </div>
  );
}

async function apiGet<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function AppointmentWizard() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [method, setMethod] = useState<BookingMethod | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);

  const [subcats, setSubcats] = useState<SubcategoryNode[]>([]);
  const [countries, setCountries] = useState<CountryNode[]>([]);
  const [cities, setCities] = useState<CityNode[]>([]);
  const [clinics, setClinics] = useState<ClinicRow[]>([]);
  const [clinicServices, setClinicServices] = useState<ClinicServiceRow[]>([]);

  const [selectedSubcat, setSelectedSubcat] = useState<SubcategoryNode | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<CountryNode | null>(null);
  const [selectedCity, setSelectedCity] = useState<CityNode | null>(null);
  const [selectedService, setSelectedService] = useState<ClinicServiceRow | null>(null);

  // UI helpers for clinics list
  const [clinicQ, setClinicQ] = useState("");
  const [clinicOffset, setClinicOffset] = useState(0);
  const [clinicTotal, setClinicTotal] = useState(0);


  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedClinic, setSelectedClinic] = useState<ClinicRow | null>(null);

  // Step 4 form
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load categories
  useEffect(() => {
    apiGet<{ categories: Category[] }>("/api/patient/appointment/categories")
      .then((r) => setCategories(r.categories ?? []))
      .catch((e) => setErrorMsg(String(e?.message ?? e)));
  }, []);

  function resetStep3Down() {
    setSubcats([]);
    setCountries([]);
    setCities([]);
    setClinics([]);
    setClinicServices([]);

    setSelectedSubcat(null);
    setSelectedCountry(null);
    setSelectedCity(null);
    setSelectedClinic(null);
    setSelectedService(null);

    setClinicQ("");
    setClinicOffset(0);
    setClinicTotal(0);
  }


  async function pickCategory(cat: Category) {
    setErrorMsg(null);
    setSelectedCategory(cat);
    resetStep3Down();
    setBusy(true);

    try {
      const r = await apiGet<{ items: SubcategoryNode[] }>(
        `/api/patient/appointment/subcategories?categoryId=${encodeURIComponent(String(cat.id))}`
      );
      setSubcats(r.items ?? []);
      setStep(3);
    } catch (e: any) {
      setErrorMsg(String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  }

  async function pickSubcat(node: SubcategoryNode) {
    if (!selectedCategory) return;

    setErrorMsg(null);
    setSelectedSubcat(node);

    setSelectedCountry(null);
    setSelectedCity(null);
    setSelectedClinic(null);
    setSelectedService(null);

    setCountries([]);
    setCities([]);
    setClinics([]);
    setClinicServices([]);

    setClinicQ("");
    setClinicOffset(0);
    setClinicTotal(0);

    setBusy(true);
    try {
      const r = await apiGet<{ items: CountryNode[] }>(
        `/api/patient/appointment/location/countries?categoryId=${encodeURIComponent(String(selectedCategory.id))}`
      );
      setCountries(r.items ?? []);
    } catch (e: any) {
      setErrorMsg(String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  }

  async function pickCountry(c: CountryNode) {
    setErrorMsg(null);
    setSelectedCountry(c);

    setSelectedCity(null);
    setSelectedClinic(null);
    setSelectedService(null);

    setCities([]);
    setClinics([]);
    setClinicServices([]);

    setClinicQ("");
    setClinicOffset(0);
    setClinicTotal(0);

    setBusy(true);
    try {
      const r = await apiGet<{ items: CityNode[] }>(
        `/api/patient/appointment/location/cities?countryNodeId=${encodeURIComponent(String(c.id))}`
      );
      setCities(r.items ?? []);
    } catch (e: any) {
      setErrorMsg(String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  }

  async function loadClinics(nextOffset: number, replace = false) {
    if (!selectedCategory || !selectedSubcat || !selectedCountry || !selectedCity) return;

    const limit = 15;

    const url =
      `/api/patient/appointment/clinics?` +
      `categoryId=${encodeURIComponent(String(selectedCategory.id))}` +
      `&subcategoryNodeId=${encodeURIComponent(String(selectedSubcat.id))}` +
      `&country=${encodeURIComponent(selectedCountry.country)}` +
      `&city=${encodeURIComponent(selectedCity.city)}` +
      `&q=${encodeURIComponent(clinicQ)}` +
      `&limit=${encodeURIComponent(String(limit))}` +
      `&offset=${encodeURIComponent(String(nextOffset))}`;

    setBusy(true);
    try {
      const r = await apiGet<{ items: any[]; total: number }>(url);
      const list: ClinicRow[] = (r.items ?? []).map((c) => ({
        clinic_id: String(c.clinic_id),
        clinic_name: c.clinic_name ?? "",
        country: c.country ?? "",
        city: c.city ?? "",
      }));

      setClinicTotal(Number(r.total ?? 0));
      setClinicOffset(nextOffset);

      setClinics((prev) => (replace ? list : [...prev, ...list]));
    } catch (e: any) {
      setErrorMsg(String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  }

  async function pickCity(c: CityNode) {
    setErrorMsg(null);
    setSelectedCity(c);

    setSelectedClinic(null);
    setSelectedService(null);

    setClinics([]);
    setClinicServices([]);
    setClinicOffset(0);
    setClinicTotal(0);

    await loadClinics(0, true);
  }

  async function pickClinic(c: ClinicRow) {
    if (!selectedSubcat) return;

    setErrorMsg(null);
    setSelectedClinic(c);
    setSelectedService(null);
    setClinicServices([]);

    setBusy(true);
    try {
      const r = await apiGet<{ items: ClinicServiceRow[] }>(
        `/api/patient/appointment/clinic-services?clinicId=${encodeURIComponent(c.clinic_id)}&subcategoryNodeId=${encodeURIComponent(String(selectedSubcat.id))}`
      );
      setClinicServices(r.items ?? []);
    } catch (e: any) {
      setErrorMsg(String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  }

  const canGoStep4 = useMemo(
    () =>
      method === "manual" &&
      selectedCategory &&
      selectedSubcat &&
      selectedCountry &&
      selectedCity &&
      selectedClinic &&
      selectedService,
    [method, selectedCategory, selectedSubcat, selectedCountry, selectedCity, selectedClinic, selectedService]
  );

  async function submitBooking() {
    if (!selectedClinic || !selectedService || !selectedCategory) return;

    setErrorMsg(null);
    setBusy(true);
    try {
      const res = await fetch("/api/patient/appointment/book", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          clinicId: selectedClinic.clinic_id,
          categoryId: selectedCategory.id,
          serviceId: selectedService.service_id,
          bookingMethod: method ?? "manual",
          preferredDate,
          preferredTime,
          fullName,
          phone,
          notes,
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      router.push("/patient/bookings?created=1");
      router.refresh();
    } catch (e: any) {
      setErrorMsg(String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Step chain */}
      <Stepper step={step} />

      {/* Errors */}
      {errorMsg && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      {/* Step 1 */}
      {step === 1 && (
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Choose appointment method</h2>
          <p className="mt-1 text-sm text-gray-500">How would you like to schedule your appointment?</p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {/* Manual */}
            <div className="rounded-2xl border p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-2xl">📅</div>
              <div className="mt-3 text-lg font-semibold">Manual booking</div>
              <p className="mt-1 text-sm text-gray-500">
                Browse clinics and contact them directly to schedule your appointment.
              </p>
              <button
                className="mt-4 w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                disabled={busy}
                onClick={() => {
                  setMethod("manual");
                  setStep(2);
                }}
              >
                Choose manual booking
              </button>
            </div>

            {/* Automatic (disabled) */}
            <div className="rounded-2xl border p-5 opacity-70">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-2xl">⏱️</div>
              <div className="mt-3 flex items-center gap-2 text-lg font-semibold">
                Automatic booking
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">
                  Coming soon
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                We’ll help you find and schedule appointments automatically.
              </p>
              <button
                className="mt-4 w-full cursor-not-allowed rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-500"
                disabled
              >
                Choose automatic booking
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Select medical category</h2>
              <p className="mt-1 text-sm text-gray-500">Choose the type of medical service you need</p>
            </div>
            <button
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
              onClick={() => setStep(1)}
            >
              ← Back
            </button>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                disabled={busy}
                onClick={() => pickCategory(cat)}
                className="rounded-xl border px-4 py-4 text-left hover:bg-gray-50 disabled:opacity-60"
              >
                <div className="text-sm font-semibold text-gray-900">{cat.name}</div>
                <div className="mt-1 text-xs text-gray-500">Tap to select</div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <section className="rounded-2xl border bg-white p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Select filters</h2>
              <p className="mt-1 text-sm text-gray-500">
                Choose subcategory, country, city, clinic, then service
              </p>
            </div>
            <button
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
              onClick={() => setStep(2)}
            >
              ← Back
            </button>
          </div>

          {/* Subcategories */}
          <div>
            <div className="text-sm font-semibold text-gray-900">Choose subcategory</div>
            <div className="mt-3 grid gap-2 md:grid-cols-3">
              {subcats.map((n) => {
                const active = selectedSubcat?.id === n.id;
                return (
                  <button
                    key={n.id}
                    disabled={busy}
                    onClick={() => pickSubcat(n)}
                    className={[
                      "rounded-xl border px-4 py-4 text-left",
                      active ? "bg-emerald-600 text-white border-emerald-600" : "hover:bg-gray-50",
                    ].join(" ")}
                  >
                    <div className="text-sm font-semibold">{n.name}</div>
                    <div
                      className={[
                        "mt-2 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold",
                        active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-700",
                      ].join(" ")}
                    >
                      {n.clinics_count} clinics
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Countries */}
          {selectedSubcat && (
            <div>
              <div className="text-sm font-semibold text-gray-900">Available countries</div>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                {countries.map((c) => {
                  const active = selectedCountry?.id === c.id;
                  return (
                    <button
                      key={c.id}
                      disabled={busy}
                      onClick={() => pickCountry(c)}
                      className={[
                        "rounded-xl border px-4 py-4 text-left",
                        active ? "bg-emerald-600 text-white border-emerald-600" : "hover:bg-gray-50",
                      ].join(" ")}
                    >
                      <div className="text-sm font-semibold">{c.country}</div>
                      <div
                        className={[
                          "mt-2 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold",
                          active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-700",
                        ].join(" ")}
                      >
                        {c.clinics_count} clinics
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Cities */}
          {selectedCountry && (
            <div>
              <div className="text-sm font-semibold text-gray-900">Available cities</div>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                {cities.map((c) => {
                  const active = selectedCity?.id === c.id;
                  return (
                    <button
                      key={c.id}
                      disabled={busy}
                      onClick={() => pickCity(c)}
                      className={[
                        "rounded-xl border px-4 py-4 text-left",
                        active ? "bg-emerald-600 text-white border-emerald-600" : "hover:bg-gray-50",
                      ].join(" ")}
                    >
                      <div className="text-sm font-semibold">{c.city}</div>
                      <div
                        className={[
                          "mt-2 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold",
                          active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-700",
                        ].join(" ")}
                      >
                        {c.clinics_count} clinics
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Clinics */}
          {selectedCity && (
            <div className="space-y-3">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-gray-900">Available clinics</div>
                  <div className="mt-1 text-xs text-gray-500">
                    Showing {clinics.length} of {clinicTotal}
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    value={clinicQ}
                    onChange={(e) => setClinicQ(e.target.value)}
                    placeholder="Search clinic..."
                    className="h-9 w-56 rounded-lg border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  />
                  <button
                    disabled={busy}
                    onClick={() => loadClinics(0, true)}
                    className="h-9 rounded-lg border border-gray-200 px-3 text-sm hover:bg-gray-50 disabled:opacity-60"
                  >
                    Search
                  </button>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {clinics.map((c) => {
                  const active = selectedClinic?.clinic_id === c.clinic_id;
                  return (
                    <button
                      key={c.clinic_id}
                      disabled={busy}
                      onClick={() => pickClinic(c)}
                      className={[
                        "rounded-xl border p-4 text-left",
                        active ? "border-emerald-600 ring-2 ring-emerald-100" : "hover:bg-gray-50",
                      ].join(" ")}
                    >
                      <div className="text-sm font-semibold text-gray-900">{c.clinic_name}</div>
                      <div className="mt-1 text-xs text-gray-500">
                        {c.city}, {c.country}
                      </div>
                    </button>
                  );
                })}
              </div>

              {clinics.length < clinicTotal && (
                <button
                  disabled={busy}
                  onClick={() => loadClinics(clinicOffset + 15, false)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
                >
                  Load more
                </button>
              )}
            </div>
          )}

          {/* Services (after clinic selected) */}
          {selectedClinic && (
            <div>
              <div className="text-sm font-semibold text-gray-900">Choose service</div>
              <div className="mt-3 grid gap-2 md:grid-cols-3">
                {clinicServices.map((s) => {
                  const active = selectedService?.service_id === s.service_id;
                  return (
                    <button
                      key={s.service_id}
                      disabled={busy}
                      onClick={() => setSelectedService(s)}
                      className={[
                        "rounded-lg border px-3 py-2 text-sm font-medium",
                        active ? "bg-emerald-600 text-white border-emerald-600" : "hover:bg-gray-50",
                      ].join(" ")}
                    >
                      {s.service_name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between gap-4">
            <button
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
              onClick={() => setStep(2)}
            >
              Previous
            </button>

            <button
              disabled={!canGoStep4 || busy}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              onClick={() => setStep(4)}
            >
              Next →
            </button>
          </div>
        </section>
      )}

      {/* Step 4 */}
      {step === 4 && selectedClinic && selectedService && (
        <section className="rounded-2xl border bg-white p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Complete your appointment</h2>
              <p className="mt-1 text-sm text-gray-500">Fill in the details to finalize your request</p>
            </div>
            <button
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
              onClick={() => setStep(3)}
            >
              ← Back
            </button>
          </div>

          {/* Summary */}
          <div className="rounded-2xl border p-5">
            <div className="text-lg font-semibold">Appointment summary</div>
            <div className="mt-4 space-y-2 text-sm text-gray-700">
              <div>🏥 <span className="font-semibold">{selectedClinic.clinic_name}</span></div>
              <div>📍 {selectedClinic.city}, {selectedClinic.country}</div>
              <div>🩺 {selectedService.service_name}</div>
              <div>🗓️ Manual booking</div>
            </div>
          </div>

          {/* Form */}
          <div className="rounded-2xl border p-5">
            <div className="text-lg font-semibold">Appointment details</div>
            <p className="mt-1 text-sm text-gray-500">Provide your preferences and contact information</p>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-gray-700">Preferred date</label>
                <input
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Preferred time</label>
                <input
                  type="time"
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Full name</label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Phone number</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-gray-700">Additional notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional information or special requests..."
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  rows={4}
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-4">
              <button
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
                onClick={() => setStep(3)}
              >
                Previous
              </button>

              <button
                disabled={busy || !preferredDate || !fullName || !phone}
                className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                onClick={submitBooking}
              >
                {busy ? "Submitting..." : "Submit request"}
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
