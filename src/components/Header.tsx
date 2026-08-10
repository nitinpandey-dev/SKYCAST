import React from 'react';
import { SearchBar } from './SearchBar';
import { LocationButton } from './LocationButton';
import { ThemeToggle } from './ThemeToggle';
import { UnitToggle } from './UnitToggle';
import { LocationInfo } from '../types/weather';
import { CloudSun } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  onLocationSelect: (location: LocationInfo) => void;
  onUseLocation: () => void;
  locationLoading: boolean;
}

export function Header({ onLocationSelect, onUseLocation, locationLoading }: HeaderProps) {
  return (
    <header className="w-full py-4 px-6 sticky top-0 z-40 bg-[var(--background)]/80 backdrop-blur-lg border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="bg-gradient-to-tr from-blue-500 to-indigo-500 p-2 rounded-xl text-white">
            <CloudSun size={24} />
          </div>
          <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
            SKYCAST
          </span>
        </Link>

        {/* Search */}
        <div className="w-full md:flex-1 md:max-w-xl md:mx-8">
          <SearchBar onLocationSelect={onLocationSelect} />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end shrink-0">
          <LocationButton onClick={onUseLocation} loading={locationLoading} />
          <div className="flex items-center gap-2">
            <UnitToggle />
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
