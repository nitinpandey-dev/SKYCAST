import React, { useState } from 'react';
import { DailyForecast } from '../types/weather';
import { useSettings } from '../contexts/SettingsContext';
import { cToF, formatDay, getWeatherCondition, kmhToMph, formatTime, getWindDirection } from '../utils/weatherUtils';
import { WeatherIcon } from './Icons';
import { ChevronDown, Sunrise, Sunset, Wind, CloudRain, Sun, Gauge, Eye } from 'lucide-react';

interface TenDayForecastProps {
  daily: DailyForecast[];
  currentTemp: number;
}

export function TenDayForecast({ daily, currentTemp }: TenDayForecastProps) {
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

  // Colors
  const isDark = document.documentElement.classList.contains('dark');
  const barGradStart = isDark ? '#60A5FA' : '#3478F6';
  const barGradEnd = '#FBBF24'; // Warm yellow accent

  return (
    <div className="glass-card p-4 sm:p-5 transition-all duration-300 w-full select-none">
      <div className="flex items-center justify-between mb-4 border-b border-border-custom/25 pb-2">
        <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider">10-Day Forecast</h2>
        <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Expand for Details</span>
      </div>

      <div className="flex flex-col">
        {daily.map((day, index) => {
          const condition = getWeatherCondition(day.conditionCode, true);
          const isToday = index === 0;
          const dayLabel = isToday ? 'Today' : formatDay(day.date).slice(0, 3);
          const temps = getConvertedTemps(day);
          const isExpanded = expandedIndex === index;
          
          const displayWindMax = Math.round(units === 'imperial' ? kmhToMph(day.windSpeedMax) : day.windSpeedMax);
          const windUnit = units === 'imperial' ? 'mph' : 'km/h';
          const windDirStr = getWindDirection(day.windDirectionDominant);

          const displayPrecipSum = units === 'imperial'
            ? (day.precipitationSum * 0.03937).toFixed(2) + ' in'
            : day.precipitationSum.toFixed(1) + ' mm';

          let uvLevel = 'Low';
          if (day.uvIndex >= 3 && day.uvIndex <= 5) uvLevel = 'Mod';
          else if (day.uvIndex >= 6 && day.uvIndex <= 7) uvLevel = 'High';
          else if (day.uvIndex >= 8 && day.uvIndex <= 10) uvLevel = 'V. High';
          else if (day.uvIndex >= 11) uvLevel = 'Extreme';

          // Percentage placement for temperature range bar
          const leftPercent = ((temps.low - absoluteMin) / absoluteDiff) * 100;
          const rightPercent = ((temps.high - absoluteMin) / absoluteDiff) * 100;
          const barWidth = rightPercent - leftPercent;

          // Calculate current temp dot position (Today only)
          let currentTempDotPercent = -1;
          if (isToday) {
            const currentVal = Math.round(units === 'imperial' ? cToF(currentTemp) : currentTemp);
            const rangeDiff = temps.high - temps.low || 1;
            const relativePercent = ((currentVal - temps.low) / rangeDiff) * 100;
            // Map the relative percentage (0-100) inside the bar width
            currentTempDotPercent = leftPercent + (relativePercent * (barWidth / 100));
          }

          return (
            <div 
              key={day.date} 
              className="border-b border-border-custom/20 last:border-none py-3"
            >
              {/* Row Header */}
              <button
                onClick={() => toggleExpand(index)}
                className="w-full flex items-center justify-between text-left focus:outline-none cursor-pointer text-xs sm:text-sm text-text-primary"
                aria-expanded={isExpanded}
              >
                {/* Day (Today / Mon / Tue) */}
                <span className={`w-12 sm:w-16 font-semibold shrink-0 ${isToday ? 'text-accent-custom font-bold' : 'text-text-secondary font-medium'}`}>
                  {dayLabel}
                </span>
                
                {/* Condition Icon */}
                <div className="w-8 flex justify-center shrink-0">
                  <WeatherIcon name={condition.icon} size={14} className={isToday ? 'text-accent-custom' : 'text-text-secondary'} />
                </div>

                {/* Low Temp */}
                <span className="text-text-secondary w-8 text-right font-medium shrink-0 ml-2">
                  {temps.low}°
                </span>

                {/* Range Bar */}
                <div className="flex-1 min-w-[70px] max-w-[120px] sm:max-w-none h-1.5 bg-surface-elevated/60 dark:bg-white/[0.04] rounded-full mx-2 sm:mx-4 relative overflow-visible shrink-0">
                  <div 
                    className="absolute h-full rounded-full"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${Math.max(barWidth, 6)}%`,
                      background: `linear-gradient(90deg, ${barGradStart} 0%, ${barGradEnd} 100%)`
                    }}
                  />
                  
                  {/* Current Temp Dot Indicator */}
                  {isToday && currentTempDotPercent >= 0 && (
                    <div 
                      className="absolute w-2 h-2 rounded-full bg-white border border-accent-custom -top-[1px] shadow-sm transform -translate-x-1/2"
                      style={{ left: `${Math.min(Math.max(currentTempDotPercent, leftPercent), rightPercent)}%` }}
                    />
                  )}
                </div>

                {/* High Temp */}
                <span className="text-text-primary w-8 text-right font-bold shrink-0">
                  {temps.high}°
                </span>

                {/* Rain % */}
                <span className="text-[10px] text-accent-custom font-extrabold w-10 text-right shrink-0 ml-2">
                  {day.precipitationProbability > 0 ? `${day.precipitationProbability}%` : ''}
                </span>

                <ChevronDown 
                  size={12} 
                  className={`text-text-muted transition-transform ml-2 shrink-0 ${isExpanded ? 'rotate-180 text-accent-custom' : ''}`} 
                />
              </button>

              {/* Expanded details (iOS-style clean list with dividers) */}
              {isExpanded && (
                <div className="mt-3.5 pt-3.5 border-t border-border-custom/10 grid grid-cols-2 md:grid-cols-3 gap-3.5 text-xs text-text-secondary animate-in fade-in duration-200">
                  <div className="flex items-center gap-2">
                    <Wind size={12} className="text-emerald-500" />
                    <span>Wind: <strong className="font-bold text-text-primary">{displayWindMax} {windUnit} {windDirStr}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CloudRain size={12} className="text-accent-custom" />
                    <span>Rain Amount: <strong className="font-bold text-text-primary">{displayPrecipSum}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sun size={12} className="text-amber-500" />
                    <span>UV Index: <strong className="font-bold text-text-primary">{day.uvIndex} ({uvLevel})</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sunrise size={12} className="text-amber-400" />
                    <span>Sunrise: <strong className="font-bold text-text-primary">{formatTime(day.sunrise)}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sunset size={12} className="text-orange-400" />
                    <span>Sunset: <strong className="font-bold text-text-primary">{formatTime(day.sunset)}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gauge size={12} className="text-blue-400" />
                    <span>Avg Pressure: <strong className="font-bold text-text-primary">1013 hPa</strong></span>
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
export default TenDayForecast;
