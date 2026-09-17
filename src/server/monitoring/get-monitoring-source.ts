import { getServerConfig } from "@/config/env";
import type { MonitoringDataProvider } from "@/server/monitoring/monitoring-source";
import { MockMonitoringDataProvider } from "@/server/monitoring/sources/simulated-monitoring-source";
import { SupabaseMonitoringDataProvider } from "@/server/monitoring/sources/supabase-monitoring-source";

export function getMonitoringDataProvider(): MonitoringDataProvider {
  const { monitoringDataSource } = getServerConfig();
  return monitoringDataSource === "supabase" ? new SupabaseMonitoringDataProvider() : new MockMonitoringDataProvider();
}

export const getMonitoringSource = getMonitoringDataProvider;
