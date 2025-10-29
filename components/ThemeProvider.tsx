// components/ThemeProvider.tsx
"use client";

import * as React from "react";
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps as NextThemesProviderProps,
} from "next-themes";

/**
 * Обёртка над next-themes с дефолтами для проекта.
 * Пропсы можно переопределять при использовании.
 */
export type ThemeProviderProps = Omit<NextThemesProviderProps, "children"> & {
  children: React.ReactNode;
};

export default function ThemeProvider({
  children,
  ...rest
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      // дефолты проекта
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
      storageKey="medtravel-theme"
      themes={["light", "dark"]}
      // позволяют переопределить при необходимости
      {...rest}
    >
      {children}
    </NextThemesProvider>
  );
}
