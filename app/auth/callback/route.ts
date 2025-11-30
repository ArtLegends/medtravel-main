// app/auth/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic"; // не кешируем
export const revalidate = 0;

type RoleName = "CUSTOMER" | "PARTNER" | "ADMIN";

function normalizeRole(asParam?: string | null): RoleName {
  const as = (asParam || "").toUpperCase();
  if (as === "PARTNER") return "PARTNER";
  if (as === "ADMIN") return "ADMIN";
  return "CUSTOMER";
}

/**
 * Создаёт/обновляет запись в public.profiles
 * и добавляет роль в public.user_roles (кроме ADMIN).
 */
async function ensureProfileAndRole(
  supabase: SupabaseClient,
  role: RoleName,
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const userId = user.id;
  const email = user.email ?? null;
  const meta: any = user.user_metadata ?? {};

  // 1) upsert в public.profiles
  await supabase
    .from("profiles")
    .upsert(
      {
        id: userId,
        email,
        full_name:
          meta.display_name ||
          meta.name ||
          [meta.first_name, meta.last_name].filter(Boolean).join(" ") ||
          email,
        avatar_url: meta.avatar_url ?? null,
      },
      { onConflict: "id" } as any,
    );

  // 2) роль в public.user_roles
  // админов обычно заводим руками — не трогаем
  if (role === "ADMIN") return;

  const { data: existingRoles, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", role)
    .limit(1);

  if (!error && existingRoles && existingRoles.length > 0) {
    return;
  }

  await supabase.from("user_roles").insert({
    user_id: userId,
    role,
  } as any);
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";
  const asParam = url.searchParams.get("as");
  const role = normalizeRole(asParam);

  // ответ, к которому будем пришивать куки auth
  const res = NextResponse.redirect(new URL(next, req.url));

  const store = await cookies();
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
            // Supabase отдаёт корректные options; обязательно их применяем
            res.cookies.set(cookie.name, cookie.value, cookie.options);
          }
        },
      },
    },
  );

  // без code мы не сможем обменять сессию
  if (!code) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    // чтобы видеть причину на клиенте
    res.cookies.set(
      "mt_auth_error",
      encodeURIComponent(error.message),
      {
        path: "/",
        httpOnly: false,
        maxAge: 60,
      },
    );
    return NextResponse.redirect(
      new URL("/auth/login?error=oauth", req.url),
    );
  }

  // успешный вход — создаём профиль и роль (CUSTOMER / PARTNER)
  await ensureProfileAndRole(supabase, role);

  // На этом этапе Supabase уже пришил куки:
  //   sb-<ref>-auth-token  и  sb-<ref>-auth-token.sig
  return res;
}
