import { NextResponse } from "next/server";
import { serverTranslate } from "@/i18n/server";
import { getMonitoringDataProvider } from "@/server/monitoring/get-monitoring-source";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: await serverTranslate("common.errors.authNotConfigured") }, { status: 503 });
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.json({ error: await serverTranslate("common.errors.unauthorized") }, { status: 401 });
  const snapshot = await getMonitoringDataProvider().getCurrentStatus();
  return NextResponse.json({ data: snapshot });
}
