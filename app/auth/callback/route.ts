// app/(auth)/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const as = (url.searchParams.get("as") || "").toUpperCase(); // "CUSTOMER" | ""
  const res = NextResponse.redirect(new URL("/", req.url));
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll().map((c: any) => ({ name: c.name, value: c.value })),
        setAll: (all) => all.forEach((cookie) => res.cookies.set(cookie.name, cookie.value, cookie.options)),
      },
    }
  );

  if (!code) return res;

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL("/login?error=oauth", req.url));

  // получили пользователя
  const { data: u } = await supabase.auth.getUser();
  const email = u?.user?.email ?? "";
  const handle = email ? email.split("@")[0]!.toLowerCase().replace(/[^a-z0-9_-]+/g, "-") || "user" : "user";

  // поднимем роль в profiles/user_roles (на всякий случай)
  if (u?.user?.id && as === "CUSTOMER") {
    await supabase.from("profiles").update({ role: "CUSTOMER" }).eq("id", u.user.id);
    await supabase.from("user_roles").upsert({ user_id: u.user.id, role: "CUSTOMER" }, { onConflict: "user_id" });
  }

  // финальный редирект
  return NextResponse.redirect(new URL(`/customer/${handle}`, req.url));
}
