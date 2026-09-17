import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { getServerLocale } from "@/i18n/server";
import { translate } from "@/i18n";
import { getDashboardData } from "@/server/dashboard/get-dashboard-data";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const locale = await getServerLocale();
  return { title: translate(locale, "dashboard.meta.title") };
}

export default async function DashboardPage() {
  const data = await getDashboardData(12);
  return <DashboardClient initialData={data} />;
}
