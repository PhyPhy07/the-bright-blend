import { getCachedForecast } from "@/lib/fetchForecast";
import ForecastSection from "@/components/ForecastSection";
//tells next.js to re-render the page on every request, ensures forecast is fresh when cache expires
export const dynamic = "force-dynamic";

// Server component that fetches the cached forecast and passes it to the client for display and Remix.
export default async function Home() {
  const { optimistic, weatherFactors } = await getCachedForecast();

  return (
    <div className="min-h-screen bg-white px-4 pt-4 pb-8">
      <main className="mx-auto max-w-4xl">
        <header className="mb-4 text-center">
          <h1 className="text-7xl font-bold font-[family-name:var(--font-typewriter)]">
            <span className="text-black">WEATHER</span> <span className="text-brand-gold">WONDER</span>
          </h1>
          <h2 className="mt-2 text-2xl font-bold text-brand-blue font-[family-name:var(--font-typewriter)]">
            Optimistically delusional, by design.
          </h2>
        </header>
        <ForecastSection initialData={optimistic} initialWeatherFactors={weatherFactors} />
      </main>
    </div>
  );
}