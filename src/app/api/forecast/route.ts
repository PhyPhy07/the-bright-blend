import { NextResponse } from "next/server";
import { getCachedForecast } from "@/lib/fetchForecast";

// API route for Rebrew: returns cached blended forecast (optimistic + providers). Api backend entry point.
export async function GET() {
  const { optimistic, providers } = await getCachedForecast();

  return NextResponse.json({ optimistic, providers });
}