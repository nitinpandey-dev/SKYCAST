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

  // Find forecast at specific times of the day (relative to today's starting index)
  // Let's assume indices are relative to today.
  // Morning: 8 AM, Afternoon: 2 PM, Evening: 6 PM, Night: 10 PM.
  // We can scan the hourly forecast times and find the closest matches.
  
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
      <h2 className="text-xl font-bold mb-6">Today's Timeline</h2>
      
      <div className="relative flex flex-col sm:flex-row items-stretch justify-between gap-6 sm:gap-4">
        {/* Connecting line for desktop */}
        <div className="absolute top-[40px] left-[40px] right-[40px] h-[3px] bg-gray-200 dark:bg-gray-800 hidden sm:block -z-10 rounded-full"></div>
        {/* Connecting line for mobile */}
        <div className="absolute left-[30px] top-[40px] bottom-[40px] w-[3px] bg-gray-200 dark:bg-gray-800 sm:hidden -z-10 rounded-full"></div>

        {periods.map((period, index) => {
          const data = getPeriodData(period.targetHour);
          if (!data) return null;

          const condition = getWeatherCondition(data.conditionCode, data.isDay);
          const temp = Math.round(units === 'imperial' ? cToF(data.temperature) : data.temperature);

          return (
            <div 
              key={index} 
              className="flex sm:flex-col items-center gap-4 sm:gap-2 flex-1 relative z-10 bg-white dark:bg-gray-900 sm:bg-transparent p-3 sm:p-0 rounded-2xl sm:rounded-none shadow-sm sm:shadow-none border border-gray-100 dark:border-gray-800 sm:border-none"
            >
              {/* Icon circle */}
              <div className={`w-14 h-14 rounded-full flex items-center justify-center border-4 border-white dark:border-gray-900 shadow-md transition-all hover:scale-115 ${
                data.isDay 
                  ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-500' 
                  : 'bg-indigo-50 dark:bg-indigo-950/20 text-blue-400'
              }`}>
                <WeatherIcon name={condition.icon} size={24} />
              </div>

              {/* Text info */}
              <div className="text-left sm:text-center flex-1 sm:flex-initial">
                <div className="font-extrabold text-sm text-gray-800 dark:text-gray-200">{period.label}</div>
                <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">{period.timeLabel}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-semibold truncate max-w-[120px] sm:mx-auto">
                  {condition.description}
                </div>
              </div>

              {/* Temperature */}
              <div className="text-right sm:text-center shrink-0">
                <span className="text-lg font-black text-gray-900 dark:text-white">{temp}°</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
