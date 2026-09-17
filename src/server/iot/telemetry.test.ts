import test from "node:test";
import assert from "node:assert/strict";
import { TelemetryValidationError, getRequestIp, validateTelemetryPayload } from "./telemetry-validation";

const valid = {
  device_id: "esp32-main-01",
  temperature: 24.8,
  humidity: 62,
  occupancy: true,
  light: true,
  ac: true,
  power: 420,
};

test("accepts a valid telemetry payload", () => {
  assert.deepEqual(validateTelemetryPayload(valid), { ...valid, timestamp: undefined });
});

test("rejects a numeric field with the wrong type", () => {
  assert.throws(() => validateTelemetryPayload({ ...valid, temperature: "24.8" }), TelemetryValidationError);
});

test("rejects an unknown or malformed device identifier", () => {
  assert.throws(() => validateTelemetryPayload({ ...valid, device_id: "?" }), TelemetryValidationError);
});

test("rejects values outside safe laboratory ranges", () => {
  assert.throws(() => validateTelemetryPayload({ ...valid, humidity: 140 }), TelemetryValidationError);
});

test("rejects stale client timestamps beyond the five-minute window", () => {
  assert.throws(() => validateTelemetryPayload({ ...valid, timestamp: new Date(Date.now() - 10 * 60_000).toISOString() }), TelemetryValidationError);
});

test("reads only a valid forwarded IP", () => {
  assert.equal(getRequestIp(new Request("http://localhost", { headers: { "x-forwarded-for": "192.0.2.10, 10.0.0.1" } })), "192.0.2.10");
  assert.equal(getRequestIp(new Request("http://localhost", { headers: { "x-forwarded-for": "not-an-ip" } })), null);
});
