"use client";

import { useEffect, useRef, useState } from "react";
import type { DeviceReading, MonitoringDevice } from "@/domain/devices/types";
import { SectionHeader } from "@/components/monitoring/section-header";
import { StatusIndicator } from "@/components/monitoring/status-indicator";
import { useI18n } from "@/i18n/provider";
import { formatRelativeTime } from "@/lib/format/time";

interface DevicesPageClientProps { initialDevices: MonitoringDevice[]; referenceTime: string; }

export function DevicesPageClient({ initialDevices, referenceTime }: DevicesPageClientProps) {
  const { t, formatNumber, formatDateTime } = useI18n();
  const [selected, setSelected] = useState<MonitoringDevice | null>(null);
  const online = initialDevices.filter((device) => device.status === "online").length;
  const warning = initialDevices.filter((device) => device.status === "warning").length;
  const offline = initialDevices.filter((device) => device.status === "offline").length;
  const sourceLabel = initialDevices.some((device) => device.simulated) ? t("common.dataSource.demo") : t("common.dataSource.live");
  const toneFor = (status: MonitoringDevice["status"]) => status === "online" ? "normal" : status === "warning" ? "attention" : "offline";
  const statusLabel = (status: MonitoringDevice["status"]) => t(`common.status.${status}`);
  const nameFor = (device: MonitoringDevice) => device.nameKey ? t(device.nameKey) : device.name;
  const typeFor = (device: MonitoringDevice) => device.typeKey ? t(device.typeKey) : device.deviceType;

  return (
    <main className="page-main">
      <header className="page-header"><div><h1 className="page-title">{t("devices.header.title")}</h1><p className="page-description">{t("devices.header.description")}</p></div></header>
      <div className="device-summary"><div><span>{t("devices.summary.total")}</span><strong>{formatNumber(initialDevices.length)}</strong></div><div><span>{t("devices.summary.online")}</span><strong>{formatNumber(online)}</strong></div><div><span>{t("devices.summary.warning")}</span><strong>{formatNumber(warning)}</strong></div><div><span>{t("devices.summary.offline")}</span><strong>{formatNumber(offline)}</strong></div></div>
      <section aria-labelledby="device-list-title">
        <SectionHeader eyebrow={t("devices.header.title")} title={t("devices.list.title")} detail={<span>{sourceLabel}</span>} />
        {initialDevices.length === 0 ? <div className="data-state">{t("devices.list.empty")}</div> : <div className="table-scroll"><table className="data-table" aria-label={t("devices.list.title")}><caption className="sr-only">{t("devices.list.caption")}</caption><thead><tr><th scope="col">{t("devices.table.name")}</th><th scope="col">{t("devices.table.type")}</th><th scope="col">{t("devices.table.status")}</th><th scope="col">{t("devices.table.lastSeen")}</th><th scope="col" aria-label={t("devices.detail.title")} /></tr></thead><tbody>{initialDevices.map((device) => <tr key={device.id}><th scope="row">{nameFor(device)}</th><td>{typeFor(device)}</td><td><StatusIndicator compact label={statusLabel(device.status)} tone={toneFor(device.status)} /></td><td>{device.lastSeenAt ? formatRelativeTime(device.lastSeenAt, t, formatDateTime, referenceTime) : t("common.state.unknown")}</td><td><button className="table-action" type="button" onClick={() => setSelected(device)}>{t("devices.detail.title")}</button></td></tr>)}</tbody></table></div>}
      </section>
      <p className="prototype-disclaimer">{initialDevices.some((device) => device.simulated) ? t("devices.readOnlyNotice") : t("common.dataSource.live")}</p>
      {selected ? <DeviceDetail device={selected} referenceTime={referenceTime} onClose={() => setSelected(null)} /> : null}
    </main>
  );
}

function readingValue(reading: DeviceReading, formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string, onLabel: string, offLabel: string) { if (typeof reading.value === "boolean") return reading.value ? onLabel : offLabel; return `${formatNumber(reading.value)}${reading.unit ? ` ${reading.unit}` : ""}`; }

function DeviceDetail({ device, referenceTime, onClose }: { device: MonitoringDevice; referenceTime: string; onClose: () => void }) {
  const { t, formatNumber, formatDateTime } = useI18n();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { closeButtonRef.current?.focus(); const handleEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); }; window.addEventListener("keydown", handleEscape); return () => window.removeEventListener("keydown", handleEscape); }, [onClose]);
  const name = device.nameKey ? t(device.nameKey) : device.name;
  const type = device.typeKey ? t(device.typeKey) : device.deviceType;
  return <div className="detail-overlay" role="dialog" aria-modal="true" aria-label={t("devices.detail.title")} onClick={onClose}><div className="detail-panel" onClick={(event) => event.stopPropagation()}><header className="detail-panel__head"><div><p className="detail-panel__eyebrow">{t("devices.detail.title")}</p><h2>{name}</h2></div><button ref={closeButtonRef} className="detail-panel__close" type="button" onClick={onClose} aria-label={t("devices.detail.close")}>×</button></header><dl className="detail-grid"><div><dt>{t("devices.detail.type")}</dt><dd>{type}</dd></div><div><dt>{t("devices.detail.status")}</dt><dd>{t(`common.status.${device.status}`)}</dd></div><div><dt>{t("devices.detail.lastSeen")}</dt><dd>{device.lastSeenAt ? formatRelativeTime(device.lastSeenAt, t, formatDateTime, referenceTime) : t("common.state.unknown")}</dd></div><div><dt>{t("devices.detail.connection")}</dt><dd>{t(`devices.connection.${device.connection}`)}</dd></div>{device.firmwareVersion ? <div><dt>{t("devices.detail.firmware")}</dt><dd>{device.firmwareVersion}</dd></div> : null}</dl>{device.readings.length > 0 ? <div className="detail-readings"><p className="detail-readings__label">{t("devices.detail.readings")}</p><ul>{device.readings.map((reading) => <li key={reading.metric}><span>{t(`devices.readings.${reading.metric}`)}</span><b>{readingValue(reading, formatNumber, t("common.state.on"), t("common.state.off"))}</b></li>)}</ul></div> : null}<p className="detail-panel__note">{t("devices.detail.note")}</p></div></div>;
}
