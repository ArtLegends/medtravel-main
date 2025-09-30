'use client';

import { useState } from "react";

type Props = {
  clinicSlug: string;
  clinicName: string;
  services: string[];
};

export default function ClinicInquiryForm({ clinicSlug, clinicName, services }: Props) {
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [phone, setPhone]       = useState("");
  const [message, setMessage]   = useState("");
  const [service, setService]   = useState(services[0] ?? "");
  const [loading, setLoading]   = useState(false);
  const [ok, setOk]             = useState<null | string>(null);
  const [err, setErr]           = useState<null | string>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setOk(null); setErr(null);
    setLoading(true);

    try {
      const res = await fetch("/api/clinic-inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinic_slug: clinicSlug,
          clinic_name: clinicName,
          name, email, phone, message, service,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed");

      setOk("Thanks! We received your inquiry and will contact you shortly.");
      setName(""); setEmail(""); setPhone(""); setMessage("");
    } catch (e: any) {
      setErr(e.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="mb-2 text-xl font-semibold">Get in Touch</div>

      {/* name */}
      <div>
        <label className="mb-1 block text-sm font-medium">Your Name</label>
        <input
          value={name} onChange={e => setName(e.target.value)}
          className="w-full rounded-md border px-3 py-2"
          placeholder="Enter your name"
          required
        />
      </div>

      {/* email */}
      <div>
        <label className="mb-1 block text-sm font-medium">Email</label>
        <input
          type="email"
          value={email} onChange={e => setEmail(e.target.value)}
          className="w-full rounded-md border px-3 py-2"
          placeholder="Enter your email"
        />
      </div>

      {/* phone */}
      <div>
        <label className="mb-1 block text-sm font-medium">Phone Number</label>
        <input
          value={phone} onChange={e => setPhone(e.target.value)}
          className="w-full rounded-md border px-3 py-2"
          placeholder="Enter your phone number"
          required
        />
      </div>

      {/* service */}
      {services.length ? (
        <div>
          <label className="mb-1 block text-sm font-medium">Service Interested In</label>
          <select
            value={service} onChange={e => setService(e.target.value)}
            className="w-full rounded-md border bg-white px-3 py-2"
          >
            {services.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      ) : null}

      {/* message */}
      <div>
        <label className="mb-1 block text-sm font-medium">Message</label>
        <textarea
          value={message} onChange={e => setMessage(e.target.value)}
          className="h-28 w-full rounded-md border px-3 py-2"
          placeholder="Tell us briefly about your case (optional)"
        />
      </div>

      {/* alerts */}
      {ok && <div className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">{ok}</div>}
      {err && <div className="rounded-md bg-rose-50 p-3 text-sm text-rose-700">{err}</div>}

      {/* submit */}
      <div className="pt-1">
        <button
          disabled={loading}
          className="w-full rounded-md bg-emerald-600 px-5 py-3 font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {loading ? "Sending..." : "Send Message"}
        </button>
      </div>
    </form>
  );
}
