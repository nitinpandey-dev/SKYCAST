import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '../components/Header';
import { CurrentWeather } from '../components/CurrentWeather';
import { HourlyForecastComponent } from '../components/HourlyForecast';
import { DailyForecastComponent } from '../components/DailyForecast';
import { WeatherDetails } from '../components/WeatherDetails';
import { WeatherMap } from '../components/WeatherMap';
import { FavoriteLocations } from '../components/FavoriteLocations';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useWeather } from '../hooks/useWeather';
import { useGeolocation } from '../hooks/useGeolocation';
import { LocationInfo } from '../types/weather';
import { searchLocations } from '../services/weatherService';
import { getWeatherBackgroundClass } from '../utils/weatherUtils';
import { CloudOff } from 'lucide-react';

// A sensible default if geolocation is denied and no location is specified
const DEFAULT_LOCATION: LocationInfo = {
  id: 'default',
  name: 'New York',
  country: 'United States',
  countryCode: 'US',
  admin1: 'New York',
  lat: 40.71427,
  lon: -74.00597
};

export function Home() {
  const { locationName } = useParams();
  const navigate = useNavigate();
  const { requestLocation, loading: geoLoading } = useGeolocation();
  
  const [activeLocation, setActiveLocation] = useState<LocationInfo | null>(null);
  const [initLoading, setInitLoading] = useState(true);
  
  const { data, loading: weatherLoading, error, refreshWeather } = useWeather(activeLocation);

  // Initial load logic
  useEffect(() => {
    let mounted = true;
    
    async function initialize() {
      if (locationName) {
        // We have a URL param, let's search for it
        try {
          // If we stored lat/lon in URL, we could parse it, but for clean URLs (/weather/lucknow)
          // we do a search and pick the first one.
          const results = await searchLocations(locationName);
          if (results.length > 0 && mounted) {
            setActiveLocation(results[0]);
          } else if (mounted) {
            setActiveLocation(DEFAULT_LOCATION);
          }
        } catch (e) {
          if (mounted) setActiveLocation(DEFAULT_LOCATION);
        }
      } else {
        // No URL param, try geolocation
        const loc = await requestLocation();
        if (mounted) {
          if (loc) {
            setActiveLocation(loc);
            // Replace URL to reflect current location (slugified)
            navigate(`/weather/${encodeURIComponent(loc.name.toLowerCase().replace(/ /g, '-'))}`, { replace: true });
          } else {
            setActiveLocation(DEFAULT_LOCATION);
          }
        }
      }
      if (mounted) setInitLoading(false);
    }
    
    initialize();
    
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationName]);

  const handleLocationSelect = (loc: LocationInfo) => {
    setActiveLocation(loc);
    navigate(`/weather/${encodeURIComponent(loc.name.toLowerCase().replace(/ /g, '-'))}`);
  };

  const handleUseLocation = async () => {
    const loc = await requestLocation();
    if (loc) {
      handleLocationSelect(loc);
    }
  };

  // Determine dynamic background
  let bgClass = 'bg-[var(--background)]';
  if (data?.current) {
    bgClass = getWeatherBackgroundClass(data.current.conditionCode, data.current.isDay);
  }

  if (initLoading) {
    return (
      <div className={`min-h-screen ${bgClass}`}>
        <Header 
          onLocationSelect={handleLocationSelect}
          onUseLocation={handleUseLocation}
          locationLoading={geoLoading}
        />
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgClass} pb-12 transition-colors duration-1000`}>
      <Header 
        onLocationSelect={handleLocationSelect}
        onUseLocation={handleUseLocation}
        locationLoading={geoLoading}
      />
      
      <main className="w-full max-w-7xl mx-auto p-4 md:p-6">
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-2xl mb-6 flex items-center gap-3">
            <CloudOff size={24} />
            <div>
              <h3 className="font-semibold">Weather unavailable</h3>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Persist UI during loading if we have old data, otherwise show skeleton */}
        {weatherLoading && !data ? (
          <div className="-mx-4 md:-mx-6 -mt-4 md:-mt-6">
            <LoadingSkeleton />
          </div>
        ) : data ? (
          <div className="animate-in fade-in duration-500">
            {/* Top section: Current weather */}
            <div className="mb-6 relative">
              {weatherLoading && (
                <div className="absolute top-4 right-4 bg-primary text-white text-xs px-2 py-1 rounded-full animate-pulse z-20 shadow-lg">
                  Updating...
                </div>
              )}
              <CurrentWeather data={data} onRefresh={refreshWeather} />
            </div>

            {/* Favorites (if any) */}
            <FavoriteLocations onSelect={handleLocationSelect} />

            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              
              {/* Left Column (Hourly & Details) */}
              <div className="lg:col-span-2 space-y-6 flex flex-col">
                <HourlyForecastComponent hourly={data.hourly} />
                <div className="flex-1">
                  <WeatherDetails current={data.current} />
                </div>
              </div>

              {/* Right Column (Daily & Map) */}
              <div className="space-y-6 flex flex-col">
                <DailyForecastComponent daily={data.daily} />
                <div className="flex-1">
                  <WeatherMap />
                </div>
              </div>
            </div>
          </div>
        ) : null}
        
      </main>
    </div>
  );
}
