import type { NormalizedForecast, ForecastDay, WeatherIcon } from "@/lib/providers/types";

const SUNNY_ICONS = new Set<WeatherIcon>([
  "clear-day",
  "clear-night",
  "partly-cloudy-day",
  "partly-cloudy-night",
]);
// Score = temp + sunny bonus (+10) - rain penalty. Higher is better.Bonus is to make sure the best day is the sunniest day and avoid warm and dry days. The sunny bonus (+10) is there so the score favors sunny forecasts, not just warm and dry ones.
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

type DayWithProvider = { day: ForecastDay; provider: string };

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
  const todaysFromAll: DayWithProvider[] = [];

  for (const forecast of forecasts) {
    const todaysDay = forecast.daily.find((day) => normalizeDate(day.date) === today);
    if (todaysDay) todaysFromAll.push({ day: todaysDay, provider: forecast.provider });
  }

  const temps = todaysFromAll.map((d) => d.day.tempHighF).sort((a, b) => a - b);
  const medianTemp = temps.length > 0 ? temps[Math.floor(temps.length / 2)] : 0;
  const OUTLIER_THRESHOLD = 7;

  const inRange = todaysFromAll.filter(
    ({ day }) => Math.abs(day.tempHighF - medianTemp) <= OUTLIER_THRESHOLD
  );
  const candidates = inRange.length > 0 ? inRange : todaysFromAll;

  let best: DayWithProvider | null = null;
  let bestScore = -Infinity;
  for (const entry of candidates) {
    const score = computeOptimismScore(entry.day);
    if (score > bestScore) {
      best = entry;
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
    daily: best ? [best.day] : [],
    sourceProvider: best?.provider,
  };
}

// Data flow: providers -> filter to today -> drop outliers -> score each -> return highest
