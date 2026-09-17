import type { SupabaseDeviceRow, SupabaseMonitoringEventRow, SupabaseSensorReadingRow } from "@/domain/iot/types";

type InsertDevice = Omit<SupabaseDeviceRow, "id" | "created_at" | "updated_at"> & { id?: string; created_at?: string; updated_at?: string };
type UpdateDevice = Partial<InsertDevice>;

export interface Database {
  public: {
    Tables: {
      devices: { Row: SupabaseDeviceRow; Insert: InsertDevice; Update: UpdateDevice; Relationships: [] };
      device_credentials: { Row: { device_id: string; api_key_hash: string; created_at: string; rotated_at: string | null }; Insert: { device_id: string; api_key_hash: string; created_at?: string; rotated_at?: string | null }; Update: { api_key_hash?: string; rotated_at?: string | null }; Relationships: [] };
      sensor_readings: { Row: SupabaseSensorReadingRow; Insert: Omit<SupabaseSensorReadingRow, "id"> & { id?: string }; Update: Partial<Omit<SupabaseSensorReadingRow, "id">>; Relationships: [] };
      monitoring_events: { Row: SupabaseMonitoringEventRow; Insert: Omit<SupabaseMonitoringEventRow, "id"> & { id?: string }; Update: Partial<Omit<SupabaseMonitoringEventRow, "id">>; Relationships: [] };
    };
    Views: Record<string, never>;
    Functions: {
      ingest_device_telemetry: {
        Args: {
          p_device_id: string; p_recorded_at: string; p_temperature: number | null;
          p_humidity: number | null; p_occupancy: boolean | null; p_light: boolean | null;
          p_ac: boolean | null; p_power: number | null; p_ip_address: string | null;
 p_offline_after_seconds: number; p_min_interval_seconds: number; p_power_event_delta?: number;
        };
        Returns: string;
      };
      refresh_stale_devices: { Args: { p_offline_after_seconds: number }; Returns: number };
      get_sensor_history: { Args: { p_range_hours: number; p_bucket_seconds: number }; Returns: SupabaseSensorReadingRow[] };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
