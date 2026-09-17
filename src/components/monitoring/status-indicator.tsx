interface StatusIndicatorProps {
  label: string;
  tone?: "normal" | "attention" | "offline" | "neutral";
  compact?: boolean;
}

export function StatusIndicator({
  label,
  tone = "neutral",
  compact = false,
}: StatusIndicatorProps) {
  return (
    <span
      className={`status-indicator status-indicator--${tone}${compact ? " status-indicator--compact" : ""}`}
    >
      <span className="status-indicator__dot" aria-hidden="true" />
      {label}
    </span>
  );
}
