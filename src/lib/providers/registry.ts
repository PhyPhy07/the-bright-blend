import type { WeatherProvider } from "./types";
import { OpenMeteoProvider } from "./open-meteo";
import { PirateWeatherProvider } from "./pirate-weather";
import { MorningBrewProvider } from "./morning-brew";

export function getProviders(): WeatherProvider[] {
  return [
    new OpenMeteoProvider(),
    new PirateWeatherProvider(),
    new MorningBrewProvider(),
  ];
}
