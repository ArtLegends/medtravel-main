// lib/i18n-server.ts
import { cache } from "react";

// Supported locales
export const locales = ["en", "es", "ru"] as const;
export type Locale = (typeof locales)[number];

// Cache translations to avoid repeated file reads
const getTranslations = cache(
  async (locale: Locale): Promise<Record<string, string>> => {
    try {
      const translations = await import(`../locales/${locale}.json`);

      return translations.default;
    } catch (error) {
      console.warn(`Failed to load translations for locale: ${locale}`, error);
      // Fallback to English
      const fallback = await import(`../locales/en.json`);

      return fallback.default;
    }
  },
);

// Get translation function for server components
export async function getServerTranslations(locale: Locale = "en") {
  const translations = await getTranslations(locale);

  return {
    t: (key: string, fallback?: string): string => {
      const value = translations[key];

      if (value) return value;

      console.warn(`Translation missing for key: ${key} in locale: ${locale}`);

      return fallback || key;
    },
    translations,
  };
}

// Detect locale from headers (for server components)
export function detectLocale(acceptLanguage?: string): Locale {
  if (!acceptLanguage) return "en";

  const preferredLocales = acceptLanguage
    .split(",")
    .map((lang) => lang.split(";")[0].trim().toLowerCase());

  for (const preferred of preferredLocales) {
    if (locales.includes(preferred as Locale)) {
      return preferred as Locale;
    }

    // Check for language without country code (e.g., "en" from "en-US")
    const langCode = preferred.split("-")[0];

    if (locales.includes(langCode as Locale)) {
      return langCode as Locale;
    }
  }

  return "en"; // Default fallback
}