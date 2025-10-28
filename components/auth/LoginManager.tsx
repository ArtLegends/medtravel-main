// components/auth/LoginManager.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/browserClient";
import EmailForm from "./EmailForm";
import OtpForm from "./OtpForm";

export default function LoginManager() {
  const sp = useSearchParams();
  const next = sp?.get("next") || "/";
  const supabase = createClient();

  const [emailSentTo, setEmailSentTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function getOrigin() {
    // в браузере – всегда текущий origin; на сервере компонент не рендерится
    return typeof window !== "undefined" ? window.location.origin : "";
  }

  async function signInWithGoogle() {
    setLoading(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          // абсолютный URL на текущий origin + проброс next
          redirectTo: `${getOrigin()}/auth/callback?next=${encodeURIComponent(
            next
          )}`,
        },
      });
      // дальше управление уйдёт в Google → /auth/callback
    } finally {
      setLoading(false);
    }
  }

  if (emailSentTo) {
    return (
      <div className="space-y-4">
        <p className="text-small text-default-500">
          We sent a 6-digit code to <b>{emailSentTo}</b>.
        </p>
        <OtpForm email={emailSentTo} onBack={() => setEmailSentTo(null)} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={signInWithGoogle}
        disabled={loading}
        className="w-full rounded-md bg-primary px-4 py-2 text-white disabled:opacity-60"
      >
        {loading ? "Redirecting…" : "Continue with Google"}
      </button>

      <div className="relative flex items-center">
        <div className="flex-grow border-t border-divider" />
        <span className="mx-4 text-small text-default-500">or</span>
        <div className="flex-grow border-t border-divider" />
      </div>

      <EmailForm onSuccess={(email) => setEmailSentTo(email)} />
    </div>
  );
}
