import type { ReactNode } from "react";

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  detail?: ReactNode;
}

export function SectionHeader({ eyebrow, title, detail }: SectionHeaderProps) {
  return (
    <header className="section-header">
      <div>
        <p className="section-header__eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      {detail ? <div className="section-header__detail">{detail}</div> : null}
    </header>
  );
}
