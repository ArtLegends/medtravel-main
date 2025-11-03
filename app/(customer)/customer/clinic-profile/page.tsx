"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";

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

/* -------------------------------- Page -------------------------------- */

export default function ClinicProfilePage() {
  // current section (single page; right pane switches)
  const [active, setActive] = useState<SectionKey>("basic");

  // unified local draft (позже заменим на контекст + server actions)
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

  const [services, setServices] = useState<Array<{ name: string; price?: string; category?: string; description?: string }>>([]);
  const [doctors, setDoctors] = useState<Array<{ fullName: string; specialty?: string; exp?: string; qual?: string; photo?: string }>>([]);
  const [additional, setAdditional] = useState({
    premises: [] as string[],
    clinic_services: [] as string[],
    travel_services: [] as string[],
    languages_spoken: [] as string[],
    accreditations: [] as Array<{ name: string; logo_url?: string; description?: string }>,
  });
  const [hours, setHours] = useState<Array<{ day: string; status: "Open" | "Closed"; start?: string; end?: string }>>([
    { day: "Monday", status: "Open", start: "09:00", end: "17:00" },
    { day: "Tuesday", status: "Open", start: "09:00", end: "17:00" },
    { day: "Wednesday", status: "Open", start: "09:00", end: "17:00" },
    { day: "Thursday", status: "Open", start: "09:00", end: "17:00" },
    { day: "Friday", status: "Open", start: "09:00", end: "17:00" },
    { day: "Saturday", status: "Closed" },
    { day: "Sunday", status: "Closed" },
  ]);
  const [gallery, setGallery] = useState<Array<{ url: string; title?: string }>>([]);
  const [location, setLocation] = useState({ mapUrl: "", directions: "" });
  const [payments, setPayments] = useState<Array<{ method: string; icon?: string; color?: string }>>([]);

  // section statuses (минимальная логика для бейджей/прогресса)
  const sectionStatuses: Record<SectionKey, SectionStatus> = useMemo(() => {
    const basicOk =
      basic.name.trim() &&
      basic.specialty.trim() &&
      basic.country.trim() &&
      basic.city.trim() &&
      basic.address.trim();

    const servicesOk = services.length > 0 && services.every((s) => s.name.trim());
    const doctorsOk = doctors.length > 0 && doctors.every((d) => d.fullName.trim());
    const locationOk = location.mapUrl.trim() || (basic.country && basic.city && basic.address);

    return {
      basic: basicOk ? "Complete" : "Required",
      services: servicesOk ? "Complete" : services.length ? "Empty" : "Required",
      doctors: doctorsOk ? "Complete" : doctors.length ? "Empty" : "Required",
      location: locationOk ? "Complete" : "Required",
      additional:
        additional.premises.length ||
        additional.clinic_services.length ||
        additional.travel_services.length ||
        additional.languages_spoken.length ||
        additional.accreditations?.length
          ? "Complete"
          : "Empty",
      hours: hours.some((h) => h.status === "Open") ? "Complete" : "Empty",
      gallery: gallery.length ? "Complete" : "Empty",
      payments: payments.length ? "Complete" : "Empty",
    };
  }, [basic, services, doctors, location, additional, hours, gallery, payments]);

  const completion = useMemo(() => {
    const done = REQUIRED.filter((k) => sectionStatuses[k] === "Complete").length;
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
        {/* LEFT: status + progress + publish + sections */}
        <div className="space-y-4">
          {/* Status */}
          <Card className="p-4">
            <div className="text-sm text-gray-500 mb-2">Status</div>
            <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
              Draft
            </span>
          </Card>

          {/* Progress */}
          <Card className="p-4">
            <div className="text-sm text-gray-500 mb-2">Profile Completion</div>
            <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
              <div
                className={clsx("h-2 rounded-full transition-all", completion === 100 ? "bg-emerald-500" : "bg-blue-500")}
                style={{ width: `${completion}%` }}
              />
            </div>
            <div className="mt-2 text-sm text-gray-600">{completion}%</div>
          </Card>

          {/* Publish */}
          <Card className="p-4 space-y-3">
            <button
              disabled={publishDisabled}
              className={clsx(
                "w-full rounded-md px-3 py-2 text-white font-medium transition",
                publishDisabled ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              )}
            >
              Publish Clinic
            </button>
            <p className="text-xs text-gray-500">Complete all sections to enable publishing</p>
          </Card>

          {/* Sections list */}
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
                    <span className={clsx("text-sm font-medium", isActive ? "text-blue-800" : "text-gray-900")}>
                      {s.label}
                    </span>
                    {REQUIRED.includes(s.key) && <span className="text-[11px] text-rose-600/80">• required</span>}
                  </div>
                  <span
                    className={clsx(
                      "text-xs px-2 py-1 rounded-full",
                      state === "Required" && "bg-rose-50 text-rose-600",
                      state === "Complete" && "bg-emerald-50 text-emerald-600",
                      state === "Empty" && "bg-gray-100 text-gray-700"
                    )}
                  >
                    {state}
                  </span>
                </button>
              );
            })}
          </Card>

        </div>

        {/* RIGHT: dynamic content */}
        <Card className="p-6 space-y-6">
          {active === "basic" && (
            <BasicInfo
              value={basic}
              onChange={setBasic}
              completion={completion}
            />
          )}

          {active === "services" && (
            <ServicesSection
              rows={services}
              onAdd={(row) => setServices((a) => [...a, row])}
              onRemove={(i) => setServices((a) => a.filter((_, idx) => idx !== i))}
            />
          )}

          {active === "doctors" && (
            <DoctorsSection
              rows={doctors}
              onAdd={(row) => setDoctors((a) => [...a, row])}
              onRemove={(i) => setDoctors((a) => a.filter((_, idx) => idx !== i))}
            />
          )}

          {active === "additional" && (
            <AdditionalSection value={additional} onChange={setAdditional} />
          )}

          {active === "hours" && (
            <HoursSection
              rows={hours}
              onChange={setHours}
              onAdd={() => setHours((h) => [...h, { day: "New day", status: "Open", start: "09:00", end: "17:00" }])}
              onRemove={(i) => setHours((h) => h.filter((_, idx) => idx !== i))}
            />
          )}

          {active === "gallery" && (
            <GallerySection
              rows={gallery}
              onAdd={(row) => setGallery((g) => [...g, row])}
              onRemove={(i) => setGallery((g) => g.filter((_, idx) => idx !== i))}
            />
          )}

          {active === "location" && (
            <LocationSection value={location} onChange={setLocation} />
          )}

          {active === "payments" && (
            <PaymentsSection
              rows={payments}
              onAdd={(row) => setPayments((p) => [...p, row])}
              onRemove={(i) => setPayments((p) => p.filter((_, idx) => idx !== i))}
            />
          )}

          {/* footer actions (общие для секций) */}
          <div className="flex items-center justify-between">
            <button className="inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Save as Draft
            </button>
            <button className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">
              Submit for Review
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ----------------------------- Primitives ----------------------------- */

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={clsx("rounded-xl border bg-white", className)}>{children}</div>;
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
          <option key={o.value + o.label} value={o.value} disabled={o.disabled}>
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
            <span key={i} className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm">
              {v}
              <button onClick={() => onRemove(i)} className="text-gray-500 hover:text-rose-600">×</button>
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
}) {
  return (
    <>
      <div className="space-y-2">
        <div className="text-lg font-semibold">Basic Information</div>
        <p className="text-sm text-gray-500">Set up your clinic&apos;s basic information and contact details</p>
      </div>

      <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <div className="font-medium mb-1">Complete all required fields to submit your clinic for review.</div>
        <div>You&apos;re {completion}% done!</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Clinic Name *" value={value.name} onChange={(v) => onChange({ ...value, name: v })} placeholder="Enter clinic name" />
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
            { value: "dentistry", label: "Dentistry" },
            { value: "cosmetology", label: "Cosmetology" },
            { value: "orthopedics", label: "Orthopedics" },
          ]}
        />

        <div />

        <Field label="Country *" value={value.country} onChange={(v) => onChange({ ...value, country: v })} placeholder="Enter country" />
        <Field label="City *" value={value.city} onChange={(v) => onChange({ ...value, city: v })} placeholder="Enter city" />
        <Field label="Province/State" value={value.province} onChange={(v) => onChange({ ...value, province: v })} placeholder="Enter province or state" />
        <Field label="District/Area" value={value.district} onChange={(v) => onChange({ ...value, district: v })} placeholder="Enter district or area" />

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

