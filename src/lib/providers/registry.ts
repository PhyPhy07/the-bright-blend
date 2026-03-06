import type { WeatherProvider } from "./types";
import { OpenMeteoProvider } from "./openMeteo";
import { PirateWeatherProvider } from "./pirateWeather";
import { WeatherGovProvider } from "./weatherGov";

export function getProviders(): WeatherProvider[] {
  return [
    new OpenMeteoProvider(),
    new PirateWeatherProvider(),
    new WeatherGovProvider(),
  ];
}
