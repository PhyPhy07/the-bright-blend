import type { NormalizedForecast, ForecastDay, WeatherProvider } from "./types";

const MORNING_BREW_URL =
  "https://weather-ashy-gamma-36.vercel.app/api/forecast";

export class MorningBrewProvider implements WeatherProvider {
  name = "Morning Brew";

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
      }) => ({
        date: day.date,
        tempHighF: day.temperature_max,
        tempLowF: day.temperature_min,
        precipitationChance: day.precipitation_probability_max,
        description: day.weather_description,
        icon: day.weather_code?.toString(),
      })
    );

    return {
      provider: this.name,
      location: `${location.name}, ${location.state}`,
      fetchedAt: new Date().toISOString(),
      daily,
    };
  }
}
