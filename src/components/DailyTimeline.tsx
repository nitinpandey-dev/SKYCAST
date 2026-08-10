import React from 'react';
import { HourlyForecast } from '../types/weather';
import { getWeatherCondition, cToF } from '../utils/weatherUtils';
import { WeatherIcon } from './Icons';
import { useSettings } from '../contexts/SettingsContext';

interface DailyTimelineProps {
  hourly: HourlyForecast[];
}

export function DailyTimeline({ hourly }: DailyTimelineProps) {
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
    <div className="glass-card p-4 sm:p-5 transition-all duration-300 w-full select-none">
      <div className="flex items-center justify-between mb-4 border-b border-border-custom/25 pb-2">
        <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider">Today's Timeline</h2>
      </div>
      
      <div className="relative flex flex-row items-center justify-between gap-1 w-full">
        {/* Connection line */}
        <div className="absolute top-[18px] left-[15px] right-[15px] h-[1px] bg-border-custom/50 -z-10 rounded-full"></div>

        {periods.map((period, index) => {
          const data = getPeriodData(period.targetHour);
          if (!data) return null;

          const condition = getWeatherCondition(data.conditionCode, data.isDay);
          const temp = Math.round(units === 'imperial' ? cToF(data.temperature) : data.temperature);

          return (
            <div 
              key={index} 
              className="flex flex-col items-center gap-1 flex-1 relative z-10 text-center"
            >
              {/* Circular container */}
              <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-105 bg-surface-custom border border-border-custom/40 shadow-sm ${
                data.isDay ? 'text-amber-500' : 'text-blue-400'
              }`}>
                <WeatherIcon name={condition.icon} size={15} />
              </div>

              {/* Description */}
              <div className="leading-tight mt-1">
                <div className="font-extrabold text-[10px] text-text-primary leading-none">{period.label}</div>
                <div className="text-[7px] font-bold text-text-muted uppercase tracking-wider mt-0.5">{period.timeLabel}</div>
                <div className="text-[8px] text-text-secondary mt-0.5 font-semibold truncate max-w-[70px] mx-auto hidden sm:block">
                  {condition.description}
                </div>
              </div>

              {/* Temperature */}
              <div className="shrink-0 mt-1">
                <span className="text-xs font-bold text-text-primary">{temp}°</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
export default DailyTimeline;
