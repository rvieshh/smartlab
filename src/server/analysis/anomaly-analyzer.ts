import type { AnomalyAnalysis } from "@/domain/analysis/types";
import type { MonitoringSnapshot } from "@/domain/monitoring/types";

/**
 * Optional analysis contract. Core monitoring must never depend on an
 * implementation of this interface being reachable.
 */
export interface AnomalyAnalyzer {
  analyze(snapshot: MonitoringSnapshot): Promise<AnomalyAnalysis>;
}
