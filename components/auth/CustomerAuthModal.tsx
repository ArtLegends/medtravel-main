// components/auth/CustomerAuthModal.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSupabase } from "@/lib/supabase/supabase-provider";

type Props = { open: boolean; onClose: () => void };

export default function CustomerAuthModal({ open, onClose }: Props) {
  const { supabase } = useSupabase();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  if (!open) return null;

  const baseUrl =
    (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/,"");

  const redirectTo = `${baseUrl}/auth/callback?as=CUSTOMER`;

  async function signInWithEmailOtp(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    // это магик-линк/OTP; создаст юзера при отсутствии
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${location.origin}/auth/callback?as=CUSTOMER`,
        data: { requested_role: "CUSTOMER" }, // передадим метку в user_metadata
      },
    });
    setSending(false);
    if (!error) setSent(true);
    else alert(error.message);
  }

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback?as=CUSTOMER`, },
    });
    if (error) alert(error.message);
  }

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 text-lg font-semibold">Clinic portal — Sign in / Sign up</div>

        <form onSubmit={signInWithEmailOtp} className="space-y-3">
          <label className="block text-sm">Email</label>
          <input
            type="email"
            required
            placeholder="you@clinic.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border px-3 py-2"
          />
          <button
            disabled={sending}
            className="w-full rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {sending ? "Sending..." : "Send magic link"}
          </button>
        </form>

        {sent && (
          <div className="mt-2 text-sm text-gray-600">
            Check your email — we’ve sent a sign-in link.
          </div>
        )}

        <div className="my-4 flex items-center gap-3 text-xs text-gray-400">
          <div className="h-px flex-1 bg-gray-200" />
          or
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <button
          onClick={signInWithGoogle}
          className="w-full rounded-md border px-4 py-2 hover:bg-gray-50"
        >
          Continue with Google
        </button>

        <button onClick={onClose} className="mt-4 w-full text-sm text-gray-500 hover:underline">
          Close
        </button>
      </div>
    </div>
  );
}
