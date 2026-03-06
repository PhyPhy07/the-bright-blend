import { unstable_cache } from "next/cache";
import type { ForecastApiResponse } from "./providers/types";
import { getProviders } from "./providers/registry";
import { getOptimisticForecast } from "./optimizer";
import { getFulfilledValues } from "./utils/getFulfilledValues";
import { fetchWeatherFactors } from "./utils/weatherFactors";

// Conroe, Texas
export const DEFAULT_LAT = 30.3119;
export const DEFAULT_LON = -95.4561;
export const DEFAULT_LOCATION = "Conroe, Texas";

const CACHE_REVALIDATE_SECONDS = 300; // 5 minutes

function isDefaultCoords(lat: number, lon: number): boolean {
  return Math.abs(lat - DEFAULT_LAT) < 0.01 && Math.abs(lon - DEFAULT_LON) < 0.01;
}

async function fetchOptimisticForecast(lat: number, lon: number): Promise<ForecastApiResponse> {
  const [forecastsResult, weatherFactorsResult] = await Promise.all([
    Promise.allSettled(getProviders().map((p) => p.fetchForecast(lat, lon))),
    fetchWeatherFactors(lat, lon),
  ]);
  const forecasts = getFulfilledValues(forecastsResult);
  const blended = getOptimisticForecast(forecasts);
  const optimistic = {
    ...blended,
    location: isDefaultCoords(lat, lon) ? DEFAULT_LOCATION : blended.location,
    allProvidersFailed: forecasts.length === 0,
  };
  return {
    optimistic,
    providers: forecasts,
    weatherFactors: weatherFactorsResult ?? null,
  };
}

function cacheKey(lat: number, lon: number) {
  return ["forecast", lat.toFixed(2), lon.toFixed(2)];
}

export const getCachedForecast = unstable_cache(
  async () => {
    const result = await fetchOptimisticForecast(DEFAULT_LAT, DEFAULT_LON);
    return {
      ...result,
      optimistic: { ...result.optimistic, location: DEFAULT_LOCATION },
    };
  },
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
