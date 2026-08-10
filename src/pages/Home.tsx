import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '../components/Header';
import { CurrentWeather } from '../components/CurrentWeather';
import { HourlyForecastComponent } from '../components/HourlyForecast';
import { DailyForecastComponent } from '../components/DailyForecast';
import { WeatherDetails } from '../components/WeatherDetails';
import { SunriseSunset } from '../components/SunriseSunset';
import { FavoriteLocations } from '../components/FavoriteLocations';
import { WeatherInsights } from '../components/WeatherInsights';
import { WeatherTimeline } from '../components/WeatherTimeline';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useWeather } from '../hooks/useWeather';
import { useGeolocation } from '../hooks/useGeolocation';
import { useSettings } from '../contexts/SettingsContext';
import { LocationInfo } from '../types/weather';
import { searchLocations } from '../services/weatherService';
import { getWeatherBackgroundClass, generateWeatherSummary } from '../utils/weatherUtils';
import { CloudOff, Info } from 'lucide-react';

const DEFAULT_LOCATION: LocationInfo = {
  id: 'default',
  name: 'New York',
  country: 'United States',
  countryCode: 'US',
  admin1: 'New York',
  lat: 40.71427,
  lon: -74.00597
};

// Subtle weather overlay animations
function WeatherEffectsOverlay({ code, isDay }: { code: number; isDay: boolean }) {
  if (code <= 1 && isDay) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[35%] aspect-square rounded-full bg-amber-400/[0.03] dark:bg-amber-400/[0.01] blur-3xl animate-[pulse_10s_ease-in-out_infinite]"></div>
      </div>
    );
  }

  if (code <= 1 && !isDay) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="stars-container absolute inset-0 opacity-15">
          <div className="absolute top-[10%] left-[15%] w-0.5 h-0.5 bg-white rounded-full animate-pulse [animation-duration:4s]"></div>
          <div className="absolute top-[30%] left-[70%] w-0.5 h-0.5 bg-white rounded-full animate-pulse [animation-duration:6s]"></div>
          <div className="absolute top-[60%] left-[45%] w-0.5 h-0.5 bg-white rounded-full animate-pulse [animation-duration:5s]"></div>
        </div>
      </div>
    );
  }

  if (code <= 3 || code === 45 || code === 48) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-10 dark:opacity-5">
        <div className="absolute top-[12%] w-32 h-6 bg-white rounded-full blur-xl animate-[cloudDrift_50s_linear_infinite]"></div>
        <div className="absolute top-[40%] w-40 h-8 bg-white rounded-full blur-xl animate-[cloudDrift_70s_linear_infinite] [animation-delay:-20s]"></div>
      </div>
    );
  }

  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-15">
        <div className="rain-container absolute inset-0">
          {[...Array(4)].map((_, i) => (
            <div 
              key={i} 
              className="absolute bg-blue-300 w-px h-3 rounded-full animate-[rainDrop_2.2s_linear_infinite]"
              style={{
                left: `${25 + i * 20}%`,
                top: `-20px`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${1.2 + Math.random() * 0.4}s`
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  return null;
}

export function Home() {
  const { locationName } = useParams();
  const navigate = useNavigate();
  const { requestLocation, loading: geoLoading } = useGeolocation();
  const { units, theme } = useSettings();
  
  const [activeLocation, setActiveLocation] = useState<LocationInfo | null>(null);
  const [initLoading, setInitLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  const { data, loading: weatherLoading, error, refreshWeather, lastUpdated } = useWeather(activeLocation);

  // Responsive tracker
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Background style mapping
  const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = theme === 'dark' || (theme === 'system' && isSystemDark);
  
  let bgClass = 'bg-[var(--background)]';
  if (data?.current) {
    bgClass = getWeatherBackgroundClass(data.current.conditionCode, data.current.isDay, isDark);
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

  const summaryText = data ? generateWeatherSummary(data, units) : '';

  return (
    <div className={`min-h-screen ${bgClass} pb-12 transition-[background-color,color,border-color,box-shadow] duration-300 relative overflow-x-hidden`}>
      {/* Dynamic weather overlay */}
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
        
        <main className="w-full max-w-7xl mx-auto p-3 sm:p-4 md:p-6">
          
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-3 rounded-2xl mb-4 flex items-center gap-2 text-xs">
              <CloudOff size={16} className="shrink-0" />
              <div>
                <h3 className="font-bold">Weather data unavailable</h3>
                <p className="text-gray-500 dark:text-gray-400">{error}</p>
              </div>
            </div>
          )}

          {weatherLoading && !data ? (
            <div className="-mx-4 md:-mx-6 -mt-4 md:-mt-6">
              <LoadingSkeleton />
            </div>
          ) : data ? (
            <div>
              {/* MOBILE LAYOUT (Sequential scrolling list, no navigation tabs) */}
              {isMobile ? (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <CurrentWeather 
                    data={data} 
                    onRefresh={refreshWeather} 
                    isLoading={weatherLoading}
                    lastUpdated={lastUpdated}
                  />

                  {summaryText && (
                    <div className="glass-card p-3.5 flex gap-2.5 items-start">
                      <Info size={14} className="text-accent-custom shrink-0 mt-0.5" />
                      <p className="text-xs text-text-secondary dark:text-[#DCE5F0] leading-relaxed font-semibold">
                        {summaryText}
                      </p>
                    </div>
                  )}
                  
                  <HourlyForecastComponent hourly={data.hourly} />
                  <DailyForecastComponent daily={data.daily} />
                  <WeatherDetails current={data.current} />
                  <SunriseSunset sunrise={data.current.sunrise} sunset={data.current.sunset} />
                  <WeatherTimeline hourly={data.hourly} />
                  <WeatherInsights data={data} />
                  <FavoriteLocations onSelect={handleLocationSelect} />
                </div>
              ) : (
                /* DESKTOP LAYOUT (Restore Good Columns Dashboard layout before sequential change, no map) */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-in fade-in duration-300">
                  
                  {/* Left Column (Focus & Timeline/Graphs) */}
                  <div className="lg:col-span-2 space-y-6">
                    <CurrentWeather 
                      data={data} 
                      onRefresh={refreshWeather} 
                      isLoading={weatherLoading}
                      lastUpdated={lastUpdated}
                    />

                    {summaryText && (
                      <div className="glass-card p-4 flex gap-3 items-start">
                        <Info size={16} className="text-accent-custom shrink-0 mt-0.5" />
                        <p className="text-xs text-text-secondary dark:text-[#DCE5F0] leading-relaxed font-semibold">
                          {summaryText}
                        </p>
                      </div>
                    )}
                    
                    <HourlyForecastComponent hourly={data.hourly} />
                    <WeatherTimeline hourly={data.hourly} />
                    <WeatherInsights data={data} />
                  </div>

                  {/* Right Column (Accordion lists, sun path, details) */}
                  <div className="space-y-6">
                    <DailyForecastComponent daily={data.daily} />
                    <SunriseSunset sunrise={data.current.sunrise} sunset={data.current.sunset} />
                    <WeatherDetails current={data.current} />
                  </div>

                  {/* Saved Locations bottom bar */}
                  <div className="lg:col-span-3">
                    <FavoriteLocations onSelect={handleLocationSelect} />
                  </div>

                </div>
              )}

              {/* Muted Open-Meteo Attribution Footer */}
              <div className="w-full text-center mt-8 pb-4 text-[9px] font-bold text-text-muted uppercase tracking-wider select-none">
                Weather data provided by <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer" className="hover:text-accent-custom transition-colors">Open-Meteo</a>
              </div>
            </div>
          ) : null}
          
        </main>
      </div>
    </div>
  );
}
export default Home;
