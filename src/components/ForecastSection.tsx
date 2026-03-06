"use client";

import { DEFAULT_LAT, DEFAULT_LON } from "@/lib/fetchForecast";
import type { ForecastApiResponse, OptimisticForecast } from "@/lib/providers/types";
import { useState } from "react";
import ErrorAlert from "./ErrorAlert";
import ForecastWithRefresh from "./ForecastWithRefresh";
import LocationSearch from "./LocationSearch";

interface ForecastSectionProps {
  initialData: OptimisticForecast;
}

export default function ForecastSection({ initialData }: ForecastSectionProps) {
  const [forecast, setForecast] = useState<OptimisticForecast>(initialData);
  const [coords, setCoords] = useState({ lat: DEFAULT_LAT, lon: DEFAULT_LON });
  const [locationName, setLocationName] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  async function fetchForecast(lat: number, lon: number): Promise<ForecastApiResponse> {
    const res = await fetch(
      `/api/forecast?lat=${lat}&lon=${lon}&t=${Date.now()}`,
      { cache: "no-store" }
    );
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  }

  async function handleSearch(location: string) {
    setIsSearching(true);
    setSearchError(null);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(location)}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Location not found");
      }
      const { lat: newLat, lon: newLon, cityState } = await res.json();
      setCoords({ lat: newLat, lon: newLon });
      setLocationName(cityState ?? null);
      const { optimistic } = await fetchForecast(newLat, newLon);
      setForecast(optimistic);
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "Location not found");
    } finally {
      setIsSearching(false);
    }
  }

  async function handleRefresh() {
    const { optimistic } = await fetchForecast(coords.lat, coords.lon);
    setForecast(optimistic);
  }
  const displayLocation = locationName ?? forecast.location;

  return (
    <section aria-label={`Today's forecast for ${displayLocation}`} className="space-y-4">
      <LocationSearch onSearch={handleSearch} disabled={isSearching} />
      {searchError && <ErrorAlert message={searchError} />}
      <ForecastWithRefresh forecast={forecast} locationName={displayLocation} onRefresh={handleRefresh} />
    </section>
  );
}
