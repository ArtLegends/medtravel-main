// app/auth/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createServiceClient } from "@/lib/supabase/serviceClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type RoleName = "CUSTOMER" | "PARTNER" | "ADMIN";

function normalizeRole(asParam?: string | null): RoleName | null {
  if (!asParam) return null;
  const v = asParam.toUpperCase();
  if (v === "CUSTOMER") return "CUSTOMER";
  if (v === "PARTNER") return "PARTNER";
  if (v === "ADMIN") return "ADMIN";
  return null;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const asParam = url.searchParams.get("as");
  const next = url.searchParams.get("next");

  const asRole = normalizeRole(asParam);

  // дефолтный next, если его не передали
  const defaultNext =
    next ||
    (asRole === "ADMIN"
      ? "/admin"
      : asRole === "PARTNER"
      ? "/partner"
      : asRole === "CUSTOMER"
      ? "/customer"
      : "/");

  const res = NextResponse.redirect(new URL(defaultNext, req.url));

  // если code не пришёл – просто на главную
  if (!code) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const store = await cookies();

  // клиент для работы с auth и куками
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () =>
          store.getAll().map((c) => ({
            name: c.name,
            value: c.value,
          })),
        setAll: (all) => {
          for (const cookie of all) {
            res.cookies.set(cookie.name, cookie.value, cookie.options);
          }
        },
      },
    },
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    res.cookies.set(
      "mt_auth_error",
      encodeURIComponent(error.message),
      {
        path: "/",
        httpOnly: false,
        maxAge: 60,
      },
    );
    return NextResponse.redirect(new URL("/login?error=oauth", req.url));
  }

  // есть сессия → можно получить user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // если логинились как партнёр / кастомер / админ – принудительно
  // дописываем роль в profiles + user_roles через service-client
  if (user && asRole) {
    const sb = createServiceClient();
    const userId = user.id;
    const email = user.email ?? null;
    const meta: any = user.user_metadata ?? {};
    const locale = (meta.locale as string) || "en";

    // 1) profiles – храним последнюю «активную» роль
    await sb
      .from("profiles")
      .upsert(
        {
          id: userId,
          email,
          role: asRole.toLowerCase(), // admin / customer / partner
          locale,
          updated_at: new Date().toISOString(),
        } as any,
        { onConflict: "id" } as any,
      );

    // 2) user_roles – набор ролей пользователя
    await sb
      .from("user_roles")
      .upsert(
        {
          user_id: userId,
          role: asRole,
        } as any,
        { onConflict: "user_id,role" } as any,
      );
  }

  return res;
}
