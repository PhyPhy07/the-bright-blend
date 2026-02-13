import { getProviders } from "@/lib/providers/registry";
import { getOptimisticForecast } from "@/lib/optimizer";
import type { NormalizedForecast } from "@/lib/providers/types";
import ForecastWithRefresh from "@/components/ForecastWithRefresh";

const NYC_LAT = 40.7128;
const NYC_LON = -74.006;

export default async function Home() {
  const providers = getProviders();
  const results = await Promise.allSettled(
    providers.map((p) => p.fetchForecast(NYC_LAT, NYC_LON))
  );

  const forecasts = results
    .filter((r) => r.status === "fulfilled")
    .map((r) => (r as PromiseFulfilledResult<NormalizedForecast>).value);

  const optimistic = getOptimisticForecast(forecasts);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 px-4 py-8">
      <main className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-center text-3xl font-bold text-amber-900">
          It&apos;s Always Sunny in New York ☀️
        </h1>

        <ForecastWithRefresh initialData={optimistic} />
      </main>
    </div>
  );
}
