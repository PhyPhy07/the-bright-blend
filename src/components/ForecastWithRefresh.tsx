"use client";

import type { ForecastApiResponse, OptimisticForecast } from "@/lib/providers/types";
import Image from "next/image";
import { useState } from "react";
import ErrorAlert from "./ErrorAlert";
import { ForecastCard } from "./ForecastCard";
import WeatherFactorsSection from "./WeatherFactorsSection";

type WeatherFactors = ForecastApiResponse["weatherFactors"];

interface ForecastWithRefreshProps {
  forecast: OptimisticForecast;
  locationName?: string;
  weatherFactors?: WeatherFactors;
  onRefresh: () => Promise<void>;
}

export default function ForecastWithRefresh({
  forecast,
  locationName,
  weatherFactors,
  onRefresh,
}: ForecastWithRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [factorsExpanded, setFactorsExpanded] = useState(false);

  async function handleRefresh() {
    setIsRefreshing(true);
    setRefreshError(null);
    try {
      await onRefresh();
    } catch {
      setRefreshError("Sorry, we spilled the beans. Please try again.");
    } finally {
      setIsRefreshing(false);
    }
  }

  const today = forecast.daily[0];

  return (
    <div className="space-y-4">
      {today ? (
        <div
          className="flex flex-col overflow-hidden rounded-2xl border-2 border-brand-blue-light shadow-brand-blue-light md:flex-row"
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="relative aspect-[9/16] w-full shrink-0 overflow-hidden md:min-w-[360px] md:flex-1 md:aspect-auto md:min-h-[280px]">
            <Image
              src="/mobileview.png"
              alt="The Weather Wonder"
              fill
              className="object-cover md:hidden"
              sizes="100vw"
              priority
            />
            <Image
              src="/weatherwonder.png"
              alt="Weather Wonder"
              width={360}
              height={280}
              className="hidden h-full min-h-[280px] w-full object-cover md:block"
            />
          </div>
          <div className="flex-1 bg-white p-5 min-w-0">
            <ForecastCard
              day={today}
              embedded
              locationName={locationName ?? forecast.location}
              sourceProvider={forecast.sourceProvider}
            />
          </div>
        </div>
      ) : null}
      {refreshError && <ErrorAlert message={refreshError} />}
      {weatherFactors && (
        <div className="rounded-xl border-2 border-brand-blue-light bg-white overflow-hidden">
          <button
            type="button"
            onClick={() => setFactorsExpanded((v) => !v)}
            className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left font-bold text-black font-[family-name:var(--font-typewriter)] hover:bg-brand-blue-light/30 transition"
            aria-expanded={factorsExpanded}
            aria-controls="weather-factors-content"
            id="weather-factors-toggle"
          >
            Weather Factors
            <span
              className={`shrink-0 text-xl transition-transform ${factorsExpanded ? "rotate-180" : ""}`}
              aria-hidden
            >
              ▼
            </span>
          </button>
          <div
            id="weather-factors-content"
            role="region"
            aria-labelledby="weather-factors-toggle"
            className={factorsExpanded ? "" : "hidden"}
          >
            <WeatherFactorsSection factors={weatherFactors} embedded />
          </div>
        </div>
      )}
      {!today ? (
        <div
          className="space-y-2 rounded-lg border border-black bg-white p-6 text-center font-[family-name:var(--font-typewriter)]"
          aria-live="polite"
          aria-atomic="true"
        >
          <p className="text-black">
            {forecast.allProvidersFailed
              ? "Couldn't reach weather providers. Try again."
              : "No forecast for today."}
          </p>
        </div>
      ) : null}
      <button
        type="button"
        onClick={handleRefresh}
        disabled={isRefreshing}
        aria-busy={isRefreshing}
        aria-label={isRefreshing ? "Refreshing forecast" : "Refresh forecast"}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-brand-gold bg-brand-gold px-4 py-3 text-2xl font-bold text-white shadow-brand-gold transition disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 font-[family-name:var(--font-typewriter)]"
      >
        <Image src="/lightning.svg" alt="" width={32} height={32} className="brightness-0 invert" aria-hidden />
        {isRefreshing ? "Remixing…" : "Remix"}
      </button>
    </div>
  );
}
