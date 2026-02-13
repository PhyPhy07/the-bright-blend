import type { WeatherProvider } from "./types";
import { OpenMeteoProvider } from "./openMeteo";
import { PirateWeatherProvider } from "./pirateWeather";
import { MorningBrewProvider } from "./morningBrew";

//single source of truth for all weather providers, future proofing for new providers 
export function getProviders(): WeatherProvider[] {
  return [
    new OpenMeteoProvider(),
    new PirateWeatherProvider(),
    new MorningBrewProvider(),
  ];
}
