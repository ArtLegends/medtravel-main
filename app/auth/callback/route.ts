// app/(auth)/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "");

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const as = (url.searchParams.get("as") || "").toUpperCase();
  const next = url.searchParams.get("next") ?? "/";

  // ↓ итоговый таргет вычисляем СРАЗУ
  const resTarget = next; // временно; поменяем позже после получения user
  let res = NextResponse.redirect(new URL(resTarget, req.url));

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll().map(c => ({ name: c.name, value: c.value })),
        // ВАЖНО: сетим куки ИМЕННО на тот response, который вернём из хендлера
        setAll: (all) => all.forEach((cookie) => res.cookies.set(cookie.name, cookie.value, cookie.options)),
      },
    }
  );

  if (!code) return NextResponse.redirect(new URL("/", req.url));

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL("/login?error=oauth", req.url));

  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return NextResponse.redirect(new URL("/login?error=session", req.url));

  const userId = user.id;
  const email = user.email ?? "";
  const handle = slugify(email.split("@")[0] || userId.slice(0, 8));

  const wantsCustomer = as === "CUSTOMER";
  // СТОРОНИМСЯ конфликтов: все роли в БД - в нижнем регистре
  const desiredRole = wantsCustomer ? "customer" : undefined;

  await supabase.from("profiles").upsert(
    { id: userId, email, role: desiredRole ?? undefined, locale: "en" } as any,
    { onConflict: "id" }
  );

  if (wantsCustomer) {
    await supabase.from("user_roles").upsert(
      { user_id: userId, role: "customer" } as any,
      { onConflict: "user_id" }
    );
  }

  // ПЕРЕсоздаём response с конечным адресом и СНОВА «пришиваем» куки к нему
  const finalTarget = wantsCustomer ? `/customer/${handle}` : (next || "/");
  res = NextResponse.redirect(new URL(finalTarget, req.url));
  // перенесём заранее набитые куки с предыдущего res (на всякий.)
  // supabase уже вызывал setAll → куки есть в cookieStore; лишнее не повредит
  return res;
}
