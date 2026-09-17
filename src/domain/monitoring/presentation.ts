import type { LaboratoryCondition } from "./types";

export type HistoryRange = "today" | "24h" | "7d" | "30d";

export function historyRangeHours(range: HistoryRange, now = new Date()): number {
  if (range === "24h") return 24;
  if (range === "7d") return 24 * 7;
  if (range === "30d") return 24 * 30;
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  return Math.max((now.getTime() - start.getTime()) / 3_600_000, 1 / 60);
}

export function historyBucketSeconds(rangeHours: number): number {
  if (rangeHours <= 24) return 60;
  if (rangeHours <= 168) return 300;
  return 1800;
}

export function chronologicalRows<T extends { recorded_at: string }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => Date.parse(a.recorded_at) - Date.parse(b.recorded_at));
}

export function laboratoryStatusKey(condition: LaboratoryCondition): LaboratoryCondition {
  return condition;
}

export function sourceCopyKey<TDemo extends string, TLive extends string>(simulated: boolean, demoKey: TDemo, liveKey: TLive): TDemo | TLive {
  return simulated ? demoKey : liveKey;
}
