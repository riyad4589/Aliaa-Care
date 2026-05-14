import { Language } from "@/hooks/useLanguage";

/**
 * Helper to get the translated version of a field from a database record.
 * Falls back to the default field if translation is missing or language is 'fr'.
 */
export function getTranslated<T extends Record<string, any>>(
  item: T,
  field: string,
  lang: Language
): string {
  if (lang === "fr") return item[field] || "";
  
  const translatedField = `${field}_${lang}`;
  return item[translatedField] || item[field] || "";
}
