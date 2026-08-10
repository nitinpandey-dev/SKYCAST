import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { WeatherHeader } from '../components/WeatherHeader';
import { WeatherHero } from '../components/WeatherHero';
import { WeatherSummary } from '../components/WeatherSummary';
import { HourlyForecast } from '../components/HourlyForecast';
import { TemperatureChart } from '../components/TemperatureChart';
import { PrecipitationChart } from '../components/PrecipitationChart';
import { TenDayForecast } from '../components/TenDayForecast';
import { WeatherDetails } from '../components/WeatherDetails';
import { SunPosition } from '../components/SunPosition';
import { DailyTimeline } from '../components/DailyTimeline';
import { WeatherInsights } from '../components/WeatherInsights';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useWeather } from '../hooks/useWeather';
import { useGeolocation } from '../hooks/useGeolocation';
import { useSettings } from '../contexts/SettingsContext';
import { LocationInfo } from '../types/weather';
import { searchLocations } from '../services/weatherService';
import { getWeatherBackgroundClass, generateWeatherSummary } from '../utils/weatherUtils';
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

export function Home() {
  const { locationName } = useParams();
  const navigate = useNavigate();
  const { requestLocation, loading: geoLoading } = useGeolocation();
  const { units, isDark } = useSettings();
  
  const [activeLocation, setActiveLocation] = useState<LocationInfo | null>(null);
  const [initLoading, setInitLoading] = useState(true);
  const [activeHourIndex, setActiveHourIndex] = useState(0);
  
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

  // Reset active hour selection when location data changes
  useEffect(() => {
    setActiveHourIndex(0);
  }, [data]);

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

  let bgClass = 'bg-[var(--bg)]';
  if (data?.current) {
    bgClass = getWeatherBackgroundClass(data.current.conditionCode, data.current.isDay, isDark);
  }

  if (initLoading) {
    return (
      <div className={`min-h-screen ${isDark ? 'dark' : ''} ${bgClass}`}>
        <WeatherHeader 
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
    <div className={`min-h-screen ${isDark ? 'dark' : ''} ${bgClass} pb-12 transition-colors duration-200 relative overflow-x-hidden`}>
      <WeatherHeader 
        onLocationSelect={handleLocationSelect}
        onUseLocation={handleUseLocation}
        locationLoading={geoLoading}
        activeLocation={activeLocation}
      />
      
      <main className="w-full max-w-[1400px] mx-auto p-4 md:p-6 space-y-6">
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-3.5 rounded-2xl flex items-center gap-2 text-xs">
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
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* 1. CURRENT WEATHER HERO */}
            <WeatherHero 
              data={data} 
              onRefresh={refreshWeather} 
              isLoading={weatherLoading}
              lastUpdated={lastUpdated}
            />

            {/* 2. WEATHER SUMMARY */}
            <WeatherSummary text={summaryText} />
            
            {/* 3. HOURLY FORECAST */}
            <HourlyForecast 
              hourly={data.hourly} 
              activeIndex={activeHourIndex}
              onActiveIndexChange={setActiveHourIndex}
            />

            {/* 4. TEMPERATURE GRAPH */}
            <TemperatureChart 
              hourly={data.hourly}
              activeIndex={activeHourIndex}
              onActiveIndexChange={setActiveHourIndex}
            />

            {/* 5. PRECIPITATION GRAPH */}
            <PrecipitationChart 
              hourly={data.hourly}
              activeIndex={activeHourIndex}
              onActiveIndexChange={setActiveHourIndex}
            />

            {/* 6. 10-DAY FORECAST */}
            <TenDayForecast 
              daily={data.daily} 
              currentTemp={data.current.temperature}
            />

            {/* 7. WEATHER DETAILS */}
            <WeatherDetails current={data.current} />

            {/* 8. SUN POSITION & TODAY'S TIMELINE (Side-by-Side on Desktop, Stacked on Mobile) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <SunPosition sunrise={data.current.sunrise} sunset={data.current.sunset} />
              <DailyTimeline hourly={data.hourly} />
            </div>

            {/* 9. WEATHER INSIGHTS */}
            <WeatherInsights data={data} />

            {/* 10. Attributed Footer */}
            <div className="w-full text-center mt-10 pt-4 text-[9px] font-bold text-text-muted uppercase tracking-wider select-none border-t border-border-custom/10">
              Weather data provided by <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer" className="hover:text-accent-custom transition-colors">Open-Meteo</a>
            </div>
          </div>
        ) : null}
        
      </main>
    </div>
  );
}
export default Home;
