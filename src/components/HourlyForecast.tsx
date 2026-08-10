import React, { useRef } from 'react';
import { HourlyForecast } from '../types/weather';
import { useSettings } from '../contexts/SettingsContext';
import { cToF, formatHour, getWeatherCondition } from '../utils/weatherUtils';
import { WeatherIcon } from './Icons';
import { Eye, Wind, Droplets, CloudRain } from 'lucide-react';

interface HourlyForecastProps {
  hourly: HourlyForecast[];
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
}

export function HourlyForecast({ hourly, activeIndex, onActiveIndexChange }: HourlyForecastProps) {
  const { units } = useSettings();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const activeHour = hourly[activeIndex] || hourly[0];
  if (!activeHour) return null;

  const activeCondition = getWeatherCondition(activeHour.conditionCode, activeHour.isDay);
  const activeTemp = Math.round(units === 'imperial' ? cToF(activeHour.temperature) : activeHour.temperature);
  const activeFeels = Math.round(units === 'imperial' ? cToF(activeHour.apparentTemperature) : activeHour.apparentTemperature);
  const activeWind = Math.round(units === 'imperial' ? activeHour.windSpeed * 0.621371 : activeHour.windSpeed); // Convert to mph if imperial
  const activeWindUnit = units === 'imperial' ? 'mph' : 'km/h';

  const chartData = hourly.slice(0, 24).map((hour, index) => ({
    time: index === 0 ? 'Now' : formatHour(hour.time),
    temp: Math.round(units === 'imperial' ? cToF(hour.temperature) : hour.temperature),
    pop: hour.precipitationProbability,
    isDay: hour.isDay,
    condition: getWeatherCondition(hour.conditionCode, hour.isDay)
  }));

  return (
    <div className="glass-card hourly-forecast-card p-4 sm:p-5 transition-all duration-300 w-full select-none">
      <div className="flex items-center justify-between mb-4 border-b border-border-custom/25 pb-2">
        <h2 className="text-xs font-semibold text-text-primary tracking-wider">Hourly forecast</h2>
        <span className="text-[10px] text-text-muted font-medium">Next 24 hours</span>
      </div>

      {/* Selected Hour Details (Floating Glass Pill) */}
      <div className="glass-inset p-3 flex flex-wrap items-center justify-between gap-3.5 mb-4 transition-all duration-300">
        <div className="flex items-center gap-2.5">
          <div className="text-[#3478F6] dark:text-accent-custom bg-accent-custom/8 p-1.5 rounded-xl">
            <WeatherIcon name={activeCondition.icon} size={16} />
          </div>
          <div className="text-left leading-none">
            <span className="text-[8px] text-text-muted font-semibold uppercase tracking-wider block mb-0.5">
              {activeIndex === 0 ? 'Currently' : formatHour(activeHour.time)}
            </span>
            <div className="text-xs font-semibold flex items-center gap-1.5 text-text-primary">
              <span>{activeCondition.description}</span>
              <span className="text-text-muted">•</span>
              <span className="text-accent-custom font-bold">{activeTemp}°</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1.5 text-[10px] text-text-secondary">
          <div className="flex items-center gap-1">
            <Eye size={11} className="text-text-muted" />
            <span>Feels: <strong className="font-semibold text-text-primary dark:text-[#E8EEF6]">{activeFeels}°</strong></span>
          </div>
          <div className="flex items-center gap-1">
            <CloudRain size={11} className="text-accent-custom" />
            <span>Rain: <strong className="font-semibold text-accent-custom">{activeHour.precipitationProbability}%</strong></span>
          </div>
          <div className="flex items-center gap-1">
            <Droplets size={11} className="text-[#059669] dark:text-teal-500" />
            <span>Humidity: <strong className="font-semibold text-[#059669] dark:text-[#34D399]">{activeHour.humidity}%</strong></span>
          </div>
          <div className="flex items-center gap-1">
            <Wind size={11} className="text-[#059669] dark:text-emerald-500" />
            <span>Wind: <strong className="font-semibold text-[#059669] dark:text-[#E8EEF6]">{Math.round(activeWind)} {activeWindUnit}</strong></span>
          </div>
        </div>
      </div>

      {/* Horizontal Cards Strip */}
      <div 
        ref={scrollContainerRef}
        className="w-full overflow-x-auto hide-scrollbar pb-1 select-none"
      >
        <div className="flex w-max min-w-full gap-1">
          {chartData.map((hour, index) => {
            const isActive = activeIndex === index;
            return (
              <button
                key={index}
                onClick={() => onActiveIndexChange(index)}
                className={`flex flex-col items-center justify-between w-[3.25rem] py-2 rounded-xl transition-all duration-200 border text-center cursor-pointer ${
                  isActive 
                    ? 'hourly-cell-current font-semibold dark:text-text-primary'
                    : 'bg-transparent border-transparent hover:bg-[#F8FAFC] dark:hover:bg-[rgba(255,255,255,0.04)] text-text-secondary'
                }`}
              >
                <span className="text-[9px] font-normal text-text-muted">
                  {hour.time}
                </span>
                
                <WeatherIcon 
                  name={hour.condition.icon} 
                  size={14} 
                  animate={isActive}
                  className={`my-1.5 ${hour.condition.icon === 'Sun' ? 'text-[#F4B400] dark:text-accent-custom' : 'text-[#3478F6] dark:text-accent-custom'}`}
                />
                
                <span className={`text-xs font-semibold ${isActive ? 'text-accent-custom dark:text-text-primary' : 'text-[#1F2937] dark:text-text-primary'}`}>{hour.temp}°</span>
                
                <span className={`text-[8px] font-semibold mt-0.5 ${hour.pop > 0 ? 'text-accent-custom' : 'text-text-muted'}`}>
                  {hour.pop > 0 ? `${hour.pop}%` : '•'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
export default HourlyForecast;
