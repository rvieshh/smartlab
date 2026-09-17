export interface TelemetryPayload {
  device_id: string;
  timestamp?: string;
  temperature: number | null;
  humidity: number | null;
  occupancy: boolean | null;
  light: boolean | null;
  ac: boolean | null;
  power: number | null;
}

export interface TelemetryResponse {
  success: boolean;
  reading_id?: string;
  error?: string;
}

export interface SupabaseDeviceRow {
  id: string;
  device_identifier: string;
  name: string;
  device_type: string;
  status: "online" | "offline" | "warning";
  connection_type: "wifi" | "i2c" | "gpio" | "analog";
  firmware_version: string | null;
  ip_address: string | null;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupabaseSensorReadingRow {
  id: string;
  device_id: string;
  recorded_at: string;
  temperature: number | null;
  humidity: number | null;
  occupancy: boolean | null;
  light: boolean | null;
  ac: boolean | null;
  power: number | null;
}

export interface SupabaseMonitoringEventRow {
  id: string;
  device_id: string | null;
  event_type: "device_online" | "device_offline" | "occupancy_changed" | "power_threshold" | "system_event";
  recorded_at: string;
  metadata: Record<string, unknown>;
}
