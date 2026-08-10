import React from 'react';
import { HourlyForecast } from '../types/weather';
import { formatHour } from '../utils/weatherUtils';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Cell } from 'recharts';

interface PrecipitationChartProps {
  hourly: HourlyForecast[];
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
}

export function PrecipitationChart({ hourly, activeIndex, onActiveIndexChange }: PrecipitationChartProps) {
  const chartData = hourly.slice(0, 24).map((hour, index) => ({
    time: index === 0 ? 'Now' : formatHour(hour.time),
    pop: hour.precipitationProbability,
    index
  }));

  // Dark/Light aware colors
  const isDark = document.documentElement.classList.contains('dark');
  const barColorDefault = isDark ? 'rgba(96, 165, 250, 0.4)' : 'rgba(52, 120, 246, 0.4)';
  const barColorActive = isDark ? '#60A5FA' : '#3478F6';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)';

  return (
    <div className="glass-card p-4 sm:p-5 transition-all duration-300 w-full select-none">
      <div className="flex items-center justify-between mb-3 border-b border-border-custom/25 pb-2">
        <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider">Precipitation</h2>
        <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Probability %</span>
      </div>

      <div className="h-[180px] md:h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={chartData} 
            margin={{ top: 15, right: 10, left: 10, bottom: 5 }}
            onClick={(state) => {
              if (state && typeof state.activeTooltipIndex === 'number') {
                onActiveIndexChange(state.activeTooltipIndex);
              }
            }}
          >
            <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
            
            <XAxis 
              dataKey="time" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fill: 'var(--text-muted)', fontWeight: 500 }}
              interval={4}
            />
            <YAxis domain={[0, 100]} hide />
            
            <Bar 
              dataKey="pop" 
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={index === activeIndex ? barColorActive : barColorDefault} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
export default PrecipitationChart;
