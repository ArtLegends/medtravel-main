"use client";

import React, {
  useEffect,
  useMemo,
  useState,
  useTransition,
  useRef,
} from "react";
import clsx from "clsx";
import { Icon } from "@iconify/react";
import {
  getDraft,
  saveDraftSection,
  saveDraftWhole,
  submitForReview,
  getCategories,
  uploadGallery,
  uploadDoctorImage,
  uploadAccreditationLogo,
} from "./actions";

type SectionKey =
  | "basic"
  | "services"
  | "doctors"
  | "additional"
  | "hours"
  | "gallery"
  | "location"
  | "payments";

type SectionStatus = "Required" | "Complete" | "Empty";

const REQUIRED: SectionKey[] = ["basic", "services", "doctors", "location"];

type HourRow = {
  day: string;
  status: "Open" | "Closed";
  start?: string;
  end?: string;
};

const DEFAULT_HOURS: Array<{ day: string; status: "Open" | "Closed"; start?: string; end?: string }> = [
  { day: "Monday",    status: "Open",  start: "00:00", end: "00:00" },
  { day: "Tuesday",   status: "Open",  start: "00:00", end: "00:00" },
  { day: "Wednesday", status: "Open",  start: "00:00", end: "00:00" },
  { day: "Thursday",  status: "Open",  start: "00:00", end: "00:00" },
  { day: "Friday",    status: "Open",  start: "00:00", end: "00:00" },
  { day: "Saturday",  status: "Closed" },
  { day: "Sunday",    status: "Closed" },
];

type ServiceRow = {
  name: string;
  price?: string;
  currency: string;
  description?: string;
};

type DoctorRow = {
  fullName: string;
  title?: string;
  specialty?: string;
  description?: string;
  photo?: string;
};

type AmenityItem = { label: string; icon?: string | null };

type Accreditation = { name: string; logo_url?: string; description?: string };

type FacilitiesState = {
  premises: any[]; // strings или AmenityItem[]
  clinic_services: any[];
  travel_services: any[];
  languages_spoken: any[];
  accreditations: Accreditation[];
};

type GalleryItem = { url: string; title?: string };

/* -------------------------------- Page -------------------------------- */

