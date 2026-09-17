import { getServerLocale } from "@/i18n/server";
import { translate } from "@/i18n";
import { getHistory } from "@/server/monitoring/get-monitoring-history";
import { HistoryPageClient } from "@/components/history/history-page-client";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const locale = await getServerLocale();
  return { title: translate(locale, "history.meta.title") };
}

export default async function HistoryPage() {
  const history = await getHistory(24);
  return <HistoryPageClient initialHistory={history} />;
}
