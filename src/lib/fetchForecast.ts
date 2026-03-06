import { unstable_cache } from "next/cache";
import type { ForecastApiResponse } from "./providers/types";
import { getProviders } from "./providers/registry";
import { getOptimisticForecast } from "./optimizer";
import { getFulfilledValues } from "./utils/getFulfilledValues";

export const DEFAULT_LAT = 40.7128;
export const DEFAULT_LON = -74.006;

const CACHE_REVALIDATE_SECONDS = 300; // 5 minutes

async function fetchOptimisticForecast(lat: number, lon: number): Promise<ForecastApiResponse> {
  const providers = getProviders();
  const results = await Promise.allSettled(
    providers.map((p) => p.fetchForecast(lat, lon))
  );
  const forecasts = getFulfilledValues(results);
  const optimistic = {
    ...getOptimisticForecast(forecasts),
    allProvidersFailed: forecasts.length === 0,
  };
  return { optimistic, providers: forecasts };
}

function cacheKey(lat: number, lon: number) {
  return ["forecast", lat.toFixed(2), lon.toFixed(2)];
}

export const getCachedForecast = unstable_cache(
  async () => fetchOptimisticForecast(DEFAULT_LAT, DEFAULT_LON),
  cacheKey(DEFAULT_LAT, DEFAULT_LON),
  { revalidate: CACHE_REVALIDATE_SECONDS }
);

export async function getCachedForecastForCoords(lat: number, lon: number): Promise<ForecastApiResponse> {
  const cached = unstable_cache(
    async () => fetchOptimisticForecast(lat, lon),
    cacheKey(lat, lon),
    { revalidate: CACHE_REVALIDATE_SECONDS }
  );
  return cached();
}
