"use client";

import React, { Suspense, useMemo } from "react";
import { HeroUIProvider } from "@heroui/react";
import { I18nextProvider } from "react-i18next";

import { SupabaseProvider } from "../lib/supabase/supabase-provider";
import ThemeProvider from "../components/ThemeProvider";
import i18n from "../i18n";

// Loading fallback for i18n
const I18nFallback = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-background">{children}</div>
);

export function Providers({ children }: { children: React.ReactNode }) {
  // Мемоизируем HeroUIProvider настройки
  const heroUIConfig = useMemo(() => ({ locale: "en" }), []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true}>
      <HeroUIProvider {...heroUIConfig}>
        <SupabaseProvider>
          <Suspense fallback={<I18nFallback>{children}</I18nFallback>}>
            <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
          </Suspense>
        </SupabaseProvider>
      </HeroUIProvider>
    </ThemeProvider>
  );
}
