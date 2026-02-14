import { getOptimisticForecast } from "../optimizer";
import type { ForecastDay, NormalizedForecast } from "@/lib/providers/types";

const todayNYC = new Date().toLocaleDateString("en-CA", {
  timeZone: "America/New_York",
});

function forecastDay(overrides: Partial<ForecastDay> = {}): ForecastDay {
  return {
    date: todayNYC,
    tempHighF: 60,
    tempLowF: 40,
    description: "Partly cloudy",
    precipitationChance: 0,
    icon: "clear-day",
    ...overrides,
  };
}

describe("optimizer", () => {
  it("returns empty daily when no forecasts", () => {
    const result = getOptimisticForecast([]);
    expect(result.provider).toBe("Optimistic Blend");
    expect(result.daily).toEqual([]);
    expect(result.sourceProvider).toBeUndefined();
  });

  it("returns the single forecast when only one provider has today", () => {
    const forecast: NormalizedForecast = {
      provider: "Open-Meteo",
      location: "New York",
      fetchedAt: "2026-02-14T12:00:00Z",
      daily: [forecastDay()],
    };
    const result = getOptimisticForecast([forecast]);
    expect(result.daily).toHaveLength(1);
    expect(result.daily[0].tempHighF).toBe(60);
    expect(result.sourceProvider).toBe("Open-Meteo");
  });

  it("picks the higher-scoring forecast when multiple providers have today", () => {
    const warmer: NormalizedForecast = {
      provider: "Pirate Weather",
      location: "New York",
      fetchedAt: "2026-02-14T12:00:00Z",
      daily: [forecastDay({ tempHighF: 72, icon: "clear-day", precipitationChance: 0 })],
    };
    const cooler: NormalizedForecast = {
      provider: "Morning Brew",
      location: "New York",
      fetchedAt: "2026-02-14T12:00:00Z",
      daily: [forecastDay({ tempHighF: 65, icon: "rain", precipitationChance: 80 })],
    };
    const result = getOptimisticForecast([warmer, cooler]);
    expect(result.daily[0].tempHighF).toBe(72);
    expect(result.sourceProvider).toBe("Pirate Weather");
  });

  it("falls back to all forecasts when all are outliers", () => {
    const forecasts: NormalizedForecast[] = [
      { provider: "A", location: "New York", fetchedAt: "2026-02-14T10:00:00Z", daily: [forecastDay({ tempHighF: 0 })] },
      { provider: "B", location: "New York", fetchedAt: "2026-02-14T10:00:00Z", daily: [forecastDay({ tempHighF: 10 })] },
      { provider: "C", location: "New York", fetchedAt: "2026-02-14T10:00:00Z", daily: [forecastDay({ tempHighF: 90 })] },
      { provider: "D", location: "New York", fetchedAt: "2026-02-14T10:00:00Z", daily: [forecastDay({ tempHighF: 100 })] },
    ];
    const result = getOptimisticForecast(forecasts);
    expect(result.daily).toHaveLength(1);
    expect(result.daily[0].tempHighF).toBe(100);
    expect(result.sourceProvider).toBe("D");
  });

  it("uses the latest fetchedAt from all forecasts", () => {
    const forecasts: NormalizedForecast[] = [
      { provider: "A", location: "New York", fetchedAt: "2026-02-14T10:00:00Z", daily: [forecastDay()] },
      { provider: "B", location: "New York", fetchedAt: "2026-02-14T15:00:00Z", daily: [forecastDay()] },
      { provider: "C", location: "New York", fetchedAt: "2026-02-14T12:00:00Z", daily: [forecastDay()] },
    ];
    const result = getOptimisticForecast(forecasts);
    expect(result.fetchedAt).toBe("2026-02-14T15:00:00Z");
  });
});