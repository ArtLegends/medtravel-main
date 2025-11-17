// components/auth/CustomerAuthModal.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSupabase } from "@/lib/supabase/supabase-provider";

type Props = { open: boolean; onClose: () => void };

function slugifyHandleFromEmail(email: string) {
  const local = (email.split("@")[0] || "me")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return local || "me";
}

export default function CustomerAuthModal({ open, onClose }: Props) {
  const { supabase } = useSupabase();
  const sp = useSearchParams();
  const router = useRouter();

  const next = sp?.get("next") || "/";
  const [email, setEmail] = useState("");
  const [mode, setMode] = useState<"magic" | "otp">("magic");
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const otpInputRef = useRef<HTMLInputElement>(null);

  // Закрытие по ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const origin =
    typeof window !== "undefined" ? window.location.origin : (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/+$/,"");

  const callback = `${origin}/auth/callback?as=CUSTOMER&next=${encodeURIComponent(
    next
  )}`;

  async function signInWithGoogle() {
    setErrorMsg(null);
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callback,
          queryParams: { prompt: "select_account" }, // всегда показывать выбор
        },
      });
      if (error) setErrorMsg(error.message);
      // дальнейший поток в Google → вернёмся в /auth/callback
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
          emailRedirectTo: callback,        // редирект из письма → /auth/callback
          data: { requested_role: "CUSTOMER" },
        },
      });
      if (error) setErrorMsg(error.message);
      else setInfo("Check your inbox — magic link has been sent.");
    } finally {
      setBusy(false);
    }
  }

  // Отправка 6-значного кода по email (если в Supabase включён Email OTP)
  async function sendOtpCode(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setInfo(null);
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          // для OTP редирект не обязателен — мы подтвердим код прямо тут
          data: { requested_role: "CUSTOMER" },
        },
      });
      if (error) setErrorMsg(error.message);
      else {
        setOtpSent(true);
        setInfo(`We emailed a 6-digit code to ${email}.`);
        // автофокус на поле ввода кода
        setTimeout(() => otpInputRef.current?.focus(), 50);
      }
    } finally {
      setBusy(false);
    }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setBusy(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email", // верификация 6-значного кода
      });
      if (error) {
        setErrorMsg(error.message);
        return;
      }

      // UX: сразу отправляем на /customer/<handle>, не дожидаясь перерендера шапки
      const handle = slugifyHandleFromEmail(email);
      router.replace(`/customer/${handle}`);
      router.refresh();
      onClose();
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
        <div className="mb-4 text-lg font-semibold">
          Clinic portal — Sign in / Sign up
        </div>

        {/* режимы: magic link / otp */}
        <div className="mb-3 flex gap-2 text-sm">
          <button
            className={`rounded px-3 py-1 ${mode === "magic" ? "bg-gray-900 text-white" : "bg-gray-100"}`}
            onClick={() => {
              setMode("magic");
              setInfo(null);
              setErrorMsg(null);
              setOtpSent(false);
            }}
            type="button"
          >
            Magic link
          </button>
          <button
            className={`rounded px-3 py-1 ${mode === "otp" ? "bg-gray-900 text-white" : "bg-gray-100"}`}
            onClick={() => {
              setMode("otp");
              setInfo(null);
              setErrorMsg(null);
              setOtpSent(false);
            }}
            type="button"
          >
            6-digit code
          </button>
        </div>

        {/* EMAIL INPUT */}
        <label className="block text-sm mb-1">Email</label>
        <input
          type="email"
          required
          placeholder="you@clinic.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-3 w-full rounded-md border px-3 py-2"
        />

        {/* MAGIC LINK FORM */}
        {mode === "magic" && (
          <form onSubmit={sendMagicLink} className="space-y-2">
            <button
              disabled={busy || !email}
              className="w-full rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {busy ? "Sending..." : "Send magic link"}
            </button>
          </form>
        )}

        {/* OTP FORM (send + verify) */}
        {mode === "otp" && (
          <>
            {!otpSent ? (
              <form onSubmit={sendOtpCode} className="space-y-2">
                <button
                  disabled={busy || !email}
                  className="w-full rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  {busy ? "Sending..." : "Send 6-digit code"}
                </button>
              </form>
            ) : (
              <form onSubmit={verifyOtp} className="space-y-2">
                <label className="block text-sm">Enter code</label>
                <input
                  ref={otpInputRef}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="w-full rounded-md border px-3 py-2 tracking-widest text-center"
                  placeholder="______"
                  required
                />
                <button
                  disabled={busy || otp.length !== 6}
                  className="w-full rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  {busy ? "Verifying..." : "Verify"}
                </button>
              </form>
            )}
          </>
        )}

        {/* info / error */}
        {info && <p className="mt-2 text-sm text-gray-600">{info}</p>}
        {errorMsg && <p className="mt-2 text-sm text-red-600">{errorMsg}</p>}

        <div className="my-4 flex items-center gap-3 text-xs text-gray-400">
          <div className="h-px flex-1 bg-gray-200" />
          or
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <button
          onClick={signInWithGoogle}
          disabled={busy}
          className="w-full rounded-md border px-4 py-2 hover:bg-gray-50 disabled:opacity-60"
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
