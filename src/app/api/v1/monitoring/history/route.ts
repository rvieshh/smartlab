import { NextRequest, NextResponse } from "next/server";
import { historyRangeHours, type HistoryRange } from "@/domain/monitoring/presentation";
import { serverTranslate } from "@/i18n/server";
import { createClient } from "@/lib/supabase/server";
import { getMonitoringDataProvider } from "@/server/monitoring/get-monitoring-source";

export const dynamic = "force-dynamic";
const RANGES = new Set<HistoryRange>(["today", "24h", "7d", "30d"]);

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: await serverTranslate("common.errors.authNotConfigured") }, { status: 503 });
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.json({ error: await serverTranslate("common.errors.unauthorized") }, { status: 401 });
  const requested = request.nextUrl.searchParams.get("range") as HistoryRange | null;
  const range = requested && RANGES.has(requested) ? requested : "24h";
  const history = await getMonitoringDataProvider().getHistory(historyRangeHours(range));
  return NextResponse.json({ data: history, range });
}
