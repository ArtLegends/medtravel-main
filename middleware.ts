// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const LOC_KIND_ORDER = ["country", "province", "city", "district"] as const;
type NodeKind = (typeof LOC_KIND_ORDER)[number];

const CATEGORY_PREFIXES = new Set([
  "dentistry",
  "plastic-surgery",
  "hair-transplant",
  "crowns",
  "veneers",
  // если вдруг это реально категория — оставь, если нет — можно убрать
  "dental-implants",
]);

function splitPath(pathname: string) {
  return pathname.split("/").filter(Boolean);
}

export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // ---------------------------
  // 1) SMART redirect for legacy clinic urls:
  // /{category}/{country}/{...maybeLocation}/{clinicSlug}
  // but NOT for filters (/category/treatment/... or /category/country/province)
  // ---------------------------
  {
    const segs = splitPath(pathname);
    const maybeCategory = segs[0];

    if (maybeCategory && CATEGORY_PREFIXES.has(maybeCategory)) {
      const tail = segs.slice(1);

      // минимум 2 сегмента после категории, иначе это точно не "клиника"
      if (tail.length >= 2) {
        const res = NextResponse.next();

        const supabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            cookies: {
              getAll: () =>
                req.cookies.getAll().map((c) => ({ name: c.name, value: c.value })),
              setAll: (all) =>
                all.forEach((cookie) =>
                  res.cookies.set(cookie.name, cookie.value, cookie.options),
                ),
            },
          },
        );

        // category id
        const { data: cat } = await supabase
          .from("categories")
          .select("id")
          .eq("slug", maybeCategory)
          .maybeSingle();

        const categoryId = Number((cat as any)?.id || 0);
        if (categoryId) {
          // 1) try to consume location path
          let parentId: number | null = null;
          let idx = 0;

          for (let k = 0; k < LOC_KIND_ORDER.length && idx < tail.length; ) {
            const kind = LOC_KIND_ORDER[k];
            const seg = tail[idx];

            let q = supabase
              .from("category_location_nodes")
              .select("id")
              .eq("category_id", categoryId)
              .eq("kind", kind)
              .eq("slug", seg);

            parentId === null ? q = q.is("parent_id", null) : q = q.eq("parent_id", parentId);

            const { data } = await q.maybeSingle();

            if (data?.id) {
              parentId = Number((data as any).id);
              idx += 1;
              k += 1;
            } else {
              // allow skipping levels (как у тебя в клиенте)
              k += 1;
            }
          }

          const remaining = tail.slice(idx);

          // если после локации осталось НЕ ровно 1 — это фильтры (тритменты/глубже) → не редиректим
          if (remaining.length === 1) {
            const candidate = remaining[0];

            // A) если candidate — это локация следующего уровня, то это фильтр → не редиректим
            // проверяем candidate как child location node
            {
              let isLocation = false;
              for (const kind of LOC_KIND_ORDER) {
                // ищем candidate как ноду любого kind, но с правильным parent_id
                let q = supabase
                  .from("category_location_nodes")
                  .select("id")
                  .eq("category_id", categoryId)
                  .eq("slug", candidate);

                parentId === null ? q = q.is("parent_id", null) : q = q.eq("parent_id", parentId);

                const { data } = await q.maybeSingle();
                if (data?.id) {
                  isLocation = true;
                  break;
                }
              }
              if (isLocation) return res;
            }

            // B) если candidate — это подкатегория (treatment node), то это фильтр → не редиректим
            {
              const { data: sub } = await supabase
                .from("category_subcategory_nodes")
                .select("id")
                .eq("category_id", categoryId)
                .eq("slug", candidate)
                .maybeSingle();

              if (sub?.id) return res;
            }

            // C) иначе проверяем, существует ли клиника с таким slug → тогда редиректим
            const { data: clinic } = await supabase
              .from("clinics")
              .select("id")
              .eq("slug", candidate)
              .maybeSingle();

            if (clinic?.id) {
              const url = req.nextUrl.clone();
              url.pathname = `/clinic/${candidate}`;
              url.search = ""; // можно сохранить search если нужно
              return NextResponse.redirect(url);
            }
          }
        }

        // по умолчанию — ничего не делаем
        return res;
      }
    }
  }

  // ---------------------------
  // 2) твоя текущая auth логика (НЕ трогаем)
  // ---------------------------
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () =>
          req.cookies.getAll().map((c) => ({
            name: c.name,
            value: c.value,
          })),
        setAll: (all: Array<{ name: string; value: string; options?: any }>) =>
          all.forEach((cookie) =>
            res.cookies.set(cookie.name, cookie.value, cookie.options),
          ),
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthRoute = pathname.startsWith("/auth");
  const isAdminRoute = pathname.startsWith("/admin");
  const isCustomerRoute = pathname.startsWith("/customer");
  const isPartnerRoute = pathname.startsWith("/partner");
  const isPatientRoute = pathname.startsWith("/patient");

  let isAdmin = false;

  if (user) {
    const metaRoles =
      ((user.app_metadata?.roles as string[] | undefined) ?? []).map((r) =>
        String(r).toUpperCase(),
      );
    if (metaRoles.includes("ADMIN")) {
      isAdmin = true;
    }

    if (!isAdmin) {
      const { data: rows, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (!error && rows?.length) {
        if (rows.some((r) => r.role?.toUpperCase() === "ADMIN")) {
          isAdmin = true;
        }
      }
    }
  }

  if (isAuthRoute && user) {
    const next =
      searchParams.get("next") ||
      (isAdmin
        ? "/admin"
        : isCustomerRoute
        ? "/customer"
        : isPartnerRoute
        ? "/partner"
        : isPatientRoute
        ? "/patient"
        : "/");
    return NextResponse.redirect(new URL(next, req.url));
  }

  if (!user && (isAdminRoute || isCustomerRoute || isPartnerRoute || isPatientRoute)) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("next", req.nextUrl.pathname + req.nextUrl.search);

    const asParam = isAdminRoute
      ? "ADMIN"
      : isPartnerRoute
      ? "PARTNER"
      : isCustomerRoute
      ? "CUSTOMER"
      : isPatientRoute
      ? "PATIENT"
      : "GUEST";

    loginUrl.searchParams.set("as", asParam);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute && !isAdmin) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return res;
}

export const config = {
  matcher: [
    "/auth/:path*",
    "/admin/:path*",
    "/customer/:path*",
    "/partner/:path*",
    "/patient/:path*",

    // важно: чтобы наш "умный редирект" срабатывал
    "/(dentistry|plastic-surgery|hair-transplant|crowns|veneers|dental-implants)/:path*",
  ],
};
