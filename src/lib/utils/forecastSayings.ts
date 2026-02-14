import type { WeatherIcon } from "@/lib/providers/types";

const SAYINGS: Record<WeatherIcon, string> = {
  "clear-day": "Hope with a High UV Index",
  "clear-night": "Serotonin Levels Rising Through the Evening",
  "partly-cloudy-day": "Partly Cloudy, Fully Caffeinated",
  "partly-cloudy-night": "Cloudy with a Chance of Couch",
  cloudy: "Overcast, Yet Overachieving",
  fog: "Foggy - Somewhere Between a Dream and a Drive to Work.",
  rain: "Rain Check on Everything Except Ambition",
  snow: "Snowy - The Kind of Day That Justifies a Third Coffee",
  sleet: "Sleet — Because the Sky Couldn't Commit Either",
  "thunder-rain": "The Sky Woke Up and Chose Chaos,  We Chose Clarity",
  wind: "Sunrise Energy That Doesn't Quit",
};

export function getForecastSaying(icon?: WeatherIcon): string {
  return (icon && SAYINGS[icon]) ?? "Warm Front of Unexpected Good News";
}
