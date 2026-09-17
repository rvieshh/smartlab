import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/lib/auth/require-user";
import { getServerConfig } from "@/config/env";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  const realtimeEnabled = getServerConfig().monitoringDataSource === "supabase";
  return <AppShell userEmail={user.email} realtimeEnabled={realtimeEnabled}>{children}</AppShell>;
}
