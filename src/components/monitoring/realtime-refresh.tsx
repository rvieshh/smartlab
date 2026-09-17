"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/** One bounded channel per dashboard session; refreshes server data after DB changes. */
export function MonitoringRealtimeRefresh({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  useEffect(() => {
    if (!enabled) return;
    const client = createClient();
    if (!client) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const refresh = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => router.refresh(), 500);
    };
    const channel = client
      .channel("smartlab-monitoring")
      .on("postgres_changes", { event: "*", schema: "public", table: "sensor_readings" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "devices" }, refresh)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "monitoring_events" }, refresh)
      .subscribe();
    return () => {
      if (timer) clearTimeout(timer);
      void client.removeChannel(channel);
    };
  }, [enabled, router]);
  return null;
}