export default function ClinicProfilePage() {
  const [active, setActive] = useState<SectionKey>("basic");
  const [isPending, startTransition] = useTransition();

  const [basic, setBasic] = useState({
    name: "",
    slug: "",
    specialty: "",
    country: "",
    city: "",
    province: "",
    district: "",
    address: "",
    description: "",
  });

  const [services, setServices] = useState<ServiceRow[]>([]);
  const [doctors, setDoctors] = useState<DoctorRow[]>([]);
  const [additional, setAdditional] = useState<FacilitiesState>({
    premises: [],
    clinic_services: [],
    travel_services: [],
    languages_spoken: [],
    accreditations: [],
  });
  const [hours, setHours] = useState(DEFAULT_HOURS);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [location, setLocation] = useState({ mapUrl: "", directions: "" });
  const [payments, setPayments] = useState<string[]>([]);

  const [cats, setCats] = useState<Array<{ id: number; name: string; slug: string }>>([]);

  // загрузка драфта
  useEffect(() => {
    startTransition(async () => {
      try {
        const [draftRes, catsRes] = await Promise.allSettled([
          getDraft(),
          getCategories(),
        ]);

        if (draftRes.status === "fulfilled") {
          const draft = draftRes.value?.draft;
          if (draft) {
            setBasic((p) =>
              draft.basic_info ? { ...p, ...draft.basic_info } : p
            );

            const srv: ServiceRow[] = Array.isArray(draft.services)
              ? draft.services.map((s: any) => ({
                  name: s?.name ?? "",
                  price: s?.price ?? "",
                  currency: s?.currency ?? "USD",
                  description: s?.description ?? s?.desc ?? "",
                }))
              : [];
            setServices(srv);

            const docs: DoctorRow[] = Array.isArray(draft.doctors)
              ? draft.doctors.map((d: any) => ({
                  fullName: d?.fullName ?? d?.name ?? "",
                  title: d?.title ?? "",
                  specialty: d?.specialty ?? d?.spec ?? "",
                  description: d?.description ?? d?.bio ?? d?.qual ?? "",
                  photo: d?.photo ?? "",
                }))
              : [];
            setDoctors(docs);

            setAdditional(
              draft.facilities ?? {
                premises: [],
                clinic_services: [],
                travel_services: [],
                languages_spoken: [],
                accreditations: [],
              }
            );

            setHours(
              draft.hours && Array.isArray(draft.hours) && draft.hours.length
                ? draft.hours
                : DEFAULT_HOURS
            );
            setGallery(draft.gallery ?? []);
            setLocation(draft.location ?? { mapUrl: "", directions: "" });

            const paymentsFromDraft = Array.isArray(draft.pricing)
              ? draft.pricing
                  .map((x: any) =>
                    typeof x === "string" ? x : x?.method
                  )
                  .filter(
                    (v: any): v is string =>
                      typeof v === "string" && v.trim().length > 0
                  )
              : [];
            setPayments(paymentsFromDraft);
          }
        }

        if (catsRes.status === "fulfilled") {
          setCats(catsRes.value);
        }
      } catch {
        // no-op
      }
    });
  }, []);

  // section statuses
  const sectionStatuses: Record<SectionKey, SectionStatus> = useMemo(() => {
    const basicOk =
      basic.name.trim() &&
      basic.specialty.trim() &&
      basic.country.trim() &&
      basic.city.trim() &&
      basic.address.trim();

    const servicesOk =
      services.length > 0 && services.every((s) => s.name.trim());
    const doctorsOk =
      doctors.length > 0 && doctors.every((d) => d.fullName.trim());
    const locationOk = Boolean(
      location.mapUrl.trim() ||
        (basic.country && basic.city && basic.address)
    );

    return {
      basic: basicOk ? "Complete" : "Required",
      services: servicesOk
        ? "Complete"
        : services.length
        ? "Empty"
        : "Required",
      doctors: doctorsOk
        ? "Complete"
        : doctors.length
        ? "Empty"
        : "Required",
      location: locationOk ? "Complete" : "Required",
      additional:
        (additional.premises?.length ?? 0) ||
        (additional.clinic_services?.length ?? 0) ||
        (additional.travel_services?.length ?? 0) ||
        (additional.languages_spoken?.length ?? 0) ||
        (additional.accreditations?.length ?? 0)
          ? "Complete"
          : "Empty",
      hours: hours.some((h) => h.status === "Open") ? "Complete" : "Empty",
      gallery: gallery.length ? "Complete" : "Empty",
      payments: payments.length ? "Complete" : "Empty",
    };
  }, [basic, services, doctors, location, additional, hours, gallery, payments]);

  const completion = useMemo(() => {
    const done = REQUIRED.filter((k) => sectionStatuses[k] === "Complete")
      .length;
    return Math.round((done / REQUIRED.length) * 100);
  }, [sectionStatuses]);

  const publishDisabled = completion < 100;

  const sections: { key: SectionKey; label: string }[] = [
    { key: "basic", label: "Basic Information" },
    { key: "services", label: "Services" },
    { key: "doctors", label: "Doctors" },
    { key: "additional", label: "Additional Services" },
    { key: "hours", label: "Operating Hours" },
    { key: "gallery", label: "Gallery" },
    { key: "location", label: "Location" },
    { key: "payments", label: "Payment Methods" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-[22px] font-semibold">Clinic Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[300px,1fr] gap-6">
        {/* LEFT */}
        <div className="space-y-4">
          <Card className="p-4">
            <div className="text-sm text-gray-500 mb-2">Status</div>
            <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
              Draft
            </span>
          </Card>

          <Card className="p-4">
            <div className="text-sm text-gray-500 mb-2">Profile Completion</div>
            <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
              <div
                className={clsx(
                  "h-2 rounded-full transition-all",
                  completion === 100 ? "bg-emerald-500" : "bg-blue-500"
                )}
                style={{ width: `${completion}%` }}
              />
            </div>
            <div className="mt-2 text-sm text-gray-600">{completion}%</div>
          </Card>

          <Card className="p-4 space-y-3">
            <button
              disabled={publishDisabled || isPending}
              onClick={() => {
                startTransition(async () => {
                  await saveDraftSection("basic_info", basic);
                  await saveDraftSection("services", services);
                  await saveDraftSection("doctors", doctors);
                  await saveDraftSection("facilities", additional);
                  await saveDraftSection("hours", hours);
                  await saveDraftSection("gallery", gallery);
                  await saveDraftSection("location", location);
                  await saveDraftSection("pricing", payments);
                  await submitForReview();
                });
              }}
              className={clsx(
                "w-full rounded-md px-3 py-2 text-white font-medium transition",
                publishDisabled
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              )}
            >
              {isPending ? "Publishing..." : "Publish Clinic"}
            </button>
            <p className="text-xs text-gray-500">
              Complete all sections to enable publishing
            </p>
          </Card>

          <Card className="p-2">
            {sections.map((s) => {
              const state = sectionStatuses[s.key];
              const isActive = active === s.key;
              return (
                <button
                  key={s.key}
                  onClick={() => setActive(s.key)}
                  className={clsx(
                    "w-full flex items-center justify-between px-3 py-2 rounded-md text-left transition",
                    "hover:bg-gray-50",
                    isActive && "ring-1 ring-blue-200 bg-blue-50/50"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={clsx(
                        "text-sm font-medium",
                        isActive ? "text-blue-800" : "text-gray-900"
                      )}
                    >
                      {s.label}
                    </span>
                    {REQUIRED.includes(s.key) && (
                      <span className="text-[11px] text-rose-600/80">
                        • required
                      </span>
                    )}
                  </div>
                  <span
                    className={clsx(
                      "text-xs px-2 py-1 rounded-full",
                      state === "Required" &&
                        "bg-rose-50 text-rose-600",
                      state === "Complete" &&
                        "bg-emerald-50 text-emerald-600",
                      state === "Empty" &&
                        "bg-gray-100 text-gray-700"
                    )}
                  >
                    {state}
                  </span>
                </button>
              );
            })}
          </Card>
        </div>

        {/* RIGHT */}
        <Card className="p-6 space-y-6">
          {active === "basic" && (
            <BasicInfo
              value={basic}
              onChange={setBasic}
              completion={completion}
              cats={cats}
            />
          )}

          {active === "services" && (
            <ServicesSection rows={services} onChange={setServices} />
          )}

          {active === "doctors" && (
            <DoctorsSection
              rows={doctors}
              onChange={setDoctors}
            />
          )}

          {active === "additional" && (
            <AdditionalSection value={additional} onChange={setAdditional} />
          )}

          {active === "hours" && (
            <HoursSection
              rows={hours}
              onChange={setHours}
            />
          )}

          {active === "gallery" && (
            <GallerySection
              rows={gallery}
              onChange={setGallery}
            />
          )}

          {active === "location" && (
            <LocationSection value={location} onChange={setLocation} />
          )}

          {active === "payments" && (
            <PaymentsSection
              rows={payments}
              onAdd={(row) => setPayments((p) => [...p, row])}
              onRemove={(i) =>
                setPayments((p) => p.filter((_, idx) => idx !== i))
              }
            />
          )}

          {/* footer */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                const snapshot = {
                  basic_info: basic,
                  services,
                  doctors,
                  facilities: additional,
                  hours,
                  gallery,
                  location,
                  pricing: payments,
                };
                startTransition(async () => {
                  await saveDraftWhole(snapshot);
                });
              }}
              className="inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              disabled={isPending}
            >
              {isPending ? "Saving..." : "Save as Draft"}
            </button>

            <button
              onClick={() => {
                startTransition(async () => {
                  await saveDraftWhole({
                    basic_info: basic,
                    services,
                    doctors,
                    facilities: additional,
                    hours,
                    gallery,
                    location,
                    pricing: payments,
                  });
                  await submitForReview();
                });
              }}
              className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-400"
              disabled={publishDisabled || isPending}
            >
              {isPending ? "Submitting..." : "Submit for Review"}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ----------------------------- Primitives ----------------------------- */

function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={clsx("rounded-xl border bg-white", className)}>
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  helper,
  className,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  helper?: string;
  className?: string;
  type?: string;
}) {
  return (
    <div className={className}>
      <label className="text-[13px] text-gray-600">{label}</label>
      <input
        className="mt-1 w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-blue-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type={type}
      />
      {helper && <p className="mt-1 text-xs text-gray-500">{helper}</p>}
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string; disabled?: boolean }[];
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="text-[13px] text-gray-600">{label}</label>
      <select
        className="mt-1 w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-blue-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option
            key={o.value + o.label}
            value={o.value}
            disabled={o.disabled}
          >
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Textarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="text-[13px] text-gray-600">{label}</label>
      <textarea
        className="mt-1 w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-blue-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
      />
    </div>
  );
}

function TagInput({
  label,
  values,
  onAdd,
  onRemove,
  placeholder,
}: {
  label: string;
  values: string[];
  onAdd: (v: string) => void;
  onRemove: (i: number) => void;
  placeholder?: string;
}) {
  const [val, setVal] = useState("");
  return (
    <div>
      <label className="text-[13px] text-gray-600">{label}</label>
      <div className="mt-1 flex gap-2">
        <input
          className="flex-1 rounded-md border px-3 py-2 text-sm outline-none focus:border-blue-500"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => {
            const v = val.trim();
            if (!v) return;
            onAdd(v);
            setVal("");
          }}
          className="rounded-md border px-3 py-2 text-sm bg-white hover:bg-gray-50"
        >
          + Add
        </button>
      </div>
      {!values.length ? (
        <p className="mt-2 text-sm text-gray-400">No items yet.</p>
      ) : (
        <div className="mt-2 flex flex-wrap gap-2">
          {values.map((v, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm"
            >
              {v}
              <button
                onClick={() => onRemove(i)}
                className="text-gray-500 hover:text-rose-600"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ----------------------------- Sections ------------------------------ */

function BasicInfo({
  value,
  onChange,
  completion,
  cats,
}: {
  value: {
    name: string;
    slug: string;
    specialty: string;
    country: string;
    city: string;
    province: string;
    district: string;
    address: string;
    description: string;
  };
  onChange: (v: any) => void;
  completion: number;
  cats: Array<{ id: number; name: string; slug: string }>;
}) {
  return (
    <>
      <div className="space-y-2">
        <div className="text-lg font-semibold">Basic Information</div>
        <p className="text-sm text-gray-500">
          Set up your clinic&apos;s basic information and contact details
        </p>
      </div>

      <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <div className="font-medium mb-1">
          Complete all required fields to submit your clinic for review.
        </div>
        <div>You&apos;re {completion}% done!</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field
          label="Clinic Name *"
          value={value.name}
          onChange={(v) => onChange({ ...value, name: v })}
          placeholder="Enter clinic name"
        />
        <Field
          label="URL Slug"
          value={value.slug}
          onChange={(v) => onChange({ ...value, slug: v })}
          placeholder="clinic-url-slug"
          helper="URL slug will be auto-generated from clinic name if left empty."
        />

        <Select
          label="Specialty *"
          value={value.specialty}
          onChange={(v) => onChange({ ...value, specialty: v })}
          options={[
            { value: "", label: "Select specialty", disabled: true },
            ...cats.map((c) => ({
              value: c.slug,
              label: c.name,
            })),
          ]}
        />

        <div />

        <Field
          label="Country *"
          value={value.country}
          onChange={(v) => onChange({ ...value, country: v })}
          placeholder="Enter country"
        />
        <Field
          label="City *"
          value={value.city}
          onChange={(v) => onChange({ ...value, city: v })}
          placeholder="Enter city"
        />
        <Field
          label="Province/State"
          value={value.province}
          onChange={(v) => onChange({ ...value, province: v })}
          placeholder="Enter province or state"
        />
        <Field
          label="District/Area"
          value={value.district}
          onChange={(v) => onChange({ ...value, district: v })}
          placeholder="Enter district or area"
        />

        <Textarea
          className="md:col-span-2"
          label="Full Address *"
          value={value.address}
          onChange={(v) => onChange({ ...value, address: v })}
          placeholder="Enter complete clinic address"
          rows={4}
        />

        <Textarea
          className="md:col-span-2"
          label="Description"
          value={value.description}
          onChange={(v) => onChange({ ...value, description: v })}
          placeholder="Describe your clinic, services, and what makes you special"
          rows={4}
        />
      </div>
    </>
  );
}

/* -------- Services: редактирование + currency input (uppercase) ------- */

function ServicesSection({
  rows,
  onChange,
}: {
  rows: ServiceRow[];
  onChange: (rows: ServiceRow[]) => void;
}) {
  const [draft, setDraft] = useState<ServiceRow>({
    name: "",
    price: "",
    currency: "USD",
    description: "",
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  function resetDraft() {
    setDraft({ name: "", price: "", currency: "USD", description: "" });
    setEditingIndex(null);
  }

  function handleSave() {
    if (!draft.name.trim()) return;
    const next = { ...draft, currency: (draft.currency || "USD").toUpperCase() };

    if (editingIndex === null) {
      onChange([...rows, next]);
    } else {
      onChange(rows.map((r, i) => (i === editingIndex ? next : r)));
    }
    resetDraft();
  }

  return (
    <>
      <div className="text-lg font-semibold">Services</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field
          label="Service Name *"
          value={draft.name}
          onChange={(v) => setDraft((d) => ({ ...d, name: v }))}
          placeholder="Enter service name"
        />
        <Field
          label="Price"
          value={draft.price || ""}
          onChange={(v) => setDraft((d) => ({ ...d, price: v }))}
          placeholder="Enter price"
        />
        <Field
          label="Currency"
          value={draft.currency}
          onChange={(v) =>
            setDraft((d) => ({ ...d, currency: v.toUpperCase() }))
          }
          placeholder="USD"
        />
        <Field
          label="Description"
          value={draft.description || ""}
          onChange={(v) => setDraft((d) => ({ ...d, description: v }))}
          placeholder="Enter description"
        />
      </div>

      <div className="flex items-center gap-2 mt-2">
        <button
          onClick={handleSave}
          className="rounded-md border bg-white px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
          disabled={!draft.name.trim()}
        >
          {editingIndex === null ? "+ Add Service" : "Save changes"}
        </button>
        {editingIndex !== null && (
          <button
            type="button"
            onClick={resetDraft}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        )}
      </div>

      {!rows.length ? (
        <p className="mt-3 text-sm text-gray-400">No services added yet.</p>
      ) : (
        <div className="mt-3 space-y-2">
          {rows.map((r, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded border px-3 py-2 text-sm"
            >
              <div>
                <div className="font-medium">{r.name}</div>
                <div className="text-gray-500">
                  {[
                    r.price &&
                      `${r.price} ${(r.currency || "USD").toUpperCase()}`,
                    r.description,
                  ]
                    .filter(Boolean)
                    .join(" • ")}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setDraft(r);
                    setEditingIndex(i);
                  }}
                  className="text-gray-500 hover:text-blue-600 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() =>
                    onChange(rows.filter((_, idx) => idx !== i))
                  }
                  className="text-gray-500 hover:text-rose-600 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/* ---------------- Doctors: upload only + edit ---------------- */

function DoctorsSection({
  rows,
  onChange,
}: {
  rows: Array<{ fullName: string; title?: string; specialty?: string; description?: string; photo?: string }>;
  onChange: (rows: Array<{ fullName: string; title?: string; specialty?: string; description?: string; photo?: string }>) => void;
}) {
  const [draft, setDraft] = useState<{
    fullName: string;
    title?: string;
    specialty?: string;
    description?: string;
    photo?: string;
  }>({
    fullName: "",
    title: "",
    specialty: "",
    description: "",
    photo: "",
  });

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputId = "doctorPhotoUpload";
  const MAX_MB = 20;
  const MAX_BYTES = MAX_MB * 1024 * 1024;

  const startNew = () => {
    setDraft({ fullName: "", title: "", specialty: "", description: "", photo: "" });
    setEditingIndex(null);
    setError(null);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files[0]) return;
    const file = files[0];

    if (file.size > MAX_BYTES) {
      setError(`Image is too large. Max size is ${MAX_MB} MB.`);
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const url = await uploadDoctorImage(file);
      setDraft((d) => ({ ...d, photo: url }));
    } catch (e: any) {
      console.error(e);
      setError("Failed to upload image. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleSave = () => {
    if (!draft.fullName.trim()) return;

    const normalized = {
      fullName: draft.fullName.trim(),
      title: draft.title?.trim() || "",
      specialty: draft.specialty?.trim() || "",
      description: draft.description?.trim() || "",
      photo: draft.photo?.trim() || "",
    };

    if (editingIndex === null) {
      onChange([...rows, normalized]);
    } else {
      onChange(
        rows.map((r, i) => (i === editingIndex ? normalized : r))
      );
    }

    startNew();
  };

  const handleEdit = (index: number) => {
    const d = rows[index];
    setDraft({
      fullName: d.fullName,
      title: d.title || "",
      specialty: d.specialty || "",
      description: d.description || "",
      photo: d.photo || "",
    });
    setEditingIndex(index);
    setError(null);
  };

  const handleDelete = (index: number) => {
    onChange(rows.filter((_, i) => i !== index));
    if (editingIndex === index) {
      startNew();
    }
  };

  return (
    <>
      <div className="text-lg font-semibold">Doctors &amp; Medical Staff</div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field
          label="Full Name *"
          value={draft.fullName}
          onChange={(v) => setDraft((d) => ({ ...d, fullName: v }))}
          placeholder="Dr. John Smith"
        />
        <Field
          label="Title/Position"
          value={draft.title || ""}
          onChange={(v) => setDraft((d) => ({ ...d, title: v }))}
          placeholder="Chief Surgeon"
        />
        <Field
          label="Specialty"
          value={draft.specialty || ""}
          onChange={(v) => setDraft((d) => ({ ...d, specialty: v }))}
          placeholder="Orthopedics, etc."
        />

        <div className="md:col-span-1">
          <label className="text-[13px] text-gray-600">Photo</label>
          <div className="mt-1 flex items-center gap-3">
            <input
              id={fileInputId}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
            />
            <label
              htmlFor={fileInputId}
              className={clsx(
                "rounded-md border bg-white px-3 py-2 text-sm cursor-pointer hover:bg-gray-50",
                busy && "opacity-60 cursor-default"
              )}
            >
              {busy ? "Uploading…" : "⬆ Upload photo from device"}
            </label>
            <span className="text-xs text-gray-500">
              One image per doctor. You can change it while editing.
            </span>
          </div>
          {draft.photo && (
            <div className="mt-2 h-10 w-10 rounded-full overflow-hidden bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={draft.photo}
                alt={draft.fullName || "Doctor photo"}
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </div>

        <Textarea
          className="md:col-span-2"
          label="Description"
          value={draft.description || ""}
          onChange={(v) => setDraft((d) => ({ ...d, description: v }))}
          placeholder="Short bio/qualifications"
        />
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={!draft.fullName.trim() || busy}
          className="rounded-md border bg-white px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
        >
          {editingIndex === null ? "+ Add Doctor" : "Save changes"}
        </button>
        {editingIndex !== null && (
          <button
            type="button"
            onClick={startNew}
            className="rounded-md border bg-white px-3 py-2 text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-600">{error}</p>
      )}

      {!rows.length ? (
        <p className="mt-3 text-sm text-gray-400">No doctors added yet.</p>
      ) : (
        <div className="mt-3 space-y-2">
          {rows.map((d, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded border px-3 py-2 text-sm"
            >
              <div className="flex items-center gap-3 min-w-0">
                {d.photo && (
                  <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={d.photo}
                      alt={d.fullName}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div className="truncate">
                  <span className="font-medium">{d.fullName}</span>
                  {d.title && (
                    <span className="text-gray-500"> — {d.title}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleEdit(i)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(i)}
                  className="text-sm text-gray-500 hover:text-rose-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/* -------- Additional (amenities + icons, accreditations edit+upload) --- */

function normalizeAmenityList(raw: any): AmenityItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (typeof item === "string") return { label: item, icon: undefined };
      if (!item) return null;
      const label = String(item.label ?? "").trim();
      if (!label) return null;
      const icon =
        item.icon && String(item.icon).trim()
          ? String(item.icon).trim()
          : undefined;
      return { label, icon };
    })
    .filter(Boolean) as AmenityItem[];
}

const AMENITY_ICON_OPTIONS: {
  value: string;
  label: string;
  icon: string;
}[] = [
  { value: "check", label: "General", icon: "solar:check-circle-bold" },
  { value: "bed", label: "Bed / room", icon: "mdi:bed" },
  { value: "tooth", label: "Dental", icon: "mdi:tooth-outline" },
  { value: "airplane", label: "Airplane / travel", icon: "mdi:airplane" },
  { value: "car", label: "Car / transfer", icon: "mdi:car" },
  { value: "hotel", label: "Hotel / stay", icon: "mdi:hotel" },
  { value: "language", label: "Languages", icon: "mdi:translate-variant" },
  { value: "globe", label: "Global / international", icon: "mdi:earth" },
];

function IconPicker({
  value,
  onChange,
}: {
  value?: string;
  onChange: (v: string | undefined) => void;
}) {
  const [open, setOpen] = useState(false);
  const active =
    AMENITY_ICON_OPTIONS.find((o) => o.value === value) ||
    AMENITY_ICON_OPTIONS[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1 rounded-md border bg-white px-2 py-1 text-xs hover:bg-gray-50"
      >
        <Icon
          icon={active.icon}
          className="h-4 w-4 text-sky-600"
        />
        <span className="text-[11px] text-gray-600">Icon</span>
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-56 rounded-md border bg-white shadow-lg p-2 grid grid-cols-3 gap-1">
          <button
            type="button"
            onClick={() => {
              onChange(undefined);
              setOpen(false);
            }}
            className="flex flex-col items-center justify-center rounded p-1 hover:bg-gray-50 text-xs text-gray-600 col-span-3 mb-1"
          >
            <span>No icon</span>
          </button>
          {AMENITY_ICON_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={clsx(
                "flex flex-col items-center justify-center rounded p-1 hover:bg-sky-50 text-[10px] text-gray-600",
                value === opt.value && "ring-2 ring-sky-500"
              )}
            >
              <Icon
                icon={opt.icon}
                className="mb-1 h-5 w-5 text-sky-600"
              />
              <span className="text-center leading-tight">{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function AmenityGroupField({
  label,
  placeholder,
  items,
  onChange,
}: {
  label: string;
  placeholder: string;
  items: AmenityItem[];
  onChange: (items: AmenityItem[]) => void;
}) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState<string | undefined>(undefined);

  function handleAdd() {
    const v = name.trim();
    if (!v) return;
    onChange([...items, { label: v, icon }]);
    setName("");
    setIcon(undefined);
  }

  return (
    <div className="space-y-1">
      <div className="text-[13px] text-gray-600">{label}</div>
      <div className="flex gap-2">
        <input
          className="flex-1 rounded-md border px-3 py-2 text-sm outline-none focus:border-blue-500"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={placeholder}
        />
        <IconPicker value={icon} onChange={setIcon} />
        <button
          type="button"
          onClick={handleAdd}
          className="rounded-md border bg-white px-3 py-2 text-xs hover:bg-gray-50"
        >
          Add
        </button>
      </div>

      {!items.length ? (
        <p className="mt-1 text-xs text-gray-400">No items yet.</p>
      ) : (
        <div className="mt-2 flex flex-wrap gap-2">
            {items.map((it, i) => {
              const cfg = AMENITY_ICON_OPTIONS.find((o) => o.value === it.icon);
              const iconName = cfg?.icon ?? AMENITY_ICON_OPTIONS[0].icon;

              return (
                <span
                  key={i}
                  className="inline-flex items-center gap-2 rounded-full bg-gray-50 border px-2 py-1 text-xs"
                >
                  <Icon icon={iconName} className="h-4 w-4 text-sky-600" />
                  <span>{it.label}</span>
                  <button
                    type="button"
                    onClick={() =>
                      onChange(items.filter((_, idx) => idx !== i))
                    }
                    className="text-gray-400 hover:text-rose-600"
                  >
                    ×
                  </button>
                </span>
              );
            })}
        </div>
      )}
    </div>
  );
}

function AdditionalSection({
  value,
  onChange,
}: {
  value: {
    premises: string[];
    clinic_services: string[];
    travel_services: string[];
    languages_spoken: string[];
    accreditations: Array<{ name: string; logo_url?: string; description?: string }>;
  };
  onChange: (v: any) => void;
}) {
  const [accDraft, setAccDraft] = useState<{ name: string; logo_url?: string; description?: string }>({
    name: "",
    logo_url: "",
    description: "",
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [accBusy, setAccBusy] = useState(false);
  const [accError, setAccError] = useState<string | null>(null);

  const logoInputId = "accreditationLogoUpload";
  const MAX_MB = 20;
  const MAX_BYTES = MAX_MB * 1024 * 1024;

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files[0]) return;
    const file = files[0];

    if (file.size > MAX_BYTES) {
      setAccError(`Image is too large. Max size is ${MAX_MB} MB.`);
      return;
    }

    setAccBusy(true);
    setAccError(null);

    try {
      const url = await uploadAccreditationLogo(file);
      setAccDraft((d) => ({ ...d, logo_url: url }));
    } catch (err) {
      console.error(err);
      setAccError("Failed to upload image. Please try again.");
    } finally {
      setAccBusy(false);
    }
  };

  const resetAcc = () => {
    setAccDraft({ name: "", logo_url: "", description: "" });
    setEditingIndex(null);
    setAccError(null);
  };

  const saveAccreditation = () => {
    if (!accDraft.name.trim()) return;

    const normalized = {
      name: accDraft.name.trim(),
      logo_url: accDraft.logo_url?.trim() || undefined,
      description: accDraft.description?.trim() || undefined,
    };

    if (editingIndex === null) {
      onChange({
        ...value,
        accreditations: [...(value.accreditations || []), normalized],
      });
    } else {
      onChange({
        ...value,
        accreditations: value.accreditations.map((a, i) =>
          i === editingIndex ? normalized : a
        ),
      });
    }

    resetAcc();
  };

  const editAccreditation = (index: number) => {
    const a = value.accreditations[index];
    setAccDraft({
      name: a.name,
      logo_url: a.logo_url || "",
      description: a.description || "",
    });
    setEditingIndex(index);
    setAccError(null);
  };

  const deleteAccreditation = (index: number) => {
    onChange({
      ...value,
      accreditations: value.accreditations.filter((_, i) => i !== index),
    });
    if (editingIndex === index) {
      resetAcc();
    }
  };

  return (
    <>
      <div className="text-lg font-semibold">Additional Services & Facilities</div>

      <TagInput
        label="Premises"
        values={value.premises}
        onAdd={(v) => onChange({ ...value, premises: [...value.premises, v] })}
        onRemove={(i) =>
          onChange({
            ...value,
            premises: value.premises.filter((_, idx) => idx !== i),
          })
        }
        placeholder="Operating rooms, recovery rooms, etc."
      />
      <div className="h-2" />

      <TagInput
        label="Clinic Services"
        values={value.clinic_services}
        onAdd={(v) =>
          onChange({
            ...value,
            clinic_services: [...value.clinic_services, v],
          })
        }
        onRemove={(i) =>
          onChange({
            ...value,
            clinic_services: value.clinic_services.filter((_, idx) => idx !== i),
          })
        }
        placeholder="Consultation, diagnosis, treatment, etc."
      />
      <div className="h-2" />

      <TagInput
        label="Travel Services"
        values={value.travel_services}
        onAdd={(v) =>
          onChange({
            ...value,
            travel_services: [...value.travel_services, v],
          })
        }
        onRemove={(i) =>
          onChange({
            ...value,
            travel_services: value.travel_services.filter((_, idx) => idx !== i),
          })
        }
        placeholder="Airport pickup, accommodation, etc."
      />
      <div className="h-2" />

      <TagInput
        label="Languages Spoken"
        values={value.languages_spoken}
        onAdd={(v) =>
          onChange({
            ...value,
            languages_spoken: [...value.languages_spoken, v],
          })
        }
        onRemove={(i) =>
          onChange({
            ...value,
            languages_spoken: value.languages_spoken.filter(
              (_, idx) => idx !== i
            ),
          })
        }
        placeholder="English, Spanish, French, etc."
      />

      {/* Accreditations */}
      <div className="h-4" />
      <div className="text-base font-medium">Accreditations</div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field
          label="Name *"
          value={accDraft.name}
          onChange={(v) => setAccDraft((a) => ({ ...a, name: v }))}
          placeholder="JCI, ISO..."
        />

        <div>
          <label className="text-[13px] text-gray-600">Logo</label>
          <div className="mt-1 flex items-center gap-3">
            <input
              id={logoInputId}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
            />
            <label
              htmlFor={logoInputId}
              className={clsx(
                "rounded-md border bg-white px-3 py-2 text-sm cursor-pointer hover:bg-gray-50",
                accBusy && "opacity-60 cursor-default"
              )}
            >
              {accBusy ? "Uploading…" : "⬆ Upload logo"}
            </label>
            <span className="text-xs text-gray-500">
              One image per accreditation.
            </span>
          </div>
          {accDraft.logo_url && (
            <div className="mt-2 h-10 w-10 overflow-hidden rounded bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={accDraft.logo_url}
                alt={accDraft.name || "Accreditation logo"}
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </div>

        <Textarea
          className="md:col-span-2"
          label="Description"
          value={accDraft.description || ""}
          onChange={(v) => setAccDraft((a) => ({ ...a, description: v }))}
          placeholder="Brief description of the accreditation"
        />
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={saveAccreditation}
          className="rounded-md border bg-white px-3 py-2 text-sm hover:bg-gray-50"
          disabled={!accDraft.name.trim() || accBusy}
        >
          {editingIndex === null ? "+ Add Accreditation" : "Save changes"}
        </button>
        {editingIndex !== null && (
          <button
            type="button"
            onClick={resetAcc}
            className="rounded-md border bg-white px-3 py-2 text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
      </div>

      {accError && (
        <p className="mt-2 text-xs text-red-600">{accError}</p>
      )}

      {!value.accreditations?.length ? (
        <p className="mt-3 text-sm text-gray-400">No accreditations yet.</p>
      ) : (
        <div className="mt-3 space-y-2">
          {value.accreditations.map((a, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded border px-3 py-2 text-sm"
            >
              <div className="flex items-center gap-3 min-w-0">
                {a.logo_url && (
                  <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={a.logo_url}
                      alt={a.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div className="truncate font-medium">{a.name}</div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => editAccreditation(i)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => deleteAccreditation(i)}
                  className="text-sm text-gray-500 hover:text-rose-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/* --------------------- Hours: fixed days + apply to all ---------------- */

function HoursSection({
  rows,
  onChange,
}: {
  rows: Array<{ day: string; status: "Open" | "Closed"; start?: string; end?: string }>;
  onChange: (rows: Array<{ day: string; status: "Open" | "Closed"; start?: string; end?: string }>) => void;
}) {
  const applyToAll = (index: number) => {
    const src = rows[index];
    const isClosed = src.status === "Closed";

    const next = rows.map((r) => ({
      ...r,
      status: src.status,
      start: isClosed ? undefined : src.start || "00:00",
      end: isClosed ? undefined : src.end || "00:00",
    }));

    onChange(next);
  };

  return (
    <>
      <div className="text-lg font-semibold">Operating Hours</div>
      <p className="mt-1 text-sm text-gray-500">
        Set opening hours for each day. Use “Apply to all days” to quickly copy status and time.
      </p>

      <div className="mt-3 space-y-3">
        {rows.map((r, i) => {
          const isClosed = r.status === "Closed";

          return (
            <div key={r.day} className="rounded border p-3">
              <div className="grid grid-cols-1 md:grid-cols-[1.1fr,1.1fr,1fr,1fr] gap-3 items-end">
                {/* Day (fixed, disabled) */}
                <div>
                  <label className="text-[13px] text-gray-600">Day</label>
                  <input
                    className="mt-1 w-full rounded-md border bg-gray-50 px-3 py-2 text-sm text-gray-500"
                    value={r.day}
                    disabled
                  />
                </div>

                {/* Status */}
                <Select
                  label="Status"
                  value={r.status}
                  onChange={(v) => {
                    const status = v as "Open" | "Closed";
                    const next = rows.map((x, idx) =>
                      idx === i
                        ? {
                            ...x,
                            status,
                            start: status === "Closed" ? undefined : x.start || "00:00",
                            end: status === "Closed" ? undefined : x.end || "00:00",
                          }
                        : x
                    );
                    onChange(next);
                  }}
                  options={[
                    { value: "Open", label: "Open" },
                    { value: "Closed", label: "Closed" },
                  ]}
                />

                {/* Start time */}
                <Field
                  label="Start Time"
                  type="time"
                  value={isClosed ? "" : (r.start || "")}
                  onChange={(v) => {
                    const next = rows.map((x, idx) =>
                      idx === i ? { ...x, start: v } : x
                    );
                    onChange(next);
                  }}
                  className={isClosed ? "opacity-60" : ""}
                />

                {/* End time */}
                <Field
                  label="End Time"
                  type="time"
                  value={isClosed ? "" : (r.end || "")}
                  onChange={(v) => {
                    const next = rows.map((x, idx) =>
                      idx === i ? { ...x, end: v } : x
                    );
                    onChange(next);
                  }}
                  className={isClosed ? "opacity-60" : ""}
                />
              </div>

              <div className="mt-2 text-right">
                <button
                  type="button"
                  onClick={() => applyToAll(i)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Apply to all days
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* --------------------- Gallery: only upload + editable title ---------- */

function GallerySection({
  rows,
  onChange,
}: {
  rows: Array<{ url: string; title?: string }>;
  onChange: (rows: Array<{ url: string; title?: string }>) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const MAX_IMAGES = 10;
  const MAX_MB = 20;
  const MAX_BYTES = MAX_MB * 1024 * 1024;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";

    if (!files.length) return;

    const remaining = MAX_IMAGES - rows.length;
    if (remaining <= 0) {
      setError(`You can upload up to ${MAX_IMAGES} images.`);
      return;
    }

    const allowed = files.slice(0, remaining);
    const tooBig = allowed.filter((f) => f.size > MAX_BYTES);

    if (tooBig.length) {
      setError(`Some files are too large. Max size is ${MAX_MB} MB per image.`);
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const urls = await uploadGallery(allowed);
      const next = [
        ...rows,
        ...urls.map((url, idx) => ({
          url,
          title: `Image ${rows.length + idx + 1}`,
        })),
      ];
      onChange(next);
    } catch (e: any) {
      console.error(e);
      setError("Failed to upload images. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (index: number) => {
    onChange(rows.filter((_, i) => i !== index));
  };

  return (
    <>
      <div className="text-lg font-semibold">Gallery</div>
      <p className="mt-1 text-sm text-gray-500">
        Upload up to {MAX_IMAGES} images. Max size {MAX_MB} MB per image.
      </p>

      <div className="mt-3">
        <input
          id="galleryUpload"
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleUpload}
        />
        <label
          htmlFor="galleryUpload"
          className={clsx(
            "inline-flex items-center rounded-md border px-3 py-2 text-sm cursor-pointer",
            "bg-white hover:bg-gray-50",
            uploading && "opacity-60 cursor-default"
          )}
        >
          {uploading ? "Uploading…" : "⬆ Upload images"}
        </label>
      </div>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      {!rows.length ? (
        <p className="mt-3 text-sm text-gray-400">No images yet.</p>
      ) : (
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((g, i) => (
            <div key={i} className="rounded-lg border overflow-hidden">
              <div className="aspect-[4/3] bg-gray-100">
                {g.url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={g.url}
                    alt={g.title || `Image ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="flex items-center justify-between px-3 py-2">
                <div className="min-w-0">
                  <div className="truncate text-sm text-gray-700">
                    {g.title || `Image ${i + 1}`}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(i)}
                  className="text-sm text-gray-500 hover:text-rose-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/* --------------------- Location & Payments (без изменений) ------------ */

function LocationSection({
  value,
  onChange,
}: {
  value: { mapUrl: string; directions: string };
  onChange: (v: { mapUrl: string; directions: string }) => void;
}) {
  return (
    <>
      <div className="text-lg font-semibold">Location & Directions</div>
      <Field
        label="Google Maps URL"
        value={value.mapUrl}
        onChange={(v) => onChange({ ...value, mapUrl: v })}
        placeholder="https://goo.gl/maps/..."
      />
      <Textarea
        label="Directions & Transportation"
        value={value.directions}
        onChange={(v) => onChange({ ...value, directions: v })}
        placeholder="Bus #5, Metro line A, etc."
      />
    </>
  );
}

function PaymentsSection({
  rows,
  onAdd,
  onRemove,
}: {
  rows: string[];
  onAdd: (r: string) => void;
  onRemove: (i: number) => void;
}) {
  const [draft, setDraft] = useState("");

  return (
    <>
      <div className="text-lg font-semibold">Payment Methods</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field
          label="Payment Method *"
          value={draft}
          onChange={setDraft}
          placeholder="e.g., Visa, Cash, Insurance"
        />
      </div>
      <button
        onClick={() => {
          const v = draft.trim();
          if (!v) return;
          onAdd(v);
          setDraft("");
        }}
        className="rounded-md border bg-white px-3 py-2 text-sm hover:bg-gray-50"
      >
        + Add Payment Method
      </button>

      {!rows.length ? (
        <p className="mt-2 text-sm text-gray-400">No payment methods yet.</p>
      ) : (
        <div className="mt-2 space-y-2">
          {rows.map((p, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded border px-3 py-2 text-sm"
            >
              <div className="font-medium">{p}</div>
              <button
                onClick={() => onRemove(i)}
                className="text-gray-500 hover:text-rose-600"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
