import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, X } from 'lucide-react';
import { searchLocations } from '../services/weatherService';
import { LocationInfo } from '../types/weather';
import { useSettings } from '../contexts/SettingsContext';

interface SearchBarProps {
  onLocationSelect: (location: LocationInfo) => void;
}

export function SearchBar({ onLocationSelect }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { recentSearches, addRecentSearch } = useSettings();
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setLoading(true);
        try {
          const res = await searchLocations(query);
          setResults(res);
          setIsOpen(true);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        // Only show dropdown for recents if query is empty and focused
        if (query.length === 0 && document.activeElement === containerRef.current?.querySelector('input')) {
          setIsOpen(true);
        } else {
          setIsOpen(false);
        }
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (loc: LocationInfo) => {
    addRecentSearch(loc);
    onLocationSelect(loc);
    setQuery('');
    setIsOpen(false);
  };

  const showRecents = query.length === 0 && recentSearches.length > 0;

  return (
    <div className="relative w-full max-w-md z-50" ref={containerRef}>
      <div className="relative flex items-center w-full">
        <Search className="absolute left-4 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="Search city..."
          className="w-full bg-black/5 dark:bg-white/10 border-none outline-none py-3 pl-12 pr-10 rounded-full text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-primary/50 transition-all"
        />
        {query && (
          <button 
            onClick={() => { setQuery(''); setIsOpen(false); }}
            className="absolute right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (query.length >= 2 || showRecents) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden max-h-80 overflow-y-auto">
          
          {loading && (
            <div className="p-4 flex items-center justify-center text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <span>Searching...</span>
            </div>
          )}

          {!loading && showRecents && !query && (
            <div>
              <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Recent Searches</div>
              {recentSearches.map(loc => (
                <button
                  key={`recent-${loc.id}`}
                  onClick={() => handleSelect(loc)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center transition-colors"
                >
                  <MapPin className="w-4 h-4 text-gray-400 mr-3 shrink-0" />
                  <div className="truncate">
                    <div className="font-medium text-gray-900 dark:text-gray-100">{loc.name}</div>
                    <div className="text-xs text-gray-500">
                      {[loc.admin1, loc.country].filter(Boolean).join(', ')}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {!loading && query.length >= 2 && results.length > 0 && (
            <div>
              {results.map(loc => (
                <button
                  key={loc.id}
                  onClick={() => handleSelect(loc)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center transition-colors"
                >
                  <MapPin className="w-4 h-4 text-primary mr-3 shrink-0" />
                  <div className="truncate">
                    <div className="font-medium text-gray-900 dark:text-gray-100">{loc.name}</div>
                    <div className="text-xs text-gray-500">
                      {[loc.admin1, loc.country].filter(Boolean).join(', ')}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {!loading && query.length >= 2 && results.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              No results found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
