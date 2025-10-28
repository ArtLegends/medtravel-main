'use client';

import React, { useMemo, useState } from 'react';

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
  lat?: string | null;
  lng?: string | null;
  payments: string[];
};

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
    lat: '',
    lng: '',
    payments: [],
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
        lat: clinic.lat?.trim() || null,
        lng: clinic.lng?.trim() || null,
        payments: clinic.payments,
      },
      services: services.map(s => ({
        name: s.name.trim(),
        desc: s.desc?.trim() || undefined,
        price: s.price?.trim() || undefined,
        currency: s.currency,
      })),
      images: images.map(im => ({ url: im.url.trim(), title: im.title?.trim() || undefined })),
      doctors: doctors.map(d => ({
        name: d.name.trim(),
        title: d.title?.trim() || undefined,
        spec: d.spec?.trim() || undefined,
        photo: d.photo?.trim() || undefined,
        bio: d.bio?.trim() || undefined,
      })),
      hours: hours.map(h => ({ day: h.day.trim(), time: h.time?.trim() || undefined })),
      accreditations: accs.map(a => ({
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
          {tab === 'services' && <Services onAdd={(row) => setServices((a) => [...a, row])} rows={services} />}
          {tab === 'gallery' && <Gallery onAdd={(row) => setImages((a) => [...a, row])} rows={images} />}
          {tab === 'location' && <Location clinic={clinic} setClinic={setClinic} />}
          {tab === 'doctors' && <Doctors onAdd={(row) => setDoctors((a) => [...a, row])} rows={doctors} />}
          {tab === 'additional' && (
            <Additional
              clinic={clinic}
              setClinic={setClinic}
              onAddHour={(r) => setHours((a) => [...a, r])}
              onAddPayment={(r) => setClinic((c) => ({ ...c, payments: [...c.payments, r.pay] }))}
              onAddAcc={(r) => setAccs((a) => [...a, r])}
              hours={hours}
              payments={clinic.payments}
              accs={accs}
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
  render: (r: T) => React.ReactNode;
}) {
  if (!rows.length) {
    return (
      <div className="rounded-md border bg-white p-3 text-center text-sm text-slate-500">
        {emptyText}
      </div>
    );
  }
  return <div className="space-y-2">{rows.map((r, i) => <div key={i}>{render(r)}</div>)}</div>;
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

function Services({ onAdd, rows }: { onAdd: (row: ServiceRow) => void; rows: ServiceRow[] }) {
  const [name, setName] = useState(''); const [desc, setDesc] = useState(''); const [price, setPrice] = useState(''); const [currency, setCurrency] = useState('USD');
  return (
    <div className="space-y-4">
      <SectionTitle title="Clinic Services" desc="Add treatments and services provided by the clinic." />
      <div className="rounded-md border p-4">
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Service Name*"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Dental Cleaning" /></Field>
          <Field label="Description"><Input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Brief description of the service" /></Field>
          <Field label="Price"><Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g., 100" /></Field>
          <Field label="Currency">
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full rounded border border-slate-300 px-3 py-2 text-sm">
              <option>USD</option><option>EUR</option><option>GBP</option><option>TRY</option>
            </select>
          </Field>
        </div>
        <button
          type="button"
          onClick={() => { if (!name.trim()) return; onAdd({ name, desc, price, currency }); setName(''); setDesc(''); setPrice(''); }}
          className="mt-3 rounded-md border bg-sky-50 px-3 py-2 text-sm text-sky-700 hover:bg-sky-100"
        >
          + Add Service
        </button>
      </div>
      <EmptyOrList emptyText="No services added yet. Add services using the form above." rows={rows} render={(r) => (
        <div className="flex justify-between rounded border px-3 py-2 text-sm">
          <div>{r.name}</div>
          <div className="text-slate-500">{r.price ? `${r.price} ${r.currency}` : '—'}</div>
        </div>
      )} />
    </div>
  );
}

function Gallery({ onAdd, rows }: { onAdd: (row: ImageRow) => void; rows: ImageRow[] }) {
  const [url, setUrl] = useState(''); const [title, setTitle] = useState('');
  return (
    <div className="space-y-4">
      <SectionTitle title="Photo Gallery" desc="Add photos of the clinic to showcase the facilities." />
      <div className="rounded-md border p-4">
        <Row>
          <Field label="Image URL*"><Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/image.jpg" /></Field>
          <Field label="Image Title/Caption"><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Reception area" /></Field>
        </Row>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => { if (!url.trim()) return; onAdd({ url, title }); setUrl(''); setTitle(''); }}
            className="rounded-md border bg-sky-50 px-3 py-2 text-sm text-sky-700 hover:bg-sky-100"
          >
            + Add Image URL
          </button>
          <button type="button" className="rounded-md border bg-white px-3 py-2 text-sm" disabled>⬆ Upload Image</button>
        </div>
      </div>
      <EmptyOrList emptyText="No images added yet. Add images using the form above." rows={rows} render={(r) => (
        <div className="rounded border px-3 py-2 text-sm">{r.url}</div>
      )} />
    </div>
  );
}

function Location({ clinic, setClinic }: { clinic: ClinicState; setClinic: React.Dispatch<React.SetStateAction<ClinicState>>; }) {
  return (
    <div className="space-y-4">
      <SectionTitle title="Location Information" desc="Enter detailed location information for the clinic." />
      <Row>
        <Field label="Latitude"><Input value={clinic.lat || ''} onChange={(e) => setClinic(c => ({ ...c, lat: e.target.value }))} placeholder="e.g., 40.7128" /></Field>
        <Field label="Longitude"><Input value={clinic.lng || ''} onChange={(e) => setClinic(c => ({ ...c, lng: e.target.value }))} placeholder="e.g., -74.0060" /></Field>
      </Row>
      <div className="rounded-md border bg-slate-50 p-3 text-xs text-slate-600">Map preview will be implemented later.</div>
    </div>
  );
}

function Doctors({ onAdd, rows }: { onAdd: (row: DoctorRow) => void; rows: DoctorRow[] }) {
  const [name, setName] = useState(''); const [title, setTitle] = useState(''); const [spec, setSpec] = useState(''); const [photo, setPhoto] = useState(''); const [bio, setBio] = useState('');
  return (
    <div className="space-y-4">
      <SectionTitle title="Doctors & Specialists" desc="Add information about doctors and specialists working at the clinic." />
      <div className="rounded-md border p-4">
        <Row>
          <Field label="Doctor Name*"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Dr. John Doe" /></Field>
          <Field label="Title/Position"><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Chief Surgeon" /></Field>
        </Row>
        <Row>
          <Field label="Specialty"><Input value={spec} onChange={(e) => setSpec(e.target.value)} placeholder="e.g., Orthopedics" /></Field>
          <Field label="Photo URL"><Input value={photo} onChange={(e) => setPhoto(e.target.value)} placeholder="https://example.com/doctor.jpg" /></Field>
        </Row>
        <Field label="Biography/Description"><Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Brief biography and qualifications" /></Field>
        <button
          type="button"
          onClick={() => { if (!name.trim()) return; onAdd({ name, title, spec, photo, bio }); setName(''); setTitle(''); setSpec(''); setPhoto(''); setBio(''); }}
          className="mt-3 rounded-md border bg-sky-50 px-3 py-2 text-sm text-sky-700 hover:bg-sky-100"
        >
          + Add Doctor
        </button>
      </div>
      <EmptyOrList emptyText="No doctors added yet. Add doctors using the form above." rows={rows} render={(r) => (
        <div className="rounded border px-3 py-2 text-sm">{r.name}{r.title ? ` — ${r.title}` : ''}</div>
      )} />
    </div>
  );
}

function Additional({
  clinic, setClinic, onAddHour, onAddPayment, onAddAcc, hours, payments, accs,
}: {
  clinic: ClinicState;
  setClinic: React.Dispatch<React.SetStateAction<ClinicState>>;
  onAddHour: (r: HourRow) => void;
  onAddPayment: (r: { pay: string }) => void;
  onAddAcc: (r: AccRow) => void;
  hours: HourRow[];
  payments: string[];
  accs: AccRow[];
}) {
  const [day, setDay] = useState(''); const [time, setTime] = useState('');
  const [pay, setPay] = useState('');
  const [accName, setAccName] = useState(''); const [accLogo, setAccLogo] = useState(''); const [accDesc, setAccDesc] = useState('');

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Operating Hours</h3>
        <div className="rounded-md border p-4">
          <Row>
            <Field label="Day"><Input value={day} onChange={(e) => setDay(e.target.value)} placeholder="e.g., Monday or Monday–Friday" /></Field>
            <Field label="Hours"><Input value={time} onChange={(e) => setTime(e.target.value)} placeholder="e.g., 9:00 AM - 3:00 PM" /></Field>
          </Row>
          <button type="button" onClick={() => { if (!day.trim()) return; onAddHour({ day, time }); setDay(''); setTime(''); }}
            className="mt-3 rounded-md border bg-sky-50 px-3 py-2 text-sm text-sky-700 hover:bg-sky-100">+ Add Hours</button>
        </div>
        <EmptyOrList emptyText="No operating hours added yet." rows={hours} render={(r) => (
          <div className="rounded border px-3 py-2 text-sm">{r.day} — {r.time || '—'}</div>
        )} />
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Payment Methods</h3>
        <div className="rounded-md border p-4">
          <Field label="Payment Method"><Input value={pay} onChange={(e) => setPay(e.target.value)} placeholder="e.g., Visa, Mastercard, Cash" /></Field>
          <button type="button" onClick={() => { if (!pay.trim()) return; onAddPayment({ pay }); setPay(''); }}
            className="mt-3 rounded-md border bg-sky-50 px-3 py-2 text-sm text-sky-700 hover:bg-sky-100">+ Add Payment Method</button>
        </div>
        <EmptyOrList emptyText="No payment methods added yet." rows={payments} render={(r) => (
          <div className="rounded border px-3 py-2 text-sm">{r}</div>
        )} />
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Accreditations & Certifications</h3>
        <div className="rounded-md border p-4">
          <Row>
            <Field label="Accreditation Name*"><Input value={accName} onChange={(e) => setAccName(e.target.value)} placeholder="e.g., JCI Accredited" /></Field>
            <Field label="Logo URL"><Input value={accLogo} onChange={(e) => setAccLogo(e.target.value)} placeholder="https://example.com/logo.png" /></Field>
          </Row>
          <Field label="Description"><Textarea value={accDesc} onChange={(e) => setAccDesc(e.target.value)} placeholder="Brief description of the accreditation" /></Field>
          <button type="button" onClick={() => {
            if (!accName.trim()) return;
            onAddAcc({ name: accName, logo_url: accLogo || undefined, description: accDesc || undefined });
            setAccName(''); setAccLogo(''); setAccDesc('');
          }} className="mt-3 rounded-md border bg-sky-50 px-3 py-2 text-sm text-sky-700 hover:bg-sky-100">+ Add Accreditation</button>
        </div>
        <EmptyOrList emptyText="No accreditations added yet." rows={accs} render={(r) => (
          <div className="rounded border px-3 py-2 text-sm">{r.name}</div>
        )} />
      </div>
    </div>
  );
}
