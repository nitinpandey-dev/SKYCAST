import React, { useEffect, useState } from 'react';
import { WeatherData } from '../types/weather';
import { getWeatherCondition, cToF, formatDay } from '../utils/weatherUtils';
import { useSettings } from '../contexts/SettingsContext';
import { WeatherIcon } from './Icons';
import { format, formatDistanceToNow } from 'date-fns';
import { Star, RefreshCw, CloudRain } from 'lucide-react';

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
    <div className="py-6 px-1 flex flex-col md:flex-row items-center md:items-start justify-between relative overflow-hidden transition-all duration-300 select-default animate-in fade-in duration-300">
      {/* Left side: Fully open weather summary, no card background */}
      <div className="w-full md:w-auto text-center md:text-left mb-6 md:mb-0">
        <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 mb-2">
          {/* Location Title (28-36px) */}
          <h1 className="text-3xl sm:text-4xl font-normal tracking-tight text-text-primary">
            {location.name}
          </h1>
          
          {/* iOS-style Capsule Button */}
          <button 
            onClick={toggleFavorite}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-surface hover:bg-surface-strong transition-all duration-200 text-xs font-semibold text-text-primary border border-border-custom cursor-pointer select-none shadow-sm active:scale-95 ${
              fav ? 'bg-amber-400/10 dark:bg-amber-400/5 border-amber-400/30' : ''
            }`}
          >
            <Star 
              size={12} 
              className={`transition-all ${
                fav 
                  ? "fill-amber-400 text-amber-400 scale-110" 
                  : "text-text-muted group-hover:text-text-secondary"
              }`} 
            />
            <span>{fav ? 'Favorited' : 'Add to Favorites'}</span>
          </button>
        </div>
        
        {/* Date (14-16px) */}
        <p className="text-text-secondary text-sm font-medium tracking-wide">
          {formatDay(new Date().toISOString())}, {format(new Date(), 'MMMM d')}
        </p>
        
        {/* Massive temperature and condition (Visual Focus) */}
        <div className="mt-8 flex flex-col items-center md:items-start">
          <div className="flex items-center gap-6">
            {/* Elegant thin temperature (72-100px mobile, 100-140px desktop) */}
            <span className="text-7xl sm:text-8xl md:text-[7.5rem] font-extralight tracking-tighter leading-none text-text-primary select-none transition-all duration-300">
              {displayTemp}°
            </span>
            <div className="flex items-center justify-center text-accent-custom h-20 w-20">
              <WeatherIcon name={condition.icon} size={72} strokeWidth={1} className="drop-shadow-sm" />
            </div>
          </div>
          
          {/* Condition (20-26px) */}
          <div className="mt-4 text-xl sm:text-2xl font-normal text-text-primary tracking-wide">
            {condition.description}
          </div>
          
          {/* Supporting information (14-16px) */}
          <div className="mt-2.5 text-sm font-medium text-text-secondary flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1">
            <span>Feels like <strong className="font-semibold text-text-primary">{displayFeelsLike}°</strong></span>
            <span className="text-border-custom opacity-50">•</span>
            <span>H: {displayHigh}° &nbsp; L: {displayLow}°</span>
            {current.precipitationProbability > 0 && (
              <>
                <span className="text-border-custom opacity-50">•</span>
                <span className="text-accent-custom font-semibold flex items-center gap-1">
                  <CloudRain size={12} className="shrink-0" />
                  {current.precipitationProbability}% Rain
                </span>
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
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-text-primary bg-surface hover:bg-surface-strong border border-border-custom hover:scale-102 active:scale-97 transition-all duration-200 disabled:opacity-50 select-none cursor-pointer shadow-sm"
        >
          <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
          <span>{isLoading ? 'Updating...' : 'Refresh'}</span>
        </button>
        <span className="text-[10px] text-text-muted font-medium">
          {isLoading ? 'Fetching Open-Meteo...' : `Updated ${timeAgo}`}
        </span>
      </div>
    </div>
  );
}
