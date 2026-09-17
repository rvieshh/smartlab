import { common as enCommon } from "@/i18n/locales/en/common";
import { auth as enAuth } from "@/i18n/locales/en/auth";
import { dashboard as enDashboard } from "@/i18n/locales/en/dashboard";
import { home as enHome } from "@/i18n/locales/en/home";
import { faq as enFaq } from "@/i18n/locales/en/faq";
import { history as enHistory } from "@/i18n/locales/en/history";
import { devices as enDevices } from "@/i18n/locales/en/devices";
import { common as idCommon } from "@/i18n/locales/id/common";
import { auth as idAuth } from "@/i18n/locales/id/auth";
import { dashboard as idDashboard } from "@/i18n/locales/id/dashboard";
import { home as idHome } from "@/i18n/locales/id/home";
import { faq as idFaq } from "@/i18n/locales/id/faq";
import { history as idHistory } from "@/i18n/locales/id/history";
import { devices as idDevices } from "@/i18n/locales/id/devices";

export const messages = {
  en: { ...enCommon, ...enAuth, ...enDashboard, ...enHome, ...enFaq, ...enHistory, ...enDevices },
  id: { ...idCommon, ...idAuth, ...idDashboard, ...idHome, ...idFaq, ...idHistory, ...idDevices },
} as const;

export type Locale = keyof typeof messages;
export type TranslationKey = keyof typeof messages.en;
export const defaultLocale: Locale = "en";
export const localeStorageKey = "smartlab-language";

export function translate(locale: Locale, key: TranslationKey, variables?: Record<string, string | number>) {
  let value: string = messages[locale][key] ?? messages.en[key] ?? `[MISSING TRANSLATION: ${key}]`;
  for (const [name, replacement] of Object.entries(variables ?? {})) {
    value = value.replaceAll(`{${name}}`, String(replacement));
  }
  return value;
}
