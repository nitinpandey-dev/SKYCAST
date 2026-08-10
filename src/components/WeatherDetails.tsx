import React from 'react';
import { CurrentWeather } from '../types/weather';
import { useSettings } from '../contexts/SettingsContext';
import { kmhToMph, getWindDirection, cToF } from '../utils/weatherUtils';
import { Droplets, Wind, Sun, Eye, Gauge, Cloud, Thermometer, Percent, Navigation, CloudRain } from 'lucide-react';

interface WeatherDetailsProps {
  current: CurrentWeather;
}

export function WeatherDetails({ current }: WeatherDetailsProps) {
  const { units } = useSettings();

  const displayTemp = Math.round(units === 'imperial' ? cToF(current.temperature) : current.temperature);
  const displayFeelsLike = Math.round(units === 'imperial' ? cToF(current.apparentTemperature) : current.apparentTemperature);
  
  const displayWindSpeed = units === 'imperial' 
    ? Math.round(kmhToMph(current.windSpeed)) 
    : Math.round(current.windSpeed);
  const displayWindGust = units === 'imperial' 
    ? Math.round(kmhToMph(current.windGusts)) 
    : Math.round(current.windGusts);
    
  const windUnit = units === 'imperial' ? 'mph' : 'km/h';
  const windDir = getWindDirection(current.windDirection);

  const displayVisibility = units === 'imperial'
    ? (current.visibility * 0.621371).toFixed(1) + ' mi'
    : current.visibility.toFixed(1) + ' km';

  const displayDewPoint = Math.round(units === 'imperial' ? cToF(current.dewPoint) : current.dewPoint);

  const displayPrecipitation = units === 'imperial'
    ? (current.precipitation * 0.03937).toFixed(2) + ' in'
    : current.precipitation.toFixed(1) + ' mm';

  // Dynamic explanations
  let uvLevel = 'Low';
  if (current.uvIndex >= 3 && current.uvIndex <= 5) uvLevel = 'Mod';
  else if (current.uvIndex >= 6 && current.uvIndex <= 7) uvLevel = 'High';
  else if (current.uvIndex >= 8 && current.uvIndex <= 10) uvLevel = 'V. High';
  else if (current.uvIndex >= 11) uvLevel = 'Extreme';

  let humidityDesc = 'Comfortable';
  if (current.humidity < 30) humidityDesc = 'Dry';
  else if (current.humidity > 60 && current.humidity <= 80) humidityDesc = 'Sticky';
  else if (current.humidity > 80) humidityDesc = 'Humid';

  let windDesc = 'Calm';
  if (current.windSpeed > 11 && current.windSpeed <= 28) windDesc = 'Breezy';
  else if (current.windSpeed > 28) windDesc = 'Windy';

  let cloudDesc = 'Clear';
  if (current.cloudCover > 20 && current.cloudCover <= 50) cloudDesc = 'Partly';
  else if (current.cloudCover > 50 && current.cloudCover <= 80) cloudDesc = 'Cloudy';
  else if (current.cloudCover > 80) cloudDesc = 'Overcast';

  const details = [
    { title: 'Temperature', value: `${displayTemp}°`, sub: 'Current', icon: Thermometer, color: 'text-rose-500 bg-rose-500/10' },
    { title: 'Feels Like', value: `${displayFeelsLike}°`, sub: 'Apparent', icon: Thermometer, color: 'text-amber-500 bg-amber-500/10' },
    { title: 'Humidity', value: `${current.humidity}%`, sub: humidityDesc, icon: Droplets, color: 'text-blue-500 bg-blue-500/10' },
    { title: 'Wind Speed', value: `${displayWindSpeed} ${windUnit}`, sub: windDesc, icon: Wind, color: 'text-teal-500 bg-teal-500/10' },
    { title: 'Wind Direction', value: `${windDir}`, sub: `${current.windDirection}°`, icon: Navigation, color: 'text-teal-600 bg-teal-600/10' },
    { title: 'Wind Gust', value: `${displayWindGust} ${windUnit}`, sub: 'Max gust', icon: Wind, color: 'text-emerald-500 bg-emerald-500/10' },
    { title: 'Pressure', value: `${Math.round(current.pressure)} hPa`, sub: current.pressure > 1013 ? 'High' : 'Low', icon: Gauge, color: 'text-purple-500 bg-purple-500/10' },
    { title: 'Visibility', value: displayVisibility, sub: 'Horizon', icon: Eye, color: 'text-indigo-500 bg-indigo-500/10' },
    { title: 'UV Index', value: `${current.uvIndex}`, sub: uvLevel, icon: Sun, color: 'text-yellow-500 bg-yellow-500/10' },
    { title: 'Cloud Cover', value: `${current.cloudCover}%`, sub: cloudDesc, icon: Cloud, color: 'text-slate-500 bg-slate-500/10' },
    { title: 'Dew Point', value: `${displayDewPoint}°`, sub: 'Condensation', icon: Thermometer, color: 'text-pink-500 bg-pink-500/10' },
    { title: 'Precipitation', value: displayPrecipitation, sub: 'Current rate', icon: CloudRain, color: 'text-blue-600 bg-blue-600/10' },
    { title: 'Rain Probability', value: `${current.precipitationProbability}%`, sub: current.precipitationProbability > 0 ? 'Wet' : 'Dry', icon: Percent, color: 'text-cyan-500 bg-cyan-500/10' },
  ];

  return (
    <div className="glass-card p-4 sm:p-5 transition-all duration-300 w-full">
      <div className="flex items-center justify-between mb-3 border-b border-border-custom/25 pb-2">
        <h2 className="text-xs font-bold text-text-muted uppercase tracking-wider">Weather Details</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {details.map((detail, index) => {
          const Icon = detail.icon;
          return (
            <div 
              key={index} 
              className="bg-surface hover:bg-surface-strong p-2.5 rounded-xl flex items-center justify-between transition-all duration-200 border border-border-custom select-default"
            >
              <div className="flex items-center gap-2 truncate">
                <div className={`p-1.5 rounded-lg shrink-0 ${detail.color}`}>
                  <Icon size={12} />
                </div>
                <div className="truncate text-left leading-tight">
                  <div className="text-[9px] font-bold text-text-muted uppercase mb-0.5 leading-none">{detail.title}</div>
                  <div className="text-xs font-extrabold text-text-primary leading-none">{detail.value}</div>
                </div>
              </div>
              <span className="text-[9px] text-text-secondary font-bold ml-1.5 text-right shrink-0">
                {detail.sub}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
