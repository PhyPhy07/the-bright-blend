import { NextResponse } from "next/server";
import { getCachedForecast } from "@/lib/fetchForecast";
import type { ForecastApiResponse } from "@/lib/providers/types";

export async function GET() {
  const { optimistic, providers } = await getCachedForecast();
  const body: ForecastApiResponse = { optimistic, providers };

  return NextResponse.json(body);
}