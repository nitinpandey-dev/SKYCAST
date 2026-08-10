import React, { useEffect, useState } from 'react';
import { WeatherData } from '../types/weather';
import { getWeatherCondition, cToF, formatDay } from '../utils/weatherUtils';
import { useSettings } from '../contexts/SettingsContext';
import { WeatherIcon } from './Icons';
import { format, formatDistanceToNow } from 'date-fns';
import { Star, RefreshCw } from 'lucide-react';

interface CurrentWeatherProps {
  data: WeatherData;
  onRefresh: () => void;
  isLoading: boolean;
  lastUpdated: Date | null;
}

export function CurrentWeather({ data, onRefresh, isLoading, lastUpdated }: CurrentWeatherProps) {
  const { units, isFavorite, addFavorite, removeFavorite } = useSettings();
  const { current, location } = data;
  const [timeAgo, setTimeAgo] = useState('just now');

  useEffect(() => {
    if (!lastUpdated) return;
    
    const updateTimeAgo = () => {
      try {
        const timeString = formatDistanceToNow(lastUpdated, { addSuffix: true });
        // Clean up "less than a minute ago" -> "just now"
        if (timeString.includes('less than a minute')) {
          setTimeAgo('just now');
        } else {
          setTimeAgo(timeString);
        }
      } catch (e) {
        setTimeAgo('just now');
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 30000); // Update every 30s
    
    return () => clearInterval(interval);
  }, [lastUpdated]);

  if (!location) return null;

  const condition = getWeatherCondition(current.conditionCode, current.isDay);
  
  const displayTemp = Math.round(units === 'imperial' ? cToF(current.temperature) : current.temperature);
  const displayFeelsLike = Math.round(units === 'imperial' ? cToF(current.apparentTemperature) : current.apparentTemperature);
  const displayHigh = Math.round(units === 'imperial' ? cToF(current.high) : current.high);
  const displayLow = Math.round(units === 'imperial' ? cToF(current.low) : current.low);

  const fav = isFavorite(location.id);

  const toggleFavorite = () => {
    if (fav) removeFavorite(location.id);
    else addFavorite(location);
  };

  return (
    <div className="glass-card p-6 sm:p-8 flex flex-col md:flex-row items-center md:items-start justify-between relative overflow-hidden transition-all duration-700">
      {/* Background decoration */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
      
      {/* Left side: Location, Time and Temp */}
      <div className="z-10 w-full md:w-auto text-center md:text-left mb-6 md:mb-0">
        <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-2.5 mb-1.5">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{location.name}</h1>
          <button 
            onClick={toggleFavorite}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/10 hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-amber-500 dark:hover:text-amber-400 transition-all font-medium text-xs text-gray-500 dark:text-gray-400 select-none cursor-pointer border border-transparent hover:border-amber-500/20"
            title={fav ? "Remove from favorites" : "Add to favorites"}
          >
            <Star size={14} className={fav ? "fill-amber-400 text-amber-400 animate-[pulse_1.5s_infinite]" : "text-gray-400"} />
            <span>{fav ? 'Favorited' : 'Add to Favorites'}</span>
          </button>
        </div>
        
        <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg">
          {formatDay(new Date().toISOString())}, {format(new Date(), 'MMMM d')}
        </p>
        
        {/* Animated temp loading/updating transition */}
        <div className="mt-8 flex flex-col items-center md:items-start">
          <div className="flex items-center gap-6">
            <span className="text-7xl sm:text-8xl font-black tracking-tighter text-gray-900 dark:text-white transition-all transform hover:scale-[1.02] duration-500 cursor-default">
              {displayTemp}°
            </span>
            <div className="flex items-center justify-center text-primary h-20 w-20">
              <WeatherIcon name={condition.icon} size={68} strokeWidth={1.5} className="drop-shadow-md" />
            </div>
          </div>
          
          <div className="mt-4 text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            {condition.description}
          </div>
          
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Feels like <span className="font-semibold text-gray-700 dark:text-gray-300">{displayFeelsLike}°</span>
          </div>
        </div>
      </div>

      {/* Right side: Refresh control and statistics */}
      <div className="z-10 flex flex-col items-center md:items-end w-full md:w-auto h-full justify-between gap-6 md:gap-0">
        
        {/* Refresh button with status */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
            {isLoading ? 'Updating weather...' : `Updated ${timeAgo}`}
          </span>
          <button 
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-gray-600 dark:text-gray-300 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-all border border-transparent disabled:opacity-50 select-none cursor-pointer"
          >
            <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        <div className="flex flex-row md:flex-col gap-6 md:gap-3 w-full justify-center md:mt-16 bg-black/5 dark:bg-white/5 md:bg-transparent p-4 md:p-0 rounded-2xl">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">High</span>
            <span className="text-base sm:text-lg font-bold">{displayHigh}°</span>
          </div>
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-800 md:hidden"></div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Low</span>
            <span className="text-base sm:text-lg font-bold">{displayLow}°</span>
          </div>
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-800 md:hidden"></div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-blue-500 dark:text-blue-400 font-bold">{current.precipitationProbability}% Rain</span>
          </div>
        </div>
      </div>
    </div>
  );
}
