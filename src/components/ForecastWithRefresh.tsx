"use client";

import { NormalizedForecast } from "@/lib/providers/types";
import Image from "next/image";
import { useState } from "react";
import { SiCoffeescript } from "react-icons/si";
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
        <div
          className="flex overflow-hidden rounded-2xl border-2"
          style={{ borderColor: "#D5E5FE", boxShadow: "0 10px 15px -3px rgba(213, 229, 254, 0.4), 0 4px 6px -2px rgba(213, 229, 254, 0.3)" }}
        >
          <div className="min-w-[360px] flex-1 overflow-hidden">
            <Image
              src="/MORNING%20BREW%20LOGO%20EDIT.png"
              alt=""
              width={360}
              height={280}
              className="h-full min-h-[280px] w-full object-cover"
            />
          </div>
          <div className="flex-1 bg-white p-5 min-w-0">
            <ForecastCard day={today} embedded />
          </div>
        </div>
      ) : (
        <p className="rounded-lg border border-black bg-white p-6 text-center text-black font-[family-name:var(--font-typewriter)]">
          No forecast for today.
        </p>
      )}
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 px-4 py-3 font-bold transition disabled:opacity-50 font-[family-name:var(--font-typewriter)]"
        style={{
          borderColor: "#D5E5FE",
          backgroundColor: "#D5E5FE",
          color: "#1666C2",
          boxShadow: "0 4px 6px -2px rgba(213, 229, 254, 0.3)",
        }}
      >
        <SiCoffeescript className="text-xl" />
        {isRefreshing ? "Rebrewing…" : "Rebrew"}
      </button>
    </div>
  );
}
