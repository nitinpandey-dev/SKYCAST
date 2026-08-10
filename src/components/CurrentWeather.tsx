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
    const interval = setInterval(updateTimeAgo, 30000);
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
    <div className="py-8 px-4 flex flex-col md:flex-row items-center md:items-start justify-between relative overflow-hidden transition-all duration-700 select-default">
      {/* Left side: Clean text sitting directly on the page background */}
      <div className="w-full md:w-auto text-center md:text-left mb-6 md:mb-0">
        <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3 mb-1">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900 dark:text-white">
            {location.name}
          </h1>
          <button 
            onClick={toggleFavorite}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 dark:bg-black/20 hover:bg-white/20 dark:hover:bg-black/30 hover:text-amber-500 transition-all font-medium text-[10px] text-gray-500 dark:text-gray-400 select-none cursor-pointer border border-transparent"
          >
            <Star size={12} className={fav ? "fill-amber-400 text-amber-400 animate-pulse" : "text-gray-400"} />
            <span>{fav ? 'Favorited' : 'Add to Favorites'}</span>
          </button>
        </div>
        
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {formatDay(new Date().toISOString())}, {format(new Date(), 'MMMM d')}
        </p>
        
        {/* Massive temperature and condition (Visual Focus) */}
        <div className="mt-8 flex flex-col items-center md:items-start">
          <div className="flex items-center gap-4">
            <span className="text-8xl sm:text-[10rem] font-light tracking-tighter leading-none text-gray-900 dark:text-white select-none">
              {displayTemp}°
            </span>
            <div className="flex items-center justify-center text-primary h-20 w-20">
              <WeatherIcon name={condition.icon} size={64} strokeWidth={1.2} className="drop-shadow-sm" />
            </div>
          </div>
          
          <div className="mt-4 text-lg font-medium text-gray-800 dark:text-gray-200">
            {condition.description}
          </div>
          
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-4">
            <span>Feels like <strong className="font-semibold text-gray-700 dark:text-gray-300">{displayFeelsLike}°</strong></span>
            <span className="text-gray-300 dark:text-gray-700">|</span>
            <span>H: {displayHigh}° &nbsp; L: {displayLow}°</span>
            {current.precipitationProbability > 0 && (
              <>
                <span className="text-gray-300 dark:text-gray-700">|</span>
                <span className="text-blue-500 font-semibold">{current.precipitationProbability}% Rain</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right side: Refresh control */}
      <div className="flex flex-col items-center md:items-end shrink-0 gap-2">
        <button 
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-all border border-transparent disabled:opacity-50 select-none cursor-pointer"
        >
          <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
          <span>{isLoading ? 'Updating...' : 'Refresh'}</span>
        </button>
        <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
          {isLoading ? 'Fetching Open-Meteo...' : `Updated ${timeAgo}`}
        </span>
      </div>
    </div>
  );
}
