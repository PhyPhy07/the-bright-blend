import type { NormalizedForecast, ForecastDay, WeatherProvider } from "./types";
import { wmoCodeToDescription } from "@/lib/utils/wmo-codes";

const OPEN_METEO_BASE = "https://api.open-meteo.com/v1/forecast";

interface OpenMeteoResponse {
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    weathercode: number[];
  };
}

export class OpenMeteoProvider implements WeatherProvider {
  name = "Open-Meteo";

  async fetchForecast(lat: number, lon: number): Promise<NormalizedForecast> {
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lon.toString(),
      daily:
        "temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode",
      temperature_unit: "fahrenheit",
      timezone: "America/New_York",
    });

    const res = await fetch(`${OPEN_METEO_BASE}?${params}`);
    if (!res.ok) throw new Error(`Open-Meteo API error: ${res.status}`);

    const data: OpenMeteoResponse = await res.json();
    const { daily } = data;

    const dailyForecasts: ForecastDay[] = daily.time.map((date, i) => ({
      date,
      tempHighF: daily.temperature_2m_max[i],
      tempLowF: daily.temperature_2m_min[i],
      precipitationChance: daily.precipitation_probability_max[i],
      description: wmoCodeToDescription(daily.weathercode[i]),
      icon: daily.weathercode[i].toString(),
    }));

    return {
      provider: this.name,
      location: "New York",
      fetchedAt: new Date().toISOString(),
      daily: dailyForecasts,
    };
  }
}
