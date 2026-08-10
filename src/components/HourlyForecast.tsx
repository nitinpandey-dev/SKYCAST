import React, { useState, useEffect, useRef } from 'react';
import { HourlyForecast } from '../types/weather';
import { useSettings } from '../contexts/SettingsContext';
import { cToF, formatHour, getWeatherCondition, getWindDirection, kmhToMph } from '../utils/weatherUtils';
import { WeatherIcon } from './Icons';
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceDot } from 'recharts';
import { Eye, Wind, Droplets, CloudRain } from 'lucide-react';

interface HourlyForecastProps {
  hourly: HourlyForecast[];
}

export function HourlyForecastComponent({ hourly }: HourlyForecastProps) {
  const { units } = useSettings();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveIndex(0);
  }, [hourly]);

  const activeHour = hourly[activeIndex];
  if (!activeHour) return null;

  const chartData = hourly.map((hour, index) => ({
    time: index === 0 ? 'Now' : formatHour(hour.time),
    temp: Math.round(units === 'imperial' ? cToF(hour.temperature) : hour.temperature),
    index,
    feelsLike: Math.round(units === 'imperial' ? cToF(hour.apparentTemperature) : hour.apparentTemperature),
    humidity: hour.humidity,
    wind: Math.round(units === 'imperial' ? kmhToMph(hour.windSpeed) : hour.windSpeed),
    windDir: getWindDirection(hour.windDirection),
    pop: hour.precipitationProbability,
    isDay: hour.isDay,
    condition: getWeatherCondition(hour.conditionCode, hour.isDay).description
  }));

  const minTemp = Math.min(...chartData.map(d => d.temp));
  const maxTemp = Math.max(...chartData.map(d => d.temp));

  const activeCondition = getWeatherCondition(activeHour.conditionCode, activeHour.isDay);
  const activeTemp = Math.round(units === 'imperial' ? cToF(activeHour.temperature) : activeHour.temperature);
  const activeFeels = Math.round(units === 'imperial' ? cToF(activeHour.apparentTemperature) : activeHour.apparentTemperature);
  const activeWind = Math.round(units === 'imperial' ? kmhToMph(activeHour.windSpeed) : activeHour.windSpeed);
  const activeWindUnit = units === 'imperial' ? 'mph' : 'km/h';

  const handleCardClick = (index: number) => {
    setActiveIndex(index);
  };

  return (
    <div className="glass-card p-6 overflow-hidden transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Hourly Forecast</h2>
        <span className="text-[10px] text-gray-400 dark:text-gray-500">Tap hour to select</span>
      </div>

      {/* Selected Hour Details Box */}
      <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4 animate-in fade-in slide-in-from-top-1 duration-200">
        <div className="flex items-center gap-3">
          <div className="text-primary bg-primary/10 dark:bg-primary/20 p-2 rounded-xl">
            <WeatherIcon name={activeCondition.icon} size={28} />
          </div>
          <div>
            <div className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase">
              {activeIndex === 0 ? 'Currently' : formatHour(activeHour.time)}
            </div>
            <div className="text-sm font-bold flex items-center gap-2">
              <span>{activeCondition.description}</span>
              <span className="text-gray-300 dark:text-gray-700">|</span>
              <span className="text-primary font-black">{activeTemp}°</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1.5 text-xs">
          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
            <Eye size={12} className="text-gray-400" />
            <span>Feels: <strong className="font-semibold text-gray-800 dark:text-gray-200">{activeFeels}°</strong></span>
          </div>
          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
            <CloudRain size={12} className="text-blue-500" />
            <span>Rain: <strong className="font-semibold text-gray-800 dark:text-gray-200">{activeHour.precipitationProbability}%</strong></span>
          </div>
          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
            <Droplets size={12} className="text-teal-500" />
            <span>Humidity: <strong className="font-semibold text-gray-800 dark:text-gray-200">{activeHour.humidity}%</strong></span>
          </div>
          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
            <Wind size={12} className="text-emerald-500" />
            <span>Wind: <strong className="font-semibold text-gray-800 dark:text-gray-200">{activeWind} {activeWindUnit}</strong></span>
          </div>
        </div>
      </div>
      
      {/* Horizontal Cards Selector */}
      <div 
        ref={scrollContainerRef}
        className="relative w-full overflow-x-auto hide-scrollbar pb-2 select-none cursor-grab active:cursor-grabbing"
      >
        <div className="flex w-max min-w-full gap-1.5">
          {chartData.map((hour, index) => {
            const condition = getWeatherCondition(hourly[index].conditionCode, hourly[index].isDay);
            const isActive = activeIndex === index;
            return (
              <button
                key={index}
                onClick={() => handleCardClick(index)}
                className={`flex flex-col items-center justify-between w-14 py-2.5 rounded-xl transition-all duration-200 border text-center cursor-pointer ${
                  isActive 
                    ? 'bg-white/10 dark:bg-white/10 border-primary/30 shadow-sm scale-102 font-bold' 
                    : 'bg-transparent border-transparent hover:bg-black/5 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400'
                }`}
              >
                <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500">
                  {hour.time}
                </span>
                
                <WeatherIcon 
                  name={condition.icon} 
                  size={16} 
                  animate={isActive}
                  className={`my-1.5 ${isActive ? 'text-primary' : hour.isDay ? 'text-amber-500' : 'text-blue-400'}`} 
                />
                
                <span className="text-xs font-bold">{hour.temp}°</span>
                
                <span className={`text-[9px] font-bold mt-1 ${hour.pop > 0 ? 'text-blue-500' : 'text-gray-300 dark:text-gray-700'}`}>
                  {hour.pop > 0 ? `${hour.pop}%` : '•'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Graphs Grid */}
      <div className="mt-4 space-y-4">
        {/* Temperature Trend Area Graph */}
        <div>
          <div className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase mb-1">Temperature Trend</div>
          <div className="h-28 w-full select-none">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart 
                data={chartData} 
                margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                onClick={(state) => {
                  if (state && typeof state.activeTooltipIndex === 'number') {
                    setActiveIndex(state.activeTooltipIndex);
                  }
                }}
              >
                <defs>
                  <linearGradient id="colorTempRedesign" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                
                <XAxis 
                  dataKey="time" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9, fill: '#888888' }}
                  interval={4}
                />
                <YAxis domain={[minTemp - 2, maxTemp + 2]} hide />
                
                <Tooltip 
                  cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white/95 dark:bg-gray-900/95 border border-gray-100 dark:border-gray-800 p-2.5 rounded-xl shadow-md text-[10px] max-w-[150px]">
                          <div className="font-bold mb-0.5">{data.time}</div>
                          <div className="text-primary font-extrabold mb-0.5">{data.temp}°</div>
                          <div className="text-gray-500 dark:text-gray-400">
                            Feels: <strong>{data.feelsLike}°</strong>
                            <br />
                            Wind: <strong>{data.wind} {units === 'imperial' ? 'mph' : 'km/h'}</strong>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                
                <Area 
                  type="monotone" 
                  dataKey="temp" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorTempRedesign)" 
                />
                
                <ReferenceDot 
                  x={chartData[activeIndex].time} 
                  y={chartData[activeIndex].temp} 
                  r={5} 
                  fill="#3b82f6" 
                  stroke="#ffffff" 
                  strokeWidth={2} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Rain Probability Bar Graph */}
        <div>
          <div className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase mb-1">Precipitation Probability</div>
          <div className="h-14 w-full select-none">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={chartData}
                margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                onClick={(state) => {
                  if (state && typeof state.activeTooltipIndex === 'number') {
                    setActiveIndex(state.activeTooltipIndex);
                  }
                }}
              >
                <YAxis domain={[0, 100]} hide />
                <XAxis dataKey="time" hide />
                <Tooltip 
                  cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white/95 dark:bg-gray-900/95 border border-gray-100 dark:border-gray-800 p-2 rounded-lg shadow-sm text-[10px]">
                          <span>{data.time}: <strong>{data.pop}% chance</strong></span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="pop" 
                  fill="#60a5fa" 
                  radius={[3, 3, 0, 0]}
                  maxBarSize={8}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
