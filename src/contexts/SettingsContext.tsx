import React, { createContext, useContext, useEffect, useState } from 'react';
import { LocationInfo, Theme, UnitSystem } from '../types/weather';

interface SettingsContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  units: UnitSystem;
  setUnits: (units: UnitSystem) => void;
  favorites: LocationInfo[];
  addFavorite: (loc: LocationInfo) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  recentSearches: LocationInfo[];
  addRecentSearch: (loc: LocationInfo) => void;
  clearRecentSearches: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  // Theme
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) || 'system';
  });

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(mediaQuery.matches ? 'dark' : 'light');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Units
  const [units, setUnitsState] = useState<UnitSystem>(() => {
    return (localStorage.getItem('units') as UnitSystem) || 'metric';
  });

  const setUnits = (newUnits: UnitSystem) => {
    setUnitsState(newUnits);
    localStorage.setItem('units', newUnits);
  };

  // Favorites
  const [favorites, setFavoritesState] = useState<LocationInfo[]>(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });

  const addFavorite = (loc: LocationInfo) => {
    setFavoritesState(prev => {
      if (prev.some(f => f.id === loc.id)) return prev;
      const newFavs = [...prev, loc];
      localStorage.setItem('favorites', JSON.stringify(newFavs));
      return newFavs;
    });
  };

  const removeFavorite = (id: string) => {
    setFavoritesState(prev => {
      const newFavs = prev.filter(f => f.id !== id);
      localStorage.setItem('favorites', JSON.stringify(newFavs));
      return newFavs;
    });
  };

  const isFavorite = (id: string) => favorites.some(f => f.id === id);

  // Recent Searches
  const [recentSearches, setRecentSearchesState] = useState<LocationInfo[]>(() => {
    const saved = localStorage.getItem('recentSearches');
    return saved ? JSON.parse(saved) : [];
  });

  const addRecentSearch = (loc: LocationInfo) => {
    setRecentSearchesState(prev => {
      // Remove if exists to put it at the top
      const filtered = prev.filter(r => r.id !== loc.id);
      const newRecents = [loc, ...filtered].slice(0, 5); // Keep max 5
      localStorage.setItem('recentSearches', JSON.stringify(newRecents));
      return newRecents;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearchesState([]);
    localStorage.removeItem('recentSearches');
  };

  return (
    <SettingsContext.Provider
      value={{
        theme,
        setTheme,
        units,
        setUnits,
        favorites,
        addFavorite,
        removeFavorite,
        isFavorite,
        recentSearches,
        addRecentSearch,
        clearRecentSearches
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
