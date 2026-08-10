import React from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { MapPin, X, Heart } from 'lucide-react';
import { LocationInfo } from '../types/weather';

interface FavoriteLocationsProps {
  onSelect: (location: LocationInfo) => void;
}

export function FavoriteLocations({ onSelect }: FavoriteLocationsProps) {
  const { favorites, removeFavorite } = useSettings();

  if (favorites.length === 0) return null;

  return (
    <div className="glass-card p-6 mt-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Heart size={20} className="text-red-500 fill-red-500" />
        My Locations
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {favorites.map((loc) => (
          <div 
            key={loc.id}
            className="group relative bg-black/5 dark:bg-white/5 hover:bg-primary/10 dark:hover:bg-primary/20 p-4 rounded-2xl cursor-pointer transition-colors border border-transparent hover:border-primary/20"
            onClick={() => onSelect(loc)}
          >
            <div className="flex items-start justify-between">
              <div className="truncate pr-6">
                <h3 className="font-semibold text-lg truncate">{loc.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {[loc.admin1, loc.country].filter(Boolean).join(', ')}
                </p>
              </div>
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeFavorite(loc.id);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/50 dark:bg-black/50 text-gray-400 hover:text-red-500 hover:bg-white dark:hover:bg-gray-800 opacity-0 group-hover:opacity-100 transition-all shadow-sm"
              title="Remove favorite"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
