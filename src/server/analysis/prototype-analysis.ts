import type { AnomalyAnalysis } from "@/domain/analysis/types";
import type { MonitoringSnapshot } from "@/domain/monitoring/types";

export function getPrototypeAnalysis(snapshot: MonitoringSnapshot): AnomalyAnalysis {
  const { occupancyCount, powerUsageWatts } = snapshot.readings;
  const { acOn, lightOn } = snapshot.devices;
  if (occupancyCount === null || powerUsageWatts === null || acOn === null || lightOn === null) {
    return { availability: "available", analyzedAt: snapshot.recordedAt, findings: [] };
  }
  return {
    availability: "available",
    analyzedAt: snapshot.recordedAt,
    findings: [{
      id: "prototype-unoccupied-devices-active", code: "unoccupied_with_active_devices", severity: "warning",
      detectedAt: snapshot.recordedAt, confidence: 0.92,
      evidence: [
        { metric: "occupancy", value: occupancyCount, unit: "people" },
        { metric: "ac", value: acOn },
        { metric: "light", value: lightOn },
        { metric: "power", value: powerUsageWatts, unit: "W" },
      ],
    }],
  };
}
