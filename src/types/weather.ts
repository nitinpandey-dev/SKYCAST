export interface Coordinates {
  lat: number;
  lon: number;
}

export interface LocationInfo {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  admin1?: string;
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
  dewPoint: number;
  cloudCover: number;
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  apparentTemperature: number;
  conditionCode: number;
  precipitationProbability: number;
  isDay: boolean;
  humidity: number;
  windSpeed: number;
  windDirection: number;
}

export interface DailyForecast {
  date: string;
  high: number;
  low: number;
  conditionCode: number;
  precipitationProbability: number;
  sunrise: string;
  sunset: string;
  uvIndex: number;
  windSpeedMax: number;
}

export interface WeatherData {
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  location?: LocationInfo;
}

export interface WeatherAlert {
  event: string;
  headline: string;
  description: string;
  severity: string;
  effective: string;
  expires: string;
}

export type UnitSystem = 'metric' | 'imperial';
export type Theme = 'light' | 'dark' | 'system';
