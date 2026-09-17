import type { AnomalyAnalysis } from "@/domain/analysis/types";
import type {
  MonitoringHistory,
  MonitoringSnapshot,
} from "@/domain/monitoring/types";

export interface MonitoringActivity {
  id: string;
  occurredAt: string;
  category: "system" | "device" | "analysis";
  deviceName?: string;
  type: "condition_attention" | "lighting_active" | "simulator_active" | "temperature_update" | "occupancy_empty" | "power_increased" | "device_online" | "device_offline" | "occupancy_changed" | "power_threshold" | "system_event";
}

export interface DashboardData {
  snapshot: MonitoringSnapshot;
  history: MonitoringHistory;
  analysis: AnomalyAnalysis;
  activities: MonitoringActivity[];
}
