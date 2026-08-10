import React from 'react';
import { WeatherData } from '../types/weather';
import { useSettings } from '../contexts/SettingsContext';
import { formatHour, cToF, kmhToMph } from '../utils/weatherUtils';
import { Sparkles, Sun, CloudRain, Wind, Thermometer } from 'lucide-react';

interface WeatherInsightsProps {
  data: WeatherData;
}

export function WeatherInsights({ data }: WeatherInsightsProps) {
  const { units } = useSettings();
  const { hourly, current } = data;

  // Calculate insights deterministically
  const insights: string[] = [];
  const icons: React.ComponentType<any>[] = [];
  const iconColors: string[] = [];

  // 1. Temperature Range Insight
  const high = Math.round(units === 'imperial' ? cToF(current.high) : current.high);
  const low = Math.round(units === 'imperial' ? cToF(current.low) : current.low);
  const tempRange = high - low;
  insights.push(`Today's temperature range is ${tempRange}°${units === 'metric' ? 'C' : 'F'}. Expect a low of ${low}° and high of ${high}°.`);
  icons.push(Thermometer);
  iconColors.push('text-rose-500 bg-rose-500/10');

  // 2. Warmest part of the day
  let maxTemp = -999;
  let warmestHour = '';
  hourly.forEach(hour => {
    if (hour.temperature > maxTemp) {
      maxTemp = hour.temperature;
      warmestHour = formatHour(hour.time);
    }
  });
  if (warmestHour) {
    insights.push(`The warmest part of the day is expected around ${warmestHour} at ${Math.round(units === 'imperial' ? cToF(maxTemp) : maxTemp)}°.`);
    icons.push(Sun);
    iconColors.push('text-amber-500 bg-amber-500/10');
  }

  // 3. Rain Probabilities
  let peakRainProb = 0;
  let rainHours: string[] = [];
  hourly.forEach(hour => {
    if (hour.precipitationProbability > peakRainProb) {
      peakRainProb = hour.precipitationProbability;
    }
    if (hour.precipitationProbability >= 30) {
      rainHours.push(formatHour(hour.time));
    }
  });

  if (peakRainProb >= 50 && rainHours.length > 0) {
    const timeString = rainHours.length > 3 
      ? `between ${rainHours[0]} and ${rainHours[rainHours.length - 1]}` 
      : `around ${rainHours.join(', ')}`;
    insights.push(`Precipitation is likely ${timeString}, peaking at ${peakRainProb}% probability.`);
    icons.push(CloudRain);
    iconColors.push('text-blue-500 bg-blue-500/10');
  } else if (peakRainProb > 0 && peakRainProb < 50) {
    insights.push(`There is a minor chance of light rain today, peaking at ${peakRainProb}% probability.`);
    icons.push(CloudRain);
    iconColors.push('text-blue-400 bg-blue-400/10');
  } else {
    insights.push("No rain is expected today. Enjoy the clear conditions!");
    icons.push(Sun);
    iconColors.push('text-emerald-500 bg-emerald-500/10');
  }

  // 4. Wind increase
  // Let's divide 24 hours into day (first 12 hours) and night (next 12 hours)
  const firstHalfWind = hourly.slice(0, 12).reduce((acc, h) => acc + h.windSpeed, 0) / 12;
  const secondHalfWind = hourly.slice(12, 24).reduce((acc, h) => acc + h.windSpeed, 0) / 12;
  
  if (secondHalfWind > firstHalfWind + 5) {
    insights.push("Winds are projected to increase later this evening.");
    icons.push(Wind);
    iconColors.push('text-teal-500 bg-teal-500/10');
  } else if (current.windSpeed > 25) {
    insights.push(`Brace for gusty conditions today. Winds are averaging ${Math.round(units === 'imperial' ? kmhToMph(current.windSpeed) : current.windSpeed)} ${units === 'imperial' ? 'mph' : 'km/h'}.`);
    icons.push(Wind);
    iconColors.push('text-teal-500 bg-teal-500/10');
  }

  return (
    <div className="glass-card p-6 transition-all duration-300">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Sparkles size={20} className="text-primary animate-pulse" />
        Weather Insights
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight, idx) => {
          const Icon = icons[idx];
          return (
            <div key={idx} className="flex gap-3 bg-black/5 dark:bg-white/5 p-4 rounded-2xl items-start transition-all hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-primary/5">
              <div className={`p-2 rounded-xl shrink-0 ${iconColors[idx]}`}>
                <Icon size={18} />
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                {insight}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
