import React, { useState, useRef, useEffect } from 'react';
import { SearchBar } from './SearchBar';
import { ThemeToggle } from './ThemeToggle';
import { UnitToggle } from './UnitToggle';
import { LocationInfo } from '../types/weather';
import { CloudSun, ChevronDown, MapPin, Heart, Clock, Navigation } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';

interface WeatherHeaderProps {
  onLocationSelect: (location: LocationInfo) => void;
  onUseLocation: () => void;
  locationLoading: boolean;
  activeLocation: LocationInfo | null;
}

export function WeatherHeader({ 
  onLocationSelect, 
  onUseLocation, 
  locationLoading, 
  activeLocation 
}: WeatherHeaderProps) {
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
    <header className="w-full px-4 pt-4 sticky top-0 z-40 select-none">
      <div className="max-w-7xl mx-auto glass-card h-16 px-4 flex items-center justify-between gap-3 md:gap-6 shadow-sm border border-border-custom/80">
        
        {/* Left Side: Logo & Location Switcher */}
        <div className="flex items-center gap-4 shrink-0">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="bg-accent-custom p-1.5 rounded-lg text-white shadow-sm flex items-center justify-center">
              <CloudSun size={16} />
            </div>
            <span className="font-extrabold text-sm tracking-tight text-text-primary hidden sm:block">
              SKYCAST
            </span>
          </Link>

          {/* Location Selector Switcher */}
          {activeLocation && (
            <div className="relative" ref={switcherRef}>
              <button
                onClick={() => setSwitcherOpen(!switcherOpen)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-elevated/40 hover:bg-surface-elevated/70 text-xs font-semibold text-text-primary border border-border-custom/50 transition-all cursor-pointer"
                aria-label="Toggle location switcher"
              >
                <MapPin size={12} className="text-accent-custom" />
                <span className="truncate max-w-[100px] sm:max-w-[130px] font-semibold">{activeLocation.name}</span>
                <ChevronDown size={11} className={`text-text-muted transition-transform duration-200 ${switcherOpen ? 'rotate-180 text-accent-custom' : ''}`} />
              </button>

              {switcherOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-surface-elevated backdrop-blur-xl rounded-2xl shadow-xl border border-border-custom py-2.5 z-50 animate-in fade-in duration-200">
                  <button
                    onClick={() => { onUseLocation(); setSwitcherOpen(false); }}
                    disabled={locationLoading}
                    className="w-full text-left px-4 py-2 hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2 text-xs text-accent-custom font-bold transition-colors cursor-pointer border-none outline-none"
                  >
                    <Navigation size={12} className={locationLoading ? 'animate-pulse' : ''} />
                    <span>{locationLoading ? 'Locating...' : 'Use My Geolocation'}</span>
                  </button>

                  <div className="border-t border-border-custom my-1.5 opacity-50"></div>

                  {favorites.length > 0 && (
                    <div className="py-1">
                      <div className="px-4 py-1 text-[9px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1 mb-1">
                        <Heart size={8} className="fill-red-500 text-red-500" />
                        Saved Locations
                      </div>
                      {favorites.slice(0, 3).map(fav => (
                        <button
                          key={`switcher-fav-${fav.id}`}
                          onClick={() => handleSelect(fav)}
                          className="w-full text-left px-4 py-1.5 hover:bg-black/5 dark:hover:bg-white/5 text-xs text-text-secondary hover:text-text-primary truncate transition-colors cursor-pointer border-none outline-none"
                        >
                          {fav.name}, {fav.countryCode}
                        </button>
                      ))}
                    </div>
                  )}

                  {favorites.length > 0 && recentSearches.length > 0 && (
                    <div className="border-t border-border-custom my-1.5 opacity-50"></div>
                  )}

                  {recentSearches.length > 0 && (
                    <div className="py-1">
                      <div className="px-4 py-1 text-[9px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1 mb-1">
                        <Clock size={8} />
                        Recent Searches
                      </div>
                      {recentSearches.slice(0, 3).map(rec => (
                        <button
                          key={`switcher-rec-${rec.id}`}
                          onClick={() => handleSelect(rec)}
                          className="w-full text-left px-4 py-1.5 hover:bg-black/5 dark:hover:bg-white/5 text-xs text-text-secondary hover:text-text-primary truncate transition-colors cursor-pointer border-none outline-none"
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

        {/* Center Section: Search Bar */}
        <div className="flex-1 max-w-xs md:max-w-md mx-2 sm:mx-4">
          <SearchBar onLocationSelect={onLocationSelect} />
        </div>

        {/* Right Section: Configuration Controls */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <UnitToggle />
          <div className="w-px h-5 bg-border-custom hidden sm:block"></div>
          <ThemeToggle />
        </div>

      </div>
    </header>
  );
}
export default WeatherHeader;
