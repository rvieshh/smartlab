import { StatusIndicator } from "@/components/monitoring/status-indicator";

interface DeviceStateProps {
  label: string;
  state: string;
  detail: string;
  active?: boolean;
  attention?: boolean;
}

export function DeviceState({
  label,
  state,
  detail,
  active = false,
  attention = false,
}: DeviceStateProps) {
  const tone = attention ? "attention" : active ? "normal" : "neutral";

  return (
    <div className="device-state">
      <div>
        <p className="device-state__label">{label}</p>
        <p className="device-state__detail">{detail}</p>
      </div>
      <StatusIndicator compact label={state} tone={tone} />
    </div>
  );
}
