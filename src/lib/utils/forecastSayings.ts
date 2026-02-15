import type { WeatherIcon } from "@/lib/providers/types";

const SAYINGS: Record<WeatherIcon, string> = {
  "clear-day": "Hope with a high UV index",
  "clear-night": "Serotonin levels rising through the evening",
  "partly-cloudy-day": "Partly cloudy, fully caffeinated",
  "partly-cloudy-night": "Cloudy with a Chance of Couch",
  cloudy: "Overcast, yet overachieving",
  fog: "Foggy - Somewhere between a dream and a drive to work",
  rain: "Rain check on everything except ambition",
  snow: "Snowy - The kind of day that justifies a third coffee",
  sleet: "Sleet — Because the sky couldn't commit either",
  "thunder-rain": "The sky woke up and chose chaos,  we chose clarity",
  wind: "Sunrise energy that doesn't quit",
};

export function getForecastSaying(icon?: WeatherIcon): string {
  return (icon && SAYINGS[icon]) ?? "Warm front of unexpected good news";
}
