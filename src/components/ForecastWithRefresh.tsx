"use client";

import { NormalizedForecast } from "@/lib/providers/types";
import { useState } from "react";
import { ForecastCard } from "./ForecastCard";

interface ForecastWithRefreshProps {
  initialData: NormalizedForecast;
}

export default function ForecastWithRefresh({ initialData }: ForecastWithRefreshProps) {
  const [forecast, setForecast] = useState<NormalizedForecast>(initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function handleRefresh() {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/forecast", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setForecast(json.optimistic);
    } catch {
      // Keep existing forecast on error
    } finally {
      setIsRefreshing(false);
    }
  }

  const today = forecast.daily[0];

  return (
    <div className="space-y-4">
      {today ? (
        <ForecastCard day={today} provider={forecast.provider} />
      ) : (
        <p className="rounded-lg border border-amber-200 bg-white p-6 text-center text-amber-900">
          No forecast for today.
        </p>
      )}
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="w-full rounded-lg border border-amber-300 bg-amber-100 px-4 py-2 font-medium text-amber-900 transition hover:bg-amber-200 disabled:opacity-50"
      >
        {isRefreshing ? "Refreshing…" : "Refresh"}
      </button>
    </div>
  );
}
