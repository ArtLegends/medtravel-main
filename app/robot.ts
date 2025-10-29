// app/robots.ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  // Канонический сайт (один!)
  const canonical =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
    "https://medtravel.me";

  const isPreview = !!process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production";

  if (isPreview) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          // системные
          "/api/",
          "/admin/",
          "/auth/",
          "/_next/",
          "/static/",
          // мусорные query-хвосты
          "/*?*utm_",
          "/*?*ref=",
          "/*?*session=",
          "/*?*preview=",
          // поиск/фильтры блога — не индексируем
          "/blog?*",
          "/en/blog?*",
          "/ru/blog?*",
          "/pl/blog?*",
          "/*/blog?*",
          // черновики/превью, если появятся
          "/*/blog/draft/*",
          "/*/blog/preview/*",
        ],
      },
    ],
    // Можно вернуть массив, если у тебя реально две карты; но лучше один канон
    sitemap: `${canonical}/sitemap.xml`,
    // Host — не стандарт, используется в Яндексе. Допускается только один.
    host: new URL(canonical).host,
  };
}
