# SmartLab

SmartLab is an IoT laboratory monitoring prototype for the GRED Robotics Division IoT selection proposal. It is being designed to monitor environmental conditions, occupancy, lights, AC state, power usage, laboratory activity, and—later—optional anomaly analysis.

This repository contains a public product landing page, a Supabase-authenticated monitoring dashboard, and a simulator or Supabase-backed monitoring data source. The IoT foundation includes persistent telemetry storage, device credentials, ingestion validation, and an ESP32 reference client; physical hardware is still optional.

## Stack

- **Next.js 16 App Router** — one deployable web application with route handlers for the prototype API.
- **React 19 + TypeScript** — typed UI and shared domain contracts.
- **Tailwind CSS 4** — utility tooling, with project-owned CSS design tokens in `src/app/globals.css`.
- **ESLint** — framework-aware static checks.

This stack keeps local development and deployment straightforward while supporting server-rendered UI, real-time-ish client polling/streaming later, and versioned API endpoints. Backend concerns live under `src/server`; the UI does not import simulator details directly.

## IoT data foundation

The backend foundation lives in `docs/IOT_DATA_FOUNDATION.md`. It includes the non-destructive Supabase migration, RLS policies, server-only device-key ingestion, provider selection, realtime refresh boundary, device registration command, and an ESP32 reference client under `examples/esp32/`.

```text
ESP32 + sensors (future)
        ↓ Wi-Fi
Versioned ingestion/query API
        ↓
MonitoringSource adapter
        ↓
Processing + persistence (future)
        ├──────────────→ Dashboard
        └─ optional ───→ AnomalyAnalyzer (future)
```

The `MonitoringSource` interface separates consumers from the telemetry provider. The current implementation is a simulator and clearly marks every response with `source.simulated: true`. A future ESP32/database implementation can satisfy the same interface without rewriting dashboard components.

AI is deliberately represented only as an optional contract. Basic monitoring routes do not call or depend on an AI service.

## Repository map

```text
src/
├── app/
│   ├── page.tsx                 Public SmartLab landing page (`/`)
│   ├── dashboard/page.tsx       Operational monitoring dashboard (`/dashboard`)
│   └── api/                     Versioned prototype API route handlers
├── components/
│   ├── layout/                  Application shell
│   └── ui/                      Reusable UI primitives
├── config/                      Validated server configuration
├── domain/
│   ├── monitoring/              Sensor and device domain types
│   └── analysis/                Optional anomaly-analysis types
└── server/
    ├── monitoring/              Data-source contract and adapters
    └── analysis/                Future analyzer contract
```

`DESIGN.md` is the primary visual specification. CSS variables in `src/app/globals.css` implement its foundation tokens.

## Local development

Requirements:

- Node.js 20.9 or newer
- npm 10 or newer

Install and prepare configuration:

```bash
npm install
cp .env.example .env.local
```

Set the Supabase public project values in `.env.local` before using authentication:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
```

- `MONITORING_DATA_SOURCE=simulator` keeps the clearly labeled demo provider active.
- `MONITORING_DATA_SOURCE=supabase` reads the IoT tables and enables the bounded Realtime refresh channel.
- `POST /api/iot/telemetry` accepts registered ESP32 telemetry with the `x-device-key` header.
- `npm run device:register -- <id> <name> <type>` provisions a device and writes its one-time credential to an ignored `0600` file.

Only the public URL and anon key belong in browser-accessible configuration. `SUPABASE_SERVICE_ROLE_KEY` is required for live ingestion and live server reads, remains server-only, and must never be exposed through `NEXT_PUBLIC_*` variables.

Start development mode:

```bash
npm run dev
```

Open `http://localhost:3000`.

Useful endpoints:

- `GET /api/health` — service/configuration health; confirms AI is non-blocking.
- `GET /api/v1/monitoring/current` — authenticated current status from the active demo/live provider.
- `GET /api/v1/monitoring/history?range=24h|7d|30d` — authenticated bounded history query from the active provider.
- `POST /api/iot/telemetry` — machine-facing authenticated ESP32 telemetry ingestion.
- `/login` — email/password login only; there is no public registration flow.
- `/dashboard` — authenticated monitoring application; unauthenticated requests redirect to `/login`.

## Quality checks

```bash
npm run lint
npm run typecheck
npm run build
```

## Environment variables

| Variable | Required | Current use |
| --- | --- | --- |
| `MONITORING_DATA_SOURCE` | No | `simulator` (default, clearly labeled demo data) or `supabase` (live IoT tables). |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes for auth | Browser-safe Supabase project configuration. |
| `SUPABASE_SERVICE_ROLE_KEY` | For live mode | Server-only ingestion and live reads; never exposed to the browser. |
| `TELEMETRY_RATE_LIMIT_SECONDS` | No | Minimum interval between accepted packets per device (default `5`). |
| `DEVICE_OFFLINE_AFTER_SECONDS` | No | Seconds without telemetry before a device is evaluated offline (default `120`). |
| `TELEMETRY_INTERVAL_SECONDS` | No | Recommended device reporting interval documented for ESP32 clients (default `10`). |
| `AI_ANALYSIS_ENABLED` | No | Defaults to `false`; no analyzer is implemented yet. |
| `AI_SERVICE_URL` | No | Reserved for the future optional analysis adapter. |

Never prefix server credentials with `NEXT_PUBLIC_`; those values are included in browser bundles.

## Deliberately not implemented yet

- AI provider integration and anomaly rules (the dashboard contract already accepts findings)
- Alerting and notification delivery
- Device command/actuation endpoints
- OTA firmware updates

These should be added as vertical slices after the foundation is approved.