function ServicesSection({
  rows,
  onAdd,
  onRemove,
}: {
  rows: Array<{ name: string; price?: string; category?: string; description?: string }>;
  onAdd: (r: { name: string; price?: string; category?: string; description?: string }) => void;
  onRemove: (idx: number) => void;
}) {
  const [draft, setDraft] = useState({ name: "", price: "", category: "", description: "" });

  return (
    <>
      <div className="text-lg font-semibold">Services</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Service Name" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} placeholder="Enter service name" />
        <Field label="Price" value={draft.price} onChange={(v) => setDraft({ ...draft, price: v })} placeholder="Enter price" />
        <Field label="Category" value={draft.category} onChange={(v) => setDraft({ ...draft, category: v })} placeholder="Service category" />
        <Field label="Description" value={draft.description} onChange={(v) => setDraft({ ...draft, description: v })} placeholder="Enter description" />
      </div>
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            if (!draft.name.trim()) return;
            onAdd({ ...draft });
            setDraft({ name: "", price: "", category: "", description: "" });
          }}
          className="rounded-md border bg-white px-3 py-2 text-sm hover:bg-gray-50"
        >
          + Add Service
        </button>
      </div>

      {!rows.length ? (
        <p className="text-sm text-gray-400">No services added yet.</p>
      ) : (
        <div className="space-y-2">
          {rows.map((r, i) => (
            <div key={i} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
              <div>
                <div className="font-medium">{r.name}</div>
                <div className="text-gray-500">{[r.category, r.price && `Price: ${r.price}`, r.description].filter(Boolean).join(" • ")}</div>
              </div>
              <button onClick={() => onRemove(i)} className="text-gray-500 hover:text-rose-600">Delete</button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function DoctorsSection({
  rows,
  onAdd,
  onRemove,
}: {
  rows: Array<{ fullName: string; specialty?: string; exp?: string; qual?: string; photo?: string }>;
  onAdd: (r: { fullName: string; specialty?: string; exp?: string; qual?: string; photo?: string }) => void;
  onRemove: (idx: number) => void;
}) {
  const [draft, setDraft] = useState({ fullName: "", specialty: "", exp: "", qual: "", photo: "" });

  return (
    <>
      <div className="text-lg font-semibold">Doctors & Medical Staff</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Full Name *" value={draft.fullName} onChange={(v) => setDraft({ ...draft, fullName: v })} placeholder="Dr. John Smith" />
        <Field label="Specialty" value={draft.specialty} onChange={(v) => setDraft({ ...draft, specialty: v })} placeholder="Cardiology, Orthopedics, etc." />
        <Field label="Experience" value={draft.exp} onChange={(v) => setDraft({ ...draft, exp: v })} placeholder="Years of experience or background" />
        <Field label="Qualifications" value={draft.qual} onChange={(v) => setDraft({ ...draft, qual: v })} placeholder="Degrees, certifications" />
        <Field label="Photo URL" value={draft.photo} onChange={(v) => setDraft({ ...draft, photo: v })} placeholder="https://..." />
      </div>
      <button
        onClick={() => {
          if (!draft.fullName.trim()) return;
          onAdd({ ...draft });
          setDraft({ fullName: "", specialty: "", exp: "", qual: "", photo: "" });
        }}
        className="rounded-md border bg-white px-3 py-2 text-sm hover:bg-gray-50"
      >
        + Add Doctor
      </button>

      {!rows.length ? (
        <p className="mt-2 text-sm text-gray-400">No doctors added yet.</p>
      ) : (
        <div className="mt-2 space-y-2">
          {rows.map((d, i) => (
            <div key={i} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
              <div className="truncate">
                <span className="font-medium">{d.fullName}</span>
                {d.specialty ? <span className="text-gray-500"> — {d.specialty}</span> : null}
              </div>
              <button onClick={() => onRemove(i)} className="text-gray-500 hover:text-rose-600">Delete</button>
            </div>
          ))}
        </div>
      )}
    </>
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
  const [acc, setAcc] = useState<{ name: string; logo_url?: string; description?: string }>({ name: "", logo_url: "", description: "" });

  return (
    <>
      <div className="text-lg font-semibold">Additional Services & Facilities</div>

      <TagInput
        label="Premises"
        values={value.premises}
        onAdd={(v) => onChange({ ...value, premises: [...value.premises, v] })}
        onRemove={(i) => onChange({ ...value, premises: value.premises.filter((_, idx) => idx !== i) })}
        placeholder="Operating rooms, recovery rooms, etc."
      />
      <div className="h-2" />

      <TagInput
        label="Clinic Services"
        values={value.clinic_services}
        onAdd={(v) => onChange({ ...value, clinic_services: [...value.clinic_services, v] })}
        onRemove={(i) => onChange({ ...value, clinic_services: value.clinic_services.filter((_, idx) => idx !== i) })}
        placeholder="Consultation, diagnosis, treatment, etc."
      />
      <div className="h-2" />

      <TagInput
        label="Travel Services"
        values={value.travel_services}
        onAdd={(v) => onChange({ ...value, travel_services: [...value.travel_services, v] })}
        onRemove={(i) => onChange({ ...value, travel_services: value.travel_services.filter((_, idx) => idx !== i) })}
        placeholder="Airport pickup, accommodation, etc."
      />
      <div className="h-2" />

      <TagInput
        label="Languages Spoken"
        values={value.languages_spoken}
        onAdd={(v) => onChange({ ...value, languages_spoken: [...value.languages_spoken, v] })}
        onRemove={(i) => onChange({ ...value, languages_spoken: value.languages_spoken.filter((_, idx) => idx !== i) })}
        placeholder="English, Spanish, French, etc."
      />

      <div className="h-4" />
      <div className="text-base font-medium">Accreditations</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Name *" value={acc.name} onChange={(v) => setAcc((a) => ({ ...a, name: v }))} placeholder="JCI, ISO..." />
        <Field label="Logo URL" value={acc.logo_url || ""} onChange={(v) => setAcc((a) => ({ ...a, logo_url: v }))} placeholder="https://..." />
        <Textarea className="md:col-span-2" label="Description" value={acc.description || ""} onChange={(v) => setAcc((a) => ({ ...a, description: v }))} />
      </div>
      <button
        onClick={() => {
          if (!acc.name.trim()) return;
          onChange({ ...value, accreditations: [...(value.accreditations || []), acc] });
          setAcc({ name: "", logo_url: "", description: "" });
        }}
        className="rounded-md border bg-white px-3 py-2 text-sm hover:bg-gray-50"
      >
        + Add Accreditation
      </button>

      {!value.accreditations?.length ? (
        <p className="mt-2 text-sm text-gray-400">No accreditations yet.</p>
      ) : (
        <div className="mt-2 space-y-2">
          {value.accreditations.map((a, i) => (
            <div key={i} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
              <div className="font-medium">{a.name}</div>
              <button
                onClick={() =>
                  onChange({
                    ...value,
                    accreditations: value.accreditations.filter((_, idx) => idx !== i),
                  })
                }
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

function HoursSection({
  rows,
  onChange,
  onAdd,
  onRemove,
}: {
  rows: Array<{ day: string; status: "Open" | "Closed"; start?: string; end?: string }>;
  onChange: (rows: Array<{ day: string; status: "Open" | "Closed"; start?: string; end?: string }>) => void;
  onAdd: () => void;
  onRemove: (i: number) => void;
}) {
  return (
    <>
      <div className="text-lg font-semibold">Operating Hours</div>
      <button onClick={onAdd} className="rounded-md border bg-white px-3 py-2 text-sm hover:bg-gray-50">+ Add Hours</button>
      <div className="mt-3 space-y-3">
        {rows.map((r, i) => (
          <div key={i} className="rounded border p-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Field label="Day" value={r.day} onChange={(v) => onChange(rows.map((x, idx) => (idx === i ? { ...x, day: v } : x)))} />
              <Select
                label="Status"
                value={r.status}
                onChange={(v) => onChange(rows.map((x, idx) => (idx === i ? { ...x, status: v as "Open" | "Closed" } : x)))}
                options={[
                  { value: "Open", label: "Open" },
                  { value: "Closed", label: "Closed" },
                ]}
              />
              <Field label="Start Time" type="time" value={r.start || ""} onChange={(v) => onChange(rows.map((x, idx) => (idx === i ? { ...x, start: v } : x)))} />
              <Field label="End Time" type="time" value={r.end || ""} onChange={(v) => onChange(rows.map((x, idx) => (idx === i ? { ...x, end: v } : x)))} />
            </div>
            <div className="mt-2 text-right">
              <button onClick={() => onRemove(i)} className="text-sm text-gray-500 hover:text-rose-600">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function GallerySection({
  rows,
  onAdd,
  onRemove,
}: {
  rows: Array<{ url: string; title?: string }>;
  onAdd: (r: { url: string; title?: string }) => void;
  onRemove: (i: number) => void;
}) {
  const [draft, setDraft] = useState({ url: "", title: "" });
  return (
    <>
      <div className="text-lg font-semibold">Gallery</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Image URL" value={draft.url} onChange={(v) => setDraft({ ...draft, url: v })} placeholder="https://example.com/image.jpg" />
        <Field label="Image Title" value={draft.title} onChange={(v) => setDraft({ ...draft, title: v })} placeholder="Optional" />
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => {
            if (!draft.url.trim()) return;
            onAdd(draft);
            setDraft({ url: "", title: "" });
          }}
          className="rounded-md border bg-white px-3 py-2 text-sm hover:bg-gray-50"
        >
          + Add Image
        </button>
        <button className="rounded-md border bg-white px-3 py-2 text-sm" disabled>
          ⬆ Upload (later)
        </button>
      </div>

      {!rows.length ? (
        <p className="mt-2 text-sm text-gray-400">No images yet.</p>
      ) : (
        <div className="mt-2 space-y-2">
          {rows.map((g, i) => (
            <div key={i} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
              <div className="truncate">{g.url}</div>
              <button onClick={() => onRemove(i)} className="text-gray-500 hover:text-rose-600">Delete</button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

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
      <Field label="Google Maps URL" value={value.mapUrl} onChange={(v) => onChange({ ...value, mapUrl: v })} placeholder="https://goo.gl/maps/..." />
      <Textarea label="Directions & Transportation" value={value.directions} onChange={(v) => onChange({ ...value, directions: v })} placeholder="Bus #5, Metro line A, etc." />
    </>
  );
}

function PaymentsSection({
  rows,
  onAdd,
  onRemove,
}: {
  rows: Array<{ method: string; icon?: string; color?: string }>;
  onAdd: (r: { method: string; icon?: string; color?: string }) => void;
  onRemove: (i: number) => void;
}) {
  const [draft, setDraft] = useState({ method: "", icon: "credit-card", color: "Purple" });

  return (
    <>
      <div className="text-lg font-semibold">Payment Methods</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field label="Payment Method *" value={draft.method} onChange={(v) => setDraft({ ...draft, method: v })} placeholder="e.g., Credit Card, Cash, Insurance" />
        <Select
          label="Icon"
          value={draft.icon}
          onChange={(v) => setDraft({ ...draft, icon: v })}
          options={[{ value: "credit-card", label: "credit-card" }, { value: "wallet", label: "wallet" }, { value: "banknote", label: "banknote" }]}
        />
        <Select
          label="Color"
          value={draft.color}
          onChange={(v) => setDraft({ ...draft, color: v })}
          options={[{ value: "Purple", label: "Purple" }, { value: "Blue", label: "Blue" }, { value: "Green", label: "Green" }]}
        />
      </div>
      <button
        onClick={() => {
          if (!draft.method.trim()) return;
          onAdd(draft);
          setDraft({ method: "", icon: "credit-card", color: "Purple" });
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
            <div key={i} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
              <div className="font-medium">{p.method}</div>
              <button onClick={() => onRemove(i)} className="text-gray-500 hover:text-rose-600">Delete</button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
