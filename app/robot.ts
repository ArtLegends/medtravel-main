// app/robots.ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  // Канонический сайт
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
          // поиск/фильтры блога
          "/blog?*",
          "/en/blog?*",
          "/ru/blog?*",
          "/pl/blog?*",
          "/*/blog?*",
          // черновики/превью
          "/*/blog/draft/*",
          "/*/blog/preview/*",
        ],
      },
    ],
    sitemap: `${canonical}/sitemap.xml`,
    host: new URL(canonical).host,
  };
}
