export interface ForecastDay {
    date: string;
    tempHighF: number;
    tempLowF: number;
    description: string;
    precipitationChance: number;
    icon?: string;
  }
  
  export interface NormalizedForecast {
    provider: string;
    location: string;
    fetchedAt: string;
    daily: ForecastDay[];
  }
  //keeping same interface for consistency & future proofing even if morning brew doesnt currently support lat and lon
  export interface WeatherProvider {
    name: string;
    fetchForecast(lat: number, lon: number): Promise<NormalizedForecast>;
  }