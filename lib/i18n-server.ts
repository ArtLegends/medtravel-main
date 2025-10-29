// lib/i18n-server.ts
import { cache } from "react";

// Поддерживаемые локали
export const locales = ["en", "ru", "pl"] as const;
export type Locale = (typeof locales)[number];

// Вложенный словарь: значение — строка или ещё один словарь
interface NestedDict {
  [key: string]: string | NestedDict;
}

// Утилита: сплющиваем NestedDict в плоский Record<string,string> с dot.notation
function flattenDict(
  obj: NestedDict,
  prefix = "",
  out: Record<string, string> = {}
): Record<string, string> {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object") {
      flattenDict(v as NestedDict, key, out);
    } else {
      out[key] = String(v ?? "");
    }
  }
  return out;
}

// Кэшируем чтение JSON, сплющиваем и возвращаем плоский словарь
const getTranslations = cache(
  async (locale: Locale): Promise<Record<string, string>> => {
    try {
      const mod = await import(`../locales/${locale}.json`);
      return flattenDict(mod.default as NestedDict);
    } catch (error) {
      console.warn(`Failed to load translations for locale: ${locale}`, error);
      const mod = await import(`../locales/en.json`);
      return flattenDict(mod.default as NestedDict);
    }
  }
);

// Для server components: t(key) с dot.notation + доступ к словарю
export async function getServerTranslations(locale: Locale = "en") {
  const translations = await getTranslations(locale);

  return {
    t: (key: string, fallback?: string): string => {
      const val = translations[key];
      if (val !== undefined && val !== null && val !== "") return val;
      // необязательная подсветка пропусков
      // console.warn(`i18n: missing key "${key}" for locale "${locale}"`);
      return fallback ?? key;
    },
    translations,
  };
}

// Определение локали из Accept-Language
export function detectLocale(acceptLanguage?: string): Locale {
  if (!acceptLanguage) return "en";
  const preferred = acceptLanguage
    .split(",")
    .map((s) => s.split(";")[0].trim().toLowerCase());

  for (const p of preferred) {
    // точное совпадение
    if (locales.includes(p as Locale)) return p as Locale;
    // en-US -> en
    const base = p.split("-")[0];
    if (locales.includes(base as Locale)) return base as Locale;
  }
  return "en";
}
