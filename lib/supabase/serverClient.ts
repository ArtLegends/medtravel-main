// lib/supabase/serverClient.ts
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        // @ts-ignore next/headers returns async cookies in Next 15 — но нам подходит
        const store = (typeof cookies === "function" ? cookies() : cookies) as any;
        return store.getAll().map((c: any) => ({ name: c.name, value: c.value }));
      },
      setAll(all) {
        // noop — ставим в конкретном route (/auth/callback)
      },
    },
  });
}








// lib/supabase/serverClient.ts
// import "server-only";
// import { createClient as _createClient } from '@supabase/supabase-js'

// const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
// const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// export function createServerClient() {
//   return _createClient(url, serviceKey)
// }
