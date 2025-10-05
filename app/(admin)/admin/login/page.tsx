// app/(admin)/admin/login/page.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@medtravel.com');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const router = useRouter();
  const sp = useSearchParams(); // ReadonlyURLSearchParams | null
  const next = sp?.get('next') ?? '/admin';

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    const r = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (r.ok) router.replace(next);
    else setErr('Invalid credentials');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-6 text-center">
          <span className="text-xl font-semibold">
            <span className="text-emerald-500">Med</span>Travel
          </span>
          <div className="text-sm text-gray-500">Admin Login</div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className="w-full rounded-md border px-3 py-2"
            placeholder="Email"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            className="w-full rounded-md border px-3 py-2"
            placeholder="Password"
          />
          {err ? <p className="text-sm text-rose-600">{err}</p> : null}
          <button className="w-full rounded-md bg-emerald-600 px-4 py-2 text-white">
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
