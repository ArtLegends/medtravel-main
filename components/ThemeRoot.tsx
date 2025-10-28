// components/ThemeRoot.tsx
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Клиентский провайдер темы. Отдельное имя/файл, чтобы не конфликтовать
 * с кэшем предыдущего ThemeProvider.tsx.
 */
export default function ThemeRoot({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="medtravel-theme"
      themes={["light", "dark"]}
    >
      {children}
    </NextThemesProvider>
  );
}
