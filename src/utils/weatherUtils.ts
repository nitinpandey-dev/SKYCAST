import { format } from 'date-fns';
import { WeatherData, HourlyForecast } from '../types/weather';

/**
 * Open-Meteo WMO Weather interpretation codes
 */
export function getWeatherCondition(code: number, isDay: boolean = true): { description: string, icon: string } {
  switch (code) {
    case 0:
      return { description: 'Clear sky', icon: isDay ? 'Sun' : 'Moon' };
    case 1:
      return { description: 'Mainly clear', icon: isDay ? 'Sun' : 'Moon' };
    case 2:
      return { description: 'Partly cloudy', icon: isDay ? 'CloudSun' : 'CloudMoon' };
    case 3:
      return { description: 'Overcast', icon: 'Cloud' };
    case 45:
    case 48:
      return { description: 'Fog', icon: 'CloudFog' };
    case 51:
    case 53:
    case 55:
      return { description: 'Drizzle', icon: 'CloudDrizzle' };
    case 56:
    case 57:
      return { description: 'Freezing Drizzle', icon: 'CloudSnow' };
    case 61:
    case 63:
    case 65:
      return { description: 'Rain', icon: 'CloudRain' };
    case 66:
    case 67:
      return { description: 'Freezing Rain', icon: 'CloudSnow' };
    case 71:
    case 73:
    case 75:
    case 77:
      return { description: 'Snow', icon: 'Snowflake' };
    case 80:
    case 81:
    case 82:
      return { description: 'Rain Showers', icon: 'CloudRain' };
    case 85:
    case 86:
      return { description: 'Snow Showers', icon: 'CloudSnow' };
    case 95:
      return { description: 'Thunderstorm', icon: 'CloudLightning' };
    case 96:
    case 99:
      return { description: 'Thunderstorm with Hail', icon: 'CloudLightning' };
    default:
      return { description: 'Unknown', icon: 'Cloud' };
  }
}

/**
 * Format a time string (ISO 8601) to a readable hour (e.g. "10 AM")
 */
export function formatHour(isoTime: string): string {
  try {
    return format(new Date(isoTime), 'h a');
  } catch (e) {
    return isoTime;
  }
}

/**
 * Format a date string (ISO 8601) to a readable day (e.g. "Monday")
 */
export function formatDay(isoTime: string): string {
  try {
    return format(new Date(isoTime), 'EEEE');
  } catch (e) {
    return isoTime;
  }
}

export function formatTime(isoTime: string): string {
  try {
    return format(new Date(isoTime), 'h:mm a');
  } catch (e) {
    return isoTime;
  }
}

/**
 * Convert Celsius to Fahrenheit
 */
export function cToF(c: number): number {
  return (c * 9/5) + 32;
}

/**
 * Convert km/h to mph
 */
export function kmhToMph(kmh: number): number {
  return kmh * 0.621371;
}

export function getWindDirection(degrees: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(((degrees %= 360) < 0 ? degrees + 360 : degrees) / 45) % 8;
  return directions[index];
}

/**
 * Get dynamic background gradient classes based on weather and time of day.
 * REDESIGNED: extremely subtle, low-contrast atmospheric tones to support the glass UI.
 */
