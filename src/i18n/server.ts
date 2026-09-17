import { cookies } from "next/headers";
import { defaultLocale, localeStorageKey, translate, type Locale, type TranslationKey } from "@/i18n";

export async function getServerLocale(): Promise<Locale> {
  const value = (await cookies()).get(localeStorageKey)?.value;
  return value === "id" || value === "en" ? value : defaultLocale;
}

export async function serverTranslate(key: TranslationKey, variables?: Record<string, string | number>) {
  return translate(await getServerLocale(), key, variables);
}
