import React, { useState } from 'react';
import { DailyForecast } from '../types/weather';
import { useSettings } from '../contexts/SettingsContext';
import { cToF, formatDay, getWeatherCondition, kmhToMph, formatTime, getWindDirection } from '../utils/weatherUtils';
import { WeatherIcon } from './Icons';
import { ChevronDown, Sunrise, Sunset, Sun, Wind, CloudRain, Droplets, Cloud, Gauge } from 'lucide-react';

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
  const barGradEnd = '#f59e0b'; // Warm accent

  return (
    <div className="glass-card p-4 sm:p-5 transition-all duration-300 w-full">
      <div className="flex items-center justify-between mb-3 border-b border-border-custom/25 pb-2">
        <h2 className="text-xs font-bold text-text-muted uppercase tracking-wider">
          {daily.length}-Day Forecast
        </h2>
        <span className="text-[10px] text-text-muted font-semibold">Click row to expand details</span>
      </div>
      
      {/* Unified List Panel */}
      <div className="flex flex-col">
        {daily.map((day, index) => {
          const condition = getWeatherCondition(day.conditionCode, true);
          const isToday = index === 0;
          const label = isToday ? 'Today' : formatDay(day.date).slice(0, 3);
          const temps = getConvertedTemps(day);
          const isExpanded = expandedIndex === index;
          
          const displayWindMax = Math.round(units === 'imperial' ? kmhToMph(day.windSpeedMax) : day.windSpeedMax);
          const displayWindGust = Math.round(units === 'imperial' ? kmhToMph(day.windGustsMax) : day.windGustsMax);
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
                {/* Day column (Today / Mon / Tue) */}
                <span className={`w-12 sm:w-16 font-semibold truncate shrink-0 ${isToday ? 'text-accent-custom' : ''}`}>
                  {isToday ? 'Today' : label}
                </span>
                
                {/* Condition Icon & Rain probability */}
                <div className="flex items-center gap-2 w-14 sm:w-16 justify-start shrink-0">
                  <WeatherIcon name={condition.icon} size={14} className="text-text-secondary" />
                  <span className="text-[9px] text-accent-custom font-extrabold">
                    {day.precipitationProbability > 0 ? `${day.precipitationProbability}%` : ''}
                  </span>
                </div>

                {/* Condition Text (Desktop/Tablet only) */}
                <span className="text-xs text-text-secondary font-medium w-28 truncate hidden sm:block">
                  {condition.description}
                </span>

                {/* Range Bar Indicator */}
                <div className="flex items-center gap-2.5 flex-1 justify-end">
                  <span className="text-text-secondary w-6 text-right font-medium">{temps.low}°</span>
                  
                  <div className="w-12 sm:w-24 h-1.5 bg-surface-strong rounded-full relative overflow-hidden shrink-0">
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
                </div>

                {/* Wind & Wind direction (Desktop/Tablet only) */}
                <span className="text-xs text-text-secondary font-medium w-24 text-right truncate hidden md:block shrink-0">
                  {displayWindMax} {windUnit} {windDirStr}
                </span>

                <ChevronDown size={10} className={`text-text-muted transition-transform duration-250 ml-2 shrink-0 ${isExpanded ? 'rotate-180 text-accent-custom' : ''}`} />
              </button>

              {/* Accordion Detail Panel (Displays ALL daily variables) */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-border-custom/40 grid grid-cols-2 sm:grid-cols-3 gap-y-3.5 gap-x-4 text-[10px] sm:text-xs text-text-secondary animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 text-left">
                    <WeatherIcon name="Thermometer" size={14} className="text-rose-500 shrink-0" />
                    <div>
                      <div className="text-[8px] font-bold text-text-muted uppercase leading-none mb-0.5">Temperature</div>
                      <div>H: <strong>{temps.high}°</strong> &bull; L: <strong>{temps.low}°</strong></div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-left">
                    <CloudRain size={14} className="text-accent-custom shrink-0" />
                    <div>
                      <div className="text-[8px] font-bold text-text-muted uppercase leading-none mb-0.5">Precipitation</div>
                      <div>Prob: <strong>{day.precipitationProbability}%</strong> &bull; Sum: <strong>{displayPrecipSum}</strong></div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-left">
                    <Wind size={14} className="text-emerald-500 shrink-0" />
                    <div>
                      <div className="text-[8px] font-bold text-text-muted uppercase leading-none mb-0.5">Wind Details</div>
                      <div>Max: <strong>{displayWindMax} {windUnit}</strong> &bull; Gusts: <strong>{displayWindGust} {windUnit}</strong></div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-left">
                    <Sunrise size={14} className="text-orange-400 shrink-0" />
                    <div>
                      <div className="text-[8px] font-bold text-text-muted uppercase leading-none mb-0.5">Astronomy</div>
                      <div>Rise: <strong>{formatTime(day.sunrise)}</strong> &bull; Set: <strong>{formatTime(day.sunset)}</strong></div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-left">
                    <Sun size={14} className="text-amber-500 shrink-0" />
                    <div>
                      <div className="text-[8px] font-bold text-text-muted uppercase leading-none mb-0.5">UV index</div>
                      <div>Value: <strong>{day.uvIndex} ({uvLevel})</strong></div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-left">
                    <Droplets size={14} className="text-teal-500 shrink-0" />
                    <div>
                      <div className="text-[8px] font-bold text-text-muted uppercase leading-none mb-0.5">Atmosphere</div>
                      <div>Hum: <strong>{day.humidityAvg}%</strong> &bull; Cloud: <strong>{day.cloudCoverAvg}%</strong></div>
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
export default DailyForecastComponent;
