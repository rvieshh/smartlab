# SmartLab IoT data foundation

## Data flow

```text
ESP32 + sensors -> Wi-Fi -> POST /api/iot/telemetry -> Supabase
                                                  -> dashboard provider
                                                  -> Supabase Realtime refresh
```

The application has two providers selected by `MONITORING_DATA_SOURCE`:

- `simulator` (default): demo data, clearly labeled `Demo Data`.
- `supabase`: reads `devices`, `sensor_readings`, and `monitoring_events`; no fake fallback is used.

## Database

Migration: `supabase/migrations/20260917030000_iot_foundation.sql`

Entities:

- `devices`: stable `device_identifier`, metadata, status, last seen.
- `device_credentials`: SHA-256 device API-key hashes; never selectable by dashboard users.
- `sensor_readings`: nullable numeric/boolean telemetry values and UTC timestamp.
- `monitoring_events`: meaningful state changes only; metadata remains structured JSON.

Indexes support `(device_id, recorded_at desc)` and recent timestamp queries. RLS allows authenticated dashboard reads and denies browser writes. The ingestion RPC is `security definer`, transactionally inserts a reading, updates device state, and creates events for online transitions, occupancy changes, and significant power deltas.

Apply the migration through the Supabase SQL editor or an authenticated Supabase CLI session. It is non-destructive and does not touch Supabase Auth tables.

## Environment

Public auth variables remain:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Server-only ingestion variables:

```env
MONITORING_DATA_SOURCE=simulator
SUPABASE_SERVICE_ROLE_KEY=
TELEMETRY_INTERVAL_SECONDS=10
DEVICE_OFFLINE_AFTER_SECONDS=120
TELEMETRY_RATE_LIMIT_SECONDS=5
```

`SUPABASE_SERVICE_ROLE_KEY` must never be imported by client code or exposed in a response. Set `MONITORING_DATA_SOURCE=supabase` only after the migration and service-role key are configured.

## Device registration

After applying the migration, register a device server-side:

```bash
npm run device:register -- esp32-main-01 "ESP32 Main Controller" esp32
```

The generated key is written once to `.device-credentials/esp32-main-01.key` with mode `0600`. That directory is ignored by Git. Put the key into the ESP32's private build/secrets configuration; do not commit it.

Unknown device identifiers and invalid keys are rejected. A device must be registered before it can ingest.

## Telemetry API

`POST /api/iot/telemetry`

Required header:

```text
x-device-key: <registered-device-api-key>
content-type: application/json
```

Body:

```json
{
  "device_id": "esp32-main-01",
  "temperature": 24.8,
  "humidity": 62,
  "occupancy": true,
  "light": true,
  "ac": true,
  "power": 420
}
```

All six telemetry fields are required but may be `null` for a device that does not report that metric. Optional `timestamp` must be an ISO timestamp within five minutes of server time. Safe ranges are temperature `-50..100`, humidity `0..100`, and power `0..100000`.

Success:

```json
{ "success": true, "reading_id": "uuid" }
```

Errors:

- `400`: malformed JSON or validation failure
- `401`: missing/invalid device key
- `404`: unknown device
- `429`: telemetry too frequent
- `500`: server/database failure (internal details are not returned)

Default rate limit is one accepted packet every 5 seconds per device. Recommended prototype interval is 10 seconds to avoid unnecessary database growth. Devices become offline after 120 seconds without accepted telemetry; stale status is evaluated lazily on dashboard reads.

## Local API checks

Validation tests:

```bash
npm run test:iot
```

After migration, registration, and `MONITORING_DATA_SOURCE=supabase` are configured:

```bash
curl -i -X POST http://127.0.0.1:4500/api/iot/telemetry \
  -H 'content-type: application/json' \
  -H "x-device-key: $(cat .device-credentials/esp32-main-01.key)" \
  --data '{"device_id":"esp32-main-01","temperature":24.8,"humidity":62,"occupancy":true,"light":true,"ac":true,"power":420}'
```

## Realtime

The authenticated dashboard opens one Supabase Realtime channel in live mode for inserts/updates on `sensor_readings`, `devices`, and inserts on `monitoring_events`. Changes debounce to one server refresh; demo mode does not create this subscription.

## Scope boundary

This foundation deliberately does not implement AI anomaly detection, notifications, physical hardware control, OTA, or command queues. The data/events model is structured so a future analysis layer can consume readings and meaningful events without changing ingestion.
