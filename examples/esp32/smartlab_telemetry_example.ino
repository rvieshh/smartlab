#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// Reference only. Supply these through a private local secrets header/build config.
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* SMARTLAB_API_URL = "https://your-smartlab-host.example/api/iot/telemetry";
const char* DEVICE_ID = "esp32-main-01";
const char* DEVICE_API_KEY = "YOUR_REGISTERED_DEVICE_API_KEY";
const unsigned long TELEMETRY_INTERVAL_MS = 10000;
unsigned long lastSentAt = 0;

void connectWifi() {
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) delay(500);
}

void sendTelemetry() {
  if (WiFi.status() != WL_CONNECTED) connectWifi();

  // Replace these values with actual sensor reads.
  const float temperature = 24.8;
  const float humidity = 62.0;
  const bool occupied = true;
  const bool lightOn = true;
  const bool acOn = true;
  const float powerWatts = 420.0;

  JsonDocument payload;
  payload["device_id"] = DEVICE_ID;
  payload["temperature"] = temperature;
  payload["humidity"] = humidity;
  payload["occupancy"] = occupied;
  payload["light"] = lightOn;
  payload["ac"] = acOn;
  payload["power"] = powerWatts;

  String body;
  serializeJson(payload, body);

  HTTPClient http;
  http.begin(SMARTLAB_API_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-device-key", DEVICE_API_KEY);
  const int status = http.POST(body);
  const String response = http.getString();
  Serial.printf("SmartLab telemetry: HTTP %d %s\n", status, response.c_str());
  http.end();
}

void setup() {
  Serial.begin(115200);
  connectWifi();
}

void loop() {
  if (millis() - lastSentAt >= TELEMETRY_INTERVAL_MS) {
    lastSentAt = millis();
    sendTelemetry();
  }
  delay(50);
}
