"use client";

import { NormalizedForecast } from "@/lib/providers/types";
import Image from "next/image";
import { useState } from "react";
import { SiCoffeescript } from "react-icons/si";
import { ForecastCard } from "./ForecastCard";

interface ForecastWithRefreshProps {
  initialData: NormalizedForecast & { allProvidersFailed?: boolean };
}

export default function ForecastWithRefresh({ initialData }: ForecastWithRefreshProps) {
  const [forecast, setForecast] = useState(initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  async function handleRefresh() {
    setIsRefreshing(true);
    setRefreshError(null);
    try {
      const res = await fetch(`/api/forecast?t=${Date.now()}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
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
          className="flex overflow-hidden rounded-2xl border-2"
          style={{ borderColor: "#D5E5FE", boxShadow: "0 10px 15px -3px rgba(213, 229, 254, 0.4), 0 4px 6px -2px rgba(213, 229, 254, 0.3)" }}
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
      ) : (
        <div className="space-y-2 rounded-lg border border-black bg-white p-6 text-center font-[family-name:var(--font-typewriter)]">
          <p className="text-black">
            {forecast.allProvidersFailed
              ? "Couldn't reach weather providers. Try again."
              : "No forecast for today."}
          </p>
          {refreshError && <p className="text-red-500 text-sm">{refreshError}</p>}
        </div>
      )}
      <button
        type="button"
        onClick={handleRefresh}
        disabled={isRefreshing}
        aria-busy={isRefreshing}
        aria-label={isRefreshing ? "Refreshing forecast" : "Refresh forecast"}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 px-4 py-3 text-2xl font-bold transition disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F9B423] focus-visible:ring-offset-2 font-[family-name:var(--font-typewriter)]"
        style={{
          borderColor: "#F9B423",
          backgroundColor: "#F9B423",
          color: "white",
          boxShadow: "0 4px 6px -2px rgba(249, 180, 35, 0.3)",
        }}
      >
        <SiCoffeescript className="text-3xl" aria-hidden />
        {isRefreshing ? "Rebrewing…" : "Rebrew"}
      </button>
    </div>
  );
}
