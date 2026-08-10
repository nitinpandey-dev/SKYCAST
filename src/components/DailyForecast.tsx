import React from 'react';
import { DailyForecast } from '../types/weather';
import { useSettings } from '../contexts/SettingsContext';
import { cToF, formatDay, getWeatherCondition } from '../utils/weatherUtils';
import { WeatherIcon } from './Icons';

interface DailyForecastProps {
  daily: DailyForecast[];
}

export function DailyForecastComponent({ daily }: DailyForecastProps) {
  const { units } = useSettings();

  return (
    <div className="glass-card p-6">
      <h2 className="text-xl font-semibold mb-6">7-Day Forecast</h2>
      
      <div className="flex flex-col gap-4">
        {daily.map((day, index) => {
          const condition = getWeatherCondition(day.conditionCode, true);
          const isToday = index === 0;
          const label = isToday ? 'Today' : formatDay(day.date);
          const high = Math.round(units === 'imperial' ? cToF(day.high) : day.high);
          const low = Math.round(units === 'imperial' ? cToF(day.low) : day.low);
          
          return (
            <div key={day.date} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0 last:pb-0">
              <span className={`w-28 font-medium ${isToday ? 'text-primary font-bold' : ''}`}>
                {label}
              </span>
              
              <div className="flex items-center gap-3 w-1/3 justify-start">
                <WeatherIcon name={condition.icon} size={20} className="text-gray-600 dark:text-gray-300" />
                <div className="text-sm text-blue-500 font-medium w-12">
                  {day.precipitationProbability > 0 ? `${day.precipitationProbability}%` : ''}
                </div>
              </div>
              
              <div className="flex items-center justify-end w-24 gap-4">
                <span className="font-semibold text-gray-900 dark:text-gray-100">{high}°</span>
                <span className="text-gray-500 dark:text-gray-400">{low}°</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
