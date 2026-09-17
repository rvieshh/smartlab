import { NextResponse } from "next/server";
import { getServerConfig } from "@/config/env";

export const dynamic = "force-dynamic";

export function GET() {
  const config = getServerConfig();

  return NextResponse.json({
    status: "ok",
    service: "smartlab-web",
    timestamp: new Date().toISOString(),
    monitoring: {
      dataSource: config.monitoringDataSource,
    },
    analysis: {
      enabled: config.aiAnalysisEnabled,
      requiredForMonitoring: false,
    },
  });
}
