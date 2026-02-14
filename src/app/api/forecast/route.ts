import { NextResponse } from "next/server";
import { getCachedForecast } from "@/lib/fetchForecast";
//defines the api route used by rebrew to get blended forecast
export async function GET() {
  const { optimistic, providers } = await getCachedForecast();

  return NextResponse.json({ optimistic, providers });
}