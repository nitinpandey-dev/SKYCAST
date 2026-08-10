import React from 'react';
import { CurrentWeather } from '../types/weather';
import { useSettings } from '../contexts/SettingsContext';
import { kmhToMph, formatTime, getWindDirection } from '../utils/weatherUtils';
import { Droplets, Wind, Sun, Eye, Gauge, Sunrise, Sunset } from 'lucide-react';

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

  let uvLevel = 'Low';
  if (current.uvIndex >= 3 && current.uvIndex <= 5) uvLevel = 'Moderate';
  else if (current.uvIndex >= 6 && current.uvIndex <= 7) uvLevel = 'High';
  else if (current.uvIndex >= 8 && current.uvIndex <= 10) uvLevel = 'Very High';
  else if (current.uvIndex >= 11) uvLevel = 'Extreme';

  const details = [
    {
      title: 'Humidity',
      value: `${current.humidity}%`,
      icon: Droplets,
      color: 'text-blue-500'
    },
    {
      title: 'Wind',
      value: `${displayWindSpeed} ${windUnit}`,
      subValue: windDir,
      icon: Wind,
      color: 'text-teal-500'
    },
    {
      title: 'UV Index',
      value: current.uvIndex,
      subValue: uvLevel,
      icon: Sun,
      color: 'text-amber-500'
    },
    {
      title: 'Visibility',
      value: displayVisibility,
      icon: Eye,
      color: 'text-emerald-500'
    },
    {
      title: 'Pressure',
      value: `${current.pressure} hPa`,
      icon: Gauge,
      color: 'text-purple-500'
    },
    {
      title: 'Sunrise',
      value: formatTime(current.sunrise),
      icon: Sunrise,
      color: 'text-orange-400'
    },
    {
      title: 'Sunset',
      value: formatTime(current.sunset),
      icon: Sunset,
      color: 'text-red-400'
    }
  ];

  return (
    <div className="glass-card p-6 h-full">
      <h2 className="text-xl font-semibold mb-6">Weather Details</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {details.map((detail, index) => {
          const Icon = detail.icon;
          return (
            <div key={index} className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl flex flex-col justify-between aspect-square">
              <div className="flex items-center gap-2 mb-2">
                <Icon size={20} className={detail.color} />
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{detail.title}</span>
              </div>
              <div className="mt-auto">
                <div className="text-2xl font-semibold">{detail.value}</div>
                {detail.subValue && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">{detail.subValue}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
