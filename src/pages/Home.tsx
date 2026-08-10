import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '../components/Header';
import { CurrentWeather } from '../components/CurrentWeather';
import { HourlyForecastComponent } from '../components/HourlyForecast';
import { DailyForecastComponent } from '../components/DailyForecast';
import { WeatherDetails } from '../components/WeatherDetails';
import { WeatherMap } from '../components/WeatherMap';
import { FavoriteLocations } from '../components/FavoriteLocations';
import { WeatherInsights } from '../components/WeatherInsights';
import { WeatherTimeline } from '../components/WeatherTimeline';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useWeather } from '../hooks/useWeather';
import { useGeolocation } from '../hooks/useGeolocation';
import { LocationInfo } from '../types/weather';
import { searchLocations } from '../services/weatherService';
import { getWeatherBackgroundClass } from '../utils/weatherUtils';
import { CloudOff } from 'lucide-react';

const DEFAULT_LOCATION: LocationInfo = {
  id: 'default',
  name: 'New York',
  country: 'United States',
  countryCode: 'US',
  admin1: 'New York',
  lat: 40.71427,
  lon: -74.00597
};

// Lightweight, CSS-driven weather animation effects overlay
function WeatherEffectsOverlay({ code, isDay }: { code: number; isDay: boolean }) {
  // Sunny
  if (code <= 1 && isDay) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] aspect-square rounded-full bg-amber-400/20 blur-3xl animate-[pulse_10s_ease-in-out_infinite]"></div>
      </div>
    );
  }

  // Night Clear
  if (code <= 1 && !isDay) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="stars-container absolute inset-0 opacity-40">
          <div className="absolute top-[10%] left-[20%] w-1 h-1 bg-white rounded-full animate-ping [animation-duration:3s]"></div>
          <div className="absolute top-[30%] left-[70%] w-1 h-1 bg-white rounded-full animate-ping [animation-duration:5s]"></div>
          <div className="absolute top-[60%] left-[40%] w-1.5 h-1.5 bg-white rounded-full animate-ping [animation-duration:4s]"></div>
          <div className="absolute top-[80%] left-[85%] w-1 h-1 bg-white rounded-full animate-ping [animation-duration:6s]"></div>
        </div>
      </div>
    );
  }

  // Cloudy/Foggy
  if (code <= 3 || code === 45 || code === 48) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-30 dark:opacity-20">
        <div className="absolute top-[15%] w-48 h-12 bg-white dark:bg-gray-700 rounded-full blur-xl animate-[cloudDrift_40s_linear_infinite]"></div>
        <div className="absolute top-[40%] w-64 h-16 bg-white dark:bg-gray-700 rounded-full blur-xl animate-[cloudDrift_60s_linear_infinite] [animation-delay:-10s]"></div>
      </div>
    );
  }

  // Rain/Drizzle
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-40">
        <div className="rain-container absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <div 
              key={i} 
              className="absolute bg-blue-400 dark:bg-blue-300 w-0.5 h-6 rounded-full animate-[rainDrop_1.5s_linear_infinite]"
              style={{
                left: `${15 + i * 15}%`,
                top: `-20px`,
                animationDelay: `${i * 0.25}s`,
                animationDuration: `${0.8 + Math.random() * 0.5}s`
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  // Snow
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-50">
        <div className="snow-container absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <div 
              key={i} 
              className="absolute bg-white dark:bg-blue-100 rounded-full animate-[snowDrift_4s_linear_infinite]"
              style={{
                width: `${4 + (i % 3) * 2}px`,
                height: `${4 + (i % 3) * 2}px`,
                left: `${10 + i * 12}%`,
                top: `-20px`,
                animationDelay: `${i * 0.4}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  // Storm
  if (code >= 95) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Lightning flash effect */}
        <div className="absolute inset-0 bg-white/20 dark:bg-white/5 opacity-0 animate-[lightningFlash_8s_ease-in-out_infinite]"></div>
      </div>
    );
  }

  return null;
}

export function Home() {
  const { locationName } = useParams();
  const navigate = useNavigate();
  const { requestLocation, loading: geoLoading } = useGeolocation();
  
  const [activeLocation, setActiveLocation] = useState<LocationInfo | null>(null);
  const [initLoading, setInitLoading] = useState(true);
  
  const { data, loading: weatherLoading, error, refreshWeather, lastUpdated } = useWeather(activeLocation);

  // Initial load logic
  useEffect(() => {
    let mounted = true;
    
    async function initialize() {
      if (locationName) {
        try {
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
        const loc = await requestLocation();
        if (mounted) {
          if (loc) {
            setActiveLocation(loc);
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
          activeLocation={activeLocation}
        />
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgClass} pb-12 transition-colors duration-1000 relative`}>
      {/* Background Weather Animation Overlay */}
      {data?.current && (
        <WeatherEffectsOverlay code={data.current.conditionCode} isDay={data.current.isDay} />
      )}

      <div className="relative z-10">
        <Header 
          onLocationSelect={handleLocationSelect}
          onUseLocation={handleUseLocation}
          locationLoading={geoLoading}
          activeLocation={activeLocation}
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

          {weatherLoading && !data ? (
            <div className="-mx-4 md:-mx-6 -mt-4 md:-mt-6">
              <LoadingSkeleton />
            </div>
          ) : data ? (
            <div className="animate-in fade-in duration-500 space-y-6">
              
              {/* Top Section: Current Weather & Timeline Overview */}
              <div className="grid grid-cols-1 gap-6">
                <CurrentWeather 
                  data={data} 
                  onRefresh={refreshWeather} 
                  isLoading={weatherLoading}
                  lastUpdated={lastUpdated}
                />
                
                <WeatherTimeline hourly={data.hourly} />
              </div>

              {/* Favorites Dashboard */}
              <FavoriteLocations onSelect={handleLocationSelect} />

              {/* Data Insights Panel */}
              <WeatherInsights data={data} />

              {/* Multi-column Detail Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column (Hourly & Detailed Cards) */}
                <div className="lg:col-span-2 space-y-6 flex flex-col">
                  <HourlyForecastComponent hourly={data.hourly} />
                  <div className="flex-1">
                    <WeatherDetails current={data.current} />
                  </div>
                </div>

                {/* Right Column (7-Day Accordion & Radar Map) */}
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
    </div>
  );
}
