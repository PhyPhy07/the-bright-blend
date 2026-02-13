import type { NormalizedForecast, ForecastDay, WeatherIcon } from "@/lib/providers/types";

const SUNNY_ICONS = new Set<WeatherIcon>([
  "clear-day",
  "clear-night",
  "partly-cloudy-day",
  "partly-cloudy-night",
]);
// The assignment needs “best (sunniest/warmest)” forecast. The bonus makes “sunniest” part of the score, not just “warmest” and “driest” , without the bonus, the score would be biased towards warmer and drier days.
function computeOptimismScore(day: ForecastDay): number {
  const tempScore = day.tempHighF;
  const precipPenalty = day.precipitationChance * -0.5;
  const sunBonus = day.icon && SUNNY_ICONS.has(day.icon) ? 10 : 0;
  return tempScore + precipPenalty + sunBonus;
}

function getTodayDateNYC(): string {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "America/New_York",
  });
}

export function getOptimisticForecast(forecasts: NormalizedForecast[]): NormalizedForecast {
  if (forecasts.length === 0) {
    return {
      provider: "Optimistic Blend",
      location: "New York",
      fetchedAt: new Date().toISOString(),
      daily: [],
    };
  }

  const today = getTodayDateNYC();
  const todaysFromAll: ForecastDay[] = [];

  for (const forecast of forecasts) {
    const todaysDay = forecast.daily.find((day) => day.date === today);
    if (todaysDay) todaysFromAll.push(todaysDay);
  }

  let bestDay: ForecastDay | null = null;
  let bestScore = -Infinity;
  for (const day of todaysFromAll) {
    const score = computeOptimismScore(day);
    if (score > bestScore) {
      bestDay = day;
      bestScore = score;
    }
  }

  const latestFetched = forecasts.reduce(
    (latest, f) => (f.fetchedAt > latest ? f.fetchedAt : latest),
    forecasts[0].fetchedAt
  );

  return {
    provider: "Optimistic Blend",
    location: forecasts[0].location,
    fetchedAt: latestFetched,
    daily: bestDay ? [bestDay] : [],
  };
  //optimizer/aggregator gathers forecast data from all providers, and returns the best day based on the score, returns a new normalized forecast object with the best day
}
