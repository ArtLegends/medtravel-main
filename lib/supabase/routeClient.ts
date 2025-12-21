import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function createRouteClient() {
  const store = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () =>
          store.getAll().map((c) => ({ name: c.name, value: c.value })),
        // В route handlers можно/нужно уметь setAll — Next вернёт Set-Cookie
        setAll: () => {},
      },
    },
  );
}
