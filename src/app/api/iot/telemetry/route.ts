import { NextRequest, NextResponse } from "next/server";
import { serverTranslate } from "@/i18n/server";
import {
  TelemetryAuthError,
  TelemetryRateLimitError,
  TelemetryUnknownDeviceError,
  TelemetryValidationError,
  getRequestIp,
  ingestTelemetry,
  validateTelemetryPayload,
} from "@/server/iot/telemetry";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: await serverTranslate("common.errors.invalidTelemetryPayload") }, { status: 400 });
    }

    const payload = validateTelemetryPayload(body);
    const apiKey = request.headers.get("x-device-key");
    const { readingId } = await ingestTelemetry(payload, apiKey, getRequestIp(request));
    return NextResponse.json({ success: true, reading_id: readingId });
  } catch (error) {
    if (error instanceof TelemetryValidationError) {
      return NextResponse.json({ success: false, error: await serverTranslate("common.errors.invalidTelemetryPayload") }, { status: 400 });
    }
    if (error instanceof TelemetryUnknownDeviceError) {
      return NextResponse.json({ success: false, error: await serverTranslate("common.errors.unknownDevice") }, { status: 404 });
    }
    if (error instanceof TelemetryAuthError) {
      return NextResponse.json({ success: false, error: await serverTranslate("common.errors.invalidDeviceCredential") }, { status: 401 });
    }
    if (error instanceof TelemetryRateLimitError) {
      return NextResponse.json({ success: false, error: await serverTranslate("common.errors.telemetryTooFrequent") }, { status: 429, headers: { "retry-after": String(Math.ceil(error.retryAfterSeconds)) } });
    }
    const message = error instanceof Error ? error.message : "unknown";
    if (message.includes("telemetry_rate_limited")) {
      return NextResponse.json({ success: false, error: await serverTranslate("common.errors.telemetryTooFrequent") }, { status: 429 });
    }
    console.error("telemetry ingestion failed", error);
    return NextResponse.json({ success: false, error: await serverTranslate("common.errors.serverError") }, { status: 500 });
  }
}
