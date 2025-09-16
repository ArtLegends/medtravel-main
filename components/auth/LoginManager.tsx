'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr'; // если у тебя другой хелпер – суть та же

export default function LoginManager() {
  const sp = useSearchParams();
  const [loading, setLoading] = useState(false);

  // если был передан ?next=/что-то, пробрасываем его; по умолчанию — /admin
  const next = sp?.get('next') || '/admin';
  const site = process.env.NEXT_PUBLIC_SITE_URL || '';

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function signInWithGoogle() {
    setLoading(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // критично: абсолютный URL до нашего callback + пробрасываем next
          redirectTo: `${site}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      // дальше управление уйдёт в Google, а потом в /auth/callback
    } finally {
      setLoading(false);
    }
  }

  // если используешь OTP/email, можно так же пробрасывать redirectTo
  // async function signInWithEmail(email: string) {
  //   await supabase.auth.signInWithOtp({
  //     email,
  //     options: { emailRedirectTo: `${site}/auth/callback?next=${encodeURIComponent(next)}` },
  //   });
  // }

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={signInWithGoogle}
        disabled={loading}
        className="w-full rounded-md bg-primary px-4 py-2 text-white disabled:opacity-60"
      >
        {loading ? 'Redirecting…' : 'Continue with Google'}
      </button>

      {/* добавь сюда остальные способы входа при необходимости */}
    </div>
  );
}
