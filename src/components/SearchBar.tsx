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
        <Search className="absolute left-4 w-4 h-4 text-text-muted pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search city or location..."
          aria-autocomplete="list"
          aria-controls="search-results-list"
          aria-activedescendant={activeIndex >= 0 ? `option-${activeIndex}` : undefined}
          className="w-full bg-surface border border-border-custom outline-none py-2.5 pl-11 pr-10 rounded-full text-xs font-semibold text-text-primary placeholder:text-text-muted focus:bg-surface-strong focus:border-accent-custom/30 focus:ring-2 focus:ring-accent-custom/20 transition-all duration-300"
        />
        {query && (
          <button 
            onClick={() => { setQuery(''); setIsOpen(false); inputRef.current?.focus(); }}
            className="absolute right-4 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            aria-label="Clear search query"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown listbox (Using highly opaque background + blur for perfect contrast overlays) */}
      {isOpen && (query.length >= 2 || showRecents) && (
        <div 
          id="search-results-list"
          role="listbox"
          className="absolute top-full left-0 right-0 mt-2 glass-dropdown overflow-hidden max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {loading && (
            <div className="p-4 flex items-center justify-center text-text-secondary">
              <Loader2 className="w-4 h-4 animate-spin mr-2 text-accent-custom" />
              <span className="text-xs font-semibold">Searching...</span>
            </div>
          )}

          {!loading && showRecents && !query && (
            <div>
              <div className="px-4 py-2.5 text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center justify-between border-b border-border-custom/50">
                <span>Recent Searches</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); clearRecentSearches(); }}
                  className="text-text-muted hover:text-red-500 flex items-center gap-1 transition-colors normal-case cursor-pointer font-bold"
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
                    activeIndex === idx 
                      ? 'bg-accent-custom/10' 
                      : 'hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                  onClick={() => handleSelect(loc)}
                >
                  <div className="flex items-center truncate mr-3">
                    <Clock className="w-3.5 h-3.5 text-text-muted mr-3 shrink-0" />
                    <div className="truncate text-left">
                      <div className="font-bold text-text-primary text-xs">{loc.name}</div>
                      <div className="text-[10px] text-text-secondary mt-0.5">
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
                    className="p-1 rounded-full text-text-muted hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity border border-border-custom cursor-pointer"
                    aria-label={`Remove ${loc.name} from search history`}
                  >
                    <X className="w-3 h-3" />
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
                  className={`w-full text-left px-4 py-3 flex items-center transition-colors border-none outline-none cursor-pointer ${
                    activeIndex === idx 
                      ? 'bg-accent-custom/10' 
                      : 'hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 text-accent-custom mr-3 shrink-0" />
                  <div className="truncate">
                    <div className="font-bold text-text-primary text-xs">{loc.name}</div>
                    <div className="text-[10px] text-text-secondary mt-0.5">
                      {[loc.admin1, loc.country].filter(Boolean).join(', ')}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {!loading && query.length >= 2 && results.length === 0 && (
            <div className="p-4 text-center text-xs text-text-secondary font-semibold">
              Couldn't find "{query}". Try a different city.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
