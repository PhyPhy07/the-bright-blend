import { fetchWithRetry } from "@/lib/utils/fetchWithRetry";

const OPEN_METEO_BASE = "https://api.open-meteo.com/v1/forecast";

export interface WeatherFactors {
  pressureHpa: number;
  humidityPct: number;
  windSpeedMph: number;
  tempHighF: number;
  tempLowF: number;
  precipitationChance: number;
  /** Yesterday's pressure for change comparison (hPa) */
  previousPressureHpa?: number;
}

interface OpenMeteoFactorsResponse {
  daily?: {
    time?: string[];
    pressure_msl_mean?: (number | null)[];
    surface_pressure_mean?: (number | null)[];
    relative_humidity_2m_mean?: (number | null)[];
    windspeed_10m_max?: (number | null)[];
    temperature_2m_max?: (number | null)[];
    temperature_2m_min?: (number | null)[];
    precipitation_probability_max?: (number | null)[];
  };
}

function getTodayDate(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
}

export async function fetchWeatherFactors(lat: number, lon: number): Promise<WeatherFactors | null> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    daily:
      "pressure_msl_mean,surface_pressure_mean,relative_humidity_2m_mean,windspeed_10m_max,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
    temperature_unit: "fahrenheit",
    timezone: "America/New_York",
    past_days: "1",
  });

  const res = await fetchWithRetry(`${OPEN_METEO_BASE}?${params}`);
  if (!res.ok) return null;

  const data = (await res.json()) as OpenMeteoFactorsResponse;
  const daily = data.daily;
  if (!daily?.time?.length) return null;

  const today = getTodayDate();
  const idx = daily.time.findIndex((d) => d?.startsWith(today));
  if (idx < 0) return null;

  const pressure = daily.pressure_msl_mean?.[idx] ?? daily.surface_pressure_mean?.[idx] ?? 0;
  const prevPressure = idx > 0
    ? (daily.pressure_msl_mean?.[idx - 1] ?? daily.surface_pressure_mean?.[idx - 1])
    : undefined;
  const humidity = daily.relative_humidity_2m_mean?.[idx] ?? 0;
  const windRaw = daily.windspeed_10m_max?.[idx] ?? 0;
  const windMph = windRaw > 50 ? Math.round(windRaw * 0.621371) : Math.round(windRaw);
  const tempHigh = daily.temperature_2m_max?.[idx] ?? 0;
  const tempLow = daily.temperature_2m_min?.[idx] ?? 0;
  const precip = daily.precipitation_probability_max?.[idx] ?? 0;

  return {
    pressureHpa: Math.round(pressure),
    humidityPct: Math.round(humidity),
    windSpeedMph: windMph,
    tempHighF: Math.round(tempHigh),
    tempLowF: Math.round(tempLow),
    precipitationChance: Math.round(precip),
    previousPressureHpa: prevPressure != null ? Math.round(prevPressure) : undefined,
  };
}

/** Low pressure (hPa) - stormy weather, affects arthritis/sinus */
const LOW_PRESSURE_THRESHOLD = 1010;

/** High humidity threshold (%) - use mean not max; max often 90%+ at dawn */
const HIGH_HUMIDITY_THRESHOLD = 80;

/** Cold temp threshold (°F) */
const COLD_TEMP_THRESHOLD = 45;

/** High wind threshold (mph) - spreads allergens */
const HIGH_WIND_THRESHOLD = 15;

/** Large temp swing (°F) */
const TEMP_SWING_THRESHOLD = 15;

export interface FactorInsight {
  id: string;
  condition: "sinus" | "arthritis";
  factor: string;
  impact: string;
  level: "high" | "moderate" | "low" | "minimal";
}

