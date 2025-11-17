// app/(auth)/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";        // не кешируем
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";

  // ответ, к которому будем пришивать куки auth
  const res = NextResponse.redirect(new URL(next, req.url));

  // важно: читаем ВСЕ входящие куки (в т.ч. code_verifier),
  // и обязательно прокидываем options при установке
  const store = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => store.getAll().map(c => ({ name: c.name, value: c.value })),
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
  if (!code) return NextResponse.redirect(new URL("/", req.url));

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    // чтобы видеть причину на клиенте
    res.cookies.set("mt_auth_error", encodeURIComponent(error.message), { path: "/", httpOnly: false, maxAge: 60 });
    return NextResponse.redirect(new URL("/login?error=oauth", req.url));
  }

  // На этом этапе Supabase через setAll уже пришьёт:
  //   sb-<ref>-auth-token  и  sb-<ref>-auth-token.sig
  // ⇒ на следующем запросе провайдер увидит валидную сессию.
  return res;
}
