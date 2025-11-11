// lib/supabase/serverClient.ts
"use server";

import { cookies as nextCookies, headers as nextHeaders } from "next/headers";
import { createServerClient as createSSRClient } from "@supabase/ssr";

export async function createServerClient() {
  const cookieStore = await nextCookies();
  // headers не обязательны, но пусть будут готовы
  await nextHeaders();

  const supabase = createSSRClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value as string | undefined;
        },
        set(name: string, value: string, options?: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options?: any) {
          cookieStore.set({ name, value: "", ...options, expires: new Date(0) });
        },
      },
    }
  );

  return supabase;
}
