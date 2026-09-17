export type MonitoringDataSource = "simulator" | "supabase";

export interface ServerConfig {
  monitoringDataSource: MonitoringDataSource;
  aiAnalysisEnabled: boolean;
  aiServiceUrl?: string;
  telemetryIntervalSeconds: number;
  deviceOfflineAfterSeconds: number;
  telemetryRateLimitSeconds: number;
}

function readBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  if (value === "true") return true;
  if (value === "false") return false;
  throw new Error(`Expected a boolean environment value, received: ${value}`);
}

function readPositiveInteger(value: string | undefined, fallback: number) {
  if (value === undefined) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) throw new Error("Expected a positive integer environment value");
  return parsed;
}

export function getServerConfig(): ServerConfig {
  const monitoringDataSource = process.env.MONITORING_DATA_SOURCE ?? "simulator";
  if (monitoringDataSource !== "simulator" && monitoringDataSource !== "supabase") {
    throw new Error(`Unsupported MONITORING_DATA_SOURCE: ${monitoringDataSource}`);
  }
  return {
    monitoringDataSource,
    aiAnalysisEnabled: readBoolean(process.env.AI_ANALYSIS_ENABLED, false),
    aiServiceUrl: process.env.AI_SERVICE_URL,
    telemetryIntervalSeconds: readPositiveInteger(process.env.TELEMETRY_INTERVAL_SECONDS, 10),
    deviceOfflineAfterSeconds: readPositiveInteger(process.env.DEVICE_OFFLINE_AFTER_SECONDS, 120),
    telemetryRateLimitSeconds: readPositiveInteger(process.env.TELEMETRY_RATE_LIMIT_SECONDS, 5),
  };
}
