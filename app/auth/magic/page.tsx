"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function parseHash(hash: string) {
  const h = hash.startsWith("#") ? hash.slice(1) : hash;
  const params = new URLSearchParams(h);
  return {
    access_token: params.get("access_token") ?? "",
    refresh_token: params.get("refresh_token") ?? "",
    expires_in: params.get("expires_in") ?? "",
    token_type: params.get("token_type") ?? "",
    type: params.get("type") ?? "",
  };
}

export default function MagicAuthPage() {
  const router = useRouter();
  const sp = useSearchParams();

  useEffect(() => {
    const next = sp.get("next") || "/patient";
    const as = sp.get("as") || "PATIENT";

    const { access_token, refresh_token } = parseHash(window.location.hash);

    // если токенов нет — просто на логин
    if (!access_token || !refresh_token) {
      router.replace(`/auth/login?as=${encodeURIComponent(as)}&next=${encodeURIComponent(next)}`);
      return;
    }

    (async () => {
      const res = await fetch("/auth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token, refresh_token, as, next }),
      });

      // сервер уже сделает redirect, но на всякий:
      if (res.ok) {
        router.replace(next);
        router.refresh();
      } else {
        router.replace(`/auth/login?as=${encodeURIComponent(as)}&next=${encodeURIComponent(next)}`);
      }
    })();
  }, [router, sp]);

  return (
    <div className="mx-auto max-w-md px-4 py-10 text-center">
      <div className="text-lg font-semibold">Signing you in…</div>
      <div className="mt-2 text-sm text-default-500">Please wait.</div>
    </div>
  );
}