import React, { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { X, Heart, Loader2 } from 'lucide-react';
import { LocationInfo } from '../types/weather';
import { getWeatherData, reverseGeocode } from '../services/weatherService';
import { cToF, getWeatherCondition } from '../utils/weatherUtils';

interface FavoriteLocationsProps {
  onSelect: (location: LocationInfo) => void;
}

interface FavWeatherData {
  temp: number;
  conditionCode: number;
  isDay: boolean;
}

export function FavoriteLocations({ onSelect }: FavoriteLocationsProps) {
  const { favorites, removeFavorite, units } = useSettings();
  const [weatherDataMap, setWeatherDataMap] = useState<Record<string, FavWeatherData>>({});
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

  // Background fetch temperatures/conditions for favorites
  useEffect(() => {
    if (favorites.length === 0) return;

    const fetchFavoriteWeather = async (loc: LocationInfo) => {
      // Don't refetch if we already have it loading
      if (loadingMap[loc.id]) return;

      setLoadingMap(prev => ({ ...prev, [loc.id]: true }));
      try {
        const data = await getWeatherData(loc.lat, loc.lon);
        setWeatherDataMap(prev => ({
          ...prev,
          [loc.id]: {
            temp: data.current.temperature,
            conditionCode: data.current.conditionCode,
            isDay: data.current.isDay
          }
        }));
      } catch (e) {
        console.error(`Failed to fetch background weather for favorite ${loc.name}`, e);
      } finally {
        setLoadingMap(prev => ({ ...prev, [loc.id]: false }));
      }
    };

    favorites.forEach(loc => {
      // Fetch if not already fetched
      if (!weatherDataMap[loc.id]) {
        fetchFavoriteWeather(loc);
      }
    });
  }, [favorites, weatherDataMap, loadingMap]);

  if (favorites.length === 0) return null;

  return (
    <div className="glass-card p-6 mt-6 transition-all duration-300">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Heart size={20} className="text-red-500 fill-red-500" />
        My Locations
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {favorites.map((loc) => {
          const weather = weatherDataMap[loc.id];
          const isLoading = loadingMap[loc.id];
          const displayTemp = weather 
            ? Math.round(units === 'imperial' ? cToF(weather.temp) : weather.temp) 
            : null;
          const condition = weather 
            ? getWeatherCondition(weather.conditionCode, weather.isDay) 
            : null;

          return (
            <div 
              key={loc.id}
              className="group relative bg-black/5 dark:bg-white/5 hover:bg-primary/10 dark:hover:bg-primary/20 p-4 rounded-2xl cursor-pointer transition-all duration-300 border border-transparent hover:border-primary/20 flex items-center justify-between overflow-hidden"
              onClick={() => onSelect(loc)}
            >
              <div className="truncate pr-6">
                <h3 className="font-bold text-base truncate">{loc.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {[loc.admin1, loc.country].filter(Boolean).join(', ')}
                </p>
                {condition && (
                  <span className="text-[10px] font-bold text-primary mt-1 block">
                    {condition.description}
                  </span>
                )}
              </div>

              {/* Temperature display or loader */}
              <div className="shrink-0 flex items-center gap-2">
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin text-gray-400" />
                ) : displayTemp !== null ? (
                  <span className="text-xl font-black">{displayTemp}°</span>
                ) : (
                  <span className="text-xs text-gray-400">—</span>
                )}
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFavorite(loc.id);
                }}
                className="absolute top-2 right-2 p-1 rounded-full bg-white/60 dark:bg-black/50 text-gray-400 hover:text-red-500 hover:bg-white dark:hover:bg-gray-800 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all shadow-sm"
                title={`Remove ${loc.name} from favorites`}
              >
                <X size={12} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
