"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en.json";
import pl from "./locales/pl.json";
import ru from "./locales/ru.json";

export const locales = ['en','ru','pl'] as const;
export const defaultLocale = 'en';

// ключи автоматом возьмутся из /locales/{lng}/common.json
export const localeConfig = {
  locales,
  defaultLocale,
  localeDetection: true,
  pages: {
    '*': ['common'],
  },
};

const resources = {
  en: { translation: en },
  pl: { translation: pl },
  ru: { translation: ru },
};

if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: "en",
      interpolation: { escapeValue: false },
      detection: {
        // order and from where user language should be detected
        order: ["localStorage", "navigator", "htmlTag"],
        caches: ["localStorage"],
      },
    })
    .catch((err) => console.error("i18n init failed", err));
}

export default i18n;
