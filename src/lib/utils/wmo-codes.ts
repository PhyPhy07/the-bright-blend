import type { WeatherIcon } from "@/lib/providers/types";

/** O(1) lookup by WMO code. @see https://open-meteo.com/en/docs#weathervariables */
const WMO: Record<number, { description: string; icon: WeatherIcon }> = {
  0: { description: "Clear sky", icon: "clear-day" },
  1: { description: "Mainly clear", icon: "partly-cloudy-day" },
  2: { description: "Partly cloudy", icon: "partly-cloudy-day" },
  3: { description: "Overcast", icon: "cloudy" },
  45: { description: "Fog", icon: "fog" },
  48: { description: "Depositing rime fog", icon: "fog" },
  51: { description: "Light drizzle", icon: "rain" },
  53: { description: "Moderate drizzle", icon: "rain" },
  55: { description: "Dense drizzle", icon: "rain" },
  61: { description: "Slight rain", icon: "rain" },
  63: { description: "Moderate rain", icon: "rain" },
  65: { description: "Heavy rain", icon: "rain" },
  71: { description: "Slight snowfall", icon: "snow" },
  73: { description: "Moderate snowfall", icon: "snow" },
  75: { description: "Heavy snowfall", icon: "snow" },
  77: { description: "Snow grains", icon: "snow" },
  80: { description: "Slight rain showers", icon: "rain" },
  81: { description: "Moderate rain showers", icon: "rain" },
  82: { description: "Violent rain showers", icon: "rain" },
  85: { description: "Slight snow showers", icon: "snow" },
  86: { description: "Heavy snow showers", icon: "snow" },
  95: { description: "Thunderstorm", icon: "thunder-rain" },
  96: { description: "Thunderstorm with slight hail", icon: "thunder-rain" },
  99: { description: "Thunderstorm with heavy hail", icon: "thunder-rain" },
};

const unknownFallback = { description: "Unknown", icon: "cloudy" as WeatherIcon };

export function wmoCodeToDisplay(code: number): {
  description: string;
  icon: WeatherIcon;
} {
  return WMO[code] ?? unknownFallback;
}

/** Validates and normalizes a string to a WeatherIcon. Falls back to "cloudy" for unknown values. */
export function toWeatherIcon(value: string | undefined): WeatherIcon {
  const valid = new Set<WeatherIcon>([
    "clear-day",
    "clear-night",
    "partly-cloudy-day",
    "partly-cloudy-night",
    "cloudy",
    "fog",
    "rain",
    "snow",
    "sleet",
    "thunder-rain",
    "wind",
  ]);
  const normalized = value === "thunderstorm" ? "thunder-rain" : value;
  return (normalized && valid.has(normalized as WeatherIcon))
    ? (normalized as WeatherIcon)
    : "cloudy" as WeatherIcon;
}
  