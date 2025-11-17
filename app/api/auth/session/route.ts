import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";

export async function GET() {
  const store = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => store.getAll().map(c => ({ name: c.name, value: c.value })),
        setAll: () => {},
      },
    }
  );
  const { data } = await supabase.auth.getUser();
  return NextResponse.json({ user: data.user ?? null });
}
