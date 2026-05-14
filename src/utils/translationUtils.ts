import { Language } from "@/i18n/translations";

/**
 * Dynamically retrieves a translated field from a database record.
 * @param item The database record (Product, Category, Pack)
 * @param field The base field name (e.g., 'name', 'description')
 * @param language The current active language
 * @returns The translated string or the original field as fallback
 */
export function getTranslated(item: any, field: string, language: Language): string {
  if (!item) return "";
  
  // Construct the translated field name (e.g., name_ar, description_en)
  const translatedField = language === 'fr' ? field : `${field}_${language}`;
  
  // Return translated version if available, otherwise fallback to French (original field)
  return item[translatedField] || item[field] || "";
}
