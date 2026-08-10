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
    <div className="glass-card p-4 sm:p-5 transition-all duration-300 w-full">
      <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-4">Today's Timeline</h2>
      
      <div className="relative flex flex-row items-center justify-between gap-1 w-full select-none">
        {/* Connecting line */}
        <div className="absolute top-[18px] left-[15px] right-[15px] h-[1px] bg-border-custom/50 -z-10 rounded-full"></div>

        {periods.map((period, index) => {
          const data = getPeriodData(period.targetHour);
          if (!data) return null;

          const condition = getWeatherCondition(data.conditionCode, data.isDay);
          const temp = Math.round(units === 'imperial' ? cToF(data.temperature) : data.temperature);

          return (
            <div 
              key={index} 
              className="flex flex-col items-center gap-1.5 flex-1 relative z-10 text-center"
            >
              {/* Softer circular icon container */}
              <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-105 bg-surface border border-border-custom/40 shadow-sm ${
                data.isDay ? 'text-amber-500' : 'text-blue-400'
              }`}>
                <WeatherIcon name={condition.icon} size={15} />
              </div>

              {/* Text info */}
              <div className="leading-tight mt-0.5">
                <div className="font-extrabold text-[11px] text-text-primary leading-tight">{period.label}</div>
                <div className="text-[8px] font-bold text-text-muted uppercase tracking-wider mt-0.5">{period.timeLabel}</div>
                <div className="text-[9px] text-text-secondary mt-0.5 font-semibold truncate max-w-[70px] mx-auto hidden sm:block">
                  {condition.description}
                </div>
              </div>

              {/* Temperature */}
              <div className="shrink-0 mt-0.5">
                <span className="text-xs font-black text-text-primary">{temp}°</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
export default WeatherTimeline;
