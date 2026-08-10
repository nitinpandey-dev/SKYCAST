import React, { useState } from 'react';
import { DailyForecast } from '../types/weather';
import { useSettings } from '../contexts/SettingsContext';
import { cToF, formatDay, getWeatherCondition, kmhToMph, formatTime } from '../utils/weatherUtils';
import { WeatherIcon } from './Icons';
import { ChevronDown, Sunrise, Sunset, Sun, Wind, CloudRain } from 'lucide-react';

interface DailyForecastProps {
  daily: DailyForecast[];
}

export function DailyForecastComponent({ daily }: DailyForecastProps) {
  const { units } = useSettings();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const toggleExpand = (index: number) => {
    setExpandedIndex(prev => (prev === index ? null : index));
  };

  const getConvertedTemps = (day: DailyForecast) => {
    return {
      high: Math.round(units === 'imperial' ? cToF(day.high) : day.high),
      low: Math.round(units === 'imperial' ? cToF(day.low) : day.low)
    };
  };

  const convertedList = daily.map(getConvertedTemps);
  const absoluteMin = Math.min(...convertedList.map(d => d.low));
  const absoluteMax = Math.max(...convertedList.map(d => d.high));
  const absoluteDiff = absoluteMax - absoluteMin || 1;

  return (
    <div className="glass-card p-5 sm:p-6 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {daily.length}-Day Forecast
        </h2>
        <span className="text-[9px] text-gray-400 dark:text-gray-500 font-semibold uppercase">Details on click</span>
      </div>
      
      <div className="flex flex-col gap-1">
        {daily.map((day, index) => {
          const condition = getWeatherCondition(day.conditionCode, true);
          const isToday = index === 0;
          const label = isToday ? 'Today' : formatDay(day.date).slice(0, 3); // Short day names for iOS feel
          const temps = getConvertedTemps(day);
          const isExpanded = expandedIndex === index;
          
          const displayWindMax = Math.round(units === 'imperial' ? kmhToMph(day.windSpeedMax) : day.windSpeedMax);
          const windUnit = units === 'imperial' ? 'mph' : 'km/h';

          let uvLevel = 'Low';
          if (day.uvIndex >= 3 && day.uvIndex <= 5) uvLevel = 'Mod';
          else if (day.uvIndex >= 6 && day.uvIndex <= 7) uvLevel = 'High';
          else if (day.uvIndex >= 8 && day.uvIndex <= 10) uvLevel = 'Very High';
          else if (day.uvIndex >= 11) uvLevel = 'Extreme';

          const leftPercent = ((temps.low - absoluteMin) / absoluteDiff) * 100;
          const rightPercent = ((temps.high - absoluteMin) / absoluteDiff) * 100;
          const barWidth = rightPercent - leftPercent;

          return (
            <div 
              key={day.date} 
              className={`rounded-xl transition-all duration-200 border ${
                isExpanded 
                  ? 'bg-black/5 dark:bg-white/5 border-primary/10 p-3.5' 
                  : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5 py-2.5 px-3'
              }`}
            >
              {/* Row Header */}
              <button
                onClick={() => toggleExpand(index)}
                className="w-full flex items-center justify-between text-left focus:outline-none cursor-pointer text-xs sm:text-sm"
                aria-expanded={isExpanded}
              >
                <span className={`w-12 sm:w-16 font-semibold truncate ${isToday ? 'text-primary' : ''}`}>
                  {isToday ? 'Today' : label}
                </span>
                
                <div className="flex items-center gap-2 w-20 justify-start shrink-0">
                  <WeatherIcon name={condition.icon} size={14} className="text-gray-500 dark:text-gray-400" />
                  <span className="text-[9px] text-blue-500 font-bold">
                    {day.precipitationProbability > 0 ? `${day.precipitationProbability}%` : ''}
                  </span>
                </div>

                {/* Range Bar tracking */}
                <div className="flex items-center gap-3 flex-1 justify-end">
                  <span className="text-gray-400 dark:text-gray-500 w-6 text-right font-medium">{temps.low}°</span>
                  
                  {/* Range indicator track */}
                  <div className="w-14 sm:w-28 h-1 bg-black/10 dark:bg-white/10 rounded-full relative overflow-hidden shrink-0">
                    <div 
                      className="absolute h-full bg-gradient-to-r from-blue-400 to-amber-400 rounded-full"
                      style={{
                        left: `${leftPercent}%`,
                        width: `${Math.max(barWidth, 5)}%`
                      }}
                    />
                  </div>
                  
                  <span className="text-gray-900 dark:text-gray-100 w-6 text-right font-semibold">{temps.high}°</span>
                  <ChevronDown size={10} className={`text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-primary' : ''}`} />
                </div>
              </button>

              {/* Detail panel */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-[var(--border)] grid grid-cols-2 gap-y-3 gap-x-4 text-[10px] sm:text-xs animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                    <Sunrise size={12} className="text-orange-400" />
                    <span>Sunrise: <strong className="font-semibold text-gray-800 dark:text-gray-200">{formatTime(day.sunrise)}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                    <Sunset size={12} className="text-red-400" />
                    <span>Sunset: <strong className="font-semibold text-gray-800 dark:text-gray-200">{formatTime(day.sunset)}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                    <Sun size={12} className="text-amber-500" />
                    <span>UV Index: <strong className="font-semibold text-gray-800 dark:text-gray-200">{day.uvIndex} ({uvLevel})</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                    <Wind size={12} className="text-teal-500" />
                    <span>Wind Max: <strong className="font-semibold text-gray-800 dark:text-gray-200">{displayWindMax} {windUnit}</strong></span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
