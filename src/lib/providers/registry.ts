import type { WeatherProvider } from "./types";
import { OpenMeteoProvider } from "./open-meteo";
import { PirateWeatherProvider } from "./pirate-weather";
import { MorningBrewProvider } from "./morning-brew";

//single source of truth for all weather providers, future proofing for new providers 
export function getProviders(): WeatherProvider[] {
  return [
    new OpenMeteoProvider(),
    new PirateWeatherProvider(),
    new MorningBrewProvider(),
  ];
}
