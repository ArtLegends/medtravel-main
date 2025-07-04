"use client";

import type { ThemeProviderProps } from "next-themes";

import dynamic from "next/dynamic";

const NextThemesProvider = dynamic(
  () => import("next-themes").then((m) => m.ThemeProvider),
  { ssr: false }
);

export function ThemeProvider(props: ThemeProviderProps) {
  return <NextThemesProvider {...props} />;
}
