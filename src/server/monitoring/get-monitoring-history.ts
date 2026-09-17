export { getMonitoringDataProvider as getHistoryProvider } from "@/server/monitoring/get-monitoring-source";

export async function getHistory(rangeHours = 24 * 30) {
  const provider = (await import("@/server/monitoring/get-monitoring-source")).getMonitoringDataProvider();
  return provider.getHistory(rangeHours);
}
