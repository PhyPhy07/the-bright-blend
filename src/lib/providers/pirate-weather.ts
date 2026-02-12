import type { NormalizedForecast, ForecastDay, WeatherProvider } from "./types";

interface PirateWeatherDailyData {
  time: number;
  summary: string;
  icon: string;
  temperatureHigh?: number;
  temperatureMax?: number;
  temperatureLow?: number;
  temperatureMin?: number;
  precipProbability: number;
}

interface PirateWeatherResponse {
  daily: {
    data: PirateWeatherDailyData[];
  };
}

function unixToDateString(unix: number): string {
  return new Date(unix * 1000).toISOString().slice(0, 10);
}

export class PirateWeatherProvider implements WeatherProvider {
  name = "Pirate Weather";

  async fetchForecast(lat: number, lon: number): Promise<NormalizedForecast> {
    const apiKey = process.env.PIRATE_WEATHER_API_KEY;
    if (!apiKey) throw new Error("PIRATE_WEATHER_API_KEY is not set");

    const url = `https://api.pirateweather.net/forecast/${apiKey}/${lat},${lon}?units=us`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Pirate Weather API error: ${res.status}`);

    const data: PirateWeatherResponse = await res.json();
    const days = data.daily?.data ?? [];

    const daily: ForecastDay[] = days.map((day) => {
      const tempHigh = day.temperatureHigh ?? day.temperatureMax ?? 0;
      const tempLow = day.temperatureLow ?? day.temperatureMin ?? 0;
      const precipPct = Math.round(day.precipProbability * 100);

      return {
        date: unixToDateString(day.time),
        tempHighF: tempHigh,
        tempLowF: tempLow,
        description: day.summary,
        precipitationChance: precipPct,
        icon: day.icon,
      };
    });

    return {
      provider: this.name,
      location: "New York",
      fetchedAt: new Date().toISOString(),
      daily,
    };
  }
}
