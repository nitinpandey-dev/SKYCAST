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
    <div className="glass-card p-5 sm:p-6 overflow-hidden transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-bold text-text-muted uppercase tracking-wider">Hourly Forecast</h2>
        <span className="text-[10px] text-text-muted font-semibold">Tap hour to select</span>
      </div>

      {/* Selected Hour Details Box */}
      <div className="bg-surface border border-border-custom rounded-2xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4 animate-in fade-in duration-200">
        <div className="flex items-center gap-3">
          <div className="text-accent-custom bg-accent-custom/10 p-2 rounded-xl">
            <WeatherIcon name={activeCondition.icon} size={28} />
          </div>
          <div>
            <div className="text-[10px] text-text-muted font-bold uppercase">
              {activeIndex === 0 ? 'Currently' : formatHour(activeHour.time)}
            </div>
            <div className="text-sm font-bold flex items-center gap-2 text-text-primary">
              <span>{activeCondition.description}</span>
              <span className="text-border-custom">|</span>
              <span className="text-accent-custom font-black">{activeTemp}°</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1.5 text-xs text-text-secondary">
          <div className="flex items-center gap-1">
            <Eye size={12} className="text-text-muted" />
            <span>Feels: <strong className="font-semibold text-text-primary">{activeFeels}°</strong></span>
          </div>
          <div className="flex items-center gap-1">
            <CloudRain size={12} className="text-accent-custom" />
            <span>Rain: <strong className="font-semibold text-text-primary">{activeHour.precipitationProbability}%</strong></span>
          </div>
          <div className="flex items-center gap-1">
            <Droplets size={12} className="text-teal-500" />
            <span>Humidity: <strong className="font-semibold text-text-primary">{activeHour.humidity}%</strong></span>
          </div>
          <div className="flex items-center gap-1">
            <Wind size={12} className="text-emerald-500" />
            <span>Wind: <strong className="font-semibold text-text-primary">{activeWind} {activeWindUnit}</strong></span>
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
                    ? 'bg-surface-strong border-accent-custom/40 shadow-sm scale-102 font-bold text-text-primary' 
                    : 'bg-transparent border-transparent hover:bg-surface/50 text-text-secondary'
                }`}
              >
                <span className="text-[10px] font-semibold text-text-muted">
                  {hour.time}
                </span>
                
                <WeatherIcon 
                  name={condition.icon} 
                  size={16} 
                  animate={isActive}
                  className={`my-1.5 ${isActive ? 'text-accent-custom' : hour.isDay ? 'text-amber-500' : 'text-blue-400'}`} 
                />
                
                <span className="text-xs font-bold text-text-primary">{hour.temp}°</span>
                
                <span className={`text-[9px] font-bold mt-1 ${hour.pop > 0 ? 'text-accent-custom' : 'text-text-muted opacity-50'}`}>
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
          <div className="text-[10px] text-text-muted font-bold uppercase mb-1">Temperature Trend</div>
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
                    <stop offset="5%" stopColor="var(--accent-custom)" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="var(--accent-custom)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                
                <XAxis 
                  dataKey="time" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9, fill: 'var(--text-muted)' }}
                  interval={4}
                />
                <YAxis domain={[minTemp - 2, maxTemp + 2]} hide />
                
                <Tooltip 
                  cursor={{ stroke: 'var(--accent-custom)', strokeWidth: 1, strokeDasharray: '4 4' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-surface-strong border border-border-custom p-2.5 rounded-xl shadow-md text-[10px] max-w-[150px] text-text-primary">
                          <div className="font-bold mb-0.5">{data.time}</div>
                          <div className="text-accent-custom font-extrabold mb-0.5">{data.temp}°</div>
                          <div className="text-text-secondary">
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
                  stroke="var(--accent-custom)" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorTempRedesign)" 
                />
                
                <ReferenceDot 
                  x={chartData[activeIndex].time} 
                  y={chartData[activeIndex].temp} 
                  r={5} 
                  fill="var(--accent-custom)" 
                  stroke="var(--bg-primary)" 
                  strokeWidth={2} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Rain Probability Bar Graph */}
        <div>
          <div className="text-[10px] text-text-muted font-bold uppercase mb-1">Precipitation Probability</div>
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
                  cursor={{ fill: 'var(--surface-strong)', opacity: 0.1 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-surface-strong border border-border-custom p-2 rounded-lg shadow-sm text-[10px] text-text-primary">
                          <span>{data.time}: <strong>{data.pop}% chance</strong></span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="pop" 
                  fill="var(--accent-custom)" 
                  opacity={0.6}
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
