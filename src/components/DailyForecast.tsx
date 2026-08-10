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
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0); // Default open first day (Today)

  const toggleExpand = (index: number) => {
    setExpandedIndex(prev => (prev === index ? null : index));
  };

  return (
    <div className="glass-card p-6 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">7-Day Forecast</h2>
        <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">Tap a day for more info</span>
      </div>
      
      <div className="flex flex-col gap-2">
        {daily.map((day, index) => {
          const condition = getWeatherCondition(day.conditionCode, true);
          const isToday = index === 0;
          const label = isToday ? 'Today' : formatDay(day.date);
          const high = Math.round(units === 'imperial' ? cToF(day.high) : day.high);
          const low = Math.round(units === 'imperial' ? cToF(day.low) : day.low);
          const isExpanded = expandedIndex === index;
          
          const displayWindMax = Math.round(units === 'imperial' ? kmhToMph(day.windSpeedMax) : day.windSpeedMax);
          const windUnit = units === 'imperial' ? 'mph' : 'km/h';

          let uvLevel = 'Low';
          if (day.uvIndex >= 3 && day.uvIndex <= 5) uvLevel = 'Moderate';
          else if (day.uvIndex >= 6 && day.uvIndex <= 7) uvLevel = 'High';
          else if (day.uvIndex >= 8 && day.uvIndex <= 10) uvLevel = 'Very High';
          else if (day.uvIndex >= 11) uvLevel = 'Extreme';

          return (
            <div 
              key={day.date} 
              className={`rounded-2xl transition-all duration-300 border ${
                isExpanded 
                  ? 'bg-black/5 dark:bg-white/5 border-primary/20 p-4' 
                  : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5 py-3 px-2 sm:px-4'
              }`}
            >
              {/* Row Header - Clickable */}
              <button
                onClick={() => toggleExpand(index)}
                className="w-full flex items-center justify-between text-left focus:outline-none cursor-pointer group"
                aria-expanded={isExpanded}
                aria-label={`${label}, ${condition.description}, High ${high}°, Low ${low}°`}
              >
                <div className="flex items-center gap-4">
                  <span className={`w-24 sm:w-28 text-sm font-semibold group-hover:text-primary transition-colors ${isToday ? 'text-primary' : ''}`}>
                    {label}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <WeatherIcon name={condition.icon} size={20} className="text-gray-600 dark:text-gray-300" />
                    <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 hidden sm:inline truncate max-w-[100px]">
                      {condition.description}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-xs text-blue-500 font-bold flex items-center gap-1">
                    {day.precipitationProbability > 0 ? (
                      <>
                        <CloudRain size={12} />
                        <span>{day.precipitationProbability}%</span>
                      </>
                    ) : (
                      <span className="text-gray-300 dark:text-gray-700 font-normal">•</span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 font-semibold text-sm">
                    <span className="text-gray-900 dark:text-gray-100 w-8 text-right">{high}°</span>
                    <span className="text-gray-400 dark:text-gray-500 w-8 text-right">{low}°</span>
                  </div>

                  <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-primary' : ''}`} />
                </div>
              </button>

              {/* Expandable Content Panel */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-[var(--border)] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Sunrise size={16} className="text-orange-400 shrink-0" />
                    <div>
                      <div className="font-bold text-gray-400 dark:text-gray-500 text-[10px] uppercase">Sunrise</div>
                      <div className="font-bold text-gray-800 dark:text-gray-200">{formatTime(day.sunrise)}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Sunset size={16} className="text-red-400 shrink-0" />
                    <div>
                      <div className="font-bold text-gray-400 dark:text-gray-500 text-[10px] uppercase">Sunset</div>
                      <div className="font-bold text-gray-800 dark:text-gray-200">{formatTime(day.sunset)}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Sun size={16} className="text-amber-500 shrink-0" />
                    <div>
                      <div className="font-bold text-gray-400 dark:text-gray-500 text-[10px] uppercase">UV Index</div>
                      <div className="font-bold text-gray-800 dark:text-gray-200">{day.uvIndex} ({uvLevel})</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Wind size={16} className="text-teal-500 shrink-0" />
                    <div>
                      <div className="font-bold text-gray-400 dark:text-gray-500 text-[10px] uppercase">Max Wind</div>
                      <div className="font-bold text-gray-800 dark:text-gray-200">{displayWindMax} {windUnit}</div>
                    </div>
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
