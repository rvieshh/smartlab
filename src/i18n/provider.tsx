"use client";

import { createContext, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { defaultLocale, localeStorageKey, translate, type Locale, type TranslationKey } from "@/i18n";

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, variables?: Record<string, string | number>) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatDateTime: (value: string, options?: Intl.DateTimeFormatOptions) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => { listeners.delete(listener); window.removeEventListener("storage", listener); };
}

function getSnapshot(): Locale {
  const saved = window.localStorage.getItem(localeStorageKey);
  return saved === "id" || saved === "en" ? saved : defaultLocale;
}

function getServerSnapshot(initialLocale: Locale) {
  return initialLocale;
}

export function I18nProvider({ children, initialLocale = defaultLocale }: { children: ReactNode; initialLocale?: Locale }) {
  const locale = useSyncExternalStore(subscribe, getSnapshot, () => getServerSnapshot(initialLocale));

  useEffect(() => {
    document.documentElement.lang = locale;
    const path = window.location.pathname;
    const titleKey: TranslationKey = path === "/login"
      ? "auth.meta.title"
      : path === "/dashboard/history"
        ? "history.meta.title"
        : path === "/dashboard/devices"
          ? "devices.meta.title"
          : path.startsWith("/dashboard")
            ? "dashboard.meta.title"
            : "home.meta.title";
    document.title = translate(locale, titleKey);
  }, [locale]);

  function setLocale(next: Locale) {
    window.localStorage.setItem(localeStorageKey, next);
    document.cookie = `${localeStorageKey}=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
    listeners.forEach((listener) => listener());
  }

  const value = useMemo<I18nContextValue>(() => ({
    locale,
    setLocale,
    t: (key, variables) => translate(locale, key, variables),
    formatNumber: (number, options) => new Intl.NumberFormat(locale === "id" ? "id-ID" : "en-US", options).format(number),
    formatDateTime: (date, options) => new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", options).format(new Date(date)),
  }), [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used inside I18nProvider");
  return value;
}
