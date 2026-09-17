"use client";

import { useMemo, useState } from "react";
import type { MonitoringHistory } from "@/domain/monitoring/types";
import type { HistoryRange } from "@/domain/monitoring/presentation";
import { HistoryChart } from "@/components/monitoring/history-chart";
import { SectionHeader } from "@/components/monitoring/section-header";
import { useI18n } from "@/i18n/provider";

interface HistoryPageClientProps { initialHistory?: MonitoringHistory; }
type TrendMetric = "temperature" | "humidity" | "power";
type SensorFilter = "all" | TrendMetric;

export function HistoryPageClient({ initialHistory }: HistoryPageClientProps) {
  const { t, formatNumber, formatDateTime } = useI18n();
  const [timeRange, setTimeRange] = useState<HistoryRange>("24h");
  const [sensor, setSensor] = useState<SensorFilter>("all");
  const [history, setHistory] = useState<MonitoringHistory | undefined>(initialHistory);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  async function selectRange(next: HistoryRange) {
    if (next === timeRange && history) return;
    setTimeRange(next);
    setLoading(true);
    setLoadError(false);
    try {
      const response = await fetch(`/api/v1/monitoring/history?range=${next}`, { cache: "no-store" });
      if (!response.ok) throw new Error("history fetch failed");
      const payload = (await response.json()) as { data: MonitoringHistory };
      setHistory(payload.data);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    if (!history) return [];
    if (timeRange === "24h" || timeRange === "7d" || timeRange === "30d") return history.samples;
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const cutoff = start.toISOString();
    return history.samples.filter((sample) => sample.recordedAt >= cutoff);
  }, [history, timeRange]);
  const charts: TrendMetric[] = sensor === "all" ? ["temperature", "humidity", "power"] : [sensor];
  const sourceLabel = history?.source.simulated ? t("common.dataSource.demo") : t("common.dataSource.live");
  const numberOrDash = (value: number | null, options?: Intl.NumberFormatOptions) => value === null ? "—" : formatNumber(value, options);
  const stateOrUnknown = (value: boolean | null) => value === null ? t("common.state.unknown") : value ? t("common.state.on") : t("common.state.off");

  if (!history) return <main className="page-main"><PageHeader title={t("history.header.title")} description={t("history.header.description")} /><div className="data-state data-state--loading" role="status">{t("common.states.loading")}</div></main>;

  return <main className="page-main">
    <PageHeader title={t("history.header.title")} description={t("history.header.description")} />
    <div className="filter-bar" aria-label={t("history.filter.timeRange")}>
      <div className="filter-group"><span>{t("history.filter.timeRange")}</span><div className="filter-group__options">{(["today", "24h", "7d", "30d"] as const).map((option) => <button key={option} type="button" disabled={loading} className={timeRange === option ? "filter-group__button filter-group__button--active" : "filter-group__button"} onClick={() => void selectRange(option)}>{t(`history.filter.range.${option}`)}</button>)}</div></div>
      <div className="filter-group"><span>{t("history.filter.sensor")}</span><div className="filter-group__options">{(["all", "temperature", "humidity", "power"] as const).map((option) => <button key={option} type="button" className={sensor === option ? "filter-group__button filter-group__button--active" : "filter-group__button"} onClick={() => setSensor(option)}>{t(`history.filter.sensor.${option}`)}</button>)}</div></div>
    </div>
    {loadError ? <p className="data-state" role="alert">{t("common.states.error")}</p> : null}
    <div className="history-charts">{charts.map((metric) => <section className="history-chart-panel" key={metric} aria-label={t(`history.charts.${metric}`)}><SectionHeader eyebrow={t("history.header.title")} title={t(`history.charts.${metric}`)} detail={<span>{sourceLabel}</span>} /><HistoryChart samples={filtered} metric={metric} /></section>)}</div>
    <section className="history-table-section" aria-labelledby="history-table-title">
      <SectionHeader eyebrow={t("history.header.title")} title={t("history.table.title")} detail={<span aria-hidden="true">{t("history.table.caption")}</span>} />
      {filtered.length === 0 ? <div className="data-state">{t("history.table.empty")}</div> : <div className="table-scroll"><table className="data-table" aria-label={t("history.table.title")}><thead><tr><th scope="col">{t("history.table.timestamp")}</th><th scope="col">{t("history.table.temperature")}</th><th scope="col">{t("history.table.humidity")}</th><th scope="col">{t("history.table.occupancy")}</th><th scope="col">{t("history.table.light")}</th><th scope="col">{t("history.table.ac")}</th><th scope="col">{t("history.table.power")}</th></tr></thead><tbody>{filtered.slice(0, 50).map((sample) => <tr key={sample.id}><th scope="row">{formatDateTime(sample.recordedAt, { dateStyle: "medium", timeStyle: "short" })}</th><td>{numberOrDash(sample.temperatureCelsius, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}{sample.temperatureCelsius === null ? "" : " °C"}</td><td>{numberOrDash(sample.relativeHumidityPercent, { maximumFractionDigits: 0 })}{sample.relativeHumidityPercent === null ? "" : " %"}</td><td>{sample.occupancyCount === null ? t("common.state.unknown") : `${sample.occupancyCount} ${t("common.units.people")}`}</td><td>{stateOrUnknown(sample.lightOn)}</td><td>{stateOrUnknown(sample.acOn)}</td><td>{numberOrDash(sample.powerUsageWatts)}{sample.powerUsageWatts === null ? "" : " W"}</td></tr>)}</tbody></table></div>}
    </section>
    <p className="prototype-disclaimer">{history.source.simulated ? t("history.disclaimer") : t("history.liveDisclaimer")}</p>
  </main>;
}

function PageHeader({ title, description }: { title: string; description: string }) { return <header className="page-header"><div><h1 className="page-title">{title}</h1><p className="page-description">{description}</p></div></header>; }
