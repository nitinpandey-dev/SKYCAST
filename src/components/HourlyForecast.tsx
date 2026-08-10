import React from 'react';
import { HourlyForecast } from '../types/weather';
import { useSettings } from '../contexts/SettingsContext';
import { cToF, formatHour, getWeatherCondition } from '../utils/weatherUtils';
import { WeatherIcon } from './Icons';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface HourlyForecastProps {
  hourly: HourlyForecast[];
}

export function HourlyForecastComponent({ hourly }: HourlyForecastProps) {
  const { units } = useSettings();

  // Prepare data for the chart
  const chartData = hourly.map(hour => ({
    time: formatHour(hour.time),
    temp: Math.round(units === 'imperial' ? cToF(hour.temperature) : hour.temperature),
    rawTime: hour.time,
    code: hour.conditionCode,
    isDay: hour.isDay,
    pop: hour.precipitationProbability
  }));

  const minTemp = Math.min(...chartData.map(d => d.temp));
  const maxTemp = Math.max(...chartData.map(d => d.temp));

  return (
    <div className="glass-card p-6 overflow-hidden">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        Hourly Forecast
      </h2>
      
      {/* Scrollable container for the cards and chart aligned */}
      <div className="relative w-full overflow-x-auto hide-scrollbar pb-4">
        <div className="flex w-max min-w-full">
          {chartData.map((hour, index) => {
            const condition = getWeatherCondition(hour.code, hour.isDay);
            return (
              <div key={index} className="flex flex-col items-center justify-between w-20 shrink-0 gap-3">
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  {index === 0 ? 'Now' : hour.time}
                </span>
                
                <WeatherIcon 
                  name={condition.icon} 
                  size={24} 
                  className={hour.isDay ? 'text-amber-500' : 'text-blue-400'} 
                />
                
                <span className="text-lg font-bold">{hour.temp}°</span>
                
                <div className="text-xs text-blue-500 font-medium flex items-center mt-1">
                  {hour.pop > 0 ? `${hour.pop}%` : ''}
                </div>
              </div>
            );
          })}
        </div>

        {/* The temperature trend chart positioned exactly below the cards matching their width */}
        <div className="h-24 w-max min-w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 40, left: 40, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="temp" 
                stroke="#3b82f6" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorTemp)" 
                isAnimationActive={false}
              />
              <YAxis domain={[minTemp - 2, maxTemp + 2]} hide />
              <XAxis dataKey="time" hide />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur border border-gray-200 dark:border-gray-700 p-2 rounded-lg shadow-lg text-sm font-medium">
                        {payload[0].payload.time}: {payload[0].value}°
                      </div>
                    );
                  }
                  return null;
                }}
                cursor={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
