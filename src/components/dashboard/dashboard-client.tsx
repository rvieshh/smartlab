"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import type { DashboardData, MonitoringActivity } from "@/domain/dashboard/types";
import { AnomalyPanel } from "@/components/monitoring/anomaly-panel";
import { DeviceState } from "@/components/monitoring/device-state";
import { HistoryChart } from "@/components/monitoring/history-chart";
import { MetricDisplay } from "@/components/monitoring/metric-display";
import { SectionHeader } from "@/components/monitoring/section-header";
import { StatusIndicator } from "@/components/monitoring/status-indicator";
import { laboratoryStatusKey } from "@/domain/monitoring/presentation";
import { useI18n } from "@/i18n/provider";

interface DashboardClientProps {
  initialData: DashboardData;
}

const rangeOptions = [6, 12, 24] as const;
type RangeHours = (typeof rangeOptions)[number];
type TrendMetric = "temperature" | "humidity" | "power";

export function DashboardClient({ initialData }: DashboardClientProps) {
  const { t, locale, formatNumber, formatDateTime } = useI18n();
  const [data, setData] = useState(initialData);
  const [range, setRange] = useState<RangeHours>(12);
  const [metric, setMetric] = useState<TrendMetric>("temperature");
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState(false);

  const refresh = useCallback(async (nextRange = range) => {
    setRefreshing(true);
    try {
      const response = await fetch(`/api/v1/dashboard?range=${nextRange}`, { cache: "no-store" });
      if (!response.ok) throw new Error("Dashboard refresh failed"); // internal only
      const payload = (await response.json()) as { data: DashboardData };
      setData(payload.data);
      setRefreshError(false);
    } catch {
      setRefreshError(true);
    } finally {
      setRefreshing(false);
    }
  }, [range]);
  useEffect(() => {
    const interval = window.setInterval(() => void refresh(), 60_000);
    return () => window.clearInterval(interval);
  }, [refresh]);

  const { snapshot, history, analysis, activities } = data;
  const isAttention = snapshot.condition === "attention";
  const statusKey = laboratoryStatusKey(snapshot.condition);
  const hasReading = snapshot.readings.temperatureCelsius !== null || snapshot.readings.relativeHumidityPercent !== null || snapshot.readings.powerUsageWatts !== null;
  const sourceLabel = snapshot.source.simulated ? t("common.dataSource.demo") : t("common.dataSource.live");
  const numberOrDash = (value: number | null, options?: Intl.NumberFormatOptions) => value === null ? "—" : formatNumber(value, options);
  const stateOrUnknown = (value: boolean | null) => value === null ? t("common.state.unknown") : value ? t("common.state.on") : t("common.state.off");

  return (
    <main className="dashboard-main">
      <section className="dashboard-overview" aria-labelledby="dashboard-title">
        <div className="dashboard-heading">
          <p className="dashboard-kicker">{t("dashboard.overview.eyebrow")}</p>
          <div className="dashboard-title-row">
            <div>
              <h1 id="dashboard-title">{t("dashboard.overview.title")}</h1>
              <p className="dashboard-location">{t("dashboard.overview.description")}</p>
            </div>
            <div className="dashboard-actions">
              <StatusIndicator label={sourceLabel} tone={snapshot.source.simulated ? "neutral" : "normal"} />
              <button className="refresh-button" type="button" onClick={() => void refresh()} disabled={refreshing}>
                <RefreshCw aria-hidden="true" size={14} className={refreshing ? "refresh-icon refresh-icon--spinning" : "refresh-icon"} />
                {refreshing ? t("common.actions.refreshing") : t("common.actions.refresh")}
              </button>
            </div>
          </div>
        </div>

        <div className={`overall-status overall-status--${isAttention ? "attention" : "normal"}`}>
          <div>
            <p className="overall-status__label">{t("dashboard.status.title")}</p>
            <p className="overall-status__value">{hasReading ? t(`dashboard.status.${statusKey}`) : t("dashboard.status.waiting")}</p>
            <p className="overall-status__detail">{hasReading ? t(`dashboard.status.${statusKey}Detail`) : t("dashboard.status.waitingDetail")}</p>
          </div>
          <div className="overall-status__meta">
            <StatusIndicator label={t("dashboard.header.systemOnline")} tone="normal" compact />
            <span>{t("dashboard.status.updated", { time: formatDateTime(snapshot.recordedAt, { hour: "2-digit", minute: "2-digit", hour12: locale === "en" }) })}</span>
          </div>
        </div>
      </section>

      {refreshError ? <p className="data-state" role="alert">{t("common.states.error")}</p> : null}
      <section className="metrics-section" aria-labelledby="metrics-title">
        <SectionHeader eyebrow={t("dashboard.metrics.eyebrow")} title={t("dashboard.metrics.title")} detail={<span>{snapshot.source.simulated ? t("dashboard.metrics.source") : t("dashboard.metrics.sourceLive")}</span>} />
        <div className="metrics-grid">
          <MetricDisplay label={t("dashboard.metrics.temperature")} value={numberOrDash(snapshot.readings.temperatureCelsius, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} unit={snapshot.readings.temperatureCelsius === null ? undefined : "°C"} detail={t("dashboard.metrics.temperatureDetail")} />
          <MetricDisplay label={t("dashboard.metrics.humidity")} value={numberOrDash(snapshot.readings.relativeHumidityPercent, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} unit={snapshot.readings.relativeHumidityPercent === null ? undefined : "%"} detail={t("dashboard.metrics.humidityDetail")} />
          <MetricDisplay label={t("dashboard.metrics.occupancy")} value={snapshot.readings.occupancyCount === null ? t("common.state.unknown") : snapshot.readings.occupancyCount > 0 ? t("common.state.occupied") : t("common.state.empty")} detail={snapshot.readings.occupancyCount === null ? t("common.states.empty") : t("dashboard.metrics.occupancyDetail", { count: snapshot.readings.occupancyCount })} tone="attention" />
          <MetricDisplay label={t("dashboard.metrics.light")} value={stateOrUnknown(snapshot.devices.lightOn)} detail={snapshot.readings.lightIntensityLux === null ? t("common.states.empty") : t("dashboard.metrics.lightDetail", { value: formatNumber(snapshot.readings.lightIntensityLux) })} tone="attention" />
          <MetricDisplay label={t("dashboard.metrics.ac")} value={stateOrUnknown(snapshot.devices.acOn)} detail={t("dashboard.metrics.acDetail")} tone="attention" />
          <MetricDisplay label={t("dashboard.metrics.power")} value={numberOrDash(snapshot.readings.powerUsageWatts, { maximumFractionDigits: 0 })} unit={snapshot.readings.powerUsageWatts === null ? undefined : "W"} detail={t("dashboard.metrics.powerDetail")} tone="attention" />
        </div>
      </section>

      <section className="operations-grid" aria-label={t("dashboard.history.title")}>
        <div className="trend-panel">
          <SectionHeader
            eyebrow={t("dashboard.history.eyebrow")}
            title={t("dashboard.history.title")}
            detail={
              <div className="range-selector" aria-label={t("dashboard.history.rangeLabel")}>
                {rangeOptions.map((option) => (
                  <button key={option} type="button" className={range === option ? "range-selector__button range-selector__button--active" : "range-selector__button"} onClick={() => { setRange(option); void refresh(option); }}>{option}h</button>
                ))}
              </div>
            }
          />
          <div className="metric-selector" role="tablist" aria-label={t("dashboard.history.metricLabel")}>
            {(["temperature", "humidity", "power"] as const).map((option) => (
              <button key={option} role="tab" aria-selected={metric === option} className={`metric-selector__button${metric === option ? " metric-selector__button--active" : ""}`} type="button" onClick={() => setMetric(option)}>
                {t(`dashboard.history.${option}`)}
              </button>
            ))}
          </div>
          <HistoryChart samples={history.samples} metric={metric} />
        </div>

        <aside className="devices-panel">
          <SectionHeader eyebrow={t("dashboard.devices.eyebrow")} title={t("dashboard.devices.title")} />
          <div className="device-list">
            <DeviceState label={t("dashboard.devices.ac")} state={stateOrUnknown(snapshot.devices.acOn)} detail={t("dashboard.devices.setpoint")} active={snapshot.devices.acOn === true} attention={snapshot.devices.acOn === true && snapshot.readings.occupancyCount === 0} />
            <DeviceState label={t("dashboard.devices.light")} state={stateOrUnknown(snapshot.devices.lightOn)} detail={snapshot.readings.lightIntensityLux === null ? t("common.states.empty") : t("dashboard.devices.lux", { value: formatNumber(snapshot.readings.lightIntensityLux) })} active={snapshot.devices.lightOn === true} attention={snapshot.devices.lightOn === true && snapshot.readings.occupancyCount === 0} />
            <DeviceState label={t("dashboard.devices.gateway")} state={snapshot.devices.gateway.toUpperCase()} detail={t("dashboard.devices.connection")} active={snapshot.devices.gateway === "online"} />
          </div>
          <div className="device-footnote"><span className="device-footnote__mark" aria-hidden="true">i</span><span>{t("dashboard.devices.readOnly")}</span></div>
        </aside>
      </section>

      <AnomalyPanel analysis={analysis} />

      <section className="activity-section" aria-labelledby="activity-title">
        <SectionHeader eyebrow={t("dashboard.events.eyebrow")} title={t("dashboard.events.title")} detail={<span>{t("dashboard.events.timezone")}</span>} />
        <div className="activity-list">
          {activities.length === 0 ? <div className="data-state">{t("common.states.empty")}</div> : activities.map((activity) => (
            <article className="activity-item" key={activity.id}>
              <span className={`activity-item__dot activity-item__dot--${activity.category}`} aria-hidden="true" />
              <div className="activity-item__content"><p>{t(`dashboard.events.${eventTypeKey(activity.type)}.title`)}</p><span>{t(`dashboard.events.${eventTypeKey(activity.type)}.detail`, { device: activity.deviceName ?? t("dashboard.events.deviceFallback"), ...(activity.type === "lighting_active" && snapshot.readings.lightIntensityLux !== null ? { value: formatNumber(snapshot.readings.lightIntensityLux) } : {}) })}</span></div>
              <time dateTime={activity.occurredAt}>{formatDateTime(activity.occurredAt, { hour: "2-digit", minute: "2-digit", hour12: false })}</time>
            </article>
          ))}
        </div>
      </section>
      <p className="prototype-disclaimer">{snapshot.source.simulated ? t("dashboard.prototypeDisclaimer") : t("dashboard.liveDisclaimer")}</p>
    </main>
  );
}

function eventTypeKey(type: MonitoringActivity["type"]) {
  switch (type) {
    case "condition_attention": return "condition";
    case "lighting_active": return "lighting";
    case "simulator_active": return "source";
    case "temperature_update": return "temperature";
    case "occupancy_empty": return "occupancy";
    case "power_increased": return "power";
    case "device_online": return "deviceOnline";
    case "device_offline": return "deviceOffline";
    case "occupancy_changed": return "occupancyChanged";
    case "power_threshold": return "powerThreshold";
    case "system_event": return "systemEvent";
  }
}
