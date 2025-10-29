// // app/(site)/[lang]/layout.tsx
// import type { Metadata } from "next";
// import { Providers } from "@/app/providers";
// import { isLocale, LOCALES, DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";

// export async function generateStaticParams() {
//   return LOCALES.map((lang) => ({ lang }));
// }

// export async function generateMetadata({
//   params,
// }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
//   const { lang } = await params;
//   const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;

//   // Можно дописать alternates.languages для SEO
//   return {
//     alternates: {
//       languages: {
//         en: `/en`,
//         ru: `/ru`,
//         pl: `/pl`,
//       },
//     },
//     // html lang поставим в JSX (ниже)
//   };
// }

// export default async function LangLayout({
//   children,
//   params,
// }: {
//   children: React.ReactNode;
//   params: Promise<{ lang: string }>;
// }) {
//   const { lang } = await params;
//   const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE;

//   return (
//     <html lang={locale} className="light"> {/* форсим светлую по умолчанию */}
//       <body>
//         {/* Передаём в провайдеры текущий язык */}
//         <Providers initialLang={locale}>{children}</Providers>
//       </body>
//     </html>
//   );
// }
