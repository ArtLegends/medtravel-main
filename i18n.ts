"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en.json";
import es from "./locales/es.json";
import ru from "./locales/ru.json";

const resources = {
  en: { translation: en },
  es: { translation: es },
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
