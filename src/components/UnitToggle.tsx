import React from 'react';
import { useSettings } from '../contexts/SettingsContext';

export function UnitToggle() {
  const { units, setUnits } = useSettings();

  const baseButtonClass = "px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer select-none";
  const activeClass = "bg-[#3478F6] text-white dark:bg-accent-custom/18 dark:text-white shadow-sm";
  const inactiveClass = "text-text-muted hover:text-text-primary";

  return (
    <div className="flex items-center bg-surface border border-border-custom rounded-full p-0.5">
      <button
        onClick={() => setUnits('metric')}
        className={`${baseButtonClass} ${units === 'metric' ? activeClass : inactiveClass}`}
        aria-label="Use Celsius"
      >
        °C
      </button>
      <button
        onClick={() => setUnits('imperial')}
        className={`${baseButtonClass} ${units === 'imperial' ? activeClass : inactiveClass}`}
        aria-label="Use Fahrenheit"
      >
        °F
      </button>
    </div>
  );
}
