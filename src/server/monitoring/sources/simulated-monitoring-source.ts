import type { MonitoringActivity } from "@/domain/dashboard/types";
import type { MonitoringDevice } from "@/domain/devices/types";
import type { MonitoringHistory, MonitoringSnapshot } from "@/domain/monitoring/types";
import type { MonitoringDataProvider } from "@/server/monitoring/monitoring-source";

const MINUTE = 60_000;
function round(value: number, precision = 1) { return Number(value.toFixed(precision)); }
function makeValues(at: Date, index = 0) {
  const cycle = at.getTime() / MINUTE;
  const occupied = index % 9 > 3 && index % 9 < 8;
  return {
    temperatureCelsius: round(24.8 + Math.sin(cycle / 47) * 1.15),
    relativeHumidityPercent: round(61 + Math.cos(cycle / 62) * 3.4),
    occupancyCount: occupied ? 2 + (index % 4) : 0,
    lightOn: occupied || index % 6 !== 0,
    acOn: occupied || index % 7 !== 0,
    powerUsageWatts: round((occupied ? 2760 : 1980) + Math.sin(cycle / 31) * 180, 0),
  };
}

export class MockMonitoringDataProvider implements MonitoringDataProvider {
  async getCurrentStatus(): Promise<MonitoringSnapshot> {
    const now = new Date();
    return {
      labId: "smartlab-prototype", labName: "electronics-lab-01", recordedAt: now.toISOString(), condition: "attention",
      source: { kind: "simulator", simulated: true },
      readings: { temperatureCelsius: 24.8, relativeHumidityPercent: 62, occupancyCount: 0, lightIntensityLux: 428, powerUsageWatts: 2840 },
      devices: { lightOn: true, acOn: true, gateway: "online" },
    };
  }

  async getHistory(rangeHours = 24): Promise<MonitoringHistory> {
    const now = Date.now();
    const sampleCount = rangeHours <= 24 ? 25 : rangeHours <= 168 ? 57 : 181;
    const step = (rangeHours * 60 * MINUTE) / (sampleCount - 1);
    const samples = Array.from({ length: sampleCount }, (_, index) => {
      const recordedAt = new Date(now - (sampleCount - 1 - index) * step);
      const values = makeValues(recordedAt, index);
      return { id: `mock-reading-${rangeHours}-${index}`, recordedAt: recordedAt.toISOString(), ...values };
    });
    return { labId: "smartlab-prototype", rangeHours, source: { kind: "simulator", simulated: true }, samples };
  }

  async getDevices(): Promise<MonitoringDevice[]> {
    const now = Date.now();
    return [
      { id: "esp32-main", deviceIdentifier: "esp32-main-01", name: "ESP32 Main Controller", nameKey: "devices.names.esp32", deviceType: "controller", typeKey: "devices.types.esp32", status: "online", lastSeenAt: new Date(now - 35_000).toISOString(), connection: "wifi", firmwareVersion: "1.0.0-prototype", readings: [], simulated: true },
      { id: "sensor-environment", deviceIdentifier: "sensor-environment-01", name: "Temperature & Humidity Sensor", nameKey: "devices.names.temperatureHumidity", deviceType: "environmental", typeKey: "devices.types.environmental", status: "online", lastSeenAt: new Date(now - MINUTE).toISOString(), connection: "i2c", readings: [{ metric: "temperature", value: 24.8, unit: "°C" }, { metric: "humidity", value: 62, unit: "%" }], simulated: true },
      { id: "sensor-occupancy", deviceIdentifier: "sensor-occupancy-01", name: "Occupancy Sensor", nameKey: "devices.names.occupancy", deviceType: "occupancy", typeKey: "devices.types.occupancy", status: "online", lastSeenAt: new Date(now - 2 * MINUTE).toISOString(), connection: "gpio", readings: [{ metric: "occupancy", value: 0, unit: "people" }], simulated: true },
      { id: "sensor-light", deviceIdentifier: "sensor-light-01", name: "Light Sensor", nameKey: "devices.names.light", deviceType: "light", typeKey: "devices.types.light", status: "online", lastSeenAt: new Date(now - 2 * MINUTE).toISOString(), connection: "analog", readings: [{ metric: "light", value: 428, unit: "lux" }], simulated: true },
      { id: "monitor-power", deviceIdentifier: "monitor-power-01", name: "Power Monitor", nameKey: "devices.names.power", deviceType: "power", typeKey: "devices.types.power", status: "warning", lastSeenAt: new Date(now - 3 * MINUTE).toISOString(), connection: "analog", readings: [{ metric: "power", value: 2840, unit: "W" }], simulated: true },
      { id: "relay-ac", deviceIdentifier: "relay-ac-01", name: "AC Control Relay", nameKey: "devices.names.acRelay", deviceType: "relay", typeKey: "devices.types.relay", status: "warning", lastSeenAt: new Date(now - 12 * MINUTE).toISOString(), connection: "gpio", readings: [{ metric: "state", value: true }], simulated: true },
    ];
  }

  async getRecentEvents(): Promise<MonitoringActivity[]> {
    const now = Date.now();
    return [
      { id: "event-temperature", occurredAt: new Date(now - MINUTE).toISOString(), category: "system", type: "temperature_update" },
      { id: "event-occupancy", occurredAt: new Date(now - 4 * MINUTE).toISOString(), category: "device", type: "occupancy_empty" },
      { id: "event-analysis", occurredAt: new Date(now - 6 * MINUTE).toISOString(), category: "analysis", type: "condition_attention" },
      { id: "event-power", occurredAt: new Date(now - 9 * MINUTE).toISOString(), category: "device", type: "power_increased" },
    ];
  }
}

export const SimulatedMonitoringSource = MockMonitoringDataProvider;
