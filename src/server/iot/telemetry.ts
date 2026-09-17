import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import type { TelemetryPayload } from "@/domain/iot/types";
import { getServerConfig } from "@/config/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { TelemetryAuthError, TelemetryRateLimitError, TelemetryUnknownDeviceError } from "@/server/iot/telemetry-errors";
export { TelemetryAuthError, TelemetryRateLimitError, TelemetryUnknownDeviceError } from "@/server/iot/telemetry-errors";
export { TelemetryValidationError, getRequestIp, validateTelemetryPayload } from "@/server/iot/telemetry-validation";

function hashApiKey(apiKey: string) { return createHash("sha256").update(apiKey).digest("hex"); }
function safeHashEqual(left: string, right: string) {
  const a = Buffer.from(left, "hex");
  const b = Buffer.from(right, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function ingestTelemetry(payload: TelemetryPayload, apiKey: string | null, ipAddress: string | null) {
  if (!apiKey || apiKey.length < 24) throw new TelemetryAuthError("invalid_device_credential");
  const client = createAdminClient();
  if (!client) throw new Error("telemetry_service_not_configured");
  const { telemetryRateLimitSeconds, deviceOfflineAfterSeconds } = getServerConfig();
  const { data: device, error: deviceError } = await client.from("devices").select("id, last_seen_at").eq("device_identifier", payload.device_id).maybeSingle();
  if (deviceError) throw new Error("device_lookup_failed");
  if (!device) throw new TelemetryUnknownDeviceError("unknown_device");
  const { data: credential, error: credentialError } = await client.from("device_credentials").select("api_key_hash").eq("device_id", device.id).maybeSingle();
  if (credentialError || !credential || !safeHashEqual(credential.api_key_hash, hashApiKey(apiKey))) throw new TelemetryAuthError("invalid_device_credential");
  if (device.last_seen_at) {
    const elapsed = Math.floor((Date.now() - Date.parse(device.last_seen_at)) / 1000);
    if (elapsed < telemetryRateLimitSeconds) throw new TelemetryRateLimitError(telemetryRateLimitSeconds - elapsed);
  }
  const { data: readingId, error: ingestError } = await client.rpc("ingest_device_telemetry", {
    p_device_id: device.id,
    p_recorded_at: payload.timestamp ?? new Date().toISOString(),
    p_temperature: payload.temperature,
    p_humidity: payload.humidity,
    p_occupancy: payload.occupancy,
    p_light: payload.light,
    p_ac: payload.ac,
    p_power: payload.power,
    p_ip_address: ipAddress,
    p_offline_after_seconds: deviceOfflineAfterSeconds,
    p_min_interval_seconds: telemetryRateLimitSeconds,
    p_power_event_delta: 250,
  });
  if (ingestError || !readingId) throw new Error(ingestError?.message.includes("telemetry_rate_limited") ? "telemetry_rate_limited" : "telemetry_write_failed");
  return { readingId: String(readingId) };
}
