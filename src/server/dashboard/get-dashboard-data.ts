import type { AnomalyAnalysis } from "@/domain/analysis/types";
import type { DashboardData } from "@/domain/dashboard/types";
import { getPrototypeAnalysis } from "@/server/analysis/prototype-analysis";
import { getMonitoringDataProvider } from "@/server/monitoring/get-monitoring-source";

export async function getDashboardData(rangeHours = 12): Promise<DashboardData> {
  const provider = getMonitoringDataProvider();
  const [snapshot, history, activities] = await Promise.all([
    provider.getCurrentStatus(),
    provider.getHistory(rangeHours),
    provider.getRecentEvents(),
  ]);
  const analysis: AnomalyAnalysis = snapshot.source.simulated ? getPrototypeAnalysis(snapshot) : { availability: "not-configured", analyzedAt: snapshot.recordedAt, findings: [] };
  return { snapshot, history, analysis, activities };
}
