import type { ForecastDay, WeatherIcon } from "@/lib/providers/types";

export function createForecastDay(input: {
  date: string;
  tempHighF?: number;
  tempLowF?: number;
  description?: string;
  precipitationChance?: number;
  icon?: WeatherIcon;
}): ForecastDay {
  return {
    date: input.date,
    tempHighF: input.tempHighF ?? 0,
    tempLowF: input.tempLowF ?? 0,
    description: input.description ?? "",
    precipitationChance: input.precipitationChance ?? 0,
    ...(input.icon && { icon: input.icon }),
  };
}
//centralized function for creating forecast days, ensures consistency across providers and future proofing for new fields