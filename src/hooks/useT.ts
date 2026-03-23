import { useLanguage } from "@/hooks/useLanguage";
import { t, TranslationKey } from "@/i18n/translations";
import { useCallback } from "react";

export const useT = () => {
  const language = useLanguage((s) => s.language);
  const translate = useCallback(
    (key: TranslationKey) => t(key, language),
    [language]
  );
  return { t: translate, lang: language, isRtl: language === "ar" };
};
