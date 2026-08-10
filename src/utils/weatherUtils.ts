import { format } from 'date-fns';

/**
 * Open-Meteo WMO Weather interpretation codes
 */
export function getWeatherCondition(code: number, isDay: boolean = true): { description: string, icon: string } {
  // Map WMO codes to descriptions and Lucide icon names (we'll map these to actual icons in components)
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
 * Ensures the app "subtly responds to weather conditions".
 */
export function getWeatherBackgroundClass(code: number, isDay: boolean): string {
  const isDark = document.documentElement.classList.contains('dark');
  
  // Sunny
  if (code <= 1) {
    return isDark 
      ? (isDay ? 'bg-gradient-to-br from-blue-900 to-indigo-950' : 'bg-gradient-to-br from-slate-900 to-black')
      : (isDay ? 'bg-gradient-to-br from-blue-100 to-indigo-50' : 'bg-gradient-to-br from-indigo-900 to-slate-900 text-white');
  }
  // Cloudy
  if (code <= 3 || code === 45 || code === 48) {
    return isDark
      ? 'bg-gradient-to-br from-gray-800 to-slate-950'
      : 'bg-gradient-to-br from-slate-100 to-gray-200';
  }
  // Rain
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    return isDark
      ? 'bg-gradient-to-br from-slate-800 to-slate-950'
      : 'bg-gradient-to-br from-slate-200 to-blue-200';
  }
  // Snow
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
    return isDark
      ? 'bg-gradient-to-br from-slate-700 to-slate-950'
      : 'bg-gradient-to-br from-slate-100 to-blue-100';
  }
  // Thunder
  if (code >= 95) {
    return isDark
      ? 'bg-gradient-to-br from-slate-900 to-slate-950'
      : 'bg-gradient-to-br from-slate-300 to-slate-400';
  }
  
  return isDark ? 'bg-gradient-to-br from-slate-900 to-black' : 'bg-gradient-to-br from-slate-50 to-slate-100';
}
