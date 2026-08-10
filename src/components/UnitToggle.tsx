import React from 'react';
import { useSettings } from '../contexts/SettingsContext';

export function UnitToggle() {
  const { units, setUnits } = useSettings();

  return (
    <div className="flex items-center bg-black/5 dark:bg-white/10 rounded-full p-1 border border-black/5 dark:border-white/5">
      <button
        onClick={() => setUnits('metric')}
        className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
          units === 'metric' 
            ? 'bg-white dark:bg-gray-800 shadow-sm text-black dark:text-white' 
            : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
        }`}
        aria-label="Use Celsius"
      >
        °C
      </button>
      <button
        onClick={() => setUnits('imperial')}
        className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
          units === 'imperial' 
            ? 'bg-white dark:bg-gray-800 shadow-sm text-black dark:text-white' 
            : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
        }`}
        aria-label="Use Fahrenheit"
      >
        °F
      </button>
    </div>
  );
}
