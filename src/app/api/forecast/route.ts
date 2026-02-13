import { NextResponse } from "next/server";
import { getProviders } from "../../../lib/providers/registry";
import { getOptimisticForecast } from "@/lib/optimizer";
import { NormalizedForecast } from "../../../lib/providers/types";

const NYC_LAT = 40.7128;
const NYC_LON = -74.006;

export async function GET() {
  const providers = getProviders();
  const results = await Promise.allSettled(
    providers.map((p) => p.fetchForecast(NYC_LAT, NYC_LON))
  );

  const forecasts = results
    .filter((r) => r.status === "fulfilled")
    .map((r) => (r as PromiseFulfilledResult<NormalizedForecast>).value);

  const optimistic = getOptimisticForecast(forecasts);

  return NextResponse.json(
    { optimistic, providers: forecasts },
    {
      headers: {
        "Cache-Control": "public, s-maxage=900",
      },
    }
  );
}