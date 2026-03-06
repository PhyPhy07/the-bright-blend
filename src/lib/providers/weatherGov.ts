import { createForecastDay } from "../utils/forecast";
import type { NormalizedForecast, ForecastDay, WeatherProvider } from "./types";
import { weatherGovShortForecastToIcon } from "@/lib/utils/weatherGovIcons";
import { fetchWithRetry } from "@/lib/utils/fetchWithRetry";

const WEATHER_GOV_BASE = "https://api.weather.gov";
const USER_AGENT = "TheBrightBlend/1.0 (https://github.com/the-bright-blend; contact@example.com)";

interface PointsResponse {
  properties?: {
    forecast?: string;
    relativeLocation?: {
      properties?: { city?: string; state?: string };
    };
  };
}

interface ForecastPeriod {
  name: string;
  startTime: string;
  endTime: string;
  temperature: number;
  temperatureUnit: string;
  shortForecast: string;
  detailedForecast: string;
  probabilityOfPrecipitation?: { value: number | null };
  isDaytime?: boolean;
}

interface ForecastResponse {
  properties?: {
    periods?: ForecastPeriod[];
  };
}

function extractDate(iso: string): string {
  return iso.slice(0, 10);
}

function toFahrenheit(temp: number, unit: string): number {
  return unit === "F" ? temp : Math.round((temp * 9) / 5 + 32);
}

export class WeatherGovProvider implements WeatherProvider {
  name = "Weather.gov";

  async fetchForecast(lat: number, lon: number): Promise<NormalizedForecast> {
    const pointsRes = await fetchWithRetry(
      `${WEATHER_GOV_BASE}/points/${lat.toFixed(4)},${lon.toFixed(4)}`,
      { headers: { "User-Agent": USER_AGENT } }
    );
    if (!pointsRes.ok) throw new Error(`Weather.gov points error: ${pointsRes.status}`);

    const pointsData: PointsResponse = await pointsRes.json();
    const forecastUrl = pointsData.properties?.forecast;
    if (!forecastUrl) throw new Error("Weather.gov did not return forecast URL");

    const city = pointsData.properties?.relativeLocation?.properties?.city ?? "Unknown";
    const state = pointsData.properties?.relativeLocation?.properties?.state ?? "";

    const forecastRes = await fetchWithRetry(forecastUrl, {
      headers: { "User-Agent": USER_AGENT },
    });
    if (!forecastRes.ok) throw new Error(`Weather.gov forecast error: ${forecastRes.status}`);

    const forecastData: ForecastResponse = await forecastRes.json();
    const periods = forecastData.properties?.periods ?? [];
    if (!periods.length) throw new Error("Weather.gov returned no forecast periods");

    const daily: ForecastDay[] = [];
    for (let i = 0; i < periods.length; i += 2) {
      const dayPeriod = periods[i];
      const nightPeriod = periods[i + 1];

      const date = extractDate(dayPeriod.startTime);
      const tempHighF = toFahrenheit(dayPeriod.temperature, dayPeriod.temperatureUnit);
      const tempLowF = nightPeriod
        ? toFahrenheit(nightPeriod.temperature, nightPeriod.temperatureUnit)
        : tempHighF;

      const precipDay = dayPeriod.probabilityOfPrecipitation?.value ?? 0;
      const precipNight = nightPeriod?.probabilityOfPrecipitation?.value ?? 0;
      const precipitationChance = Math.max(precipDay, precipNight);

      const description = dayPeriod.shortForecast;
      const icon = weatherGovShortForecastToIcon(dayPeriod.shortForecast);

      daily.push(
        createForecastDay({
          date,
          tempHighF,
          tempLowF,
          description,
          precipitationChance,
          icon,
        })
      );
    }

    return {
      provider: this.name,
      location: state ? `${city}, ${state}` : city,
      fetchedAt: new Date().toISOString(),
      daily,
    };
  }
}
