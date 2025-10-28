// lib/supabase/serverClient.ts
import { cookies } from "next/headers";
import { createServerClient as createSSRClient } from "@supabase/ssr";
import { env } from "@/config/env";

/**
 * Next 15: cookies() стал async → его надо await-ить.
 * В обычных API/route handlers мы читаем cookie (getAll), а setAll оставляем no-op,
 * чтобы не пытаться модифицировать cookie вне /auth/callback.
 */
export async function createServerClient() {
  const cookieStore = await cookies();

  const supabase = createSSRClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore
            .getAll()
            .map((c: any) => ({ name: c.name, value: c.value }));
        },
        setAll() {
          // no-op. Мы не записываем cookie тут (это делаем в /auth/callback)
        },
      },
    }
  );

  return supabase;
}
