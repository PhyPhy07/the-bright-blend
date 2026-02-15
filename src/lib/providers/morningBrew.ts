import { createForecastDay } from "../utils/forecast";
import type { NormalizedForecast, ForecastDay, WeatherProvider } from "./types";
import { wmoCodeToDisplay } from "@/lib/utils/wmoCodes";

const MORNING_BREW_URL =
  process.env.MORNING_BREW_API_URL ??
  "https://weather-ashy-gamma-36.vercel.app/api/forecast";

export class MorningBrewProvider implements WeatherProvider {
  name = "Morning Brew";

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- lat/lon required by interface; Morning Brew uses fixed location
  async fetchForecast(_lat: number, _lon: number): Promise<NormalizedForecast> {
    const res = await fetch(MORNING_BREW_URL);
    if (!res.ok) throw new Error(`Morning Brew API error: ${res.status}`);

    const data = await res.json();
    const { location, seven_day } = data;

    const daily: ForecastDay[] = seven_day.map(
      (day: {
        date: string;
        temperature_max: number;
        temperature_min: number;
        precipitation_probability_max: number;
        weather_description: string;
        weather_code?: number;
      }) => {
        const { icon } = wmoCodeToDisplay(day.weather_code ?? 0);
        return createForecastDay({
          date: day.date,
          tempHighF: day.temperature_max,
          tempLowF: day.temperature_min,
          precipitationChance: day.precipitation_probability_max,
          description: day.weather_description,
          icon,
        });
      }
    );

    return {
      provider: this.name,
      location: `${location.name}, ${location.state}`,
      fetchedAt: new Date().toISOString(),
      daily,
    };
  }
}

// TODO: Caching – Each call hits the API. If fetchForecast runs often, adding a short-lived cache (or memoization) would reduce redundant requests.
//Response typing – The API response shape is typed inline in the callback. A shared interface (e.g. MorningBrewApiDay) would improve reuse and type safety.
//  Runtime crashes from bad API data
// With no validation:
// seven_day is undefined or null → seven_day.map throws (Cannot read property 'map' of undefined)
// location is undefined → location.name throws
// seven_day is not an array → .map throws
// If the API changes its shape or returns an error body, the code will crash instead of failing safely.
// Invalid JSON
// await res.json() throws if the response body is not valid JSON (e.g. HTML error page, partial response). That error is not handled, so it propagates up uncaught.
