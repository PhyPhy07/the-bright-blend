import { createForecastDay } from "../utils/forecast";
import type { NormalizedForecast, ForecastDay, WeatherProvider } from "./types";
import { wmoCodeToDisplay } from "@/lib/utils/wmoCodes";

const OPEN_METEO_BASE = "https://api.open-meteo.com/v1/forecast";
//open meteo api response type
interface OpenMeteoResponse {
  daily?: {
    time?: string[];
    temperature_2m_max?: (number | null)[];
    temperature_2m_min?: (number | null)[];
    precipitation_probability_max?: (number | null)[];
    weathercode?: (number | null)[];
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
      timezone: "auto",
    });

    const res = await fetch(`${OPEN_METEO_BASE}?${params}`);
    if (!res.ok) throw new Error(`Open-Meteo API error: ${res.status}`);

    const data = (await res.json()) as OpenMeteoResponse;
    const daily = data.daily;

    if (!daily?.time?.length) {
      throw new Error("Open-Meteo API returned invalid or empty daily forecast");
    }

    const times = daily.time;
    const tempMax = daily.temperature_2m_max ?? [];
    const tempMin = daily.temperature_2m_min ?? [];
    const precipProb = daily.precipitation_probability_max ?? [];
    const weathercodes = daily.weathercode ?? [];

    const expectedLength = times.length;
    if (
      tempMax.length !== expectedLength ||
      tempMin.length !== expectedLength ||
      precipProb.length !== expectedLength ||
      weathercodes.length !== expectedLength
    ) {
      throw new Error("Open-Meteo API returned misaligned arrays");
    }
    const dailyForecasts: ForecastDay[] = times.map((date, i) => {
      const code = weathercodes[i] ?? 0;
      const { description, icon } = wmoCodeToDisplay(code);
      return createForecastDay({
        date,
        tempHighF: tempMax[i] ?? 0,
        tempLowF: tempMin[i] ?? 0,
        precipitationChance: precipProb[i] ?? 0,
        description,
        icon,
      });
    });

    return {
      provider: this.name,
      location: "New York",
      fetchedAt: new Date().toISOString(),
      daily: dailyForecasts,
    };
  }
}
