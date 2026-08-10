import React, { useState } from 'react';
import { Map, Thermometer, CloudRain, Wind } from 'lucide-react';

type MapLayer = 'temp' | 'rain' | 'wind';

export function WeatherMap() {
  const [activeLayer, setActiveLayer] = useState<MapLayer>('temp');

  const layers = [
    { id: 'temp' as MapLayer, label: 'Temperature', icon: Thermometer, color: 'text-amber-500', note: 'Thermal maps require satellite grid overlays.' },
    { id: 'rain' as MapLayer, label: 'Rain / Radar', icon: CloudRain, color: 'text-blue-500', note: 'Precipitation tracking requires Doppler radar tiles.' },
    { id: 'wind' as MapLayer, label: 'Wind', icon: Wind, color: 'text-teal-500', note: 'Wind currents require vector stream integrations.' }
  ];

  return (
    <div className="glass-card p-6 flex flex-col h-full min-h-[300px] transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Weather Map</h2>
        
        {/* Layer Tabs Selector */}
        <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl self-start sm:self-auto border border-black/5 dark:border-white/5">
          {layers.map(layer => {
            const Icon = layer.icon;
            const isActive = activeLayer === layer.id;
            return (
              <button
                key={layer.id}
                onClick={() => setActiveLayer(layer.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-white dark:bg-gray-800 shadow-sm text-gray-900 dark:text-white' 
                    : 'text-gray-500 hover:text-gray-950 dark:hover:text-gray-200'
                }`}
              >
                <Icon size={10} className={isActive ? layer.color : ''} />
                <span>{layer.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Radar Map Placeholder */}
      <div className="flex-1 bg-black/5 dark:bg-white/5 rounded-2xl border border-dashed border-gray-300 dark:border-gray-800 flex flex-col items-center justify-center text-center p-6 transition-all duration-350">
        <div className="relative mb-3">
          <div className="w-12 h-12 bg-primary/5 dark:bg-primary/20 rounded-full flex items-center justify-center">
            <Map className="w-6 h-6 text-primary" />
          </div>
          <div className="absolute inset-0 border border-primary/20 rounded-full animate-ping opacity-25"></div>
        </div>

        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-1">
          {layers.find(l => l.id === activeLayer)?.label} Radar
        </h3>
        
        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[240px] leading-relaxed mb-1">
          {layers.find(l => l.id === activeLayer)?.note}
        </p>
        <span className="text-[10px] text-gray-400 dark:text-gray-500">
          Interactive map tile provider configuration is required.
        </span>
      </div>
    </div>
  );
}
