import React from 'react';
import { HourlyForecast } from '../types/weather';
import { useSettings } from '../contexts/SettingsContext';
import { cToF, formatHour } from '../utils/weatherUtils';
import {
  Area, AreaChart, ResponsiveContainer, XAxis, YAxis,
  ReferenceDot, CartesianGrid, Tooltip
} from 'recharts';

interface TemperatureChartProps {
  hourly: HourlyForecast[];
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
}

// Custom tooltip that reads CSS variables so it always matches the theme
function ChartTooltip({ active, payload }: { active?: boolean; payload?: Array<{ value: number }> }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div
      style={{
        background: 'var(--surface-strong)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: '6px 12px',
        color: 'var(--text-primary)',
        fontSize: 12,
        fontWeight: 600,
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
      }}
    >
      {payload[0].value}°
    </div>
  );
}

export function TemperatureChart({ hourly, activeIndex, onActiveIndexChange }: TemperatureChartProps) {
  const { units, isDark } = useSettings();

  const chartData = hourly.slice(0, 24).map((hour, index) => ({
    time: index === 0 ? 'Now' : formatHour(hour.time),
    temp: Math.round(units === 'imperial' ? cToF(hour.temperature) : hour.temperature),
    index
  }));

  const minTemp = Math.min(...chartData.map(d => d.temp));
  const maxTemp = Math.max(...chartData.map(d => d.temp));

  const activeDataPoint = chartData[activeIndex] || chartData[0];
  const activeTemp = activeDataPoint ? activeDataPoint.temp : 0;

  // Reactive — updates immediately when isDark changes (no DOM read)
  const accentColor   = isDark ? '#60A5FA' : '#3478F6';
  const gridColor     = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)';
  const areaFillId    = isDark ? 'tempAreaDark' : 'tempAreaLight';
  const areaOpacityS  = isDark ? 0.22 : 0.18;

  return (
    <div className="glass-card p-4 sm:p-5 w-full select-none">
      <div className="flex items-center justify-between mb-3 border-b pb-2" style={{ borderColor: 'var(--border-subtle)' }}>
        <h2 className="text-xs font-semibold text-text-primary tracking-wider">Temperature</h2>
        <span className="text-[10px] text-text-muted font-medium">Next 24 hours</span>
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
              <linearGradient id={areaFillId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={accentColor} stopOpacity={areaOpacityS} />
                <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />

            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fill: isDark ? '#7F8DA1' : '#718096', fontWeight: 500 }}
              interval={4}
            />
            <YAxis domain={[minTemp - 2, maxTemp + 2]} hide />

            <Tooltip content={<ChartTooltip />} cursor={{ stroke: accentColor, strokeWidth: 1, strokeDasharray: '4 2' }} />

            <Area
              type="monotone"
              dataKey="temp"
              stroke={accentColor}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#${areaFillId})`}
              dot={false}
              activeDot={false}
            />

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
