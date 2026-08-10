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
      className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
      aria-label={`Current theme: ${theme}. Click to change.`}
      title="Toggle theme"
    >
      {theme === 'light' && <Sun size={20} className="text-amber-500" />}
      {theme === 'dark' && <Moon size={20} className="text-blue-400" />}
      {theme === 'system' && <Laptop size={20} className="text-gray-500 dark:text-gray-400" />}
    </button>
  );
}
