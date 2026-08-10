import React, { useState } from 'react';
import { Map, Thermometer, CloudRain, Wind, Layers } from 'lucide-react';

type MapLayer = 'temp' | 'rain' | 'wind';

export function WeatherMap() {
  const [activeLayer, setActiveLayer] = useState<MapLayer>('temp');

  const layers = [
    { id: 'temp' as MapLayer, label: 'Temperature', icon: Thermometer, color: 'text-amber-500', desc: 'visualizing thermal gradients across geographical boundaries.' },
    { id: 'rain' as MapLayer, label: 'Radar / Rain', icon: CloudRain, color: 'text-blue-500', desc: 'monitoring real-time precipitation density and storm tracking.' },
    { id: 'wind' as MapLayer, label: 'Wind Currents', icon: Wind, color: 'text-teal-500', desc: 'tracking dominant wind vector speeds and atmospheric flow.' }
  ];

  return (
    <div className="glass-card p-6 flex flex-col h-full min-h-[350px] transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Layers size={20} className="text-primary" />
          Interactive Radar
        </h2>
        
        {/* Layer Tabs */}
        <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl self-start sm:self-auto border border-black/5 dark:border-white/5">
          {layers.map(layer => {
            const Icon = layer.icon;
            const isActive = activeLayer === layer.id;
            return (
              <button
                key={layer.id}
                onClick={() => setActiveLayer(layer.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-white dark:bg-gray-800 shadow-sm text-gray-900 dark:text-white' 
                    : 'text-gray-500 hover:text-gray-950 dark:hover:text-gray-200'
                }`}
              >
                <Icon size={12} className={isActive ? layer.color : ''} />
                <span>{layer.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Placeholder View */}
      <div className="flex-1 bg-black/5 dark:bg-white/5 rounded-2xl border border-dashed border-gray-300 dark:border-gray-800 flex flex-col items-center justify-center text-center p-6 transition-all duration-500">
        <div className="relative mb-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center animate-[pulse_3s_infinite]">
            <Map className="w-8 h-8 text-primary" />
          </div>
          {/* Subtle radar scan sweep effect */}
          <div className="absolute inset-0 border border-primary/20 rounded-full animate-ping opacity-30"></div>
        </div>

        <h3 className="text-lg font-bold mb-2">
          {layers.find(l => l.id === activeLayer)?.label} Layer Preview
        </h3>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed mb-4">
          A dedicated map tile service (such as Mapbox, OpenStreetMap, or Leaflet) is required for {layers.find(l => l.id === activeLayer)?.desc}
        </p>

        <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-gray-500 bg-black/5 dark:bg-white/10 px-3 py-1 rounded-full">
          Integration Ready
        </div>
      </div>
    </div>
  );
}
