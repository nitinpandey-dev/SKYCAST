import React from 'react';
import { Map } from 'lucide-react';

export function WeatherMap() {
  return (
    <div className="glass-card p-6 flex flex-col h-full min-h-[300px]">
      <h2 className="text-xl font-semibold mb-4">Weather Map</h2>
      <div className="flex-1 bg-black/5 dark:bg-white/5 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center text-center p-6">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
          <Map className="w-8 h-8 text-blue-500" />
        </div>
        <h3 className="text-lg font-medium mb-2">Interactive Maps</h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm">
          This feature requires a dedicated map tile provider (like Mapbox or Leaflet) integrated with weather radar layers. 
          The component architecture is ready for future integration.
        </p>
      </div>
    </div>
  );
}
