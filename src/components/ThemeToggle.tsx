import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

export function ThemeToggle() {
  const { theme, setTheme } = useSettings();

  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-surface hover:bg-surface-strong border border-border-custom transition-all duration-200 cursor-pointer shadow-sm active:scale-95 flex items-center justify-center select-none"
      aria-label={`Current theme: ${theme}. Click to change.`}
      title="Toggle theme"
    >
      {theme === 'light' && <Sun size={16} className="text-amber-500 animate-[spin_40s_linear_infinite]" />}
      {theme === 'dark' && <Moon size={16} className="text-accent-custom animate-[pulse_5s_ease-in-out_infinite]" />}
      {theme === 'system' && <Laptop size={16} className="text-text-muted" />}
    </button>
  );
}
