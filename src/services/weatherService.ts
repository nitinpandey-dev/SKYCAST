import { WeatherData, LocationInfo, CurrentWeather, HourlyForecast, DailyForecast } from '../types/weather';

const API_BASE = 'https://api.open-meteo.com/v1';
const GEO_API_BASE = 'https://geocoding-api.open-meteo.com/v1';

export async function searchLocations(query: string): Promise<LocationInfo[]> {
  if (!query || query.trim().length < 2) return [];
  
  try {
    const response = await fetch(`${GEO_API_BASE}/search?name=${encodeURIComponent(query)}&count=10&language=en&format=json`);
    if (!response.ok) throw new Error('Failed to fetch locations');
    
    const data = await response.json();
    if (!data.results) return [];
    
    return data.results.map((result: any) => ({
      id: `${result.id}-${result.latitude}-${result.longitude}`,
      name: result.name,
      country: result.country || '',
      countryCode: result.country_code || '',
      admin1: result.admin1 || '',
      lat: result.latitude,
      lon: result.longitude
    }));
  } catch (error) {
    console.error("Error searching locations:", error);
    throw error;
  }
}

export async function reverseGeocode(lat: number, lon: number): Promise<LocationInfo | null> {
  try {
    const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
    if (!response.ok) throw new Error('Failed to reverse geocode');
    
    const data = await response.json();
    return {
      id: `curr-${lat}-${lon}`,
      name: data.city || data.locality || data.principalSubdivision || 'Current Location',
      country: data.countryName || '',
      countryCode: data.countryCode || '',
      admin1: data.principalSubdivision || '',
      lat,
      lon
    };
  } catch (error) {
    console.error("Error reverse geocoding:", error);
    return {
      id: `curr-${lat}-${lon}`,
      name: 'Current Location',
      country: '',
      countryCode: '',
      lat,
      lon
    };
  }
}

export async function getWeatherData(lat: number, lon: number): Promise<WeatherData> {
  try {
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lon.toString(),
      current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation_probability,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m',
      hourly: 'temperature_2m,apparent_temperature,precipitation_probability,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,is_day',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max,uv_index_max,wind_speed_10m_max',
      timezone: 'auto'
    });

    const response = await fetch(`${API_BASE}/forecast?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Weather API returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Parse current weather
    const current: CurrentWeather = {
      temperature: data.current.temperature_2m,
      apparentTemperature: data.current.apparent_temperature,
      conditionCode: data.current.weather_code,
      isDay: data.current.is_day === 1,
      precipitationProbability: data.current.precipitation_probability || 0,
      humidity: data.current.relative_humidity_2m,
      windSpeed: data.current.wind_speed_10m,
      windDirection: data.current.wind_direction_10m,
      pressure: data.current.surface_pressure,
      visibility: 10, // Default visibility mapping
      uvIndex: data.daily.uv_index_max[0] || 0,
      sunrise: data.daily.sunrise[0],
      sunset: data.daily.sunset[0],
      high: data.daily.temperature_2m_max[0],
      low: data.daily.temperature_2m_min[0],
    };

    // Parse hourly forecast (next 24 hours)
    const currentHourIndex = data.hourly.time.findIndex((t: string) => new Date(t) > new Date()) - 1;
    const startIndex = Math.max(0, currentHourIndex);
    const hourly: HourlyForecast[] = [];
    
    for (let i = startIndex; i < startIndex + 24 && i < data.hourly.time.length; i++) {
      hourly.push({
        time: data.hourly.time[i],
        temperature: data.hourly.temperature_2m[i],
        apparentTemperature: data.hourly.apparent_temperature[i],
        conditionCode: data.hourly.weather_code[i],
        precipitationProbability: data.hourly.precipitation_probability[i],
        isDay: data.hourly.is_day[i] === 1,
        humidity: data.hourly.relative_humidity_2m[i],
        windSpeed: data.hourly.wind_speed_10m[i],
        windDirection: data.hourly.wind_direction_10m[i]
      });
    }

    // Parse daily forecast (7 days)
    const daily: DailyForecast[] = [];
    for (let i = 0; i < data.daily.time.length; i++) {
      daily.push({
        date: data.daily.time[i],
        high: data.daily.temperature_2m_max[i],
        low: data.daily.temperature_2m_min[i],
        conditionCode: data.daily.weather_code[i],
        precipitationProbability: data.daily.precipitation_probability_max[i],
        sunrise: data.daily.sunrise[i],
        sunset: data.daily.sunset[i],
        uvIndex: data.daily.uv_index_max[i] || 0,
        windSpeedMax: data.daily.wind_speed_10m_max[i] || 0
      });
    }

    return {
      current,
      hourly,
      daily
    };
  } catch (error) {
    console.error("Error fetching weather data:", error);
    throw error;
  }
}
