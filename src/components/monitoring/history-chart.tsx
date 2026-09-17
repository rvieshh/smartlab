"use client";

import type { MonitoringSample } from "@/domain/monitoring/types";
import { useI18n } from "@/i18n/provider";

type TrendMetric = "temperature" | "humidity" | "power";
interface HistoryChartProps { samples: MonitoringSample[]; metric?: TrendMetric; }
const WIDTH = 760;
const HEIGHT = 232;
const PADDING = { top: 16, right: 16, bottom: 30, left: 46 };

export function HistoryChart({ samples, metric = "temperature" }: HistoryChartProps) {
  const { t, locale, formatNumber, formatDateTime } = useI18n();
  const configs = {
    temperature: { getValue: (sample: MonitoringSample) => sample.temperatureCelsius, format: (value: number) => `${formatNumber(value, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}°`, label: t("dashboard.history.temperature") },
    humidity: { getValue: (sample: MonitoringSample) => sample.relativeHumidityPercent, format: (value: number) => `${formatNumber(value, { maximumFractionDigits: 0 })}%`, label: t("dashboard.history.humidity") },
    power: { getValue: (sample: MonitoringSample) => sample.powerUsageWatts === null ? null : sample.powerUsageWatts / 1000, format: (value: number) => `${formatNumber(value, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}kW`, label: t("dashboard.history.power") },
  };
  const config = configs[metric];
  const pointsWithValues = samples.map((sample) => ({ sample, value: config.getValue(sample) })).filter((point): point is { sample: MonitoringSample; value: number } => point.value !== null);
  if (pointsWithValues.length < 2) return <div className="data-state">{t("history.charts.noData")}</div>;
  const values = pointsWithValues.map((point) => point.value);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const padding = Math.max((rawMax - rawMin) * 0.2, metric === "power" ? 0.05 : 0.5);
  const lower = rawMin - padding;
  const upper = rawMax + padding;
  const range = Math.max(upper - lower, 0.1);
  const plotWidth = WIDTH - PADDING.left - PADDING.right;
  const plotHeight = HEIGHT - PADDING.top - PADDING.bottom;
  const points = pointsWithValues.map((point, index) => ({ x: PADDING.left + (index / (pointsWithValues.length - 1)) * plotWidth, y: PADDING.top + ((upper - point.value) / range) * plotHeight, ...point }));
  const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${points.at(-1)?.x},${PADDING.top + plotHeight} L${points[0]?.x},${PADDING.top + plotHeight} Z`;
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  const yTicks = [upper, (upper + lower) / 2, lower];
  const xIndexes = [0, Math.floor((points.length - 1) / 2), points.length - 1];

  return <div className="history-chart"><div className="history-chart__summary" aria-label={t("dashboard.history.summaryAria", { metric: config.label })}><span><b>{config.format(average)}</b> {t("dashboard.history.average")}</span><span><b>{config.format(rawMin)}</b> {t("dashboard.history.low")}</span><span><b>{config.format(rawMax)}</b> {t("dashboard.history.high")}</span></div><svg className="history-chart__svg" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={t("dashboard.history.chartAria", { metric: config.label })}>{yTicks.map((tick) => { const y = PADDING.top + ((upper - tick) / range) * plotHeight; return <g key={tick}><line className="history-chart__grid" x1={PADDING.left} x2={WIDTH - PADDING.right} y1={y} y2={y} /><text className="history-chart__axis" x={PADDING.left - 10} y={y + 4} textAnchor="end">{config.format(tick)}</text></g>; })}<path className="history-chart__area" d={areaPath} /><path className="history-chart__line" d={linePath} />{xIndexes.map((index) => <text className="history-chart__axis" key={index} x={points[index].x} y={HEIGHT - 6} textAnchor={index === 0 ? "start" : index === points.length - 1 ? "end" : "middle"}>{formatDateTime(points[index].sample.recordedAt, { hour: "2-digit", minute: "2-digit", hour12: locale === "en" })}</text>)}{points.map((point) => <circle className="history-chart__hit" key={point.sample.id} cx={point.x} cy={point.y} r="8"><title>{`${formatDateTime(point.sample.recordedAt, { dateStyle: "medium", timeStyle: "short" })} · ${config.format(point.value)}`}</title></circle>)}<circle className="history-chart__point" cx={points.at(-1)?.x} cy={points.at(-1)?.y} r="4" /></svg></div>;
}
