import { getServerLocale } from "@/i18n/server";
import { translate } from "@/i18n";
import { getMonitoringDataProvider } from "@/server/monitoring/get-monitoring-source";
import { DevicesPageClient } from "@/components/devices/devices-page-client";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const locale = await getServerLocale();
  return { title: translate(locale, "devices.meta.title") };
}

export default async function DevicesPage() {
  const devices = await getMonitoringDataProvider().getDevices();
  return <DevicesPageClient initialDevices={devices} referenceTime={new Date().toISOString()} />;
}
