// components/admin/ClinicDraftEditor.tsx
"use client";

import * as React from "react";

type Service = {
  name: string;
  price?: number | null;
  currency?: string | null;
  description?: string | null;
};

type Doctor = {
  fullName?: string;
  title?: string;
  specialty?: string;
};

type Hour = {
  day: string;
  status?: string;
  start?: string;
  end?: string;
};

type GalleryItem = {
  url: string;
  title?: string;
};

type Facilities = {
  premises: string[];
  clinic_services: string[];
  travel_services: string[];
  languages_spoken: string[];
};

// pricing храним как массив строк (названия методов)
type Props = {
  initialServices: Service[];
  initialDoctors: Doctor[];
  initialHours: Hour[];
  initialGallery: GalleryItem[];
  initialFacilities: Facilities;
  initialPricing: string[];
};

export default function ClinicDraftEditor({
  initialServices,
  initialDoctors,
  initialHours,
  initialGallery,
  initialFacilities,
  initialPricing,
}: Props) {
  const [services, setServices] = React.useState<Service[]>(
    initialServices ?? [],
  );
  const [doctors, setDoctors] = React.useState<Doctor[]>(
    initialDoctors ?? [],
  );
  const [hours, setHours] = React.useState<Hour[]>(
    initialHours ?? [],
  );
  const [gallery, setGallery] = React.useState<GalleryItem[]>(
    initialGallery ?? [],
  );
  const [facilities, setFacilities] = React.useState<Facilities>({
    premises: initialFacilities?.premises ?? [],
    clinic_services: initialFacilities?.clinic_services ?? [],
    travel_services: initialFacilities?.travel_services ?? [],
    languages_spoken: initialFacilities?.languages_spoken ?? [],
  });
  const [payments, setPayments] = React.useState<string[]>(
    initialPricing ?? [],
  );

  // ---- helpers ----
  const updateService = (i: number, patch: Partial<Service>) =>
    setServices((prev) =>
      prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)),
    );

  const updateDoctor = (i: number, patch: Partial<Doctor>) =>
    setDoctors((prev) =>
      prev.map((d, idx) => (idx === i ? { ...d, ...patch } : d)),
    );

  const updateHour = (i: number, patch: Partial<Hour>) =>
    setHours((prev) =>
      prev.map((h, idx) => (idx === i ? { ...h, ...patch } : h)),
    );

  const updateGallery = (i: number, patch: Partial<GalleryItem>) =>
    setGallery((prev) =>
      prev.map((g, idx) => (idx === i ? { ...g, ...patch } : g)),
    );

  const updateFacilitiesArray = (
    key: keyof Facilities,
    updater: (prev: string[]) => string[],
  ) =>
    setFacilities((prev) => ({
      ...prev,
      [key]: updater(prev[key] ?? []),
    }));

  const addFacility = (key: keyof Facilities, value: string) => {
    const v = value.trim();
    if (!v) return;
    updateFacilitiesArray(key, (prev) =>
      prev.includes(v) ? prev : [...prev, v],
    );
  };

  const removeFacility = (key: keyof Facilities, value: string) => {
    updateFacilitiesArray(key, (prev) => prev.filter((x) => x !== value));
  };

  const addPayment = () =>
    setPayments((prev) => [...prev, ""]);

  const updatePayment = (i: number, value: string) =>
    setPayments((prev) =>
      prev.map((p, idx) => (idx === i ? value : p)),
    );

  const removePayment = (i: number) =>
    setPayments((prev) => prev.filter((_, idx) => idx !== i));

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // ---- hidden JSON fields, которые читает server action ----
  const servicesJson = JSON.stringify(services ?? []);
  const doctorsJson = JSON.stringify(doctors ?? []);
  const hoursJson = JSON.stringify(hours ?? []);
  const galleryJson = JSON.stringify(gallery ?? []);
  const facilitiesJson = JSON.stringify(facilities ?? {});
  const pricingJson = JSON.stringify(
    payments.filter((p) => p.trim().length > 0),
  );

  return (
    <>
      {/* hidden inputs для server action saveClinic */}
      <input type="hidden" name="draft_services" value={servicesJson} />
      <input type="hidden" name="draft_doctors" value={doctorsJson} />
      <input type="hidden" name="draft_hours" value={hoursJson} />
      <input type="hidden" name="draft_gallery" value={galleryJson} />
      <input type="hidden" name="draft_facilities" value={facilitiesJson} />
      <input type="hidden" name="draft_pricing" value={pricingJson} />

      {/* SERVICES & DOCTORS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Services &amp; doctors
          </h2>
          <span className="text-xs text-gray-400">
            {services.length} service(s) · {doctors.length} doctor(s)
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-2 text-sm">
          {/* Services */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Services
              </span>
              <button
                type="button"
                className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
                onClick={() =>
                  setServices((prev) => [
                    ...prev,
                    { name: "", price: null, currency: "USD", description: "" },
                  ])
                }
              >
                + Add service
              </button>
            </div>

            {!services.length && (
              <p className="text-xs text-gray-400">
                No services yet. Click “Add service”.
              </p>
            )}

            {services.map((s, i) => (
              <div
                key={i}
                className="space-y-2 rounded-lg border bg-gray-50/60 p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600">
                    Service #{i + 1}
                  </span>
                  <button
                    type="button"
                    className="text-xs text-red-500 hover:underline"
                    onClick={() =>
                      setServices((prev) =>
                        prev.filter((_, idx) => idx !== i),
                      )
                    }
                  >
                    Remove
                  </button>
                </div>

                <div className="grid gap-2 md:grid-cols-2">
                  <label className="space-y-1">
                    <span className="text-xs text-gray-500">Name</span>
                    <input
                      className="w-full rounded border px-2 py-1 text-sm"
                      value={s.name ?? ""}
                      onChange={(e) =>
                        updateService(i, { name: e.target.value })
                      }
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-xs text-gray-500">Price</span>
                    <input
                      className="w-full rounded border px-2 py-1 text-sm"
                      type="number"
                      min={0}
                      value={s.price ?? ""}
                      onChange={(e) =>
                        updateService(i, {
                          price: e.target.value
                            ? Number(e.target.value)
                            : null,
                        })
                      }
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-xs text-gray-500">Currency</span>
                    <input
                      className="w-full rounded border px-2 py-1 text-sm"
                      value={s.currency ?? ""}
                      onChange={(e) =>
                        updateService(i, { currency: e.target.value })
                      }
                    />
                  </label>
                  <label className="space-y-1 md:col-span-2">
                    <span className="text-xs text-gray-500">
                      Description
                    </span>
                    <textarea
                      className="w-full rounded border px-2 py-1 text-sm"
                      rows={2}
                      value={s.description ?? ""}
                      onChange={(e) =>
                        updateService(i, {
                          description: e.target.value,
                        })
                      }
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>

          {/* Doctors */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Doctors
              </span>
              <button
                type="button"
                className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
                onClick={() =>
                  setDoctors((prev) => [
                    ...prev,
                    { fullName: "", title: "", specialty: "" },
                  ])
                }
              >
                + Add doctor
              </button>
            </div>

            {!doctors.length && (
              <p className="text-xs text-gray-400">
                No doctors yet. Click “Add doctor”.
              </p>
            )}

            {doctors.map((d, i) => (
              <div
                key={i}
                className="space-y-2 rounded-lg border bg-gray-50/60 p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600">
                    Doctor #{i + 1}
                  </span>
                  <button
                    type="button"
                    className="text-xs text-red-500 hover:underline"
                    onClick={() =>
                      setDoctors((prev) =>
                        prev.filter((_, idx) => idx !== i),
                      )
                    }
                  >
                    Remove
                  </button>
                </div>

                <div className="grid gap-2 md:grid-cols-2">
                  <label className="space-y-1 md:col-span-2">
                    <span className="text-xs text-gray-500">Full name</span>
                    <input
                      className="w-full rounded border px-2 py-1 text-sm"
                      value={d.fullName ?? ""}
                      onChange={(e) =>
                        updateDoctor(i, { fullName: e.target.value })
                      }
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-xs text-gray-500">Title</span>
                    <input
                      className="w-full rounded border px-2 py-1 text-sm"
                      value={d.title ?? ""}
                      onChange={(e) =>
                        updateDoctor(i, { title: e.target.value })
                      }
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-xs text-gray-500">Specialty</span>
                    <input
                      className="w-full rounded border px-2 py-1 text-sm"
                      value={d.specialty ?? ""}
                      onChange={(e) =>
                        updateDoctor(i, { specialty: e.target.value })
                      }
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOURS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Working hours
          </h2>
          <button
            type="button"
            className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
            onClick={() =>
              setHours((prev) => [
                ...prev,
                {
                  day: days[(prev.length || 0) % days.length],
                  status: "open",
                  start: "",
                  end: "",
                },
              ])
            }
          >
            + Add day
          </button>
        </div>

        {!hours.length && (
          <p className="text-xs text-gray-400">
            No schedule yet. Add days and set hours.
          </p>
        )}

        <div className="space-y-2">
          {hours.map((h, i) => (
            <div
              key={i}
              className="grid gap-2 rounded-lg border bg-gray-50/60 p-3 md:grid-cols-[1.5fr,1fr,1fr,auto]"
            >
              <select
                className="rounded border px-2 py-1 text-sm"
                value={h.day}
                onChange={(e) =>
                  updateHour(i, { day: e.target.value })
                }
              >
                {days.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <select
                className="rounded border px-2 py-1 text-sm"
                value={h.status ?? "open"}
                onChange={(e) =>
                  updateHour(i, { status: e.target.value })
                }
              >
                <option value="open">open</option>
                <option value="closed">closed</option>
                <option value="by_appointment">by appointment</option>
              </select>
              <div className="flex gap-2">
                <input
                  type="time"
                  className="w-full rounded border px-2 py-1 text-sm"
                  value={h.start ?? ""}
                  onChange={(e) =>
                    updateHour(i, { start: e.target.value })
                  }
                />
                <input
                  type="time"
                  className="w-full rounded border px-2 py-1 text-sm"
                  value={h.end ?? ""}
                  onChange={(e) =>
                    updateHour(i, { end: e.target.value })
                  }
                />
              </div>
              <button
                type="button"
                className="text-xs text-red-500 hover:underline"
                onClick={() =>
                  setHours((prev) =>
                    prev.filter((_, idx) => idx !== i),
                  )
                }
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* GALLERY */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Gallery
          </h2>
          <button
            type="button"
            className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
            onClick={() =>
              setGallery((prev) => [...prev, { url: "", title: "" }])
            }
          >
            + Add image
          </button>
        </div>

        {!gallery.length && (
          <p className="text-xs text-gray-400">
            No images yet. Add image URLs or подключи сюда свой
            загрузчик из “Add new clinic”.
          </p>
        )}

        <div className="grid gap-3 md:grid-cols-2">
          {gallery.map((g, i) => (
            <div
              key={i}
              className="space-y-2 rounded-lg border bg-gray-50/60 p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-600">
                  Image #{i + 1}
                </span>
                <button
                  type="button"
                  className="text-xs text-red-500 hover:underline"
                  onClick={() =>
                    setGallery((prev) =>
                      prev.filter((_, idx) => idx !== i),
                    )
                  }
                >
                  Remove
                </button>
              </div>
              <label className="space-y-1">
                <span className="text-xs text-gray-500">Image URL</span>
                <input
                  className="w-full rounded border px-2 py-1 text-sm"
                  value={g.url ?? ""}
                  onChange={(e) =>
                    updateGallery(i, { url: e.target.value })
                  }
                  placeholder="https://..."
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-gray-500">Title</span>
                <input
                  className="w-full rounded border px-2 py-1 text-sm"
                  value={g.title ?? ""}
                  onChange={(e) =>
                    updateGallery(i, { title: e.target.value })
                  }
                />
              </label>
              {g.url && (
                <div className="overflow-hidden rounded border bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={g.url}
                    alt={g.title || "Image preview"}
                    className="h-32 w-full object-cover"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FACILITIES & PAYMENTS */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Facilities &amp; payment methods
        </h2>

        <div className="grid gap-6 md:grid-cols-2 text-sm">
          {/* Facilities */}
          <div className="space-y-4">
            <FacilitiesEditor
              label="Premises"
              values={facilities.premises}
              onAdd={(v) => addFacility("premises", v)}
              onRemove={(v) => removeFacility("premises", v)}
            />
            <FacilitiesEditor
              label="Clinic services"
              values={facilities.clinic_services}
              onAdd={(v) => addFacility("clinic_services", v)}
              onRemove={(v) =>
                removeFacility("clinic_services", v)
              }
            />
            <FacilitiesEditor
              label="Travel services"
              values={facilities.travel_services}
              onAdd={(v) => addFacility("travel_services", v)}
              onRemove={(v) =>
                removeFacility("travel_services", v)
              }
            />
            <FacilitiesEditor
              label="Languages spoken"
              values={facilities.languages_spoken}
              onAdd={(v) => addFacility("languages_spoken", v)}
              onRemove={(v) =>
                removeFacility("languages_spoken", v)
              }
            />
          </div>

          {/* Payments */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Payment methods
              </span>
              <button
                type="button"
                className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
                onClick={addPayment}
              >
                + Add method
              </button>
            </div>

            {!payments.length && (
              <p className="text-xs text-gray-400">
                No payment methods yet.
              </p>
            )}

            <div className="space-y-2">
              {payments.map((p, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    className="w-full rounded border px-2 py-1 text-sm"
                    value={p}
                    onChange={(e) =>
                      updatePayment(i, e.target.value)
                    }
                    placeholder="Visa / MasterCard / Cash / BTC..."
                  />
                  <button
                    type="button"
                    className="text-xs text-red-500 hover:underline"
                    onClick={() => removePayment(i)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function FacilitiesEditor({
  label,
  values,
  onAdd,
  onRemove,
}: {
  label: string;
  values: string[];
  onAdd: (v: string) => void;
  onRemove: (v: string) => void;
}) {
  const [draft, setDraft] = React.useState("");

  return (
    <div className="space-y-2">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="flex gap-2">
        <input
          className="w-full rounded border px-2 py-1 text-sm"
          placeholder="e.g. Free Wi-Fi"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAdd(draft);
              setDraft("");
            }
          }}
        />
        <button
          type="button"
          className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
          onClick={() => {
            onAdd(draft);
            setDraft("");
          }}
        >
          Add
        </button>
      </div>
      {!values.length ? (
        <p className="text-xs text-gray-400">—</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {values.map((v) => (
            <button
              key={v}
              type="button"
              className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs"
              onClick={() => onRemove(v)}
            >
              <span>{v}</span>
              <span className="text-gray-400">✕</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
