import React from 'react';
import { HourlyForecast } from '../types/weather';
import { getWeatherCondition, cToF } from '../utils/weatherUtils';
import { WeatherIcon } from './Icons';
import { useSettings } from '../contexts/SettingsContext';

interface WeatherTimelineProps {
  hourly: HourlyForecast[];
}

export function WeatherTimeline({ hourly }: WeatherTimelineProps) {
  const { units } = useSettings();

  const getPeriodData = (targetHour: number) => {
    const match = hourly.find(h => {
      const hourVal = new Date(h.time).getHours();
      return hourVal === targetHour;
    });
    return match || null;
  };

  const periods = [
    { label: 'Morning', targetHour: 8, timeLabel: '8:00 AM' },
    { label: 'Afternoon', targetHour: 14, timeLabel: '2:00 PM' },
    { label: 'Evening', targetHour: 18, timeLabel: '6:00 PM' },
    { label: 'Night', targetHour: 22, timeLabel: '10:00 PM' }
  ];

  return (
    <div className="glass-card p-6 transition-all duration-300">
      <h2 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-6">Today's Timeline</h2>
      
      <div className="relative flex flex-col sm:flex-row items-stretch justify-between gap-6 sm:gap-4">
        {/* Connecting line for desktop */}
        <div className="absolute top-[28px] left-[40px] right-[40px] h-[2px] bg-border-custom hidden sm:block -z-10 rounded-full"></div>
        {/* Connecting line for mobile */}
        <div className="absolute left-[28px] top-[28px] bottom-[28px] w-[2px] bg-border-custom sm:hidden -z-10 rounded-full"></div>

        {periods.map((period, index) => {
          const data = getPeriodData(period.targetHour);
          if (!data) return null;

          const condition = getWeatherCondition(data.conditionCode, data.isDay);
          const temp = Math.round(units === 'imperial' ? cToF(data.temperature) : data.temperature);

          return (
            <div 
              key={index} 
              className="flex sm:flex-col items-center gap-4 sm:gap-2 flex-1 relative z-10 bg-surface sm:bg-transparent p-3 sm:p-0 rounded-2xl sm:rounded-none border border-border-custom sm:border-none shadow-sm sm:shadow-none"
            >
              {/* Icon circle */}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-bg-primary shadow-sm transition-all hover:scale-110 ${
                data.isDay 
                  ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-500' 
                  : 'bg-indigo-50 dark:bg-indigo-950/20 text-blue-400'
              }`}>
                <WeatherIcon name={condition.icon} size={20} />
              </div>

              {/* Text info */}
              <div className="text-left sm:text-center flex-1 sm:flex-initial">
                <div className="font-extrabold text-sm text-text-primary leading-tight">{period.label}</div>
                <div className="text-[9px] font-bold text-text-muted uppercase tracking-wider mt-0.5">{period.timeLabel}</div>
                <div className="text-[10px] text-text-secondary mt-1 font-semibold truncate max-w-[120px] sm:mx-auto">
                  {condition.description}
                </div>
              </div>

              {/* Temperature */}
              <div className="text-right sm:text-center shrink-0">
                <span className="text-base font-black text-text-primary">{temp}°</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
