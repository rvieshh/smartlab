import type { MonitoringActivity } from "@/domain/dashboard/types";
import type { MonitoringDevice } from "@/domain/devices/types";
import type { MonitoringHistory, MonitoringSnapshot } from "@/domain/monitoring/types";

/**
 * Stable boundary between SmartLab UI/services and any telemetry backend.
 * The mock implementation can later be replaced by API, Supabase, or realtime
 * ingestion without changing presentation components.
 */
export interface MonitoringDataProvider {
  getCurrentStatus(): Promise<MonitoringSnapshot>;
  getHistory(rangeHours?: number): Promise<MonitoringHistory>;
  getDevices(): Promise<MonitoringDevice[]>;
  getRecentEvents(): Promise<MonitoringActivity[]>;
}

/** @deprecated Use MonitoringDataProvider. Kept as a compatibility alias. */
export type MonitoringSource = MonitoringDataProvider;
