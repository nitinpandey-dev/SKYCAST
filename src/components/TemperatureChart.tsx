import React from 'react';
import { HourlyForecast } from '../types/weather';
import { useSettings } from '../contexts/SettingsContext';
import { cToF, formatHour } from '../utils/weatherUtils';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, ReferenceDot, CartesianGrid } from 'recharts';

interface TemperatureChartProps {
  hourly: HourlyForecast[];
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
}

export function TemperatureChart({ hourly, activeIndex, onActiveIndexChange }: TemperatureChartProps) {
  const { units } = useSettings();

  const chartData = hourly.slice(0, 24).map((hour, index) => ({
    time: index === 0 ? 'Now' : formatHour(hour.time),
    temp: Math.round(units === 'imperial' ? cToF(hour.temperature) : hour.temperature),
    index
  }));

  const minTemp = Math.min(...chartData.map(d => d.temp));
  const maxTemp = Math.max(...chartData.map(d => d.temp));

  // Determine active temperature value for ReferenceDot
  const activeDataPoint = chartData[activeIndex] || chartData[0];
  const activeTemp = activeDataPoint ? activeDataPoint.temp : 0;

  // Dark/Light aware colors
  const isDark = document.documentElement.classList.contains('dark');
  const accentColor = isDark ? '#60A5FA' : '#3478F6';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)';

  return (
    <div className="glass-card p-4 sm:p-5 transition-all duration-300 w-full select-none">
      <div className="flex items-center justify-between mb-3 border-b border-border-custom/25 pb-2">
        <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider">Temperature</h2>
        <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Next 24 hours</span>
      </div>

      <div className="h-[180px] md:h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            data={chartData} 
            margin={{ top: 15, right: 10, left: 10, bottom: 5 }}
            onClick={(state) => {
              if (state && typeof state.activeTooltipIndex === 'number') {
                onActiveIndexChange(state.activeTooltipIndex);
              }
            }}
          >
            <defs>
              <linearGradient id="colorTempRedesign" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={accentColor} stopOpacity={0.15}/>
                <stop offset="95%" stopColor={accentColor} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
            
            <XAxis 
              dataKey="time" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fill: 'var(--text-muted)', fontWeight: 500 }}
              interval={isDark ? 4 : 4}
            />
            <YAxis domain={[minTemp - 2, maxTemp + 2]} hide />
            
            <Area 
              type="monotone" 
              dataKey="temp" 
              stroke={accentColor} 
              strokeWidth={2} 
              fillOpacity={1} 
              fill="url(#colorTempRedesign)" 
              dot={false}
            />

            {/* ReferenceDot to highlight currently selected hourly temperature point */}
            <ReferenceDot
              x={activeDataPoint.time}
              y={activeTemp}
              r={4}
              fill={accentColor}
              stroke={isDark ? '#07111F' : '#ffffff'}
              strokeWidth={1.5}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
export default TemperatureChart;
