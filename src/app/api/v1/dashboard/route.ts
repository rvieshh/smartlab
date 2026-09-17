import { NextRequest, NextResponse } from "next/server";
import { serverTranslate } from "@/i18n/server";
import { getDashboardData } from "@/server/dashboard/get-dashboard-data";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
const VALID_RANGES = new Set([6, 12, 24]);

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: await serverTranslate("common.errors.authNotConfigured") }, { status: 503 });
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.json({ error: await serverTranslate("common.errors.unauthorized") }, { status: 401 });
  const requestedRange = Number(request.nextUrl.searchParams.get("range") ?? 12);
  const rangeHours = VALID_RANGES.has(requestedRange) ? requestedRange : 12;
  return NextResponse.json({ data: await getDashboardData(rangeHours) });
}
