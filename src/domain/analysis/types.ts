export type AnalysisAvailability = "not-configured" | "available" | "unavailable";

export type AnomalySeverity = "info" | "warning" | "critical";

export type AnomalyMetric = "occupancy" | "ac" | "light" | "power";

export interface AnomalyEvidence {
  metric: AnomalyMetric;
  value: number | boolean;
  unit?: "people" | "W";
}

export interface AnomalyFinding {
  id: string;
  code: "unoccupied_with_active_devices";
  severity: AnomalySeverity;
  detectedAt: string;
  confidence: number;
  evidence: AnomalyEvidence[];
}

export interface AnomalyAnalysis {
  availability: AnalysisAvailability;
  analyzedAt?: string;
  findings: AnomalyFinding[];
}
