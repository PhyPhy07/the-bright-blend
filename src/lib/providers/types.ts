export interface ForecastDay {
  date: string;
  tempHighF: number;
  tempLowF: number;
  description: string;
  precipitationChance: number;
  icon?: WeatherIcon;
}
  //
  export interface NormalizedForecast {
    provider: string;
    location: string;
    fetchedAt: string;
    daily: ForecastDay[];
  }
  //keeping same interface for consistency & future proofing even if morning brew doesnt currently support lat and lon
  //The contract is about the call shape and return type, not about how each provider uses the arguments.
  export interface WeatherProvider {
    name: string;
    fetchForecast(lat: number, lon: number): Promise<NormalizedForecast>;
  }

  // icons for consistency across providers
export type WeatherIcon =
  | "clear-day"
  | "clear-night"
  | "partly-cloudy-day"
  | "partly-cloudy-night"
  | "cloudy"
  | "fog"
  | "rain"
  | "snow"
  | "sleet"
  | "thunder-rain"
  | "wind";