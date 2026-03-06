import { NextRequest, NextResponse } from "next/server";
import { getCachedForecast, getCachedForecastForCoords } from "@/lib/fetchForecast";

function parseCoords(searchParams: URLSearchParams): { lat: number; lon: number } | null {
  const lat = parseFloat(searchParams.get("lat") ?? "");
  const lon = parseFloat(searchParams.get("lon") ?? "");
  if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return null;
  }
  return { lat, lon };
}

export async function GET(request: NextRequest) {
  const coords = parseCoords(request.nextUrl.searchParams);
  const { optimistic, providers, weatherFactors } = coords
    ? await getCachedForecastForCoords(coords.lat, coords.lon)
    : await getCachedForecast();

  return NextResponse.json({ optimistic, providers, weatherFactors });
}