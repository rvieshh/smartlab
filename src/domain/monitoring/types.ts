export type MonitoringSourceKind = "simulator" | "esp32" | "supabase";

export type DeviceConnectionState = "online" | "offline" | "unknown";
export type LaboratoryCondition = "normal" | "attention" | "degraded";

export interface EnvironmentalReadings {
  temperatureCelsius: number | null;
  relativeHumidityPercent: number | null;
  occupancyCount: number | null;
  lightIntensityLux: number | null;
  powerUsageWatts: number | null;
}

export interface DeviceStates {
  lightOn: boolean | null;
  acOn: boolean | null;
  gateway: DeviceConnectionState;
}

export interface MonitoringSample {
  id: string;
  recordedAt: string;
  temperatureCelsius: number | null;
  relativeHumidityPercent: number | null;
  occupancyCount: number | null;
  lightOn: boolean | null;
  acOn: boolean | null;
  powerUsageWatts: number | null;
}

export interface MonitoringSnapshot {
  labId: string;
  labName: string;
  recordedAt: string;
  condition: LaboratoryCondition;
  source: { kind: MonitoringSourceKind; simulated: boolean };
  readings: EnvironmentalReadings;
  devices: DeviceStates;
}

export interface MonitoringHistory {
  labId: string;
  rangeHours: number;
  source: { kind: MonitoringSourceKind; simulated: boolean };
  samples: MonitoringSample[];
}

export interface MonitoringOverview {
  snapshot: MonitoringSnapshot;
  history: MonitoringHistory;
}
