import test from "node:test";
import assert from "node:assert/strict";
import { chronologicalRows, historyBucketSeconds, historyRangeHours, laboratoryStatusKey, sourceCopyKey } from "./presentation";

test("history ranges query only the requested database window", () => {
  assert.equal(historyRangeHours("24h"), 24);
  assert.equal(historyRangeHours("7d"), 168);
  assert.equal(historyRangeHours("30d"), 720);
  const today = historyRangeHours("today", new Date("2026-09-17T06:30:00Z"));
  assert.equal(today > 6 && today <= 7, true);
});

test("normalizes newest-first database rows into chart chronology", () => {
  const rows = [{ recorded_at: "2026-09-17T03:00:00Z" }, { recorded_at: "2026-09-17T02:00:00Z" }, { recorded_at: "2026-09-17T01:00:00Z" }];
  assert.deepEqual(chronologicalRows(rows).map((row) => row.recorded_at), ["2026-09-17T01:00:00Z", "2026-09-17T02:00:00Z", "2026-09-17T03:00:00Z"]);
});

test("chooses bounded history sampling for long ranges", () => {
  assert.equal(historyBucketSeconds(24) > 0, true);
  assert.equal(historyBucketSeconds(24 * 7) > 0, true);
  assert.equal(historyBucketSeconds(24 * 30) > historyBucketSeconds(24 * 7), true);
});


test("keeps degraded live state distinct from normal", () => {
  assert.equal(laboratoryStatusKey("normal"), "normal");
  assert.equal(laboratoryStatusKey("attention"), "attention");
  assert.equal(laboratoryStatusKey("degraded"), "degraded");
});


test("live and demo presentation keys never share misleading copy", () => {
  assert.equal(sourceCopyKey(true, "demo", "live"), "demo");
  assert.equal(sourceCopyKey(false, "demo", "live"), "live");
});

