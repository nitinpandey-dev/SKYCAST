import React, { useState } from 'react';
import { DailyForecast } from '../types/weather';
import { useSettings } from '../contexts/SettingsContext';
import { cToF, formatDay, getWeatherCondition, kmhToMph, formatTime } from '../utils/weatherUtils';
import { WeatherIcon } from './Icons';
import { ChevronDown, Sunrise, Sunset, Sun, Wind } from 'lucide-react';

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

  // Theme-aware setup
  const isDark = document.documentElement.classList.contains('dark');
  const barGradStart = isDark ? 'var(--accent-custom)' : '#3478F6';
  const barGradEnd = '#f59e0b'; // Muted amber for high temps

  return (
    <div className="glass-card p-5 sm:p-6 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-bold text-text-muted uppercase tracking-wider">
          {daily.length}-Day Forecast
        </h2>
        <span className="text-[9px] text-text-muted font-semibold uppercase">Details on click</span>
      </div>
      
      {/* Unified List Panel (No individual card borders, rows have subtle separators) */}
      <div className="flex flex-col">
        {daily.map((day, index) => {
          const condition = getWeatherCondition(day.conditionCode, true);
          const isToday = index === 0;
          const label = isToday ? 'Today' : formatDay(day.date).slice(0, 3);
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
              className={`border-b border-border-custom/70 last:border-none py-2.5 transition-all duration-200 ${
                isExpanded ? 'bg-surface/30 px-3 rounded-2xl my-1 border-none' : ''
              }`}
            >
              {/* Row Header */}
              <button
                onClick={() => toggleExpand(index)}
                className="w-full flex items-center justify-between text-left focus:outline-none cursor-pointer text-xs sm:text-sm text-text-primary font-medium"
                aria-expanded={isExpanded}
              >
                <span className={`w-12 sm:w-16 font-semibold truncate ${isToday ? 'text-accent-custom' : ''}`}>
                  {isToday ? 'Today' : label}
                </span>
                
                <div className="flex items-center gap-2.5 w-16 justify-start shrink-0">
                  <WeatherIcon name={condition.icon} size={14} className="text-text-secondary" />
                  <span className="text-[9px] text-accent-custom font-bold">
                    {day.precipitationProbability > 0 ? `${day.precipitationProbability}%` : ''}
                  </span>
                </div>

                {/* Range Bar tracking */}
                <div className="flex items-center gap-3 flex-1 justify-end">
                  <span className="text-text-secondary w-6 text-right font-medium">{temps.low}°</span>
                  
                  {/* Range indicator track */}
                  <div className="w-14 sm:w-28 h-1.5 bg-surface-strong rounded-full relative overflow-hidden shrink-0">
                    <div 
                      className="absolute h-full rounded-full"
                      style={{
                        left: `${leftPercent}%`,
                        width: `${Math.max(barWidth, 5)}%`,
                        background: `linear-gradient(90deg, ${barGradStart} 0%, ${barGradEnd} 100%)`
                      }}
                    />
                  </div>
                  
                  <span className="text-text-primary w-6 text-right font-semibold">{temps.high}°</span>
                  <ChevronDown size={10} className={`text-text-muted transition-transform duration-250 ${isExpanded ? 'rotate-180 text-accent-custom' : ''}`} />
                </div>
              </button>

              {/* Detail panel */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-border-custom/40 grid grid-cols-2 gap-y-3 gap-x-4 text-[10px] sm:text-xs text-text-secondary animate-in fade-in duration-200">
                  <div className="flex items-center gap-1.5">
                    <Sunrise size={12} className="text-orange-400 shrink-0" />
                    <span>Sunrise: <strong className="font-semibold text-text-primary">{formatTime(day.sunrise)}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Sunset size={12} className="text-red-400 shrink-0" />
                    <span>Sunset: <strong className="font-semibold text-text-primary">{formatTime(day.sunset)}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Sun size={12} className="text-amber-500 shrink-0" />
                    <span>UV Index: <strong className="font-semibold text-text-primary">{day.uvIndex} ({uvLevel})</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Wind size={12} className="text-emerald-500 shrink-0" />
                    <span>Wind Max: <strong className="font-semibold text-text-primary">{displayWindMax} {windUnit}</strong></span>
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
export default DailyForecastComponent;
