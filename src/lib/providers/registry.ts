import type { WeatherProvider } from "./types";
import { MorningBrewProvider } from "./morningBrew";
import { OpenMeteoProvider } from "./openMeteo";
import { PirateWeatherProvider } from "./pirateWeather";

export function getProviders(): WeatherProvider[] {
  return [
    new OpenMeteoProvider(),
    new PirateWeatherProvider(),
    new MorningBrewProvider(),
  ];
}
