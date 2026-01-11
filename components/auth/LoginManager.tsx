// components/auth/LoginManager.tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/browserClient";
import EmailForm from "./EmailForm";
import { useSupabase } from "@/lib/supabase/supabase-provider";

type RoleKind = "CUSTOMER" | "PARTNER" | "PATIENT" | "ADMIN";

export default function LoginManager() {
  const sp = useSearchParams();
  const router = useRouter();

  const next = sp?.get("next") || "/";
  const asParam = ((sp?.get("as") || "CUSTOMER").toUpperCase() ||
    "CUSTOMER") as RoleKind;

  const { supabase } = useSupabase();
  const [emailSentTo, setEmailSentTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function signInWithGoogle() {
    setLoading(true);
    try {
      const origin = window.location.origin;
      const redirectTo = `${origin}/auth/callback?as=${encodeURIComponent(
        asParam,
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

  // шаг после отправки magic link
  if (emailSentTo) {
    return (
      <div className="space-y-4 text-center">
        <h2 className="text-lg font-semibold">Check your email</h2>
        <p className="text-sm text-default-500">
          We just sent a secure sign-in link to{" "}
          <span className="font-semibold">{emailSentTo}</span>. <br />
          Open the email and click the link to continue.
        </p>

        <button
          type="button"
          onClick={() => setEmailSentTo(null)}
          className="w-full rounded-md border border-default-200 px-4 py-2 text-sm hover:bg-default-50"
        >
          Use another email
        </button>

      </div>
    );
  }

  // основной экран логина
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
