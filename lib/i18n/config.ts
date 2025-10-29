// lib/i18n/config.ts
export const LOCALES = ["en", "ru", "pl"] as const;
export type Locale = typeof LOCALES[number];
export const DEFAULT_LOCALE: Locale = "en";
export const isLocale = (s?: string): s is Locale =>
  !!s && (LOCALES as readonly string[]).includes(s);
