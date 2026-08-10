import React from 'react';
import { WeatherData } from '../types/weather';
import { useSettings } from '../contexts/SettingsContext';
import { formatHour, cToF, kmhToMph, getWindDirection } from '../utils/weatherUtils';
import { Sparkles, Sun, CloudRain, Wind, Thermometer } from 'lucide-react';

interface WeatherInsightsProps {
  data: WeatherData;
}

export function WeatherInsights({ data }: WeatherInsightsProps) {
  const { units } = useSettings();
  const { hourly, current } = data;

  // 1. Temperature Range
  const high = Math.round(units === 'imperial' ? cToF(current.high) : current.high);
  const low = Math.round(units === 'imperial' ? cToF(current.low) : current.low);
  const tempRange = high - low;

  // 2. Warmest part of day
  let maxTemp = -999;
  let warmestHour = '';
  hourly.forEach(hour => {
    if (hour.temperature > maxTemp) {
      maxTemp = hour.temperature;
      warmestHour = formatHour(hour.time);
    }
  });

  // 3. Precipitation Window
  let peakRainProb = 0;
  let peakRainHour = '';
  hourly.forEach(hour => {
    if (hour.precipitationProbability > peakRainProb) {
      peakRainProb = hour.precipitationProbability;
      peakRainHour = formatHour(hour.time);
    }
  });

  // 4. Wind speed
  const displayWind = Math.round(units === 'imperial' ? kmhToMph(current.windSpeed) : current.windSpeed);
  const windUnit = units === 'imperial' ? 'mph' : 'km/h';
  const windDir = getWindDirection(current.windDirection);
  
  let windSpeedDesc = 'Light';
  if (current.windSpeed > 11 && current.windSpeed <= 28) windSpeedDesc = 'Moderate';
  else if (current.windSpeed > 28) windSpeedDesc = 'Strong';

  const cards = [
    {
      title: "Today's Range",
      value: `${low}° – ${high}°`,
      description: `Temperature span is ${tempRange}°${units === 'metric' ? 'C' : 'F'} today.`,
      icon: Thermometer,
      color: 'text-rose-500 bg-rose-500/10'
    },
    {
      title: "Warmest Period",
      value: warmestHour ? `Around ${warmestHour} · ${Math.round(units === 'imperial' ? cToF(maxTemp) : maxTemp)}°` : '—',
      description: 'Expected peak temperature of the day.',
      icon: Sun,
      color: 'text-amber-500 bg-amber-500/10'
    },
    {
      title: "Rain Peak",
      value: peakRainProb > 0 ? `Around ${peakRainHour} · ${peakRainProb}%` : 'No rain expected',
      description: peakRainProb > 0 ? 'Peak precipitation probability window.' : 'No rainfall forecasted today.',
      icon: CloudRain,
      color: 'text-blue-500 bg-blue-500/10'
    },
    {
      title: "Wind Conditions",
      value: `${displayWind} ${windUnit} · ${windDir}`,
      description: `${windSpeedDesc} winds throughout the day.`,
      icon: Wind,
      color: 'text-teal-500 bg-teal-500/10'
    }
  ];

  return (
    <div className="glass-card p-4 sm:p-5 transition-all duration-300 w-full select-none">
      <div className="flex items-center justify-between mb-4 border-b border-border-custom/25 pb-2">
        <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles size={13} className="text-accent-custom animate-pulse" />
          Weather Insights
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div 
              key={idx} 
              className="flex gap-4 bg-surface-elevated/20 border border-border-custom/40 p-4 rounded-2xl items-start hover:bg-surface-elevated/40 transition-colors text-left"
            >
              <div className={`p-2 rounded-xl shrink-0 ${card.color}`}>
                <Icon size={14} />
              </div>
              <div className="leading-tight">
                <h3 className="text-xs font-bold text-text-secondary leading-none">
                  {card.title}
                </h3>
                <div className="text-sm sm:text-base font-extrabold text-text-primary mt-1 leading-none">
                  {card.value}
                </div>
                <p className="text-[10px] text-text-muted mt-1 leading-snug">
                  {card.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
export default WeatherInsights;
