"use client";

import type { AnomalyAnalysis, AnomalyMetric } from "@/domain/analysis/types";
import { SectionHeader } from "@/components/monitoring/section-header";
import { StatusIndicator } from "@/components/monitoring/status-indicator";
import { useI18n } from "@/i18n/provider";

interface AnomalyPanelProps { analysis: AnomalyAnalysis; }

export function AnomalyPanel({ analysis }: AnomalyPanelProps) {
  const { t, formatDateTime, formatNumber } = useI18n();
  const finding = analysis.findings[0];
  if (!finding) return <section className="anomaly-panel"><SectionHeader eyebrow={t("dashboard.anomaly.eyebrow")} title={analysis.availability === "not-configured" ? t("dashboard.anomaly.notEnabled") : t("dashboard.anomaly.none")} /></section>;

  const labels: Record<AnomalyMetric, string> = { occupancy: t("dashboard.anomaly.occupancy"), ac: t("dashboard.anomaly.ac"), light: t("dashboard.anomaly.light"), power: t("dashboard.anomaly.power") };
  const valueFor = (metric: AnomalyMetric, value: number | boolean) => {
    if (metric === "occupancy") return `${formatNumber(Number(value))} ${t("common.units.people")}`;
    if (metric === "power") return `${formatNumber(Number(value))} W`;
    return value ? t("common.state.on") : t("common.state.off");
  };

  return (
    <section className="anomaly-panel" aria-labelledby="anomaly-title">
      <div className="anomaly-panel__heading">
        <SectionHeader eyebrow={t("dashboard.anomaly.eyebrow")} title={t("dashboard.anomaly.title")} detail={<StatusIndicator label={t("common.status.attention")} tone="attention" />} />
        <p className="anomaly-panel__lead" id="anomaly-title">{t("dashboard.anomaly.lead")}</p>
        <p className="anomaly-panel__timestamp">{t("dashboard.anomaly.detected", { time: formatDateTime(finding.detectedAt, { dateStyle: "medium", timeStyle: "short" }), confidence: Math.round(finding.confidence * 100) })}</p>
      </div>
      <div className="anomaly-panel__body">
        <dl className="evidence-grid">{finding.evidence.map((item) => <div key={item.metric}><dt>{labels[item.metric]}</dt><dd>{valueFor(item.metric, item.value)}</dd></div>)}</dl>
        <div className="analysis-note"><div className="analysis-note__label"><span>{t("dashboard.anomaly.ai")}</span><span>{t("common.prototype.model")}</span></div><p>{t("dashboard.anomaly.description")}</p><small>{t("dashboard.anomaly.advisory")}</small></div>
      </div>
    </section>
  );
}
