import { createHash, randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const [identifier, name = "ESP32 Main Controller", deviceType = "esp32"] = process.argv.slice(2);
if (!identifier || !/^[a-zA-Z0-9][a-zA-Z0-9_-]{2,63}$/.test(identifier)) {
  console.error("Usage: npm run device:register -- <device-identifier> [name] [device-type]");
  process.exit(1);
}
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
  process.exit(1);
}
const client = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
const apiKey = randomBytes(32).toString("base64url");
const hash = createHash("sha256").update(apiKey).digest("hex");
const { data: device, error: deviceError } = await client.from("devices").upsert({ device_identifier: identifier, name, device_type: deviceType, status: "offline", connection_type: "wifi" }, { onConflict: "device_identifier" }).select("id").single();
if (deviceError || !device) throw new Error("Device registration failed. Apply the IoT migration first.");
const { error: credentialError } = await client.from("device_credentials").upsert({ device_id: device.id, api_key_hash: hash, rotated_at: new Date().toISOString() });
if (credentialError) throw new Error("Device credential registration failed.");
await mkdir(".device-credentials", { recursive: true, mode: 0o700 });
const path = `.device-credentials/${identifier}.key`;
await writeFile(path, `${apiKey}\n`, { mode: 0o600 });
console.log(`Registered ${identifier}. Credential written once to ${path} (mode 0600).`);
