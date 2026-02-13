import { getProviders } from "@/lib/providers/registry";
import { getOptimisticForecast } from "@/lib/optimizer";
import type { NormalizedForecast } from "@/lib/providers/types";
import ForecastWithRefresh from "@/components/ForecastWithRefresh";

export const dynamic = "force-dynamic";

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
    <div className="min-h-screen bg-white px-4 pt-4 pb-8">
      <main className="mx-auto max-w-4xl">
        <header className="mb-4 text-center">
          <h1 className="text-7xl font-bold font-[family-name:var(--font-typewriter)]" style={{ color: "#1666C2" }}>
            THE BRIGHT BLEND
          </h1>
          <h2 className="mt-2 text-2xl font-bold font-[family-name:var(--font-typewriter)]" style={{ color: "#1666C2" }}>
            Optimistically delusional, by design.
          </h2>
        </header>

        <ForecastWithRefresh initialData={optimistic} />
      </main>
    </div>
  );
}
