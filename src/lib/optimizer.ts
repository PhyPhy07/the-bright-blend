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

function normalizeDate(dateStr: string): string {
  try {
    const d = new Date(dateStr + "T12:00:00");
    if (isNaN(d.getTime())) return dateStr;
    return d.toISOString().slice(0, 10);
  } catch {
    return dateStr;
  }
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
    const todaysDay = forecast.daily.find((day) => normalizeDate(day.date) === today);
    if (todaysDay) todaysFromAll.push(todaysDay);
  }

  const temps = todaysFromAll.map((d) => d.tempHighF).sort((a, b) => a - b);
  const medianTemp = temps.length > 0 ? temps[Math.floor(temps.length / 2)] : 0;
  const OUTLIER_THRESHOLD = 15;

  const inRange = todaysFromAll.filter(
    (day) => Math.abs(day.tempHighF - medianTemp) <= OUTLIER_THRESHOLD
  );
  const candidates = inRange.length > 0 ? inRange : todaysFromAll;

  let bestDay: ForecastDay | null = null;
  let bestScore = -Infinity;
  for (const day of candidates) {
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
  //the flow is: fetch from all providers → normalize and filter to today → score each → pick the best → show that as the single “optimistic” forecast.
}
