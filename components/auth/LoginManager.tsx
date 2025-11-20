// components/auth/LoginManager.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/browserClient";
import EmailForm from "./EmailForm";
import OtpForm from "./OtpForm";

type RoleKind = "CUSTOMER" | "PARTNER" | "PATIENT" | "ADMIN";

export default function LoginManager() {
  const sp = useSearchParams();
  const next = sp?.get("next") || "/";
  const asParam = ((sp?.get("as") || "CUSTOMER") as RoleKind).toUpperCase() as RoleKind;

  const supabase = createClient();
  const [emailSentTo, setEmailSentTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function signInWithGoogle() {
    setLoading(true);
    try {
      const origin = window.location.origin;
      const redirectTo = `${origin}/auth/callback?as=${encodeURIComponent(
        asParam
      )}&next=${encodeURIComponent(next)}`;

      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: { prompt: "select_account" },
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
        <OtpForm
          email={emailSentTo}
          as={asParam}
          next={next}
          onBack={() => setEmailSentTo(null)}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={signInWithGoogle}
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {loading ? "Redirecting…" : "Continue with Google"}
      </button>

      <div className="relative flex items-center">
        <div className="flex-grow border-t border-divider" />
        <span className="mx-4 text-small text-default-500">or</span>
        <div className="flex-grow border-t border-divider" />
      </div>

      <EmailForm
        as={asParam}
        next={next}
        onSuccess={(email) => setEmailSentTo(email)}
      />
    </div>
  );
}