export function getFactorInsights(factors: WeatherFactors): FactorInsight[] {
  const insights: FactorInsight[] = [];
  const tempSwing = factors.tempHighF - factors.tempLowF;

  if (factors.pressureHpa > 0 && factors.pressureHpa < LOW_PRESSURE_THRESHOLD) {
    insights.push({
      id: "pressure-sinus",
      condition: "sinus",
      factor: "Low barometric pressure",
      impact: "Triggers sinus pressure & headaches",
      level: "high",
    });
    insights.push({
      id: "pressure-arthritis",
      condition: "arthritis",
      factor: "Low barometric pressure",
      impact: "Joint inflammation & pain",
      level: "high",
    });
  }

  if (factors.humidityPct >= HIGH_HUMIDITY_THRESHOLD) {
    const level = factors.humidityPct >= 95 ? "high" : "moderate";
    insights.push({
      id: "humidity-sinus",
      condition: "sinus",
      factor: "High humidity",
      impact: "Increases congestion",
      level,
    });
    insights.push({
      id: "humidity-arthritis",
      condition: "arthritis",
      factor: "High humidity",
      impact: "Worsens joint aches",
      level,
    });
  }

  if (factors.tempLowF < COLD_TEMP_THRESHOLD) {
    insights.push({
      id: "cold-sinus",
      condition: "sinus",
      factor: "Cold dry air",
      impact: "Irritates nasal passages",
      level: "moderate",
    });
    insights.push({
      id: "cold-arthritis",
      condition: "arthritis",
      factor: "Cold temperatures",
      impact: "Stiffness increases",
      level: "moderate",
    });
  }

  if (factors.precipitationChance >= 50) {
    insights.push({
      id: "rain-arthritis",
      condition: "arthritis",
      factor: "Rain approaching",
      impact: "Pressure drop triggers flare-ups",
      level: "moderate",
    });
  }

  if (tempSwing >= TEMP_SWING_THRESHOLD) {
    insights.push({
      id: "swing-arthritis",
      condition: "arthritis",
      factor: "Temperature swings",
      impact: "Rapid changes cause flare-ups",
      level: "moderate",
    });
  }

  if (factors.windSpeedMph >= HIGH_WIND_THRESHOLD) {
    insights.push({
      id: "wind-sinus",
      condition: "sinus",
      factor: "Wind",
      impact: "Spreads allergens",
      level: "moderate",
    });
  }

  return insights;
}

export type RiskLevel = "Low" | "Moderate" | "High";

export function getSinusRisk(factors: WeatherFactors): RiskLevel {
  const insights = getFactorInsights(factors).filter((i) => i.condition === "sinus");
  const highCount = insights.filter((i) => i.level === "high").length;
  const modCount = insights.filter((i) => i.level === "moderate").length;
  if (highCount >= 1 || modCount >= 2) return "High";
  if (modCount >= 1) return "Moderate";
  return "Low";
}

export function getArthritisRisk(factors: WeatherFactors): RiskLevel {
  const insights = getFactorInsights(factors).filter((i) => i.condition === "arthritis");
  const highCount = insights.filter((i) => i.level === "high").length;
  const modCount = insights.filter((i) => i.level === "moderate").length;
  if (highCount >= 1 || modCount >= 2) return "High";
  if (modCount >= 1) return "Moderate";
  return "Low";
}

export function getPressureChangeLabel(factors: WeatherFactors): string {
  const prev = factors.previousPressureHpa;
  if (prev == null) return "Stable";
  const diff = factors.pressureHpa - prev;
  if (diff <= -5) return "Dropping — heads up!";
  if (diff >= 5) return "Rising";
  return "Stable";
}

export function getWeatherScore(factors: WeatherFactors): { score: number; label: string } {
  let score = 5;
  if (factors.tempHighF >= 65 && factors.tempHighF <= 80) score += 2;
  else if (factors.tempHighF >= 55 && factors.tempHighF <= 90) score += 1;
  if (factors.precipitationChance <= 20) score += 2;
  else if (factors.precipitationChance <= 50) score += 1;
  if (factors.pressureHpa >= 1015) score += 1;
  if (factors.humidityPct < 80) score += 0.5;
  const final = Math.min(10, Math.max(0, Math.round(score)));
  const labels: Record<number, string> = {
    9: "Excellent",
    8: "Great Day",
    7: "Good",
    6: "Nice",
    5: "Moderate",
    4: "Fair",
    3: "Challenging",
    2: "Tough",
    1: "Rough",
    0: "Difficult",
  };
  return { score: final, label: labels[final] ?? "Moderate" };
}
