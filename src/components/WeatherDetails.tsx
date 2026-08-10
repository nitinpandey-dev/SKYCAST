import React from 'react';
import { CurrentWeather } from '../types/weather';
import { useSettings } from '../contexts/SettingsContext';
import { kmhToMph, getWindDirection } from '../utils/weatherUtils';
import { Droplets, Wind, Navigation, Gauge, Eye, Sun, Thermometer, Cloud } from 'lucide-react';

interface WeatherDetailsProps {
  current: CurrentWeather;
}

export function WeatherDetails({ current }: WeatherDetailsProps) {
  const { units } = useSettings();

  const displayWind = Math.round(units === 'imperial' ? kmhToMph(current.windSpeed) : current.windSpeed);
  const windUnit = units === 'imperial' ? 'mph' : 'km/h';
  const windDir = getWindDirection(current.windDirection);

  const displayVisibility = units === 'imperial' 
    ? (current.visibility * 0.621371).toFixed(1) + ' mi'
    : current.visibility.toFixed(1) + ' km';

  const displayDewPoint = Math.round(units === 'imperial' 
    ? (current.dewPoint * 9/5) + 32 
    : current.dewPoint
  );

  const details = [
    { title: 'Humidity', value: `${current.humidity}%`, sub: 'Water vapor in air', icon: Droplets, color: 'text-blue-500 bg-blue-500/10' },
    { title: 'Wind', value: `${displayWind} ${windUnit}`, sub: `Dir: ${windDir}`, icon: Wind, color: 'text-emerald-500 bg-emerald-500/10' },
    { title: 'Wind Direction', value: `${current.windDirection}°`, sub: windDir, icon: Navigation, color: 'text-teal-500 bg-teal-500/10' },
    { title: 'Pressure', value: `${Math.round(current.pressure)} hPa`, sub: 'Atmospheric density', icon: Gauge, color: 'text-indigo-500 bg-indigo-500/10' },
    { title: 'Visibility', value: displayVisibility, sub: 'Distance clear sight', icon: Eye, color: 'text-cyan-500 bg-cyan-500/10' },
    { title: 'UV Index', value: current.uvIndex.toFixed(0), sub: current.uvIndex >= 6 ? 'High risk' : 'Low risk', icon: Sun, color: 'text-amber-500 bg-amber-500/10' },
    { title: 'Dew Point', value: `${displayDewPoint}°`, sub: 'Condensation temp', icon: Thermometer, color: 'text-rose-500 bg-rose-500/10' },
    { title: 'Cloud Cover', value: `${current.cloudCover}%`, sub: 'Sky cloud ratio', icon: Cloud, color: 'text-slate-500 bg-slate-500/10' }
  ];

  return (
    <div className="glass-card p-4 sm:p-5 transition-all duration-300 w-full select-none">
      <div className="flex items-center justify-between mb-4 border-b border-border-custom/25 pb-2">
        <h2 className="text-xs font-semibold text-text-primary tracking-wider">Weather details</h2>
        <span className="text-[10px] text-text-muted font-medium">Current conditions</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {details.map((detail, index) => {
          const Icon = detail.icon;
          return (
            <div 
              key={index} 
              className="flex gap-3 bg-surface-elevated/20 border border-border-custom/40 p-3.5 rounded-2xl items-center hover:bg-surface-elevated/40 transition-colors text-left"
            >
              <div className={`p-2 rounded-xl shrink-0 ${detail.color}`}>
                <Icon size={14} />
              </div>
              <div className="leading-tight">
                <span className="text-[9px] font-bold text-text-muted uppercase block mb-0.5">
                  {detail.title}
                </span>
                <span className="text-sm font-bold text-text-primary block leading-none">
                  {detail.value}
                </span>
                <span className="text-[8px] text-text-secondary mt-0.5 block truncate max-w-[90px] sm:max-w-none">
                  {detail.sub}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
export default WeatherDetails;
