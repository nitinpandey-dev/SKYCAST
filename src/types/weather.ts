export interface Coordinates {
  lat: number;
  lon: number;
}

export interface LocationInfo {
  id: string; // Used as a unique identifier, could be lat,lon
  name: string;
  country: string;
  countryCode: string;
  admin1?: string; // State / Region
  lat: number;
  lon: number;
}

export interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  conditionCode: number;
  isDay: boolean;
  precipitationProbability: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  visibility: number;
  uvIndex: number;
  sunrise: string;
  sunset: string;
  high: number;
  low: number;
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  conditionCode: number;
  precipitationProbability: number;
  isDay: boolean;
}

export interface DailyForecast {
  date: string;
  high: number;
  low: number;
  conditionCode: number;
  precipitationProbability: number;
}

export interface WeatherData {
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  location?: LocationInfo; // For when reverse geocoded
}

export interface WeatherAlert {
  event: string;
  headline: string;
  description: string;
  severity: string;
  effective: string;
  expires: string;
}

// Preference types
export type UnitSystem = 'metric' | 'imperial';
export type Theme = 'light' | 'dark' | 'system';
