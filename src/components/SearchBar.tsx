import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, X, Clock, Trash2 } from 'lucide-react';
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
  const [activeIndex, setActiveIndex] = useState(-1);
  const { recentSearches, addRecentSearch, removeRecentSearch, clearRecentSearches } = useSettings();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setLoading(true);
        try {
          const res = await searchLocations(query);
          setResults(res);
          setIsOpen(true);
          setActiveIndex(-1);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        if (query.length === 0 && document.activeElement === inputRef.current) {
          setIsOpen(true);
        } else {
          setIsOpen(false);
        }
        setActiveIndex(-1);
      }
    }, 400);

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
    inputRef.current?.blur();
  };

  const showRecents = query.length === 0 && recentSearches.length > 0;
  const currentItems = showRecents ? recentSearches : results;

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || currentItems.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev + 1 >= currentItems.length ? 0 : prev + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev - 1 < 0 ? currentItems.length - 1 : prev - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < currentItems.length) {
        handleSelect(currentItems[activeIndex]);
      } else if (results.length > 0) {
        handleSelect(results[0]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="relative w-full max-w-md z-50" ref={containerRef}>
      <div 
        className="relative flex items-center w-full"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-owns="search-results-list"
      >
        <Search className="absolute left-4 w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search city..."
          aria-autocomplete="list"
          aria-controls="search-results-list"
          aria-activedescendant={activeIndex >= 0 ? `option-${activeIndex}` : undefined}
          className="w-full bg-black/5 dark:bg-white/10 border border-transparent outline-none py-3 pl-12 pr-10 rounded-full text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:bg-white dark:focus:bg-gray-800 focus:border-primary/30 focus:ring-4 focus:ring-primary/10 transition-all duration-300"
        />
        {query && (
          <button 
            onClick={() => { setQuery(''); setIsOpen(false); inputRef.current?.focus(); }}
            className="absolute right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            aria-label="Clear search query"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown listbox */}
      {isOpen && (query.length >= 2 || showRecents) && (
        <div 
          id="search-results-list"
          role="listbox"
          className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {loading && (
            <div className="p-4 flex items-center justify-center text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <span className="text-sm font-medium">Searching...</span>
            </div>
          )}

          {!loading && showRecents && !query && (
            <div>
              <div className="px-4 py-2 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center justify-between">
                <span>Recent Searches</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); clearRecentSearches(); }}
                  className="text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors text-[10px] normal-case"
                  title="Clear all search history"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear All
                </button>
              </div>
              {recentSearches.map((loc, idx) => (
                <div
                  key={`recent-${loc.id}`}
                  id={`option-${idx}`}
                  role="option"
                  aria-selected={activeIndex === idx}
                  className={`w-full px-4 py-3 flex items-center justify-between group transition-colors cursor-pointer ${
                    activeIndex === idx ? 'bg-primary/10 dark:bg-primary/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                  onClick={() => handleSelect(loc)}
                >
                  <div className="flex items-center truncate mr-3">
                    <Clock className="w-4 h-4 text-gray-400 mr-3 shrink-0" />
                    <div className="truncate text-left">
                      <div className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{loc.name}</div>
                      <div className="text-xs text-gray-500">
                        {[loc.admin1, loc.country].filter(Boolean).join(', ')}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeRecentSearch(loc.id);
                      if (recentSearches.length <= 1) setIsOpen(false);
                    }}
                    className="p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                    aria-label={`Remove ${loc.name} from search history`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {!loading && query.length >= 2 && results.length > 0 && (
            <div>
              {results.map((loc, idx) => (
                <button
                  key={loc.id}
                  id={`option-${idx}`}
                  role="option"
                  aria-selected={activeIndex === idx}
                  onClick={() => handleSelect(loc)}
                  className={`w-full text-left px-4 py-3 flex items-center transition-colors border-none outline-none ${
                    activeIndex === idx ? 'bg-primary/10 dark:bg-primary/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <MapPin className="w-4 h-4 text-primary mr-3 shrink-0" />
                  <div className="truncate">
                    <div className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{loc.name}</div>
                    <div className="text-xs text-gray-500">
                      {[loc.admin1, loc.country].filter(Boolean).join(', ')}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {!loading && query.length >= 2 && results.length === 0 && (
            <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
              Couldn't find "{query}". Try a different city.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
