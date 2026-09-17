"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { LogoutButton } from "@/components/auth/logout-button";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { SmartLabMark } from "@/components/landing/smartlab-mark";
import { MonitoringRealtimeRefresh } from "@/components/monitoring/realtime-refresh";
import { useI18n } from "@/i18n/provider";

interface AppShellProps {
  children: ReactNode;
  userEmail?: string;
  realtimeEnabled?: boolean;
}

const navigation = [
  { href: "/dashboard", key: "dashboard.nav.overview" },
  { href: "/dashboard/history", key: "dashboard.nav.history" },
  { href: "/dashboard/devices", key: "dashboard.nav.devices" },
] as const;

export function AppShell({ children, userEmail, realtimeEnabled = false }: AppShellProps) {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__inner">
          <Link className="brand" href="/" aria-label={t("common.brand")}>
            <SmartLabMark size={30} />
            <span className="brand__name">SmartLab</span>
          </Link>
          <nav className="app-nav" aria-label={t("dashboard.nav.label")}>
            {navigation.map((item) => {
              const active = pathname === item.href;
              return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={active ? "app-nav__item app-nav__item--active" : "app-nav__item"}>{t(item.key)}</Link>;
            })}
          </nav>
          <div className="header-actions">
            <span className="header-system"><i aria-hidden="true" />{t("dashboard.header.systemOnline")}</span>
            <LanguageSwitcher />
            {userEmail ? <span className="header-user" title={userEmail}>{userEmail}</span> : null}
            <LogoutButton />
          </div>
        </div>
      </header>
      <MonitoringRealtimeRefresh enabled={realtimeEnabled} />
      {children}
      <footer className="app-footer"><span>{t("common.footer.product")}</span><span>{t("common.footer.environment")}</span></footer>
    </div>
  );
}