export function getWeatherBackgroundClass(code: number, isDay: boolean): string {
  const isDark = document.documentElement.classList.contains('dark');
  
  if (isDark) {
    // All dark modes use a deep navy weather-app background gradient resembling a dark evening sky
    if (code <= 1) { // Clear Night
      return 'bg-gradient-to-b from-[#07111F] via-[#0B1728] to-[#0D1B2D]';
    }
    if (code === 2) { // Partly Cloudy Night
      return 'bg-gradient-to-b from-[#060F1D] via-[#0A1525] to-[#0C1728]';
    }
    if (code === 3 || code === 45 || code === 48) { // Cloudy / Fog
      return 'bg-gradient-to-b from-[#050D19] via-[#091220] to-[#0A1523]';
    }
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) { // Rain / Drizzle
      return 'bg-gradient-to-b from-[#040A15] via-[#07101E] to-[#081221]';
    }
    if ((code >= 71 && code <= 77) || code === 85 || code === 86) { // Snow
      return 'bg-gradient-to-b from-[#060E1A] via-[#091523] to-[#0B1A2A]';
    }
    if (code >= 95 && code <= 99) { // Thunderstorm
      return 'bg-gradient-to-b from-[#03070E] via-[#060D19] to-[#07101F]';
    }
    return 'bg-gradient-to-b from-[#07111F] via-[#0B1728] to-[#0D1B2D]';
  } else {
    // Light modes use a soft sky-like base reflecting actual daytime weather
    if (!isDay) {
      return 'bg-gradient-to-b from-[#1E293B] to-[#0F172A]'; // Night uses a dark navy sky
    }
    if (code <= 1) { // Sunny / Clear
      return 'bg-gradient-to-b from-[#DCEBF7] via-[#EAF3FB] to-[#F3F7FA]';
    }
    if (code === 2) { // Partly Cloudy
      return 'bg-gradient-to-b from-[#CFE1F0] via-[#E6F0F8] to-[#EDF3F7]';
    }
    if (code === 3 || code === 45 || code === 48) { // Cloudy / Fog
      return 'bg-gradient-to-b from-[#C4D5E5] via-[#DEE7F0] to-[#E8EEF3]';
    }
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) { // Rain / Drizzle
      return 'bg-gradient-to-b from-[#B8C9D9] via-[#D2DCE6] to-[#DCE2EA]';
    }
    if ((code >= 71 && code <= 77) || code === 85 || code === 86) { // Snow
      return 'bg-gradient-to-b from-[#E2F0FC] via-[#F1F6FC] to-[#F7FAFC]';
    }
    if (code >= 95 && code <= 99) { // Thunderstorm
      return 'bg-gradient-to-b from-[#AABBCB] via-[#C3CFDB] to-[#CED7DF]';
    }
    return 'bg-gradient-to-b from-[#DCEBF7] via-[#EAF3FB] to-[#F3F7FA]';
  }
}

/**
 * Generates a dynamic summary based on real API weather data
 */
export function generateWeatherSummary(data: WeatherData, units: 'metric' | 'imperial'): string {
  const { current, hourly } = data;
  const condition = getWeatherCondition(current.conditionCode, current.isDay).description.toLowerCase();
  
  const sentences: string[] = [];
  
  // 1. Condition
  sentences.push(`${condition.charAt(0).toUpperCase() + condition.slice(1)} conditions are observed currently.`);

  // 2. High Temp Hour
  let maxTemp = -999;
  let maxHourStr = '';
  hourly.slice(0, 12).forEach((hour: HourlyForecast) => {
    if (hour.temperature > maxTemp) {
      maxTemp = hour.temperature;
      maxHourStr = formatHour(hour.time);
    }
  });
  
  if (maxHourStr) {
    const displayMax = Math.round(units === 'imperial' ? cToF(maxTemp) : maxTemp);
    sentences.push(`Temperatures will reach a high of ${displayMax}° around ${maxHourStr}.`);
  }

  // 3. Precipitation Probability
  let peakRainProb = 0;
  let peakRainHour = '';
  hourly.slice(0, 12).forEach((hour: HourlyForecast) => {
    if (hour.precipitationProbability > peakRainProb) {
      peakRainProb = hour.precipitationProbability;
      peakRainHour = formatHour(hour.time);
    }
  });

  if (peakRainProb >= 50 && peakRainHour) {
    sentences.push(`Rain probability peaks at ${peakRainProb}% around ${peakRainHour}.`);
  } else if (peakRainProb > 15) {
    sentences.push(`There is a light ${peakRainProb}% chance of rain expected today.`);
  } else {
    sentences.push(`Expect dry and stable conditions throughout the day.`);
  }

  // 4. Winds
  const displayWind = Math.round(units === 'imperial' ? kmhToMph(current.windSpeed) : current.windSpeed);
  const windUnit = units === 'imperial' ? 'mph' : 'km/h';
  if (current.windSpeed > 20) {
    sentences.push(`Winds will remain brisk at ${displayWind} ${windUnit}.`);
  } else {
    sentences.push(`Winds will remain light and gentle.`);
  }

  return sentences.join(' ');
}

