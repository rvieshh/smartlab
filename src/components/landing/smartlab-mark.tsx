interface SmartLabMarkProps {
  size?: number;
  className?: string;
}

/**
 * Original geometric SmartLab mark.
 * A minimal cubic construction of three visible faces that suggests a
 * connected monitoring structure. Clean white geometry on dark canvas.
 */
export function SmartLabMark({ size = 28, className }: SmartLabMarkProps) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="4 2 24 22"
      fill="none"
      className={className}
      style={{ display: "block" }}
    >
      {/* Top face */}
      <path d="M16 4L26 10V16L16 22L6 16V10L16 4Z" fill="#1D1D1D" stroke="#F5F5F5" strokeWidth="1.1" />
      {/* Left face */}
      <path d="M6 10L16 16V22L6 16V10Z" fill="#0F0F0F" stroke="#F5F5F5" strokeWidth="1" />
      {/* Right face */}
      <path d="M26 10L16 16V22L26 16V10Z" fill="#141414" stroke="#F5F5F5" strokeWidth="1" />
      {/* White structural ridge */}
      <line x1="16" y1="4" x2="16" y2="16" stroke="#F5F5F5" strokeWidth="1.2" />
      {/* Center node */}
      <circle cx="16" cy="14" r="2" fill="#F5F5F5" />
    </svg>
  );
}
