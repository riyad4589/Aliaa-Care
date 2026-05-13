import { create } from "zustand";

export type Language = "fr" | "en" | "ar";

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  hasChosen: boolean;
  setHasChosen: (v: boolean) => void;
}

const getStoredLanguage = (): Language | null => {
  try {
    return localStorage.getItem("aliaa-lang") as Language | null;
  } catch {
    return null;
  }
};

const getInitialLanguage = (): Language => {
  const stored = getStoredLanguage();
  if (stored) {
    document.documentElement.dir = stored === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = stored;
    return stored;
  }
  return "fr";
};

export const useLanguage = create<LanguageState>((set) => ({
  language: getInitialLanguage(),
  hasChosen: !!getStoredLanguage(),
  setLanguage: (lang) => {
    localStorage.setItem("aliaa-lang", lang);
    set({ language: lang, hasChosen: true });
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  },
  setHasChosen: (v) => set({ hasChosen: v }),
}));
