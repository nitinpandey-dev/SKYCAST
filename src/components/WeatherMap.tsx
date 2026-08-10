import React, { useState } from 'react';
import { Map, Thermometer, Wind, CloudRain } from 'lucide-react';

export function WeatherMap() {
  const [activeLayer, setActiveLayer] = useState<'temp' | 'radar' | 'wind'>('temp');

  const layers = [
    { id: 'temp' as const, label: 'Temperature', icon: Thermometer },
    { id: 'radar' as const, label: 'Radar / Rain', icon: CloudRain },
    { id: 'wind' as const, label: 'Wind speed', icon: Wind }
  ];

  return (
    <div className="glass-card p-6 flex flex-col transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h2 className="text-xs font-bold text-text-muted uppercase tracking-wider">
          Interactive Weather Map
        </h2>
        
        {/* Layer tabs */}
        <div className="flex items-center bg-surface border border-border-custom p-0.5 rounded-xl shrink-0">
          {layers.map(layer => {
            const Icon = layer.icon;
            const isActive = activeLayer === layer.id;
            return (
              <button
                key={layer.id}
                onClick={() => setActiveLayer(layer.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-surface-strong border border-accent-custom/20 text-text-primary font-bold shadow-sm' 
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Icon size={12} className={isActive ? 'text-accent-custom' : ''} />
                <span>{layer.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Map Glass Placeholder (Strictly Theme-Aware) */}
      <div className="h-64 rounded-2xl bg-surface border border-dashed border-border-custom flex flex-col items-center justify-center p-4 text-center select-none">
        <div className="bg-accent-custom/10 p-3 rounded-2xl text-accent-custom mb-3 animate-[pulse_3s_ease-in-out_infinite]">
          <Map size={36} strokeWidth={1.5} />
        </div>
        <h3 className="text-sm font-bold text-text-primary mb-1">
          {activeLayer === 'temp' && 'Temperature Distribution Map'}
          {activeLayer === 'radar' && 'Precipitation Radar Map'}
          {activeLayer === 'wind' && 'Atmospheric Wind Vector Map'}
        </h3>
        <p className="text-xs text-text-muted max-w-sm leading-relaxed">
          Open-Meteo tile layers are currently loading. Interactive coordinates will center around the current selected city automatically.
        </p>
      </div>
    </div>
  );
}
