import { createForecastDay } from "../utils/forecast";
import type { NormalizedForecast, ForecastDay, WeatherProvider } from "./types";
import { wmoCodeToDisplay } from "@/lib/utils/wmoCodes";

const MORNING_BREW_URL =
  process.env.MORNING_BREW_API_URL ??
  "https://weather-ashy-gamma-36.vercel.app/api/forecast";

interface MorningBrewApiDay {
  date: string;
  temperature_max: number;
  temperature_min: number;
  precipitation_probability_max: number;
  weather_description: string;
  weather_code?: number;
}

interface MorningBrewApiResponse {
  location: { name: string; state: string };
  seven_day: MorningBrewApiDay[];
}

export class MorningBrewProvider implements WeatherProvider {
  name = "Morning Brew";

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- lat/lon required by interface; Morning Brew uses fixed location
  async fetchForecast(_lat: number, _lon: number): Promise<NormalizedForecast> {
    const res = await fetch(MORNING_BREW_URL);
    if (!res.ok) throw new Error(`Morning Brew API error: ${res.status}`);

    const data = (await res.json()) as MorningBrewApiResponse;
    const { location, seven_day } = data;

    if (!location?.name || !Array.isArray(seven_day)) {
      throw new Error("Morning Brew API returned invalid or empty forecast");
    }

    const daily: ForecastDay[] = seven_day.map((day: MorningBrewApiDay) => {
      const { icon } = wmoCodeToDisplay(day.weather_code ?? 0);
      return createForecastDay({
        date: day.date,
        tempHighF: day.temperature_max,
        tempLowF: day.temperature_min,
        precipitationChance: day.precipitation_probability_max,
        description: day.weather_description,
        icon,
      });
    });

    return {
      provider: this.name,
      location: `${location.name}, ${location.state}`,
      fetchedAt: new Date().toISOString(),
      daily,
    };
  }
}

