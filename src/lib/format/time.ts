import type { TranslationKey } from "@/i18n";

export function formatRelativeTime(value: string, t: (key: TranslationKey, variables?: Record<string, string | number>) => string, formatDateTime: (value: string, options?: Intl.DateTimeFormatOptions) => string, referenceValue = value) {
  const minutes = Math.floor(Math.max(0, new Date(referenceValue).getTime() - new Date(value).getTime()) / 60_000);
  if (minutes < 1) return t("common.time.justNow");
  if (minutes < 60) return t("common.time.minutesAgo", { count: minutes });
  if (minutes < 24 * 60) return t("common.time.hoursAgo", { count: Math.floor(minutes / 60) });
  return formatDateTime(value, { dateStyle: "medium", timeStyle: "short" });
}
