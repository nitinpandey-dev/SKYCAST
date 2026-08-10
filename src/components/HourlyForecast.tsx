import React, { useState, useEffect, useRef } from 'react';
import { HourlyForecast } from '../types/weather';
import { useSettings } from '../contexts/SettingsContext';
import { cToF, formatHour, getWeatherCondition, getWindDirection, kmhToMph } from '../utils/weatherUtils';
import { WeatherIcon } from './Icons';
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceDot, CartesianGrid } from 'recharts';
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

  // Theme-aware configuration
  const isDark = document.documentElement.classList.contains('dark');
  const accentColor = isDark ? 'var(--accent-custom)' : '#3478F6';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)';

  const handleCardClick = (index: number) => {
    setActiveIndex(index);
  };

  return (
    <div className="glass-card p-5 sm:p-6 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-bold text-text-muted uppercase tracking-wider">Hourly Forecast</h2>
        <span className="text-[10px] text-text-muted font-semibold">Tap hour to select</span>
      </div>

      {/* Selected Hour Details Box (Translucent Glass Pill style) */}
      <div className="bg-surface/50 border border-border-custom/50 rounded-2xl p-4 mb-5 flex flex-wrap items-center justify-between gap-4 transition-all duration-300">
        <div className="flex items-center gap-3">
          <div className="text-accent-custom bg-accent-custom/8 p-2 rounded-xl">
            <WeatherIcon name={activeCondition.icon} size={24} />
          </div>
          <div className="text-left">
            <div className="text-[9px] text-text-muted font-bold uppercase tracking-wider">
              {activeIndex === 0 ? 'Currently' : formatHour(activeHour.time)}
            </div>
            <div className="text-sm font-bold flex items-center gap-2 text-text-primary">
              <span>{activeCondition.description}</span>
              <span className="text-border-custom/60">|</span>
              <span className="text-accent-custom font-extrabold">{activeTemp}°</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1.5 text-xs text-text-secondary">
          <div className="flex items-center gap-1.5">
            <Eye size={12} className="text-text-muted" />
            <span>Feels: <strong className="font-semibold text-text-primary">{activeFeels}°</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <CloudRain size={12} className="text-accent-custom" />
            <span>Rain: <strong className="font-semibold text-text-primary">{activeHour.precipitationProbability}%</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Droplets size={12} className="text-teal-500" />
            <span>Humidity: <strong className="font-semibold text-text-primary">{activeHour.humidity}%</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Wind size={12} className="text-emerald-500" />
            <span>Wind: <strong className="font-semibold text-text-primary">{activeWind} {activeWindUnit}</strong></span>
          </div>
        </div>
      </div>
      
      {/* Horizontal Cards Strip (Compact, iOS inspired) */}
      <div 
        ref={scrollContainerRef}
        className="relative w-full overflow-x-auto hide-scrollbar pb-3 select-none cursor-grab active:cursor-grabbing"
      >
        <div className="flex w-max min-w-full gap-1.5">
          {chartData.map((hour, index) => {
            const condition = getWeatherCondition(hourly[index].conditionCode, hourly[index].isDay);
            const isActive = activeIndex === index;
            return (
              <button
                key={index}
                onClick={() => handleCardClick(index)}
                className={`flex flex-col items-center justify-between w-14 py-3 rounded-2xl transition-all duration-200 border text-center cursor-pointer ${
                  isActive 
                    ? 'bg-surface-strong border-accent-custom/30 dark:bg-[#60a5fa]/14 dark:border-[#60a5fa]/35 shadow-sm scale-102 font-bold text-text-primary' 
                    : 'bg-transparent border-transparent hover:bg-surface/30 text-text-secondary'
                }`}
              >
                <span className="text-[10px] font-semibold text-text-muted">
                  {hour.time}
                </span>
                
                <WeatherIcon 
                  name={condition.icon} 
                  size={16} 
                  animate={isActive}
                  className={`my-2 ${isActive ? 'text-accent-custom' : hour.isDay ? 'text-amber-500/80' : 'text-blue-400/80'}`} 
                />
                
                <span className="text-xs font-bold text-text-primary">{hour.temp}°</span>
                
                <span className={`text-[9px] font-bold mt-1 ${hour.pop > 0 ? 'text-accent-custom' : 'text-text-muted opacity-40'}`}>
                  {hour.pop > 0 ? `${hour.pop}%` : '•'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recharts Area & Bar Graphs (iOS Minimal Theme-Aware Style) */}
      <div className="mt-4 space-y-4">
        {/* Temperature Curve */}
        <div>
          <div className="text-[9px] text-text-muted font-bold uppercase tracking-wider mb-1 text-left">Temperature Trend</div>
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
                    <stop offset="5%" stopColor={accentColor} stopOpacity={0.12}/>
                    <stop offset="95%" stopColor={accentColor} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
                
                <XAxis 
                  dataKey="time" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9, fill: 'var(--text-muted)' }}
                  interval={4}
                />
                <YAxis domain={[minTemp - 2, maxTemp + 2]} hide />
                
                <Tooltip 
                  cursor={{ stroke: accentColor, strokeWidth: 0.8, strokeDasharray: '4 4' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white/95 dark:bg-[#101D2E]/95 backdrop-blur-md border border-border-custom dark:border-white/12 p-2.5 rounded-xl shadow-md text-[10px] max-w-[150px] text-text-primary text-left">
                          <div className="font-bold mb-0.5">{data.time}</div>
                          <div className="font-extrabold mb-0.5" style={{ color: accentColor }}>{data.temp}°</div>
                          <div className="text-text-secondary leading-normal">
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
                  stroke={accentColor} 
                  strokeWidth={1.8}
                  fillOpacity={1} 
                  fill="url(#colorTempRedesign)" 
                />
                
                <ReferenceDot 
                  x={chartData[activeIndex].time} 
                  y={chartData[activeIndex].temp} 
                  r={4.5} 
                  fill={accentColor} 
                  stroke="var(--bg-primary)" 
                  strokeWidth={2} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Rain Probability Bar Chart (Thin, Elegant, Muted) */}
        <div>
          <div className="text-[9px] text-text-muted font-bold uppercase tracking-wider mb-1 text-left">Precipitation Probability</div>
          <div className="h-12 w-full select-none">
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
                  cursor={{ fill: 'var(--surface-strong)', opacity: 0.08 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white/95 dark:bg-[#101D2E]/95 backdrop-blur-md border border-border-custom dark:border-white/12 p-2 rounded-lg shadow-sm text-[10px] text-text-primary">
                          <span>{data.time}: <strong>{data.pop}%</strong></span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="pop" 
                  fill={accentColor} 
                  opacity={0.5}
                  radius={[2, 2, 0, 0]}
                  maxBarSize={4} /* Thin and elegant */
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
export default HourlyForecastComponent;
