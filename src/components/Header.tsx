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
    <header className="w-full px-4 pt-3 sticky top-0 z-40 select-none">
      <div className="max-w-7xl mx-auto bg-header-bg backdrop-blur-lg border border-border-custom px-4 py-2 rounded-2xl shadow-sm transition-all duration-300 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
        
        {/* Brand & Location (Hidden on mobile to keep header minimal) */}
        <div className="hidden md:flex items-center justify-between w-full md:w-auto gap-4 shrink-0">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="bg-gradient-to-tr from-blue-500 to-indigo-500 p-2 rounded-xl text-white shadow-sm">
              <CloudSun size={20} />
            </div>
            <span className="font-extrabold text-base tracking-tight text-text-primary">
              SKYCAST
            </span>
          </Link>

          {/* Location Selector Switcher (Desktop only) */}
          {activeLocation && (
            <div className="relative" ref={switcherRef}>
              <button
                onClick={() => setSwitcherOpen(!switcherOpen)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-surface hover:bg-surface-strong text-xs font-bold text-text-secondary hover:text-text-primary border border-border-custom transition-all cursor-pointer"
                aria-label="Toggle location switcher"
              >
                <MapPin size={14} className="text-accent-custom" />
                <span className="truncate max-w-[140px]">{activeLocation.name}</span>
                <ChevronDown size={12} className={`text-text-muted transition-transform duration-250 ${switcherOpen ? 'rotate-180 text-accent-custom' : ''}`} />
              </button>

              {switcherOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-surface-strong backdrop-blur-xl rounded-2xl shadow-xl border border-border-custom py-2.5 z-50 animate-in fade-in duration-200">
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

        {/* Center Section: Search Bar (Dominates on mobile) */}
        <div className="w-full md:flex-1 md:max-w-md md:mx-4">
          <SearchBar onLocationSelect={onLocationSelect} />
        </div>

        {/* Right Section: Configuration controls (Compact on mobile) */}
        <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto shrink-0 border-t border-border-custom md:border-none pt-2 md:pt-0">
          <div className="flex md:hidden items-center gap-1.5 bg-surface border border-border-custom px-3 py-1.5 rounded-full cursor-pointer hover:bg-surface-strong" onClick={onUseLocation}>
            <Navigation 
              size={12} 
              className={`text-accent-custom ${locationLoading ? 'animate-pulse' : ''}`} 
            />
            <span className="text-[10px] text-text-secondary font-bold uppercase">GPS</span>
          </div>
          
          <div className="flex items-center gap-3">
            <UnitToggle />
            <div className="w-px h-5 bg-border-custom hidden md:block"></div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
