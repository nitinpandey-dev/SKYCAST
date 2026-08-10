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

  // Convert all temps once for calculation
  const getConvertedTemps = (day: DailyForecast) => {
    return {
      high: Math.round(units === 'imperial' ? cToF(day.high) : day.high),
      low: Math.round(units === 'imperial' ? cToF(day.low) : day.low)
    };
  };

  // Calculate 7-day absolute min and max for range bar normalization
  const convertedList = daily.map(getConvertedTemps);
  const absoluteMin = Math.min(...convertedList.map(d => d.low));
  const absoluteMax = Math.max(...convertedList.map(d => d.high));
  const absoluteDiff = absoluteMax - absoluteMin || 1;

  return (
    <div className="glass-card p-6 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">7-Day Forecast</h2>
        <span className="text-[10px] text-gray-400 dark:text-gray-500">Tap day to expand</span>
      </div>
      
      <div className="flex flex-col gap-1.5">
        {daily.map((day, index) => {
          const condition = getWeatherCondition(day.conditionCode, true);
          const isToday = index === 0;
          const label = isToday ? 'Today' : formatDay(day.date);
          const temps = getConvertedTemps(day);
          const isExpanded = expandedIndex === index;
          
          const displayWindMax = Math.round(units === 'imperial' ? kmhToMph(day.windSpeedMax) : day.windSpeedMax);
          const windUnit = units === 'imperial' ? 'mph' : 'km/h';

          let uvLevel = 'Low';
          if (day.uvIndex >= 3 && day.uvIndex <= 5) uvLevel = 'Moderate';
          else if (day.uvIndex >= 6 && day.uvIndex <= 7) uvLevel = 'High';
          else if (day.uvIndex >= 8 && day.uvIndex <= 10) uvLevel = 'Very High';
          else if (day.uvIndex >= 11) uvLevel = 'Extreme';

          // Horizontal Range Bar Percentages
          const leftPercent = ((temps.low - absoluteMin) / absoluteDiff) * 100;
          const rightPercent = ((temps.high - absoluteMin) / absoluteDiff) * 100;
          const barWidth = rightPercent - leftPercent;

          return (
            <div 
              key={day.date} 
              className={`rounded-2xl transition-all duration-200 border ${
                isExpanded 
                  ? 'bg-black/5 dark:bg-white/5 border-primary/10 p-4' 
                  : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5 py-2 px-2 sm:px-4'
              }`}
            >
              {/* Row Header - Clickable */}
              <button
                onClick={() => toggleExpand(index)}
                className="w-full flex items-center justify-between text-left focus:outline-none cursor-pointer group text-xs sm:text-sm"
                aria-expanded={isExpanded}
                aria-label={`${label}, ${condition.description}, High ${temps.high}°, Low ${temps.low}°`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-16 sm:w-20 font-semibold group-hover:text-primary transition-colors truncate ${isToday ? 'text-primary' : ''}`}>
                    {label}
                  </span>
                  
                  <div className="flex items-center gap-1.5 w-24">
                    <WeatherIcon name={condition.icon} size={14} className="text-gray-500 dark:text-gray-400 shrink-0" />
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 hidden sm:inline truncate">
                      {condition.description}
                    </span>
                  </div>
                </div>

                {/* Range bar and values */}
                <div className="flex items-center gap-4 flex-1 justify-end max-w-md">
                  <div className="text-[10px] text-blue-500 font-bold w-10 text-right">
                    {day.precipitationProbability > 0 ? `${day.precipitationProbability}%` : ''}
                  </div>
                  
                  {/* Left (Low) temperature */}
                  <span className="text-gray-400 dark:text-gray-500 w-6 text-right font-medium">{temps.low}°</span>
                  
                  {/* Horizontal Range Bar Track */}
                  <div className="w-16 sm:w-24 h-1.5 bg-black/10 dark:bg-white/10 rounded-full relative overflow-hidden hidden xs:block">
                    <div 
                      className="absolute h-full bg-gradient-to-r from-blue-400 to-amber-400 rounded-full"
                      style={{
                        left: `${leftPercent}%`,
                        width: `${Math.max(barWidth, 5)}%` // Ensure a minimum width is visible
                      }}
                    />
                  </div>
                  
                  {/* Right (High) temperature */}
                  <span className="text-gray-900 dark:text-gray-100 w-6 text-right font-semibold">{temps.high}°</span>

                  <ChevronDown size={12} className={`text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-primary' : ''}`} />
                </div>
              </button>

              {/* Accordion Expand Details */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-[var(--border)] grid grid-cols-2 sm:grid-cols-4 gap-4 text-[10px] sm:text-xs animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Sunrise size={14} className="text-orange-400 shrink-0" />
                    <div>
                      <div className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase leading-none mb-0.5">Sunrise</div>
                      <div className="font-semibold text-gray-800 dark:text-gray-200">{formatTime(day.sunrise)}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Sunset size={14} className="text-red-400 shrink-0" />
                    <div>
                      <div className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase leading-none mb-0.5">Sunset</div>
                      <div className="font-semibold text-gray-800 dark:text-gray-200">{formatTime(day.sunset)}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Sun size={14} className="text-amber-500 shrink-0" />
                    <div>
                      <div className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase leading-none mb-0.5">UV Index</div>
                      <div className="font-semibold text-gray-800 dark:text-gray-200">{day.uvIndex} ({uvLevel})</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Wind size={14} className="text-teal-500 shrink-0" />
                    <div>
                      <div className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase leading-none mb-0.5">Max Wind</div>
                      <div className="font-semibold text-gray-800 dark:text-gray-200">{displayWindMax} {windUnit}</div>
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
