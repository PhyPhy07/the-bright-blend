import { getCachedForecast } from "@/lib/fetchForecast";
import ForecastWithRefresh from "@/components/ForecastWithRefresh";

export const dynamic = "force-dynamic";

// Server component: fetches cached forecast (5 min TTL), passes to client for display + Rebrew.
export default async function Home() {
  const { optimistic } = await getCachedForecast();

  return (
    <div className="min-h-screen bg-white px-4 pt-4 pb-8">
      <main className="mx-auto max-w-4xl">
        <header className="mb-4 text-center">
          <h1 className="text-7xl font-bold font-[family-name:var(--font-typewriter)]">
            <span className="text-black">THE</span> <span className="text-brand-gold">BRIGHT</span> <span className="text-black">BLEND</span>
          </h1>
          <h2 className="mt-2 text-2xl font-bold text-brand-blue font-[family-name:var(--font-typewriter)]">
            Optimistically delusional, by design.
          </h2>
        </header>

        <section aria-label="Today's forecast">
          <ForecastWithRefresh initialData={optimistic} />
        </section>
      </main>
    </div>
  );
}
