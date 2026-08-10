import { useState, useCallback, useEffect } from 'react';
import { WeatherData, LocationInfo } from '../types/weather';
import { getWeatherData } from '../services/weatherService';

interface WeatherState {
  data: WeatherData | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export function useWeather(location: LocationInfo | null) {
  const [state, setState] = useState<WeatherState>({
    data: null,
    loading: false,
    error: null,
    lastUpdated: null,
  });

  const fetchWeather = useCallback(async (loc: LocationInfo, showLoading = true) => {
    if (showLoading) {
      setState(prev => ({ ...prev, loading: true, error: null }));
    }
    
    try {
      const data = await getWeatherData(loc.lat, loc.lon);
      data.location = loc; // Attach the location info
      
      setState({
        data,
        loading: false,
        error: null,
        lastUpdated: new Date()
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to fetch weather data. Please try again later.'
      }));
    }
  }, []);

  const refreshWeather = useCallback(() => {
    if (location) {
      fetchWeather(location, false);
    }
  }, [location, fetchWeather]);

  useEffect(() => {
    if (location) {
      fetchWeather(location);
    }
  }, [location, fetchWeather]);

  return { ...state, refreshWeather };
}
