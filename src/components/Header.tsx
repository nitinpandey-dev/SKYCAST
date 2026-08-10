import React, { useState, useRef, useEffect } from 'react';
import { SearchBar } from './SearchBar';
import { ThemeToggle } from './ThemeToggle';
import { UnitToggle } from './UnitToggle';
import { LocationInfo } from '../types/weather';
import { CloudSun, ChevronDown, MapPin, Heart, Clock, Navigation } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';

interface HeaderProps {
  onLocationSelect: (location: LocationInfo) => void;
  onUseLocation: () => void;
  locationLoading: boolean;
  activeLocation: LocationInfo | null;
}

export function Header({ onLocationSelect, onUseLocation, locationLoading, activeLocation }: HeaderProps) {
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const { favorites, recentSearches } = useSettings();
  const switcherRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (switcherRef.current && !switcherRef.current.contains(event.target as Node)) {
        setSwitcherOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (loc: LocationInfo) => {
    onLocationSelect(loc);
    setSwitcherOpen(false);
  };

  return (
    <header className="w-full py-3 px-4 sm:px-6 sticky top-0 z-40 bg-[var(--background)]/85 backdrop-blur-lg border-b border-[var(--border)] transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
        
        {/* Brand & Location (Hidden on mobile to keep header minimal) */}
        <div className="hidden md:flex items-center justify-between w-full md:w-auto gap-4 shrink-0">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="bg-gradient-to-tr from-blue-500 to-indigo-500 p-2 rounded-xl text-white shadow-sm">
              <CloudSun size={20} />
            </div>
            <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
              SKYCAST
            </span>
          </Link>

          {/* Location Selector Switcher (Desktop only) */}
          {activeLocation && (
            <div className="relative" ref={switcherRef}>
              <button
                onClick={() => setSwitcherOpen(!switcherOpen)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-xs font-bold text-gray-700 dark:text-gray-200 transition-all cursor-pointer"
                aria-label="Toggle location switcher"
              >
                <MapPin size={14} className="text-primary" />
                <span className="truncate max-w-[140px]">{activeLocation.name}</span>
                <ChevronDown size={12} className={`text-gray-400 transition-transform ${switcherOpen ? 'rotate-180' : ''}`} />
              </button>

              {switcherOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <button
                    onClick={() => { onUseLocation(); setSwitcherOpen(false); }}
                    disabled={locationLoading}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 flex items-center gap-2 text-xs text-primary font-semibold transition-colors"
                  >
                    <Navigation size={12} className={locationLoading ? 'animate-pulse' : ''} />
                    <span>{locationLoading ? 'Locating...' : 'Use My Geolocation'}</span>
                  </button>

                  <div className="border-t border-gray-100 dark:border-gray-800 my-1"></div>

                  {favorites.length > 0 && (
                    <div className="py-1">
                      <div className="px-4 py-1 text-[9px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 flex items-center gap-1">
                        <Heart size={8} className="fill-red-500 text-red-500" />
                        Saved Locations
                      </div>
                      {favorites.slice(0, 3).map(fav => (
                        <button
                          key={`switcher-fav-${fav.id}`}
                          onClick={() => handleSelect(fav)}
                          className="w-full text-left px-4 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 text-xs text-gray-700 dark:text-gray-300 truncate transition-colors"
                        >
                          {fav.name}, {fav.countryCode}
                        </button>
                      ))}
                    </div>
                  )}

                  {favorites.length > 0 && recentSearches.length > 0 && (
                    <div className="border-t border-gray-100 dark:border-gray-800 my-1"></div>
                  )}

                  {recentSearches.length > 0 && (
                    <div className="py-1">
                      <div className="px-4 py-1 text-[9px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 flex items-center gap-1">
                        <Clock size={8} />
                        Recent Searches
                      </div>
                      {recentSearches.slice(0, 3).map(rec => (
                        <button
                          key={`switcher-rec-${rec.id}`}
                          onClick={() => handleSelect(rec)}
                          className="w-full text-left px-4 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 text-xs text-gray-700 dark:text-gray-300 truncate transition-colors"
                        >
                          {rec.name}, {rec.countryCode}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Center Section: Search Bar (Dominates on mobile) */}
        <div className="w-full md:flex-1 md:max-w-md md:mx-4">
          <SearchBar onLocationSelect={onLocationSelect} />
        </div>

        {/* Right Section: Configuration controls (Compact on mobile) */}
        <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto shrink-0 border-t border-gray-100 dark:border-gray-800 md:border-none pt-2 md:pt-0">
          <div className="flex md:hidden items-center gap-1">
            <Navigation 
              size={14} 
              onClick={onUseLocation} 
              className={`text-primary cursor-pointer ${locationLoading ? 'animate-pulse' : ''}`} 
            />
            <span className="text-[10px] text-gray-400 font-bold uppercase">GPS</span>
          </div>
          
          <div className="flex items-center gap-3">
            <UnitToggle />
            <div className="w-px h-5 bg-gray-200 dark:bg-gray-800 hidden md:block"></div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
