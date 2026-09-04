import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18next from "i18next";
import { useEffect, useState } from "react";

import en from "../constants/translation/en.json";
import es from "../constants/translation/es.json";

export type AppLanguage = "es" | "en";

const deviceLanguage = Localization.getLocales()[0]?.languageCode?.toLowerCase().split("-")[0];
const detectedLanguage: AppLanguage = deviceLanguage === "en" ? "en" : "es";
const LANGUAGE_STORAGE_KEY = "rehabbit_language";
let currentLanguage: AppLanguage = detectedLanguage;
const listeners = new Set<() => void>();

// Initialize synchronously so data-driven labels use the device language on first render.
void i18next.init({
  compatibilityJSON: "v4",
  lng: currentLanguage,
  fallbackLng: "es",
  resources: { en, es },
  interpolation: { escapeValue: false },
  initImmediate: false,
});

export const translate = {
  get language() {
    return currentLanguage;
  },
  t: (key: string, options?: Record<string, unknown>) => i18next.t(key as never, options),
  init: async () => {
    const storedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (storedLanguage === "es" || storedLanguage === "en") {
      await setLanguage(storedLanguage);
    }
  },
  setLanguage,
};

export async function setLanguage(language: AppLanguage) {
  currentLanguage = language;
  await i18next.changeLanguage(language);
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  listeners.forEach((listener) => listener());
}

export function useAppLanguage() {
  const [language, setCurrentLanguage] = useState<AppLanguage>(currentLanguage);

  useEffect(() => {
    const listener = () => setCurrentLanguage(currentLanguage);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return { language, setLanguage };
}
