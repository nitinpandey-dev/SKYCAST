import React, { useState, useEffect, useRef } from 'react';
import { HourlyForecast } from '../types/weather';
import { useSettings } from '../contexts/SettingsContext';
import { cToF, formatHour, getWeatherCondition, getWindDirection, kmhToMph } from '../utils/weatherUtils';
import { WeatherIcon } from './Icons';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceDot } from 'recharts';
import { Eye, Wind, Droplets, CloudRain } from 'lucide-react';

interface HourlyForecastProps {
  hourly: HourlyForecast[];
}

export function HourlyForecastComponent({ hourly }: HourlyForecastProps) {
  const { units } = useSettings();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Sync active index if hourly array changes
  useEffect(() => {
    setActiveIndex(0);
  }, [hourly]);

  const activeHour = hourly[activeIndex];
  if (!activeHour) return null;

  // Prepare data for the chart
  const chartData = hourly.map((hour, index) => ({
    time: index === 0 ? 'Now' : formatHour(hour.time),
    temp: Math.round(units === 'imperial' ? cToF(hour.temperature) : hour.temperature),
    index,
    // extra info for tooltip
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
        <h2 className="text-xl font-bold">Hourly Forecast</h2>
        <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">Click hours to see details</span>
      </div>

      {/* Selected Hour Detail Panel */}
      <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4 animate-in fade-in slide-in-from-top-1 duration-300">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 dark:bg-primary/20 p-2.5 rounded-xl text-primary">
            <WeatherIcon name={activeCondition.icon} size={32} />
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
              {activeIndex === 0 ? 'Currently' : formatHour(activeHour.time)}
            </div>
            <div className="text-base font-extrabold flex items-center gap-2">
              <span>{activeCondition.description}</span>
              <span className="text-gray-400 font-normal">|</span>
              <span className="text-primary font-black">{activeTemp}°</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-2 text-sm flex-1 sm:flex-initial">
          <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
            <Eye size={14} className="text-gray-400" />
            <span>Feels like: <strong className="font-semibold text-gray-800 dark:text-gray-100">{activeFeels}°</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
            <CloudRain size={14} className="text-blue-500" />
            <span>Precip: <strong className="font-semibold text-gray-800 dark:text-gray-100">{activeHour.precipitationProbability}%</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
            <Droplets size={14} className="text-teal-500" />
            <span>Humidity: <strong className="font-semibold text-gray-800 dark:text-gray-100">{activeHour.humidity}%</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
            <Wind size={14} className="text-emerald-500" />
            <span>Wind: <strong className="font-semibold text-gray-800 dark:text-gray-100">{activeWind} {activeWindUnit}</strong></span>
          </div>
        </div>
      </div>
      
      {/* Scrollable cards */}
      <div 
        ref={scrollContainerRef}
        className="relative w-full overflow-x-auto hide-scrollbar pb-2 select-none cursor-grab active:cursor-grabbing"
      >
        <div className="flex w-max min-w-full gap-2">
          {chartData.map((hour, index) => {
            const condition = getWeatherCondition(hourly[index].conditionCode, hourly[index].isDay);
            const isActive = activeIndex === index;
            return (
              <button
                key={index}
                onClick={() => handleCardClick(index)}
                className={`flex flex-col items-center justify-between w-20 py-3 rounded-2xl transition-all duration-300 border focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer ${
                  isActive 
                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-[1.03]' 
                    : 'bg-black/5 dark:bg-white/5 border-transparent hover:bg-black/10 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300'
                }`}
                aria-label={`${hour.time}: ${hour.temp} degrees, ${hour.condition}`}
              >
                <span className={`text-xs font-semibold ${isActive ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                  {hour.time}
                </span>
                
                <WeatherIcon 
                  name={condition.icon} 
                  size={22} 
                  animate={isActive}
                  className={`my-2 ${isActive ? 'text-white' : hour.isDay ? 'text-amber-500' : 'text-blue-400'}`} 
                />
                
                <span className="text-base font-extrabold">{hour.temp}°</span>
                
                <span className={`text-[10px] font-bold mt-1 ${isActive ? 'text-white/90' : 'text-blue-500 dark:text-blue-400'}`}>
                  {hour.pop > 0 ? `${hour.pop}%` : '•'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Temperature Trend Chart */}
      <div className="h-32 w-full mt-6 select-none">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            data={chartData} 
            margin={{ top: 15, right: 10, left: 10, bottom: 5 }}
            onClick={(state) => {
              if (state && typeof state.activeTooltipIndex === 'number') {
                setActiveIndex(state.activeTooltipIndex);
              }
            }}
          >
            <defs>
              <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            
            <XAxis 
              dataKey="time" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#888888' }}
              interval={4}
            />
            <YAxis domain={[minTemp - 2, maxTemp + 2]} hide />
            
            <Tooltip 
              cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white/95 dark:bg-gray-900/95 border border-gray-100 dark:border-gray-800 p-3 rounded-2xl shadow-xl text-xs max-w-[200px] animate-in fade-in duration-100">
                      <div className="font-bold text-gray-800 dark:text-gray-100 mb-1">{data.time}</div>
                      <div className="text-primary font-black text-sm mb-1">{data.temp}°</div>
                      <div className="text-gray-500 dark:text-gray-400 space-y-0.5">
                        <div>Feels like: <strong>{data.feelsLike}°</strong></div>
                        <div>Condition: <strong>{data.condition}</strong></div>
                        <div>Wind: <strong>{data.wind} {units === 'imperial' ? 'mph' : 'km/h'} {data.windDir}</strong></div>
                        {data.pop > 0 && <div className="text-blue-500">Rain Prob: <strong>{data.pop}%</strong></div>}
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
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorTemp)" 
              dot={(props) => {
                const { cx, cy, index } = props;
                if (index === activeIndex) {
                  return (
                    <circle key={`dot-${index}`} cx={cx} cy={cy} r={6} fill="#3b82f6" stroke="#ffffff" strokeWidth={2} />
                  );
                }
                return null;
              }}
            />
            
            {/* Draw dot on the active hour */}
            <ReferenceDot 
              x={chartData[activeIndex].time} 
              y={chartData[activeIndex].temp} 
              r={6} 
              fill="#3b82f6" 
              stroke="#ffffff" 
              strokeWidth={2} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
