"use client";

import { useMemo, useState } from "react";
import { Button, Input } from "@heroui/react";
import { Icon } from "@iconify/react";
import { createClient } from "@/lib/supabase/browserClient";

export default function PhoneAuthForm({
  next,
  onSignedIn,
}: {
  next: string;
  onSignedIn?: () => void;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [phone, setPhone] = useState("");
  const [token, setToken] = useState("");
  const [step, setStep] = useState<"enter" | "code">("enter");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function sendCode() {
    setErr(null);
    setBusy(true);
    try {
      const p = phone.trim();
      const { error } = await supabase.auth.signInWithOtp({
        phone: p,
        options: { channel: "sms" as any },
      } as any);
      if (error) throw error;
      setStep("code");
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    setErr(null);
    setBusy(true);
    try {
      const p = phone.trim();
      const t = token.trim();
      const { error } = await supabase.auth.verifyOtp({
        phone: p,
        token: t,
        type: "sms",
      } as any);
      if (error) throw error;

      // ensure patient role/profile (important for phone users)
      {
        const r = await fetch("/api/patient/ensure", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ phone: p }),
        });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j?.error || "Failed to initialize patient profile");
      }

      // attach lead if exists
      let leadId = "";
      try { leadId = localStorage.getItem("mt_lead_id") || ""; } catch {}
      if (leadId) {
        const r = await fetch("/api/patient/lead/attach", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ lead_id: leadId, phone: p }),
        });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j?.error || "Failed to attach lead");
        try { localStorage.removeItem("mt_lead_id"); } catch {}
      }

      onSignedIn?.();
      window.location.href = next || "/patient";
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Input
        isRequired
        variant="bordered"
        placeholder="+905551112233"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        description="International format (E.164)"
      />

      {step === "code" ? (
        <Input
          isRequired
          variant="bordered"
          placeholder="SMS code (6 digits)"
          inputMode="numeric"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
      ) : null}

      {err ? <p className="text-danger text-small">{err}</p> : null}

      {step === "enter" ? (
        <Button
          color="primary"
          isLoading={busy}
          onPress={sendCode}
          startContent={<Icon icon="solar:chat-round-dots-linear" width={18} />}
        >
          Send code
        </Button>
      ) : (
        <Button
          color="primary"
          isLoading={busy}
          onPress={verify}
          isDisabled={token.trim().length !== 6}
          startContent={<Icon icon="solar:check-circle-linear" width={18} />}
        >
          Verify & sign in
        </Button>
      )}
    </div>
  );
}