import { NextResponse } from "next/server";
import { getProviders } from "../../../lib/providers/registry";
import { getOptimisticForecast } from "@/lib/optimizer";
import { getFulfilledValues } from "@/lib/utils/settledPromise";

const NYC_LAT = 40.7128;
const NYC_LON = -74.006;

export async function GET() {
  const providers = getProviders();
  const results = await Promise.allSettled(
    providers.map((p) => p.fetchForecast(NYC_LAT, NYC_LON))
  );

  const forecasts = getFulfilledValues(results);

  const optimistic = {
    ...getOptimisticForecast(forecasts),
    allProvidersFailed: forecasts.length === 0,
  };

  return NextResponse.json(
    { optimistic, providers: forecasts },
    {
      headers: {
        "Cache-Control": "public, s-maxage=900",
      },
    }
  );
}