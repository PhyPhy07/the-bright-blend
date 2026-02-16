"use client";

import type { ForecastApiResponse, OptimisticForecast } from "@/lib/providers/types";
import Image from "next/image";
import { useState } from "react";
import { SiCoffeescript } from "react-icons/si";
import { ForecastCard } from "./ForecastCard";

interface ForecastWithRefreshProps {
  initialData: OptimisticForecast;
}

export default function ForecastWithRefresh({ initialData }: ForecastWithRefreshProps) {
  const [forecast, setForecast] = useState<OptimisticForecast>(initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  async function handleRefresh() {
    setIsRefreshing(true);
    setRefreshError(null);
    try {
      const res = await fetch(`/api/forecast?t=${Date.now()}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch");
      const json: ForecastApiResponse = await res.json();
      setForecast(json.optimistic);
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
          className="flex overflow-hidden rounded-2xl border-2 border-brand-blue-light shadow-brand-blue-light"
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="min-w-[360px] flex-1 overflow-hidden">
            <Image
              src="/MORNING%20BREW%20LOGO%20EDIT.png"
              alt="Morning Brew logo"
              width={360}
              height={280}
              className="h-full min-h-[280px] w-full object-cover"
            />
          </div>
          <div className="flex-1 bg-white p-5 min-w-0">
            <ForecastCard day={today} embedded sourceProvider={forecast.sourceProvider} />
          </div>
        </div>
      ) : null}
      {refreshError && (
        <p
          className="rounded-lg border-2 border-red-500 bg-red-100 px-4 py-3 text-center text-base font-semibold text-red-800 font-[family-name:var(--font-typewriter)]"
          role="alert"
        >
          {refreshError}
        </p>
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
        <SiCoffeescript className="text-3xl" aria-hidden />
        {isRefreshing ? "Rebrewing…" : "Rebrew"}
      </button>
    </div>
  );
}
