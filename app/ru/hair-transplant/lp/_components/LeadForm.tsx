'use client';

import { useMemo, useState } from "react";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import LeadImageUpload from "./LeadImageUpload";

type Props = {
  submitText?: string;
  onSubmitted?: () => void;
  className?: string;
  disclaimerText?: string;
  buttonClassName?: string;
};

function fireForm1Step(meta?: { source?: string; patient_email_sent?: boolean }) {
  // 1) можно оставить — пригодится для GTM в будущем, и для метрики ecommerce
  (window as any).dataLayer = (window as any).dataLayer || [];
  (window as any).dataLayer.push({
    event: "lead_submit",
    form_name: "hair-transplant-lp",
    ...meta,
  });

  // 2) GA4 (важно: НЕ передавать email/phone — это PII)
  (window as any).gtag?.("event", "generate_lead", {
    form_name: "hair-transplant-lp",
    source: meta?.source || "hair-transplant-lp",
    patient_email_sent: Boolean(meta?.patient_email_sent),
  });

  // 3) optional: DOM event
  window.dispatchEvent(new Event("lead_submit"));
}

export default function LeadForm({
  submitText = "Отправить",
  onSubmitted,
  className,
  disclaimerText = "Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности",
  buttonClassName,
}: Props) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const [patientEmailSent, setPatientEmailSent] = useState(false);

  const canSubmit = useMemo(() => {
    return fullName.trim() && phone.trim() && email.trim();
  }, [fullName, phone, email]);

  async function submit() {
    setError(null);
    setOk(false);
    setPatientEmailSent(false);
    setBusy(true);

    try {
      const fd = new FormData();
      fd.set("source", "hair-transplant-lp");
      fd.set("full_name", fullName.trim());
      fd.set("phone", phone.trim());
      fd.set("email", email.trim());
      if (age.trim()) fd.set("age", age.trim());
      files.slice(0, 3).forEach((f) => fd.append("images", f));

      const res = await fetch("/api/leads/partner", { method: "POST", body: fd });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Submit failed");

      setOk(true);
      setPatientEmailSent(Boolean(json?.patient?.emailSent));
      fireForm1Step({
        source: "hair-transplant-lp",
        patient_email_sent: Boolean(json?.patient?.emailSent),
      });

      onSubmitted?.();

      // опционально: очистить форму
      setFullName("");
      setPhone("");
      setEmail("");
      setAge("");
      setFiles([]);
    } catch (e: any) {
      setError(String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      className={className ?? "space-y-3"}
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSubmit || busy) return;
        submit();
      }}
    >
      <Input placeholder="ФИО*" value={fullName} onChange={(e) => setFullName(e.target.value)} />
      <Input placeholder="Телефон*" value={phone} onChange={(e) => setPhone(e.target.value)} />
      <Input placeholder="Email*" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <Input placeholder="Возраст" inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} />

      <div className="mt-4">
        <LeadImageUpload files={files} onFilesChange={setFiles} />
      </div>

      {ok ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Спасибо! Мы получили заявку и свяжемся с вами.
        </div>
      ) : null}

      {ok && patientEmailSent ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Мы также создали ваш личный кабинет пациента и отправили на email ссылку для входа.
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <Button type="submit" className={buttonClassName ?? "w-full"} size="lg" disabled={!canSubmit || busy}>
        {busy ? "Отправляем..." : submitText}
      </Button>

      <p className="text-center text-xs text-slate-500">{disclaimerText}</p>
    </form>
  );
}
