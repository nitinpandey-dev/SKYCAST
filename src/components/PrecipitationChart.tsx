import React from 'react';
import { HourlyForecast } from '../types/weather';
import { useSettings } from '../contexts/SettingsContext';
import { formatHour } from '../utils/weatherUtils';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Cell, Tooltip } from 'recharts';

interface PrecipitationChartProps {
  hourly: HourlyForecast[];
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
}

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
      {payload[0].value}%
    </div>
  );
}

export function PrecipitationChart({ hourly, activeIndex, onActiveIndexChange }: PrecipitationChartProps) {
  const { isDark } = useSettings();

  const chartData = hourly.slice(0, 24).map((hour, index) => ({
    time: index === 0 ? 'Now' : formatHour(hour.time),
    pop: hour.precipitationProbability,
    index
  }));

  // Reactive — updates immediately when isDark changes (no DOM read)
  const barColorDefault = isDark ? 'rgba(96,165,250,0.35)' : 'rgba(52,120,246,0.40)';
  const barColorActive  = isDark ? '#60A5FA' : '#3478F6';
  const gridColor       = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)';
  const tickColor       = isDark ? '#7F8DA1' : '#718096';

  return (
    <div className="glass-card p-4 sm:p-5 w-full select-none">
      <div className="flex items-center justify-between mb-3 border-b pb-2" style={{ borderColor: 'var(--border-subtle)' }}>
        <h2 className="text-xs font-semibold text-text-primary tracking-wider">Precipitation</h2>
        <span className="text-[10px] text-text-muted font-medium">Probability %</span>
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
              tick={{ fontSize: 9, fill: tickColor, fontWeight: 500 }}
              interval={4}
            />
            <YAxis domain={[0, 100]} hide />

            <Tooltip content={<ChartTooltip />} cursor={{ fill: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }} />

            <Bar dataKey="pop" radius={[4, 4, 0, 0]} maxBarSize={12}>
              {chartData.map((_, index) => (
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
