"use client";

import type { OptimisticForecast } from "@/lib/providers/types";
import ForecastWithRefresh from "./ForecastWithRefresh";
import LocationSearch from "./LocationSearch";

interface ForecastSectionProps {
  initialData: OptimisticForecast;
}

export default function ForecastSection({ initialData }: ForecastSectionProps) {
  function handleSearch(location: string) {
    console.log(location);
    // TODO: geocode → fetch forecast for location
  }

  return (
    <section aria-label="Today's forecast" className="space-y-4">
      <LocationSearch handleSearch={handleSearch} />
      <ForecastWithRefresh initialData={initialData} />
    </section>
  );
}
