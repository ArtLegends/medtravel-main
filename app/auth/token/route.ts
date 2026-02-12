import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type CookieToSet = { name: string; value: string; options?: any };

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  const access_token = String(body?.access_token || "");
  const refresh_token = String(body?.refresh_token || "");
  const next = String(body?.next || "/patient");
  const asParam = String(body?.as || "PATIENT");

  if (!access_token || !refresh_token) {
    return NextResponse.json({ error: "Missing tokens" }, { status: 400 });
  }

  const store = await cookies();
  const res = NextResponse.json({ ok: true });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => store.getAll().map((c) => ({ name: c.name, value: c.value })),
        setAll: (all: CookieToSet[]) => {
          all.forEach((cookie) => {
            res.cookies.set(cookie.name, cookie.value, cookie.options);
          });
        },
      },
    }
  );

  // ✅ ВАЖНО: это выставит cookies сессии (то, что нужно middleware)
  const { error } = await supabase.auth.setSession({ access_token, refresh_token });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

    // 1) узнаем user уже по сессии
    const { data: u } = await supabase.auth.getUser();
    const user = u?.user;

    if (user?.id) {
        // 2) подтвердим email (т.к. вход по magic link — это и есть подтверждение)
        // ВАЖНО: это нужно делать через service role (createServiceClient)
        const sb = (await import("@/lib/supabase/serviceClient")).createServiceClient();

        await sb.auth.admin.updateUserById(user.id, { email_confirm: true });

        await sb.from("profiles").update({ email_verified: true }).eq("id", user.id);
    }

  // по желанию: можно сделать редирект ответом
  // но проще: фронт сам сделает router.replace(next)
  return res;
}