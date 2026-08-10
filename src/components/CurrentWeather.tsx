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
    <div className="py-2.5 px-1 flex flex-col items-center md:items-start text-center md:text-left select-default animate-in fade-in duration-300 relative w-full">
      {/* Top row: Location & Favorite + Refresh */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-border-custom/20 pb-3 mb-3">
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
          {/* Location Title (28-36px) */}
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-text-primary">
            {location.name}
          </h1>
          
          {/* Favorite capsule */}
          <button 
            onClick={toggleFavorite}
            className={`flex items-center gap-1 px-3 py-1 rounded-full bg-surface hover:bg-surface-strong transition-all duration-200 text-[10px] font-bold text-text-primary border border-border-custom cursor-pointer shadow-sm active:scale-95 ${
              fav ? 'bg-amber-400/10 dark:bg-amber-400/5 border-amber-400/30' : ''
            }`}
          >
            <Star 
              size={10} 
              className={fav ? "fill-amber-400 text-amber-400" : "text-text-muted"} 
            />
            <span>{fav ? 'Favorited' : 'Favorite'}</span>
          </button>
        </div>

        {/* Refresh & status */}
        <div className="flex items-center gap-3">
          <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider">
            {isLoading ? 'Updating...' : `Updated ${timeAgo}`}
          </span>
          <button 
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold text-text-primary bg-surface hover:bg-surface-strong border border-border-custom active:scale-95 transition-all duration-200 cursor-pointer shadow-sm"
          >
            <RefreshCw size={10} className={isLoading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Date */}
      <p className="text-text-muted dark:text-[#AAB7C8] text-[10px] font-bold uppercase tracking-widest leading-none">
        {formatDay(new Date().toISOString())}, {format(new Date(), 'MMMM d')}
      </p>
      
      {/* Compact temperature & description row */}
      <div className="flex flex-row items-center justify-center md:justify-start gap-5 mt-2.5">
        {/* Temperature: 96-120px on desktop, 72-96px on mobile */}
        <span className="text-6xl sm:text-7xl md:text-[6rem] font-extralight tracking-tighter leading-none text-text-primary dark:text-white select-none">
          {displayTemp}°
        </span>
        <div className="flex items-center justify-center text-accent-custom h-14 w-14">
          <WeatherIcon name={condition.icon} size={48} strokeWidth={1.2} />
        </div>
        <div className="text-left leading-tight hidden sm:block">
          <div className="text-base sm:text-lg font-semibold text-text-primary dark:text-[#F1F5F9] tracking-wide leading-tight">
            {condition.description}
          </div>
          <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider mt-0.5">Current Weather</p>
        </div>
      </div>

      {/* Mobile only condition label */}
      <div className="text-lg font-semibold text-text-primary dark:text-[#F1F5F9] sm:hidden mt-2">
        {condition.description}
      </div>
      
      {/* Supporting details: Feels like | H | L | Rain */}
      <div className="mt-3 text-xs font-semibold text-text-secondary flex flex-wrap items-center justify-center md:justify-start gap-x-2.5 gap-y-1">
        <span>Feels like <strong className="font-bold text-text-primary">{displayFeelsLike}°</strong></span>
        <span className="text-border-custom/50">•</span>
        <span>H: <strong className="font-bold text-text-primary">{displayHigh}°</strong></span>
        <span className="text-border-custom/50">•</span>
        <span>L: <strong className="font-bold text-text-primary">{displayLow}°</strong></span>
        {current.precipitationProbability > 0 && (
          <>
            <span className="text-border-custom/50">•</span>
            <span className="text-accent-custom font-bold flex items-center gap-0.5">
              <CloudRain size={11} className="shrink-0" />
              {current.precipitationProbability}% Rain
            </span>
          </>
        )}
      </div>
    </div>
  );
}
