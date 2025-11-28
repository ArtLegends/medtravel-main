// components/auth/PartnerAuthModal.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSupabase } from "@/lib/supabase/supabase-provider";

type Props = { open: boolean; onClose: () => void };

export default function PartnerAuthModal({ open, onClose }: Props) {
  const { supabase } = useSupabase();
  const sp = useSearchParams();

  // по умолчанию ведём в /partner
  const next = sp?.get("next") || "/partner";

  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // закрытие по ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) =>
      e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/+$/, "");

  const callback = `${origin}/auth/callback?as=PARTNER&next=${encodeURIComponent(
    next,
  )}`;

  async function signInWithGoogle() {
    setErrorMsg(null);
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callback,
          queryParams: { prompt: "select_account" },
        },
      });
      if (error) setErrorMsg(error.message);
      // дальше управление уйдёт в Google → /auth/callback
    } finally {
      setBusy(false);
    }
  }

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setInfo(null);
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: callback,
          data: { requested_role: "PARTNER" },
        },
      });
      if (error) {
        setErrorMsg(error.message);
      } else {
        setInfo(
          "We’ve sent you a secure login link. Check your inbox.",
        );
      }
    } finally {
      setBusy(false);
    }
  }

  // клик по фону — закрыть
  function onBackdrop(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-black/40 p-4"
      onMouseDown={onBackdrop}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="mb-1 text-sm font-medium text-sky-700">
          Partner portal
        </div>
        <div className="mb-4 text-lg font-semibold">
          Sign in / Sign up as partner
        </div>
        <p className="mb-4 text-sm text-gray-500">
          Use your email to access the MedTravel partner panel. We’ll
          email you a secure magic link.
        </p>

        {/* EMAIL + MAGIC LINK */}
        <form onSubmit={sendMagicLink} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Work email</label>
            <input
              type="email"
              required
              placeholder="you@site.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={busy || !email}
            className="w-full rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {busy ? "Sending…" : "Send magic link"}
          </button>
        </form>

        {/* info / error */}
        {info && (
          <p className="mt-2 text-sm text-gray-600">{info}</p>
        )}
        {errorMsg && (
          <p className="mt-2 text-sm text-red-600">{errorMsg}</p>
        )}

        <div className="my-4 flex items-center gap-3 text-xs text-gray-400">
          <div className="h-px flex-1 bg-gray-200" />
          or
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <button
          onClick={signInWithGoogle}
          disabled={busy}
          className="w-full rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-60"
        >
          Continue with Google
        </button>

        <button
          onClick={onClose}
          className="mt-4 w-full text-sm text-gray-500 hover:underline"
          type="button"
        >
          Close
        </button>
      </div>
    </div>
  );
}
