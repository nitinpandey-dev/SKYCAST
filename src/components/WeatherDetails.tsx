import React from 'react';
import { CurrentWeather } from '../types/weather';
import { useSettings } from '../contexts/SettingsContext';
import { kmhToMph, formatTime, getWindDirection } from '../utils/weatherUtils';
import { Droplets, Wind, Sun, Eye, Gauge, Sunrise, Sunset, Thermometer } from 'lucide-react';

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

  // Dynamic UV Info
  let uvLevel = 'Low';
  let uvDesc = 'Safe to be outdoors without protection.';
  if (current.uvIndex >= 3 && current.uvIndex <= 5) {
    uvLevel = 'Moderate';
    uvDesc = 'Protection recommended around midday.';
  } else if (current.uvIndex >= 6 && current.uvIndex <= 7) {
    uvLevel = 'High';
    uvDesc = 'SPF 30+ sunscreen, hat, and sunglasses are vital.';
  } else if (current.uvIndex >= 8 && current.uvIndex <= 10) {
    uvLevel = 'Very High';
    uvDesc = 'Avoid outdoors around midday. SPF 30+ is necessary.';
  } else if (current.uvIndex >= 11) {
    uvLevel = 'Extreme';
    uvDesc = 'Unprotected skin can burn in minutes. Stay inside!';
  }

  // Dynamic Humidity Info
  let humidityDesc = 'Comfortable';
  if (current.humidity < 30) humidityDesc = 'Dry air';
  else if (current.humidity >= 30 && current.humidity <= 60) humidityDesc = 'Ideal comfort';
  else if (current.humidity > 60 && current.humidity <= 80) humidityDesc = 'Sticky / Moderate humidity';
  else if (current.humidity > 80) humidityDesc = 'Extremely sticky / High humidity';

  // Dynamic Wind Info
  let windDesc = 'Calm';
  if (current.windSpeed > 1 && current.windSpeed <= 11) windDesc = 'Light breeze';
  else if (current.windSpeed > 11 && current.windSpeed <= 28) windDesc = 'Moderate wind';
  else if (current.windSpeed > 28 && current.windSpeed <= 49) windDesc = 'Strong wind warning';
  else if (current.windSpeed > 49) windDesc = 'Gale warning! Avoid travel.';

  // Dynamic Visibility Info
  let visibilityDesc = 'Excellent';
  if (current.visibility < 1) visibilityDesc = 'Very poor - dense fog';
  else if (current.visibility >= 1 && current.visibility <= 4) visibilityDesc = 'Hazy / poor visibility';
  else if (current.visibility > 4 && current.visibility <= 9) visibilityDesc = 'Moderate visibility';

  // Dynamic Pressure Info
  let pressureDesc = 'Standard pressure';
  if (current.pressure > 1013) pressureDesc = 'High pressure (Stable weather)';
  else if (current.pressure < 1009) pressureDesc = 'Low pressure (Stormy/Cloudy trend)';

  const details = [
    {
      title: 'Humidity',
      value: `${current.humidity}%`,
      subValue: humidityDesc,
      icon: Droplets,
      color: 'text-blue-500',
      bgHover: 'group-hover:text-blue-500/10'
    },
    {
      title: 'Wind',
      value: `${displayWindSpeed} ${windUnit}`,
      subValue: `${windDir} • ${windDesc}`,
      icon: Wind,
      color: 'text-teal-500',
      bgHover: 'group-hover:text-teal-500/10'
    },
    {
      title: 'UV Index',
      value: `${current.uvIndex} (${uvLevel})`,
      subValue: uvDesc,
      icon: Sun,
      color: 'text-amber-500',
      bgHover: 'group-hover:text-amber-500/10'
    },
    {
      title: 'Visibility',
      value: displayVisibility,
      subValue: `${visibilityDesc} view`,
      icon: Eye,
      color: 'text-emerald-500',
      bgHover: 'group-hover:text-emerald-500/10'
    },
    {
      title: 'Pressure',
      value: `${current.pressure} hPa`,
      subValue: pressureDesc,
      icon: Gauge,
      color: 'text-purple-500',
      bgHover: 'group-hover:text-purple-500/10'
    },
    {
      title: 'Sunrise',
      value: formatTime(current.sunrise),
      subValue: 'Golden hour starts',
      icon: Sunrise,
      color: 'text-orange-400',
      bgHover: 'group-hover:text-orange-400/10'
    },
    {
      title: 'Sunset',
      value: formatTime(current.sunset),
      subValue: 'Dusk begins shortly after',
      icon: Sunset,
      color: 'text-red-400',
      bgHover: 'group-hover:text-red-400/10'
    }
  ];

  return (
    <div className="glass-card p-6 h-full transition-all duration-300">
      <h2 className="text-xl font-bold mb-6">Weather Details</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {details.map((detail, index) => {
          const Icon = detail.icon;
          return (
            <div 
              key={index} 
              className="group bg-black/5 dark:bg-white/5 p-4 rounded-2xl flex flex-col justify-between aspect-video sm:aspect-square hover:bg-white dark:hover:bg-gray-800 hover:-translate-y-1.5 hover:shadow-lg dark:hover:shadow-black/30 border border-transparent hover:border-primary/10 transition-all duration-300 select-default"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-lg bg-black/5 dark:bg-white/5 transition-colors ${detail.bgHover}`}>
                  <Icon size={18} className={detail.color} />
                </div>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{detail.title}</span>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">{detail.value}</div>
                {detail.subValue && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium leading-relaxed">{detail.subValue}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
