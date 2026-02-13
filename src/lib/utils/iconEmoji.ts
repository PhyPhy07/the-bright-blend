import React from "react";
import type { WeatherIcon } from "@/lib/providers/types";
import {
  WiDaySunny,
  WiNightClear,
  WiDayCloudy,
  WiNightCloudy,
  WiCloudy,
  WiFog,
  WiRain,
  WiSnow,
  WiSleet,
  WiThunderstorm,
  WiWindy,
} from "react-icons/wi";

const ICONS: Record<WeatherIcon, React.ComponentType> = {
  "clear-day": WiDaySunny,
  "clear-night": WiNightClear,
  "partly-cloudy-day": WiDayCloudy,
  "partly-cloudy-night": WiNightCloudy,
  cloudy: WiCloudy,
  fog: WiFog,
  rain: WiRain,
  snow: WiSnow,
  sleet: WiSleet,
  "thunder-rain": WiThunderstorm,
  wind: WiWindy,
};

export function iconToEmoji(icon: WeatherIcon): React.ReactNode {
  const Icon = ICONS[icon] ?? WiCloudy;
  return React.createElement(Icon);
}
