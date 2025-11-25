'use client';

import React, { useMemo, useState, useRef } from 'react';
import { uploadClinicImages } from './actions';

type TabKey = 'basic' | 'services' | 'gallery' | 'location' | 'doctors' | 'additional';

type ClinicState = {
  name: string;
  about: string;
  specialty: string;
  slug?: string;
  status: 'Pending' | 'Published' | 'Hidden';
  country: string;
  region?: string | null;
  city: string;
  district?: string | null;
  address: string;

  // NEW: вместо lat/lng
  mapUrl: string;
  directions: string;

  // платежи – как строки, но отправим в JSON [{method: ...}]
  payments: string[];

  // NEW: amenities -> clinics.amenities jsonb
  amenities: {
    premises: AmenityItem[];
    clinic_services: AmenityItem[];
    travel_services: AmenityItem[];
    languages_spoken: AmenityItem[];
  };
};

type AmenityItem = { label: string; icon: string };
type ServiceRow = { name: string; desc?: string; price?: string; currency: string };
type ImageRow   = { url: string; title?: string };
type DoctorRow  = { name: string; title?: string; spec?: string; photo?: string; bio?: string };
type HourRow    = { day: string; time?: string };
type AccRow     = { name: string; logo_url?: string; description?: string };

export default function AdminClinicNewPage() {
  const tabs = useMemo(
    () =>
      [
        { id: 'basic', label: 'Basic Info' },
        { id: 'services', label: 'Services' },
        { id: 'gallery', label: 'Gallery' },
        { id: 'location', label: 'Location' },
        { id: 'doctors', label: 'Doctors' },
        { id: 'additional', label: 'Additional' },
      ] as { id: TabKey; label: string }[],
    []
  );

  const [tab, setTab] = useState<TabKey>('basic');

  // единое состояние
  const [clinic, setClinic] = useState<ClinicState>({
    name: '',
    about: '',
    specialty: '',
    slug: '',
    status: 'Pending',
    country: '',
    region: '',
    city: '',
    district: '',
    address: '',
    mapUrl: '',
    directions: '',
    payments: [],
    amenities: {
      premises: [],
      clinic_services: [],
      travel_services: [],
      languages_spoken: [],
    },
  });

  const [services, setServices] = useState<ServiceRow[]>([]);
  const [images,   setImages]   = useState<ImageRow[]>([]);
  const [doctors,  setDoctors]  = useState<DoctorRow[]>([]);
  const [hours,    setHours]    = useState<HourRow[]>([]);
  const [accs,     setAccs]     = useState<AccRow[]>([]);

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  // обязательные поля basic
  const basicOk =
    clinic.name.trim() &&
    clinic.about.trim() &&
    clinic.specialty.trim() &&
    clinic.country.trim() &&
    clinic.city.trim() &&
    clinic.address.trim();

  // требуем чтобы все подразделы были заполнены
  const hasAllSections =
    services.length > 0 &&
    images.length > 0 &&
    doctors.length > 0 &&
    hours.length > 0 &&
    accs.length > 0;

  const canSave = !!basicOk && hasAllSections && !saving;

  async function onSave() {
    setErrorMsg(null);
    setOkMsg(null);

    if (!canSave) {
      setErrorMsg('Please complete all sections before saving.');
      if (!basicOk) setTab('basic');
      else if (!services.length) setTab('services');
      else if (!images.length) setTab('gallery');
      else if (!doctors.length) setTab('doctors');
      else if (!hours.length || !accs.length) setTab('additional');
      return;
    }

    const payload = {
      clinic: {
        name: clinic.name.trim(),
        about: clinic.about.trim(),
        specialty: clinic.specialty.trim(),
        slug: clinic.slug?.trim() || undefined,
        status: clinic.status,
        country: clinic.country.trim(),
        region: clinic.region?.trim() || null,
        city: clinic.city.trim(),
        district: clinic.district?.trim() || null,
        address: clinic.address.trim(),
    
        // вместо lat/lng
        map_embed_url: clinic.mapUrl.trim() || null,
        directions: clinic.directions.trim() || null, // если будешь хранить
    
        // JSONB [{ method: "..." }]
        payments: clinic.payments.map((p) => ({ method: p })),
    
        // JSONB amenities
        amenities: clinic.amenities,
      },
      services: services.map((s) => ({
        name: s.name.trim(),
        desc: s.desc?.trim() || undefined,
        price: s.price?.trim() || undefined,
        currency: s.currency,
      })),
      images: images.map((im) => ({
        url: im.url.trim(),
        title: im.title?.trim() || undefined,
      })),
      doctors: doctors.map((d) => ({
        name: d.name.trim(),
        title: d.title?.trim() || undefined,
        spec: d.spec?.trim() || undefined,
        photo: d.photo?.trim() || undefined,
        bio: d.bio?.trim() || undefined,
      })),
      hours: hours.map((h) => ({
        day: h.day.trim(),
        time: h.time?.trim() || undefined,
      })),
      accreditations: accs.map((a) => ({
        name: a.name.trim(),
        logo_url: a.logo_url?.trim() || undefined,
        description: a.description?.trim() || undefined,
      })),
    };

    setSaving(true);
    try {
      const res = await fetch('/api/admin/clinics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let json: any = null;
      try { json = text ? JSON.parse(text) : null; } catch {}

      if (!res.ok) {
        setErrorMsg(json?.error || text || 'Failed to save clinic');
        return;
      }

      setOkMsg('Clinic has been created successfully.');
    } catch (e: any) {
      setErrorMsg(e?.message || 'Network error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => history.back()}
            className="rounded-md border px-3 py-2 text-sm bg-white hover:bg-slate-50"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-semibold">Add New Clinic</h1>
        </div>
        <button
          type="button"
          onClick={onSave}
          disabled={!canSave}
          className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white ${
            canSave ? 'bg-sky-600 hover:bg-sky-700' : 'bg-slate-400 cursor-not-allowed'
          }`}
        >
          {saving ? 'Saving…' : '💾 Save Clinic'}
        </button>
      </div>

      {errorMsg && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {errorMsg}
        </div>
      )}
      {okMsg && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
          {okMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="rounded-md border bg-white">
        <div className="flex gap-1 border-b bg-slate-50 px-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-sm font-medium ${tab === t.id
                ? 'bg-white border-x border-t -mb-px rounded-t-md'
                : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-4">
          {tab === 'basic' && <BasicInfo clinic={clinic} setClinic={setClinic} />}
          {tab === 'services' && (
            <Services
              rows={services}
              onAdd={(row) => setServices((a) => [...a, row])}
              onRemove={(index) =>
                setServices((a) => a.filter((_, i) => i !== index))
              }
            />
          )}

          {tab === 'gallery' && (
            <Gallery
              rows={images}
              onAdd={(row) => setImages((a) => [...a, row])}
              onRemove={(index) =>
                setImages((a) => a.filter((_, i) => i !== index))
              }
            />
          )}

          {tab === 'doctors' && (
            <Doctors
              rows={doctors}
              onAdd={(row) => setDoctors((a) => [...a, row])}
              onRemove={(index) =>
                setDoctors((a) => a.filter((_, i) => i !== index))
              }
            />
          )}
          {tab === 'location' && <Location clinic={clinic} setClinic={setClinic} />}
          {tab === 'additional' && (
            <Additional
              clinic={clinic}
              setClinic={setClinic}
              hours={hours}
              payments={clinic.payments}
              accs={accs}
              onAddHour={(r) => setHours((a) => [...a, r])}
              onRemoveHour={(index) =>
                setHours((a) => a.filter((_, i) => i !== index))
              }
              onAddPayment={(r) =>
                setClinic((c) => ({
                  ...c,
                  payments: [...c.payments, r.pay],
                }))
              }
              onRemovePayment={(index) =>
                setClinic((c) => ({
                  ...c,
                  payments: c.payments.filter((_, i) => i !== index),
                }))
              }
              onAddAcc={(r) => setAccs((a) => [...a, r])}
              onRemoveAcc={(index) =>
                setAccs((a) => a.filter((_, i) => i !== index))
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- UI helpers ---------------- */

function Row({ children, cols = 2 }: { children: React.ReactNode; cols?: 1 | 2 }) {
  return <div className={`grid gap-3 ${cols === 2 ? 'md:grid-cols-2' : ''}`}>{children}</div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-1">
      <div className="text-xs font-medium text-slate-700">{label}</div>
      {children}
    </label>
  );
}
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-400 ${props.className || ''}`}
    />
  );
}
function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      rows={props.rows ?? 3}
      {...props}
      className={`w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-400 ${props.className || ''}`}
    />
  );
}
function SectionTitle({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="space-y-1">
      <div className="text-base font-semibold">{title}</div>
      {desc ? <div className="text-xs text-slate-500">{desc}</div> : null}
    </div>
  );
}
function EmptyOrList<T>({
  rows,
  emptyText,
  render,
}: {
  rows: T[];
  emptyText: string;
  render: (r: T, index: number) => React.ReactNode;
}) {
  if (!rows.length) {
    return (
      <div className="rounded-md border bg-white p-3 text-center text-sm text-slate-500">
        {emptyText}
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {rows.map((r, i) => (
        <div key={i}>{render(r, i)}</div>
      ))}
    </div>
  );
}

const AMENITY_ICON_OPTIONS = [
  { value: 'check', label: 'Check' },
  { value: 'bed', label: 'Bed / room' },
  { value: 'tooth', label: 'Tooth / dental' },
  { value: 'airplane', label: 'Airplane / travel' },
  { value: 'car', label: 'Car / transfer' },
  { value: 'hotel', label: 'Hotel / stay' },
  { value: 'language', label: 'Languages' },
  { value: 'globe', label: 'Global / international' },
];

function AmenityGroup({
  label,
  items,
  placeholder,
  onChange,
}: {
  label: string;
  items: AmenityItem[];
  placeholder?: string;
  onChange: (next: AmenityItem[]) => void;
}) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('check');

  const add = () => {
    const v = name.trim();
    if (!v) return;
    onChange([...items, { label: v, icon }]);
    setName('');
  };

  const remove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const changeIcon = (index: number, value: string) => {
    onChange(
      items.map((it, i) => (i === index ? { ...it, icon: value } : it)),
    );
  };

  return (
    <div className="space-y-2">
      <div className="text-xs font-medium text-slate-700">{label}</div>
      <div className="flex gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={placeholder}
        />
        <select
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          className="rounded border border-slate-300 px-2 py-2 text-xs"
        >
          {AMENITY_ICON_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={add}
          className="rounded-md border bg-white px-3 py-2 text-xs hover:bg-slate-50"
        >
          Add
        </button>
      </div>

      {!items.length ? (
        <div className="text-xs text-slate-400 mt-1">No items yet.</div>
      ) : (
        <div className="mt-2 space-y-1">
          {items.map((it, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-full bg-slate-100 px-3 py-1 text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[11px] text-emerald-600">
                  {it.icon.slice(0, 2).toUpperCase()}
                </span>
                <span>{it.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={it.icon}
                  onChange={(e) => changeIcon(i, e.target.value)}
                  className="rounded border border-slate-300 px-2 py-1 text-[11px]"
                >
                  {AMENITY_ICON_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="text-slate-500 hover:text-rose-600"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
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
  onRemove: (index: number) => void;
  placeholder?: string;
}) {
  const [val, setVal] = useState('');
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-slate-700">{label}</div>
      <div className="flex gap-2">
        <Input
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
            setVal('');
          }}
          className="rounded-md border bg-white px-3 py-2 text-sm hover:bg-slate-50"
        >
          + Add
        </button>
      </div>
      {!values.length ? (
        <div className="text-xs text-slate-400 mt-1">No items yet.</div>
      ) : (
        <div className="mt-2 flex flex-wrap gap-2">
          {values.map((v, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs"
            >
              {v}
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="text-slate-500 hover:text-rose-600"
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

/* ---------------- Sections ---------------- */

function BasicInfo({
  clinic,
  setClinic,
}: {
  clinic: ClinicState;
  setClinic: React.Dispatch<React.SetStateAction<ClinicState>>;
}) {
  return (
    <div className="space-y-6">
      <SectionTitle title="Basic Information" desc="Enter the essential details about the clinic." />
      <Row>
        <Field label="Clinic Name*">
          <Input
            value={clinic.name}
            onChange={(e) => setClinic(c => ({ ...c, name: e.target.value }))}
            placeholder="Enter clinic name"
          />
        </Field>
        <Field label="Specialty*">
          <Input
            value={clinic.specialty}
            onChange={(e) => setClinic(c => ({ ...c, specialty: e.target.value }))}
            placeholder="e.g., Dentistry, Cardiology"
          />
        </Field>
      </Row>
      <Field label="Description*">
        <Textarea
          value={clinic.about}
          onChange={(e) => setClinic(c => ({ ...c, about: e.target.value }))}
          placeholder="Provide a detailed description of the clinic"
          rows={4}
        />
      </Field>
      <Row>
        <Field label="Slug (URL Path)">
          <Input
            value={clinic.slug || ''}
            onChange={(e) => setClinic(c => ({ ...c, slug: e.target.value }))}
            placeholder="clinic-url-slug"
          />
        </Field>
        <Field label="Status">
          <select
            value={clinic.status}
            onChange={(e) => setClinic(c => ({ ...c, status: e.target.value as ClinicState['status'] }))}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
          >
            <option>Pending</option>
            <option>Published</option>
            <option>Hidden</option>
          </select>
        </Field>
      </Row>

      <SectionTitle title="Location" desc="Enter the location details for the clinic." />
      <Row>
        <Field label="Country*">
          <Input value={clinic.country} onChange={(e) => setClinic(c => ({ ...c, country: e.target.value }))} placeholder="Enter country" />
        </Field>
        <Field label="Province/State">
          <Input value={clinic.region || ''} onChange={(e) => setClinic(c => ({ ...c, region: e.target.value }))} placeholder="Enter province or state" />
        </Field>
      </Row>
      <Row>
        <Field label="City*">
          <Input value={clinic.city} onChange={(e) => setClinic(c => ({ ...c, city: e.target.value }))} placeholder="Enter city" />
        </Field>
        <Field label="District/Area">
          <Input value={clinic.district || ''} onChange={(e) => setClinic(c => ({ ...c, district: e.target.value }))} placeholder="Enter district or area" />
        </Field>
      </Row>
      <Field label="Full Address* (for Map)">
        <Textarea value={clinic.address} onChange={(e) => setClinic(c => ({ ...c, address: e.target.value }))} placeholder="Enter the full address of the clinic" rows={3} />
      </Field>
    </div>
  );
}

function Services({
  rows,
  onAdd,
  onRemove,
}: {
  rows: ServiceRow[];
  onAdd: (row: ServiceRow) => void;
  onRemove: (index: number) => void;
}) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('USD'); // дефолт

  return (
    <div className="space-y-4">
      <SectionTitle
        title="Clinic Services"
        desc="Add treatments and services provided by the clinic."
      />

      <div className="rounded-md border p-4">
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Service Name*">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Dental Cleaning"
            />
          </Field>
          <Field label="Description">
            <Input
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Brief description of the service"
            />
          </Field>
          <Field label="Price">
            <Input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g., 100"
            />
          </Field>
          <Field label="Currency">
            <Input
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              placeholder="e.g., USD"
            />
          </Field>
        </div>

        <button
          type="button"
          onClick={() => {
            if (!name.trim()) return;
            onAdd({ name, desc, price, currency });
            setName('');
            setDesc('');
            setPrice('');
            setCurrency('USD');
          }}
          className="mt-3 rounded-md border bg-sky-50 px-3 py-2 text-sm text-sky-700 hover:bg-sky-100"
        >
          + Add Service
        </button>
      </div>

      <EmptyOrList
        emptyText="No services added yet. Add services using the form above."
        rows={rows}
        render={(r, i) => (
          <div className="flex items-center justify-between rounded border px-3 py-2 text-sm">
            <div>
              <div className="font-medium">{r.name}</div>
              <div className="text-xs text-slate-500">
                {r.price
                  ? `${r.price} ${r.currency || ''}`.trim()
                  : '—'}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="text-xs text-rose-600 hover:text-rose-700"
            >
              Remove
            </button>
          </div>
        )}
      />
    </div>
  );
}

function Gallery({
  rows,
  onAdd,
  onRemove,
}: {
  rows: ImageRow[];
  onAdd: (row: ImageRow) => void;
  onRemove: (index: number) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const urls = await uploadClinicImages(files);
      urls.forEach((u) => onAdd({ url: u, title: '' }));
    } catch (err) {
      console.error(err);
      alert('Failed to upload images');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  return (
    <div className="space-y-4">
      <SectionTitle
        title="Photo Gallery"
        desc="Add photos of the clinic to showcase the facilities."
      />

      <div className="rounded-md border p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFilesChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-md border bg-white px-3 py-2 text-sm"
            disabled={uploading}
          >
            {uploading ? 'Uploading…' : '⬆ Upload Images'}
          </button>
          <span className="text-xs text-slate-500">
            You can select multiple images at once.
          </span>
        </div>
      </div>

      <EmptyOrList
        emptyText="No images added yet. Upload some images."
        rows={rows}
        render={(r, i) => (
          <div className="flex items-center justify-between rounded border px-3 py-2 text-sm">
            <div className="flex items-center gap-3 min-w-0">
              {/* Превью */}
              <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={r.url}
                  alt={r.title || 'Clinic image'}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="truncate text-xs text-slate-600">
                  {r.url}
                </div>
                {r.title && (
                  <div className="truncate text-[11px] text-slate-400">
                    {r.title}
                  </div>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="text-xs text-rose-600 hover:text-rose-700"
            >
              Remove
            </button>
          </div>
        )}
      />
    </div>
  );
}

function Location({
  clinic,
  setClinic,
}: {
  clinic: ClinicState;
  setClinic: React.Dispatch<React.SetStateAction<ClinicState>>;
}) {
  return (
    <div className="space-y-4">
      <SectionTitle
        title="Location & Directions"
        desc="Paste Google Maps link and describe how to get to the clinic."
      />

      <Field label="Google Maps URL">
        <Input
          value={clinic.mapUrl}
          onChange={(e) => setClinic((c) => ({ ...c, mapUrl: e.target.value }))}
          placeholder="https://maps.app.goo.gl/..."
        />
      </Field>

      <Field label="Directions & Transportation">
        <Textarea
          value={clinic.directions}
          onChange={(e) => setClinic((c) => ({ ...c, directions: e.target.value }))}
          placeholder="Closest airport, metro, buses, pickup details…"
          rows={4}
        />
      </Field>

      <div className="rounded-md border bg-slate-50 p-3 text-xs text-slate-600">
        This information will be shown on the clinic page (e.g. “Directions & transportation”).
      </div>
    </div>
  );
}

function Doctors({
  rows,
  onAdd,
  onRemove,
}: {
  rows: DoctorRow[];
  onAdd: (row: DoctorRow) => void;
  onRemove: (index: number) => void;
}) {
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [spec, setSpec] = useState('');
  const [photo, setPhoto] = useState('');
  const [bio, setBio] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files[0]) return;
    setUploading(true);
    try {
      const [url] = await uploadClinicImages([files[0]]);
      if (url) setPhoto(url);
    } catch (err) {
      console.error(err);
      alert('Failed to upload photo');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  return (
    <div className="space-y-4">
      <SectionTitle
        title="Doctors & Specialists"
        desc="Add information about doctors and specialists working at the clinic."
      />

      <div className="rounded-md border p-4 space-y-3">
        <Row>
          <Field label="Doctor Name*">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dr. John Doe"
            />
          </Field>
          <Field label="Title/Position">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Chief Dentist"
            />
          </Field>
        </Row>

        <Row>
          <Field label="Specialty">
            <Input
              value={spec}
              onChange={(e) => setSpec(e.target.value)}
              placeholder="e.g., Dentistry"
            />
          </Field>
          <Field label="Photo">
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-md border bg-white px-3 py-2 text-sm"
                disabled={uploading}
              >
                {uploading ? 'Uploading…' : '⬆ Upload Photo'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              {photo && (
                <div className="h-12 w-12 overflow-hidden rounded bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo}
                    alt={name || 'Doctor photo'}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </div>
          </Field>
        </Row>

        <Field label="Biography/Description">
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Brief biography and qualifications"
          />
        </Field>

        <button
          type="button"
          onClick={() => {
            if (!name.trim()) return;
            onAdd({ name, title, spec, photo, bio });
            setName('');
            setTitle('');
            setSpec('');
            setPhoto('');
            setBio('');
          }}
          className="mt-3 rounded-md border bg-sky-50 px-3 py-2 text-sm text-sky-700 hover:bg-sky-100"
        >
          + Add Doctor
        </button>
      </div>

      <EmptyOrList
        emptyText="No doctors added yet. Add doctors using the form above."
        rows={rows}
        render={(r, i) => (
          <div className="flex items-center justify-between rounded border px-3 py-2 text-sm">
            <div>
              <div className="font-medium">{r.name}</div>
              <div className="text-xs text-slate-500">
                {[r.title, r.spec].filter(Boolean).join(' • ')}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="text-xs text-rose-600 hover:text-rose-700"
            >
              Remove
            </button>
          </div>
        )}
      />
    </div>
  );
}

function Additional({
  clinic,
  setClinic,
  onAddHour,
  onRemoveHour,
  onAddPayment,
  onRemovePayment,
  onAddAcc,
  onRemoveAcc,
  hours,
  payments,
  accs,
}: {
  clinic: ClinicState;
  setClinic: React.Dispatch<React.SetStateAction<ClinicState>>;
  onAddHour: (r: HourRow) => void;
  onRemoveHour: (index: number) => void;
  onAddPayment: (r: { pay: string }) => void;
  onRemovePayment: (index: number) => void;
  onAddAcc: (r: AccRow) => void;
  onRemoveAcc: (index: number) => void;
  hours: HourRow[];
  payments: string[];
  accs: AccRow[];
}) {
  const [day, setDay] = useState('');
  const [time, setTime] = useState('');
  const [pay, setPay] = useState('');
  const [accName, setAccName] = useState('');
  const [accLogo, setAccLogo] = useState('');
  const [accDesc, setAccDesc] = useState('');
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files[0]) return;

    setLogoUploading(true);
    try {
      const [url] = await uploadClinicImages([files[0]]);
      if (url) setAccLogo(url);
    } catch (err) {
      console.error(err);
      alert('Failed to upload logo');
    } finally {
      setLogoUploading(false);
      e.target.value = '';
    }
  }

  const { amenities } = clinic;

  const updateAmenities = (
    field: keyof ClinicState['amenities'],
    updater: (prev: AmenityItem[]) => AmenityItem[],
  ) => {
    setClinic((c) => ({
      ...c,
      amenities: {
        ...c.amenities,
        [field]: updater(c.amenities[field]),
      },
    }));
  };

  return (
    <div className="space-y-8">
      {/* Operating hours */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Operating Hours</h3>
        <div className="rounded-md border p-4">
          <Row>
            <Field label="Day">
              <Input
                value={day}
                onChange={(e) => setDay(e.target.value)}
                placeholder="e.g., Monday or Monday–Friday"
              />
            </Field>
            <Field label="Hours">
              <Input
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g., 09:00 - 17:00"
              />
            </Field>
          </Row>
          <button
            type="button"
            onClick={() => {
              if (!day.trim()) return;
              onAddHour({ day, time });
              setDay('');
              setTime('');
            }}
            className="mt-3 rounded-md border bg-sky-50 px-3 py-2 text-sm text-sky-700 hover:bg-sky-100"
          >
            + Add Hours
          </button>
        </div>
        {/* Operating hours list */}
        <EmptyOrList
          emptyText="No operating hours added yet."
          rows={hours}
          render={(r, i) => (
            <div className="flex items-center justify-between rounded border px-3 py-2 text-sm">
              <div>
                {r.day} — {r.time || '—'}
              </div>
              <button
                type="button"
                onClick={() => onRemoveHour(i)}
                className="text-xs text-rose-600 hover:text-rose-700"
              >
                Remove
              </button>
            </div>
          )}
        />
      </div>

      {/* Amenities */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Additional Services (Amenities)</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <AmenityGroup
            label="Premises"
            items={amenities.premises}
            placeholder="e.g., Operating theatre, Recovery room"
            onChange={(next) =>
              updateAmenities('premises', () => next)
            }
          />
          <AmenityGroup
            label="Clinic services"
            items={amenities.clinic_services}
            placeholder="e.g., Online consultation"
            onChange={(next) =>
              updateAmenities('clinic_services', () => next)
            }
          />
          <AmenityGroup
            label="Travel services"
            items={amenities.travel_services}
            placeholder="e.g., Airport pickup, Hotel booking"
            onChange={(next) =>
              updateAmenities('travel_services', () => next)
            }
          />
          <AmenityGroup
            label="Languages spoken"
            items={amenities.languages_spoken}
            placeholder="English, Turkish, Russian…"
            onChange={(next) =>
              updateAmenities('languages_spoken', () => next)
            }
          />
        </div>
      </div>

      {/* Payment methods */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Payment Methods</h3>
        <div className="rounded-md border p-4">
          <Field label="Payment Method">
            <Input
              value={pay}
              onChange={(e) => setPay(e.target.value)}
              placeholder="e.g., Payment plans, Credit cards"
            />
          </Field>
          <button
            type="button"
            onClick={() => {
              if (!pay.trim()) return;
              onAddPayment({ pay });
              setPay('');
            }}
            className="mt-3 rounded-md border bg-sky-50 px-3 py-2 text-sm text-sky-700 hover:bg-sky-100"
          >
            + Add Payment Method
          </button>
        </div>
        {/* Payment methods list */}
        <EmptyOrList
          emptyText="No payment methods added yet."
          rows={payments}
          render={(r, i) => (
            <div className="flex items-center justify-between rounded border px-3 py-2 text-sm">
              <div>{r}</div>
              <button
                type="button"
                onClick={() => onRemovePayment(i)}
                className="text-xs text-rose-600 hover:text-rose-700"
              >
                Remove
              </button>
            </div>
          )}
        />
      </div>

      {/* Accreditations */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Accreditations & Certifications</h3>
        <div className="rounded-md border p-4 space-y-3">
          <Row>
            <Field label="Accreditation Name*">
              <Input
                value={accName}
                onChange={(e) => setAccName(e.target.value)}
                placeholder="e.g., JCI Accredited"
              />
            </Field>

            <Field label="Logo">
              {accLogo && (
                <div className="mb-2 h-10 w-10 overflow-hidden rounded bg-slate-100">
                  <img
                    src={accLogo}
                    alt={accName || 'Accreditation logo'}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              <div className="flex gap-2">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="rounded-md border bg-white px-3 py-1 text-xs"
                  disabled={logoUploading}
                >
                  {logoUploading ? 'Uploading…' : '⬆ Upload Logo'}
                </button>
              </div>
            </Field>
          </Row>

          <Field label="Description">
            <Textarea
              value={accDesc}
              onChange={(e) => setAccDesc(e.target.value)}
              placeholder="Brief description of the accreditation"
            />
          </Field>

          <button
            type="button"
            onClick={() => {
              if (!accName.trim()) return;
              onAddAcc({
                name: accName,
                logo_url: accLogo || undefined,
                description: accDesc || undefined,
              });
              setAccName('');
              setAccLogo('');
              setAccDesc('');
            }}
            className="rounded-md border bg-sky-50 px-3 py-2 text-sm text-sky-700 hover:bg-sky-100"
          >
            + Add Accreditation
          </button>
        </div>

        {/* Accreditations list */}
        <EmptyOrList
          emptyText="No accreditations added yet."
          rows={accs}
          render={(r, i) => (
            <div className="flex items-center justify-between rounded border px-3 py-2 text-sm">
              <div className="font-medium">{r.name}</div>
              <button
                type="button"
                onClick={() => onRemoveAcc(i)}
                className="text-xs text-rose-600 hover:text-rose-700"
              >
                Remove
              </button>
            </div>
          )}
        />
      </div>
    </div>
  );
}
