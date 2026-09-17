import { useI18n } from "@/i18n/provider";

interface MetricDisplayProps { label: string; value: string; unit?: string; detail: string; tone?: "default" | "attention"; }

export function MetricDisplay({ label, value, unit, detail, tone = "default" }: MetricDisplayProps) {
  const { t } = useI18n();
  return <article className={`metric metric--${tone}`}><div className="metric__topline"><h2>{label}</h2>{tone === "attention" ? <span className="metric__marker" aria-label={t("dashboard.metrics.requiresAttention")} /> : null}</div><p className="metric__reading"><span>{value}</span>{unit ? <span className="metric__unit">{unit}</span> : null}</p><p className="metric__detail">{detail}</p></article>;
}
