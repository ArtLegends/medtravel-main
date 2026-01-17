// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Roboto } from "next/font/google";
import { headers, cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import "@/styles/globals.css";
import { detectLocale } from "@/lib/i18n-server";
import { SupabaseProvider } from "@/lib/supabase/supabase-provider";
import ThemeRoot from "@/components/ThemeRoot";
import AppChrome from "@/components/layout/AppChrome";

// Font
const roboto = Roboto({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-roboto",
  weight: ["300", "400", "500", "700"],
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: "MedTravel — Medical Tourism Platform",
    template: "%s | MedTravel",
  },
  description:
    "MedTravel connects patients with verified clinics worldwide. Compare treatments and book a consultation safely.",
  keywords: ["medical tourism","clinics","treatments","healthcare abroad","medtravel"],
  authors: [{ name: "MedTravel Team" }],
  creator: "MedTravel",
  publisher: "MedTravel",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://medtravel.me",
    siteName: "MedTravel",
    title: "MedTravel — Medical Tourism Platform",
    description: "Find the best clinics and treatments abroad. Request a free consultation.",
  },
  twitter: {
    card: "summary_large_image",
    title: "MedTravel — Medical Tourism Platform",
    description: "Find the best clinics and treatments abroad. Request a free consultation.",
    creator: "@medtravel",
  },
  metadataBase: new URL("https://medtravel.me"),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F4F4F5" },
    { media: "(prefers-color-scheme: dark)", color: "#0C0C0E" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const acceptLanguage = headersList.get("accept-language");
  const locale = detectLocale(acceptLanguage || undefined);

  // server-side session
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll().map(c => ({ name: c.name, value: c.value })),
        setAll: () => {}, // не меняем куки тут
      },
    }
  );
  const { data } = await supabase.auth.getSession();

  return (
    <html suppressHydrationWarning className={roboto.variable} lang={locale}>
      <head>
        <link href="//fonts.googleapis.com" rel="dns-prefetch" />
        <link href="//api.supabase.co" rel="dns-prefetch" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <style>{`:root{--site-header-h:64px}`}</style>
      </head>
      <body suppressHydrationWarning className={`${roboto.className} bg-background text-foreground antialiased`}>
        <SupabaseProvider initialSession={data.session}>
          <ThemeRoot>
            <div id="app-root" className="relative z-0 flex min-h-screen flex-col">
              <AppChrome>{children}</AppChrome>
            </div>
          </ThemeRoot>
        </SupabaseProvider>
      </body>
    </html>
  );
}
