import React, { useEffect, useState } from 'react';
import { WeatherData } from '../types/weather';
import { getWeatherCondition, cToF, formatDay } from '../utils/weatherUtils';
import { useSettings } from '../contexts/SettingsContext';
import { WeatherIcon } from './Icons';
import { format, formatDistanceToNow } from 'date-fns';
import { Star, RefreshCw } from 'lucide-react';

interface WeatherHeroProps {
  data: WeatherData;
  onRefresh: () => void;
  isLoading: boolean;
  lastUpdated: Date | null;
}

export function WeatherHero({ data, onRefresh, isLoading, lastUpdated }: WeatherHeroProps) {
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
    <div className="w-full flex flex-col md:flex-row items-center md:items-end justify-between gap-6 py-6 md:py-10 select-none">
      
      {/* Left / Center Info: Open Atmospheric Weather Display */}
      <div className="flex flex-col items-center md:items-start text-center md:text-left">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-text-primary">
          {location.name}
        </h1>
        <p className="text-xs font-medium text-text-secondary uppercase tracking-widest mt-1">
          {formatDay(new Date().toISOString())}, {format(new Date(), 'MMMM d')}
        </p>

        {/* Dynamic Big Temperature Grid */}
        <div className="flex items-center gap-4 mt-4 select-none">
          <span className="text-7xl sm:text-8xl md:text-[7rem] font-light tracking-tighter leading-none text-text-primary dark:text-white">
            {displayTemp}°
          </span>
          <div className="flex flex-col items-center md:items-start leading-none justify-center">
            <div className="text-accent-custom shrink-0">
              <WeatherIcon name={condition.icon} size={48} strokeWidth={1.2} />
            </div>
            <span className="text-lg sm:text-xl font-semibold text-text-primary tracking-wide mt-1.5 block">
              {condition.description}
            </span>
          </div>
        </div>

        {/* Feels like / Highs / Lows / Precipitation details */}
        <div className="mt-4 text-sm font-semibold text-text-secondary flex flex-wrap items-center justify-center md:justify-start gap-x-2 gap-y-1">
          <span>Feels like <strong className="font-bold text-text-primary">{displayFeelsLike}°</strong></span>
          <span className="opacity-40">•</span>
          <span>H: <strong className="font-bold text-text-primary">{displayHigh}°</strong></span>
          <span className="opacity-40">•</span>
          <span>L: <strong className="font-bold text-text-primary">{displayLow}°</strong></span>
          <span className="opacity-40">•</span>
          <span>{current.precipitationProbability}% Rain</span>
        </div>
      </div>

      {/* Right Side: Context Controls (Favorite + Refresh) */}
      <div className="flex flex-col sm:flex-row md:flex-col items-center md:items-end gap-3 shrink-0">
        
        {/* Favorite capsule */}
        <button 
          onClick={toggleFavorite}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-custom hover:bg-surface-elevated text-xs font-semibold text-text-primary border border-border-custom shadow-sm active:scale-95 transition-all cursor-pointer ${
            fav ? 'bg-amber-400/10 dark:bg-amber-400/5 border-amber-400/30' : ''
          }`}
        >
          <Star 
            size={12} 
            className={fav ? "fill-amber-400 text-amber-400" : "text-text-muted"} 
          />
          <span>{fav ? 'Favorited' : 'Favorite'}</span>
        </button>

        {/* Refresh button with status indicator */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">
            {isLoading ? 'Updating...' : `Updated ${timeAgo}`}
          </span>
          <button 
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-text-primary bg-surface-custom hover:bg-surface-elevated border border-border-custom active:scale-95 transition-all cursor-pointer shadow-sm"
          >
            <RefreshCw size={11} className={isLoading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

    </div>
  );
}
export default WeatherHero;
