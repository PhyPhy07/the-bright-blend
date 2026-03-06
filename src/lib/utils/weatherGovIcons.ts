import type { WeatherIcon } from "@/lib/providers/types";

/** Maps Weather.gov shortForecast strings to our WeatherIcon. Case-insensitive partial match. */
export function weatherGovShortForecastToIcon(shortForecast: string | undefined): WeatherIcon {
  const s = (shortForecast ?? "").toLowerCase();
  if (s.includes("thunder")) return "thunder-rain";
  if (s.includes("snow")) return "snow";
  if (s.includes("sleet") || s.includes("freezing rain")) return "sleet";
  if (s.includes("rain") || s.includes("drizzle") || s.includes("showers")) return "rain";
  if (s.includes("fog") || s.includes("mist")) return "fog";
  if (s.includes("wind")) return "wind";
  if (s.includes("clear") && !s.includes("cloud")) return "clear-day";
  if (s.includes("partly cloudy") || s.includes("mostly clear")) return "partly-cloudy-day";
  if (s.includes("cloudy") || s.includes("overcast")) return "cloudy";
  return "cloudy";
}
