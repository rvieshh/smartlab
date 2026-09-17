import { isIP } from "node:net";
import type { TelemetryPayload } from "@/domain/iot/types";

export class TelemetryValidationError extends Error {}
const DEVICE_IDENTIFIER = /^[a-zA-Z0-9][a-zA-Z0-9_-]{2,63}$/;
const MINUTE = 60_000;

function isNullableNumber(value: unknown): value is number | null { return value === null || (typeof value === "number" && Number.isFinite(value)); }
function isNullableBoolean(value: unknown): value is boolean | null { return value === null || typeof value === "boolean"; }
function checkRange(name: string, value: number | null, min: number, max: number) { if (value !== null && (value < min || value > max)) throw new TelemetryValidationError(`${name}_out_of_range`); }

export function validateTelemetryPayload(input: unknown): TelemetryPayload {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new TelemetryValidationError("invalid_payload");
  const value = input as Record<string, unknown>;
  if (typeof value.device_id !== "string" || !DEVICE_IDENTIFIER.test(value.device_id)) throw new TelemetryValidationError("invalid_device_id");
  const fields = ["temperature", "humidity", "occupancy", "light", "ac", "power"] as const;
  for (const field of fields) if (!(field in value)) throw new TelemetryValidationError("missing_telemetry_field");
  if (!isNullableNumber(value.temperature) || !isNullableNumber(value.humidity) || !isNullableNumber(value.power)) throw new TelemetryValidationError("invalid_numeric_value");
  if (!isNullableBoolean(value.occupancy) || !isNullableBoolean(value.light) || !isNullableBoolean(value.ac)) throw new TelemetryValidationError("invalid_boolean_value");
  if ([value.temperature, value.humidity, value.occupancy, value.light, value.ac, value.power].every((field) => field === null)) throw new TelemetryValidationError("empty_telemetry");
  checkRange("temperature", value.temperature, -50, 100);
  checkRange("humidity", value.humidity, 0, 100);
  checkRange("power", value.power, 0, 100_000);
  if (value.timestamp !== undefined) {
    if (typeof value.timestamp !== "string" || Number.isNaN(Date.parse(value.timestamp))) throw new TelemetryValidationError("invalid_timestamp");
    if (Math.abs(Date.now() - Date.parse(value.timestamp)) > 5 * MINUTE) throw new TelemetryValidationError("timestamp_out_of_window");
  }
  return { device_id: value.device_id, timestamp: value.timestamp as string | undefined, temperature: value.temperature, humidity: value.humidity, occupancy: value.occupancy, light: value.light, ac: value.ac, power: value.power };
}

export function getRequestIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  return forwarded && isIP(forwarded) ? forwarded : null;
}
