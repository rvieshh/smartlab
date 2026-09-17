import "server-only";
import type { MonitoringActivity } from "@/domain/dashboard/types";
import type { MonitoringDevice, DeviceKind, DeviceConnection } from "@/domain/devices/types";
import type { MonitoringHistory, MonitoringSample, MonitoringSnapshot } from "@/domain/monitoring/types";
import { historyBucketSeconds } from "@/domain/monitoring/presentation";
import type { SupabaseMonitoringEventRow } from "@/domain/iot/types";
import type { MonitoringDataProvider } from "@/server/monitoring/monitoring-source";
import { getServerConfig } from "@/config/env";
import { createAdminClient } from "@/lib/supabase/admin";

const LAB_ID = "smartlab-prototype";
const LAB_NAME = "electronics-lab-01";

function toSample(row: { id: string; recorded_at: string; temperature: number | null; humidity: number | null; occupancy: boolean | null; light: boolean | null; ac: boolean | null; power: number | null }): MonitoringSample {
  return { id: row.id, recordedAt: row.recorded_at, temperatureCelsius: row.temperature, relativeHumidityPercent: row.humidity, occupancyCount: row.occupancy === null ? null : row.occupancy ? 1 : 0, lightOn: row.light, acOn: row.ac, powerUsageWatts: row.power };
}
function deriveCondition(sample: MonitoringSample | null, offline: boolean): "normal" | "attention" | "degraded" {
  if (!sample || offline) return "degraded";
  if (sample.occupancyCount === 0 && (sample.acOn === true || sample.lightOn === true) && typeof sample.powerUsageWatts === "number" && sample.powerUsageWatts > 2400) return "attention";
  return "normal";
}
const EVENT_TYPE_MAP: Record<SupabaseMonitoringEventRow["event_type"], MonitoringActivity["type"]> = { device_online: "device_online", device_offline: "device_offline", occupancy_changed: "occupancy_changed", power_threshold: "power_threshold", system_event: "system_event" };
const DEVICE_TYPE_MAP: Record<string, DeviceKind> = { esp32: "controller", controller: "controller", environmental: "environmental", occupancy: "occupancy", light: "light", power: "power", relay: "relay" };
function databaseFailure(scope: string, error: { message?: string } | null) { if (error) throw new Error(`monitoring_database_${scope}_failed`); }

export class SupabaseMonitoringDataProvider implements MonitoringDataProvider {
  private client = createAdminClient();
  private requireClient() { if (!this.client) throw new Error("supabase_admin_not_configured"); return this.client; }
  private async ensureFreshStatuses() {
    const client = this.requireClient();
    const result = await client.rpc("refresh_stale_devices", { p_offline_after_seconds: getServerConfig().deviceOfflineAfterSeconds });
    databaseFailure("status_refresh", result.error);
  }

  async getCurrentStatus(): Promise<MonitoringSnapshot> {
    const client = this.requireClient();
    await this.ensureFreshStatuses();
    const [readingResult, deviceResult] = await Promise.all([
      client.from("sensor_readings").select("id, recorded_at, temperature, humidity, occupancy, light, ac, power").order("recorded_at", { ascending: false }).limit(1),
      client.from("devices").select("status"),
    ]);
    databaseFailure("latest_reading", readingResult.error);
    databaseFailure("devices", deviceResult.error);
    const latest = readingResult.data?.[0] ? toSample(readingResult.data[0]) : null;
    const devices = deviceResult.data ?? [];
    const anyOffline = devices.some((device) => device.status === "offline");
    return {
      labId: LAB_ID, labName: LAB_NAME, recordedAt: latest?.recordedAt ?? new Date().toISOString(), condition: deriveCondition(latest, anyOffline),
      source: { kind: "supabase", simulated: false },
      readings: { temperatureCelsius: latest?.temperatureCelsius ?? null, relativeHumidityPercent: latest?.relativeHumidityPercent ?? null, occupancyCount: latest?.occupancyCount ?? null, lightIntensityLux: null, powerUsageWatts: latest?.powerUsageWatts ?? null },
      devices: { lightOn: latest?.lightOn ?? null, acOn: latest?.acOn ?? null, gateway: devices.length === 0 ? "unknown" : anyOffline ? "unknown" : "online" },
    };
  }

  async getHistory(rangeHours = 24): Promise<MonitoringHistory> {
    const bucket = historyBucketSeconds(rangeHours);
    const { data, error } = await this.requireClient().rpc("get_sensor_history", { p_range_hours: rangeHours, p_bucket_seconds: bucket });
    databaseFailure("history", error);
    return { labId: LAB_ID, rangeHours, source: { kind: "supabase", simulated: false }, samples: (data ?? []).map(toSample) };
  }

  async getDevices(): Promise<MonitoringDevice[]> {
    const client = this.requireClient();
    await this.ensureFreshStatuses();
    const deviceResult = await client.from("devices").select("id, device_identifier, name, device_type, status, connection_type, firmware_version, last_seen_at").order("created_at", { ascending: true });
    databaseFailure("devices", deviceResult.error);
    const devices = deviceResult.data ?? [];
    if (devices.length === 0) return [];
    const readingResult = await client.from("sensor_readings").select("device_id, recorded_at, temperature, humidity, occupancy, light, ac, power").order("recorded_at", { ascending: false }).limit(500);
    databaseFailure("device_readings", readingResult.error);
    const latestByDevice = new Map<string, (typeof readingResult.data extends (infer T)[] | null ? T : never)>();
    for (const row of readingResult.data ?? []) if (!latestByDevice.has(row.device_id)) latestByDevice.set(row.device_id, row);
    return devices.map((device): MonitoringDevice => {
      const latest = latestByDevice.get(device.id);
      const readings: MonitoringDevice["readings"] = [];
      if (latest?.temperature != null) readings.push({ metric: "temperature", value: latest.temperature, unit: "°C" });
      if (latest?.humidity != null) readings.push({ metric: "humidity", value: latest.humidity, unit: "%" });
      if (latest?.occupancy != null) readings.push({ metric: "occupancy", value: latest.occupancy ? 1 : 0, unit: "people" });
      if (latest?.power != null) readings.push({ metric: "power", value: latest.power, unit: "W" });
      return { id: device.id, deviceIdentifier: device.device_identifier, name: device.name, deviceType: DEVICE_TYPE_MAP[device.device_type] ?? "controller", status: device.status, lastSeenAt: device.last_seen_at, connection: device.connection_type as DeviceConnection, firmwareVersion: device.firmware_version ?? undefined, readings, simulated: false };
    });
  }

  async getRecentEvents(): Promise<MonitoringActivity[]> {
    const result = await this.requireClient().from("monitoring_events").select("id, event_type, recorded_at, metadata").order("recorded_at", { ascending: false }).limit(20);
    databaseFailure("events", result.error);
    return (result.data ?? []).map((row) => ({ id: row.id, occurredAt: row.recorded_at, deviceName: typeof row.metadata?.device_name === "string" ? row.metadata.device_name : undefined, category: row.event_type === "system_event" ? "system" : "device", type: EVENT_TYPE_MAP[row.event_type as SupabaseMonitoringEventRow["event_type"]] ?? "system_event" }));
  }
}
