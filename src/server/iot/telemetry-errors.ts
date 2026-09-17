export class TelemetryAuthError extends Error {}
export class TelemetryUnknownDeviceError extends Error {}
export class TelemetryRateLimitError extends Error {
  constructor(public retryAfterSeconds: number) { super("telemetry_rate_limited"); }
}
