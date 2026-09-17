import type { DashboardData } from "@/domain/dashboard/types";
import type { MonitoringHistory, MonitoringSnapshot } from "@/domain/monitoring/types";

export function emptySnapshot(): MonitoringSnapshot {
  return {
    labId: "smartlab-prototype",
    labName: "electronics-lab-01",
    recordedAt: new Date(0).toISOString(),
    condition: "degraded",
    source: { kind: "supabase", simulated: false },
    readings: { temperatureCelsius: null, relativeHumidityPercent: null, occupancyCount: null, lightIntensityLux: null, powerUsageWatts: null },
    devices: { lightOn: null, acOn: null, gateway: "unknown" },
  };
}

export function emptyHistory(rangeHours = 24): MonitoringHistory {
  return { labId: "smartlab-prototype", rangeHours, source: { kind: "supabase", simulated: false }, samples: [] };
}

export function emptyDashboardData(rangeHours = 12): DashboardData {
  const snapshot = emptySnapshot();
  return { snapshot, history: emptyHistory(rangeHours), analysis: { availability: "not-configured", analyzedAt: snapshot.recordedAt, findings: [] }, activities: [] };
}
