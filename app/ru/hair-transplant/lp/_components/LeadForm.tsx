'use client';

import { useMemo, useState } from "react";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import LeadImageUpload from "./LeadImageUpload";
import { createClient } from "@/lib/supabase/browserClient";

type Props = {
  submitText?: string;
  onSubmitted?: () => void;
  className?: string;
  disclaimerText?: string;
  buttonClassName?: string;
};

type Stage = "form" | "sms" | "done";

function fireForm1Step(meta?: { source?: string; patient_email_sent?: boolean }) {
  (window as any).dataLayer = (window as any).dataLayer || [];
  (window as any).dataLayer.push({
    event: "lead_submit",
    form_name: "hair-transplant-lp",
    ...meta,
  });

  (window as any).gtag?.("event", "generate_lead", {
    form_name: "hair-transplant-lp",
    source: meta?.source || "hair-transplant-lp",
    patient_email_sent: Boolean(meta?.patient_email_sent),
  });

  window.dispatchEvent(new Event("lead_submit"));
}

export default function LeadForm({
  submitText = "Отправить",
  onSubmitted,
  className,
  disclaimerText = "Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности",
  buttonClassName,
}: Props) {
  const supabase = useMemo(() => createClient(), []);

  const [stage, setStage] = useState<Stage>("form");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState(""); // E.164
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [patientEmailSent, setPatientEmailSent] = useState(false);

  // phone OTP state
  const [phoneOtpMode, setPhoneOtpMode] = useState<"idle" | "sent">("idle");
  const [otp, setOtp] = useState("");
  const [otpBusy, setOtpBusy] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  const canSubmit = useMemo(() => fullName.trim() && phone.trim(), [fullName, phone]);

  function resetOtpUi() {
    setOtp("");
    setOtpError(null);
    setPhoneOtpMode("idle");
    setOtpBusy(false);
  }

  async function sendPhoneOtp() {
    setOtpError(null);
    setOtpBusy(true);
    try {
      const phoneE164 = phone.trim();
      const { error } = await supabase.auth.signInWithOtp({
        phone: phoneE164,
        options: { channel: "sms" as any },
      } as any);
      if (error) throw error;
      setPhoneOtpMode("sent");
    } catch (e: any) {
      setOtpError(e?.message ?? String(e));
    } finally {
      setOtpBusy(false);
    }
  }

  async function verifyPhoneOtp() {
    setOtpError(null);
    setOtpBusy(true);
    try {
      const phoneE164 = phone.trim();
      const token = otp.trim();

      const { error } = await supabase.auth.verifyOtp({
        phone: phoneE164,
        token,
        type: "sms",
      } as any);
      if (error) throw error;

      // ensure patient role/profile even without lead attach
      {
        const r = await fetch("/api/patient/ensure", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            full_name: fullName.trim(),
            phone: phoneE164,
          }),
        });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j?.error || "Failed to initialize patient profile");
      }

      // attach lead -> patient if exists
      let leadId = "";
      try { leadId = localStorage.getItem("mt_lead_id") || ""; } catch {}
      if (leadId) {
        const r = await fetch("/api/patient/lead/attach", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            lead_id: leadId,
            full_name: fullName.trim(),
            phone: phoneE164,
          }),
        });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j?.error || "Failed to attach lead");
        try { localStorage.removeItem("mt_lead_id"); } catch {}
      }

      setStage("done");
      window.location.href = "/patient";
    } catch (e: any) {
      setOtpError(e?.message ?? String(e));
    } finally {
      setOtpBusy(false);
    }
  }

  async function submitLead() {
    setError(null);
    setPatientEmailSent(false);
    resetOtpUi();

    setBusy(true);
    try {
      const fd = new FormData();
      fd.set("source", "hair-transplant-lp");
      fd.set("full_name", fullName.trim());
      fd.set("phone", phone.trim());

      const em = email.trim().toLowerCase();
      if (em) fd.set("email", em);

      if (age.trim()) fd.set("age", age.trim());
      files.slice(0, 3).forEach((f) => fd.append("images", f));

      const res = await fetch("/api/leads/partner", { method: "POST", body: fd });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Submit failed");

      const leadId = String(json?.id ?? "");
      if (leadId) {
        try { localStorage.setItem("mt_lead_id", leadId); } catch {}
      }

      const emailSent = Boolean(json?.patient?.emailSent);
      setPatientEmailSent(emailSent);

      fireForm1Step({
        source: "hair-transplant-lp",
        patient_email_sent: emailSent,
      });

      onSubmitted?.();

      // если email есть — остаёмся на form и показываем success (или можно done)
      if (em && emailSent) {
        // чистим поля
        setFullName("");
        setPhone("");
        setEmail("");
        setAge("");
        setFiles([]);
        setStage("done");
        return;
      }

      // email нет → переключаемся на SMS шаг
      setEmail("");
      setAge("");
      setFiles([]);
      setStage("sms");
    } catch (e: any) {
      setError(String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  }

  // ---------- RENDER ----------
  if (stage === "sms") {
    return (
      <div className={className ?? "space-y-3"}>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Спасибо! Мы получили заявку и свяжемся с вами.
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
          <div className="font-semibold">Вход в личный кабинет по SMS</div>
          <div className="mt-1 text-slate-600">
            Отправим код на номер <span className="font-medium">{phone.trim()}</span>.
          </div>

          {otpError ? (
            <div className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {otpError}
            </div>
          ) : null}

          {phoneOtpMode === "idle" ? (
            <Button className="mt-3 w-full" type="button" onClick={sendPhoneOtp} disabled={otpBusy}>
              {otpBusy ? "Отправляем..." : "Отправить код"}
            </Button>
          ) : (
            <div className="mt-3 space-y-2">
              <Input
                placeholder="Код из SMS (6 цифр)"
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <Button
                className="w-full"
                type="button"
                onClick={verifyPhoneOtp}
                disabled={otpBusy || otp.trim().length !== 6}
              >
                {otpBusy ? "Проверяем..." : "Подтвердить и войти"}
              </Button>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    resetOtpUi();
                    setStage("form"); // возвращаемся к форме
                  }}
                  disabled={otpBusy}
                >
                  Назад
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    resetOtpUi();
                    sendPhoneOtp();
                  }}
                  disabled={otpBusy}
                >
                  Отправить ещё раз
                </Button>
              </div>

              <div className="mt-2 text-xs text-slate-500">
                Номер должен быть в международном формате, например: +705551112233
              </div>
            </div>
          )}
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <p className="text-center text-xs text-slate-500">{disclaimerText}</p>
      </div>
    );
  }

  // stage: form (default)
  return (
    <form
      className={className ?? "space-y-3"}
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSubmit || busy) return;
        submitLead();
      }}
    >
      <Input placeholder="ФИО*" value={fullName} onChange={(e) => setFullName(e.target.value)} />
      <Input placeholder="Телефон* (напр. +705...)" value={phone} onChange={(e) => setPhone(e.target.value)} />
      <Input placeholder="Email (опционально)" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <Input placeholder="Возраст" inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} />

      <div className="mt-4">
        <LeadImageUpload files={files} onFilesChange={setFiles} />
      </div>

      {patientEmailSent ? (
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