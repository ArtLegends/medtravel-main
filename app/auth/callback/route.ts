// app/(auth)/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const as = url.searchParams.get("as");           // e.g. CUSTOMER
  const next = url.searchParams.get("next") ?? "/";

  // ответ, к которому пришьём куки
  const res = NextResponse.redirect(new URL(next, req.url));

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () =>
          cookieStore.getAll().map((c: any) => ({ name: c.name, value: c.value })),
        setAll: (all) => {
          all.forEach((cookie) => {
            res.cookies.set(cookie.name, cookie.value, cookie.options);
          });
        },
      },
    }
  );

  // 1) обмен кода на сессию
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(new URL(`/login?error=oauth`, req.url));
    }
  } else {
    // нет кода — на главную
    return NextResponse.redirect(new URL(`/`, req.url));
  }

  // 2) уже есть сессия → достаём пользователя
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return NextResponse.redirect(new URL(`/login?error=session`, req.url));

  const userId = user.id;
  const email = user.email ?? "";
  const handle = slugify(email.split("@")[0] || userId.slice(0, 8));

  // 3) создаём/обновляем профиль (+ роль в user_roles)
  //    делаем всё в безопасном upsert’е
  //    profile.role выставим CUSTOMER, если прилетел as=CUSTOMER
  const wantsCustomer = (as || "").toUpperCase() === "CUSTOMER";
  const desiredRole = wantsCustomer ? "CUSTOMER" : undefined;

  // profiles
  await supabase
    .from("profiles")
    .upsert(
      {
        id: userId,
        email,
        role: desiredRole ?? undefined, // не трогаем, если as не пришёл
        locale: "en",
      } as any,
      { onConflict: "id" }
    );

  // user_roles (параллельно, чтобы не падало, если таблицы нет)
  if (wantsCustomer) {
    await supabase
      .from("user_roles")
      .upsert({ user_id: userId, role: "CUSTOMER" } as any, {
        onConflict: "user_id",
      });
  }

  // 4) целевой редирект
  const target = wantsCustomer ? `/customer/${handle}` : next || "/";
  return NextResponse.redirect(new URL(target, req.url));
}
