import { unstable_cache } from "next/cache";
import { getProviders } from "./providers/registry";
import { getOptimisticForecast } from "./optimizer";
import { getFulfilledValues } from "./utils/settledPromise";

const NYC_LAT = 40.7128;
const NYC_LON = -74.006;

const CACHE_REVALIDATE_SECONDS = 300; // 5 minutes
//fetches the forecast from the providers and returns the blended forecast
async function fetchOptimisticForecast() {
  const providers = getProviders();
  const results = await Promise.allSettled(
    providers.map((p) => p.fetchForecast(NYC_LAT, NYC_LON))
  );
  const forecasts = getFulfilledValues(results);
  const optimistic = {
    ...getOptimisticForecast(forecasts),
    allProvidersFailed: forecasts.length === 0,
  };
  return { optimistic, providers: forecasts };
}
//wraps the fetchOptimisticForecast function in an unstable_cache function to cache the result for 5 minutes based on the key "forecast-nyc"
export const getCachedForecast = unstable_cache(
  fetchOptimisticForecast,
  ["forecast-nyc"],
  { revalidate: CACHE_REVALIDATE_SECONDS }
);
