import React from 'react';
import { WeatherData } from '../types/weather';
import { getWeatherCondition, cToF, formatDay } from '../utils/weatherUtils';
import { useSettings } from '../contexts/SettingsContext';
import { WeatherIcon } from './Icons';
import { format } from 'date-fns';
import { Heart, RefreshCw } from 'lucide-react';

interface CurrentWeatherProps {
  data: WeatherData;
  onRefresh: () => void;
}

export function CurrentWeather({ data, onRefresh }: CurrentWeatherProps) {
  const { units, isFavorite, addFavorite, removeFavorite } = useSettings();
  const { current, location } = data;

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
    <div className="glass-card p-8 flex flex-col md:flex-row items-center md:items-start justify-between relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="z-10 w-full md:w-auto text-center md:text-left mb-8 md:mb-0">
        <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{location.name}</h1>
          <button 
            onClick={toggleFavorite}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            title={fav ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart size={24} className={fav ? "fill-red-500 text-red-500" : "text-gray-400"} />
          </button>
        </div>
        
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          {formatDay(new Date().toISOString())}, {format(new Date(), 'MMMM d')}
        </p>
        
        <div className="mt-8 flex flex-col items-center md:items-start">
          <div className="flex items-center gap-4">
            <span className="text-7xl md:text-8xl font-bold tracking-tighter text-gray-900 dark:text-white">
              {displayTemp}°
            </span>
            <div className="flex flex-col items-center justify-center text-primary">
              <WeatherIcon name={condition.icon} size={64} strokeWidth={1.5} />
            </div>
          </div>
          
          <div className="mt-4 text-xl md:text-2xl font-medium text-gray-800 dark:text-gray-200">
            {condition.description}
          </div>
          
          <div className="mt-2 text-gray-500 dark:text-gray-400">
            Feels like {displayFeelsLike}°
          </div>
        </div>
      </div>

      <div className="z-10 flex flex-col items-center md:items-end w-full md:w-auto h-full justify-between">
        <button 
          onClick={onRefresh}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors mb-6 md:mb-0"
        >
          <RefreshCw size={14} />
          <span>Refresh</span>
        </button>

        <div className="flex flex-row md:flex-col gap-6 md:gap-4 w-full justify-center md:mt-auto">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 dark:text-gray-400">High</span>
            <span className="text-xl font-semibold">{displayHigh}°</span>
          </div>
          <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 md:hidden"></div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 dark:text-gray-400">Low</span>
            <span className="text-xl font-semibold">{displayLow}°</span>
          </div>
          <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 md:hidden"></div>
          <div className="flex items-center gap-2">
            <span className="text-blue-500 dark:text-blue-400 font-medium">{current.precipitationProbability}% Rain</span>
          </div>
        </div>
      </div>
    </div>
  );
}
