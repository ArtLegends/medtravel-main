// app/layout.tsx
import type { Metadata, Viewport } from "next";

import { Roboto } from "next/font/google";
import { headers } from "next/headers";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

import "../styles/globals.css";
import { detectLocale } from "../lib/i18n-server";

import { Providers } from "./providers";

import { SupabaseProvider } from "@/lib/supabase/supabase-provider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

// Optimize font loading
const roboto = Roboto({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-roboto",
  weight: ["300", "400", "500", "700"],
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: "MedTravel - Digital Platform",
    template: "%s | MedTravel",
  },
  description: "MedTravel - Your digital platform for creativity and commerce",
  keywords: ["marketplace", "digital", "platform", "creativity"],
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
    title: "MedTravel - Digital Platform",
    description: "Your digital platform for creativity and commerce",
  },
  twitter: {
    card: "summary_large_image",
    title: "MedTravel - Digital Platform",
    description: "Your digital platform for creativity and commerce",
    creator: "@medtravel",
  },
  metadataBase: new URL("https://medtravel.me"),
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/en",
      "es-ES": "/es",
      "ru-RU": "/ru",
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#D4D4D8" },
    { media: "(prefers-color-scheme: dark)", color: "#27272A" },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Detect locale from headers for SSR
  const headersList = await headers();
  const acceptLanguage = headersList.get("accept-language");
  const locale = detectLocale(acceptLanguage || undefined);

  return (
    <html suppressHydrationWarning className={roboto.variable} lang={locale}>
      <head>
        {/* DNS prefetch for external resources */}
        <link href="//fonts.googleapis.com" rel="dns-prefetch" />
        <link href="//vercel.live" rel="dns-prefetch" />
        <link href="//api.supabase.co" rel="dns-prefetch" />
        {/* Preconnect to critical domains */}
        <link
          crossOrigin=""
          href="https://fonts.gstatic.com"
          rel="preconnect"
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${roboto.className} bg-background text-foreground antialiased`}
      >
        <Providers>
          <SupabaseProvider>
            <ThemeProvider>
              <div className="relative flex min-h-screen flex-col bg-background">
                <Navbar />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
            </ThemeProvider>
          </SupabaseProvider>
          <Analytics />
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  );
}
