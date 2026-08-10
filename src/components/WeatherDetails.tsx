import React from 'react';
import { CurrentWeather } from '../types/weather';
import { useSettings } from '../contexts/SettingsContext';
import { kmhToMph, getWindDirection, cToF } from '../utils/weatherUtils';
import { Droplets, Wind, Sun, Eye, Gauge, Cloud, Thermometer, Percent } from 'lucide-react';

interface WeatherDetailsProps {
  current: CurrentWeather;
}

export function WeatherDetails({ current }: WeatherDetailsProps) {
  const { units } = useSettings();

  const displayWindSpeed = units === 'imperial' 
    ? Math.round(kmhToMph(current.windSpeed)) 
    : Math.round(current.windSpeed);
    
  const windUnit = units === 'imperial' ? 'mph' : 'km/h';
  const windDir = getWindDirection(current.windDirection);

  const displayVisibility = units === 'imperial'
    ? (current.visibility * 0.621371).toFixed(1) + ' mi'
    : current.visibility + ' km';

  const displayDewPoint = Math.round(units === 'imperial' ? cToF(current.dewPoint) : current.dewPoint);

  // Dynamic explanations (derived)
  let uvLevel = 'Low';
  if (current.uvIndex >= 3 && current.uvIndex <= 5) uvLevel = 'Mod';
  else if (current.uvIndex >= 6 && current.uvIndex <= 7) uvLevel = 'High';
  else if (current.uvIndex >= 8 && current.uvIndex <= 10) uvLevel = 'Very High';
  else if (current.uvIndex >= 11) uvLevel = 'Extreme';

  let humidityDesc = 'Comfortable';
  if (current.humidity < 30) humidityDesc = 'Dry';
  else if (current.humidity > 60 && current.humidity <= 80) humidityDesc = 'Sticky';
  else if (current.humidity > 80) humidityDesc = 'Humid';

  let windDesc = 'Calm';
  if (current.windSpeed > 11 && current.windSpeed <= 28) windDesc = 'Breezy';
  else if (current.windSpeed > 28) windDesc = 'Windy';

  let cloudDesc = 'Clear';
  if (current.cloudCover > 20 && current.cloudCover <= 50) cloudDesc = 'Partly Cloudy';
  else if (current.cloudCover > 50 && current.cloudCover <= 80) cloudDesc = 'Cloudy';
  else if (current.cloudCover > 80) cloudDesc = 'Overcast';

  const details = [
    { title: 'Humidity', value: `${current.humidity}%`, sub: humidityDesc, icon: Droplets, color: 'text-blue-500 bg-blue-500/10' },
    { title: 'Wind', value: `${displayWindSpeed} ${windUnit}`, sub: `${windDir} • ${windDesc}`, icon: Wind, color: 'text-teal-500 bg-teal-500/10' },
    { title: 'UV Index', value: `${current.uvIndex}`, sub: uvLevel, icon: Sun, color: 'text-amber-500 bg-amber-500/10' },
    { title: 'Visibility', value: displayVisibility, sub: 'Normal', icon: Eye, color: 'text-emerald-500 bg-emerald-500/10' },
    { title: 'Pressure', value: `${current.pressure} hPa`, sub: current.pressure > 1013 ? 'High' : 'Low', icon: Gauge, color: 'text-purple-500 bg-purple-500/10' },
    { title: 'Dew Point', value: `${displayDewPoint}°`, sub: `${displayDewPoint >= 20 ? 'Sticky' : 'Dry'}`, icon: Thermometer, color: 'text-rose-500 bg-rose-500/10' },
    { title: 'Cloud Cover', value: `${current.cloudCover}%`, sub: cloudDesc, icon: Cloud, color: 'text-slate-500 bg-slate-500/10' },
    { title: 'Rain Prob', value: `${current.precipitationProbability}%`, sub: current.precipitationProbability > 0 ? 'Wet' : 'Dry', icon: Percent, color: 'text-cyan-500 bg-cyan-500/10' },
  ];

  return (
    <div className="glass-card p-6 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Weather Details</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {details.map((detail, index) => {
          const Icon = detail.icon;
          return (
            <div 
              key={index} 
              className="bg-black/5 dark:bg-white/5 p-3 rounded-2xl flex items-center justify-between hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 border border-transparent hover:border-primary/10 select-default"
            >
              <div className="flex items-center gap-2.5 truncate">
                <div className={`p-1.5 rounded-xl shrink-0 ${detail.color}`}>
                  <Icon size={14} />
                </div>
                <div className="truncate text-left">
                  <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase leading-none mb-1">{detail.title}</div>
                  <div className="text-sm font-extrabold text-gray-900 dark:text-white leading-none">{detail.value}</div>
                </div>
              </div>
              <span className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold ml-2 text-right shrink-0">
                {detail.sub}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
