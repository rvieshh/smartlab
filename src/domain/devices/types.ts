export type DeviceStatus = "online" | "offline" | "warning";
export type DeviceKind = "controller" | "environmental" | "occupancy" | "light" | "power" | "relay";
export type DeviceConnection = "wifi" | "i2c" | "gpio" | "analog";

export interface DeviceReading {
  metric: "temperature" | "humidity" | "occupancy" | "light" | "power" | "state";
  value: number | boolean;
  unit?: "°C" | "%" | "people" | "lux" | "W";
}

export interface MonitoringDevice {
  id: string;
  deviceIdentifier: string;
  name: string;
  nameKey?: `devices.names.${"esp32" | "temperatureHumidity" | "occupancy" | "light" | "power" | "acRelay"}`;
  deviceType: DeviceKind;
  typeKey?: `devices.types.${"esp32" | "environmental" | "occupancy" | "light" | "power" | "relay"}`;
  status: DeviceStatus;
  lastSeenAt: string | null;
  connection: DeviceConnection;
  firmwareVersion?: string;
  readings: DeviceReading[];
  simulated: boolean;
}
