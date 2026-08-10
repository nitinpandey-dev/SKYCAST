import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '../components/Header';
import { CurrentWeather } from '../components/CurrentWeather';
import { HourlyForecastComponent } from '../components/HourlyForecast';
import { DailyForecastComponent } from '../components/DailyForecast';
import { WeatherDetails } from '../components/WeatherDetails';
import { SunriseSunset } from '../components/SunriseSunset';
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

// Weather background effects
function WeatherEffectsOverlay({ code, isDay }: { code: number; isDay: boolean }) {
  if (code <= 1 && isDay) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[35%] aspect-square rounded-full bg-amber-400/[0.04] dark:bg-amber-400/[0.01] blur-3xl animate-[pulse_10s_ease-in-out_infinite]"></div>
      </div>
    );
  }

  if (code <= 1 && !isDay) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="stars-container absolute inset-0 opacity-20">
          <div className="absolute top-[12%] left-[15%] w-0.5 h-0.5 bg-white rounded-full animate-pulse [animation-duration:4s]"></div>
          <div className="absolute top-[28%] left-[75%] w-0.5 h-0.5 bg-white rounded-full animate-pulse [animation-duration:6s]"></div>
          <div className="absolute top-[65%] left-[38%] w-1 h-1 bg-white rounded-full animate-pulse [animation-duration:5s]"></div>
          <div className="absolute top-[78%] left-[88%] w-0.5 h-0.5 bg-white rounded-full animate-pulse [animation-duration:7s]"></div>
        </div>
      </div>
    );
  }

  if (code <= 3 || code === 45 || code === 48) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-15 dark:opacity-5">
        <div className="absolute top-[10%] w-36 h-8 bg-white rounded-full blur-xl animate-[cloudDrift_45s_linear_infinite]"></div>
        <div className="absolute top-[35%] w-48 h-10 bg-white rounded-full blur-xl animate-[cloudDrift_65s_linear_infinite] [animation-delay:-15s]"></div>
      </div>
    );
  }

  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-20">
        <div className="rain-container absolute inset-0">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i} 
              className="absolute bg-blue-300 w-px h-4 rounded-full animate-[rainDrop_2s_linear_infinite]"
              style={{
                left: `${20 + i * 18}%`,
                top: `-20px`,
                animationDelay: `${i * 0.4}s`,
                animationDuration: `${1.1 + Math.random() * 0.4}s`
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-25">
        <div className="snow-container absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <div 
              key={i} 
              className="absolute bg-white dark:bg-zinc-800 rounded-full animate-[snowDrift_5s_linear_infinite]"
              style={{
                width: `${3 + (i % 2) * 2}px`,
                height: `${3 + (i % 2) * 2}px`,
                left: `${15 + i * 15}%`,
                top: `-20px`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3.5 + Math.random() * 1.5}s`
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (code >= 95) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 bg-white/[0.05] dark:bg-white/[0.02] opacity-0 animate-[lightningFlash_10s_ease-in-out_infinite]"></div>
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

  // Determine background class
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
    <div className={`min-h-screen ${bgClass} pb-12 transition-colors duration-1000 relative overflow-x-hidden`}>
      {/* Background Weather Animation */}
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
              
              {/* Redesigned grid for space optimization */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                {/* Left Column (Main Focus & Visual Timeline/Graphs) */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Current Weather sits directly on page background */}
                  <CurrentWeather 
                    data={data} 
                    onRefresh={refreshWeather} 
                    isLoading={weatherLoading}
                    lastUpdated={lastUpdated}
                  />
                  
                  {/* Hourly forecast selector & curve graphs */}
                  <HourlyForecastComponent hourly={data.hourly} />
                  
                  {/* Timeline representation */}
                  <WeatherTimeline hourly={data.hourly} />
                  
                  {/* Local insights banner */}
                  <WeatherInsights data={data} />
                </div>

                {/* Right Column (Accordion daily forecast, sunrise sun path, details, map) */}
                <div className="space-y-6">
                  {/* Compact daily forecast rows */}
                  <DailyForecastComponent daily={data.daily} />
                  
                  {/* Interactive Sun curve path */}
                  <SunriseSunset sunrise={data.current.sunrise} sunset={data.current.sunset} />
                  
                  {/* Dense weather details grid */}
                  <WeatherDetails current={data.current} />
                  
                  {/* Radar placeholder */}
                  <WeatherMap />
                </div>

              </div>

              {/* Favorites board (stands out as horizontal dashboard) */}
              <FavoriteLocations onSelect={handleLocationSelect} />
            </div>
          ) : null}
          
        </main>
      </div>
    </div>
  );
}
