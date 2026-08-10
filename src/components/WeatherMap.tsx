import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LocationInfo, WeatherData } from '../types/weather';
import { getWeatherCondition, cToF } from '../utils/weatherUtils';
import { Map, Thermometer, Wind, CloudRain, Crosshair, Plus, Minus, Loader2 } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

// Fix Leaflet icon issues in Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface WeatherMapProps {
  activeLocation: LocationInfo | null;
  currentWeatherData: WeatherData | null;
}

// Subcomponent to recenter the map on active coordinates
function RecenterMap({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lon], map.getZoom());
  }, [lat, lon, map]);
  return null;
}

// Track map instance and expose to parent
function MapInstanceTracker({ setMap }: { setMap: (map: L.Map | null) => void }) {
  const map = useMap();
  useEffect(() => {
    setMap(map);
    return () => setMap(null);
  }, [map, setMap]);
  return null;
}

// Dynamic temperature color scale
const getTempColor = (t: number) => {
  if (t < 15) return '#3b82f6'; // Blue
  if (t < 22) return '#06b6d4'; // Cyan
  if (t < 28) return '#eab308'; // Yellow
  if (t < 34) return '#f97316'; // Orange
  return '#ef4444'; // Red
};

// Dynamic wind speed color scale
const getWindColor = (s: number) => {
  if (s < 10) return '#10b981'; // Muted Green
  if (s < 20) return '#059669'; // Medium Green
  if (s < 30) return '#0d9488'; // Teal
  return '#0f766e'; // Dark Teal
};

// Dynamic precipitation color scale
const getPrecipColor = (p: number) => {
  if (p <= 0.2) return '#93c5fd'; // Light Blue
  if (p <= 2.0) return '#3b82f6'; // Blue
  if (p <= 7.0) return '#2563eb'; // Medium Blue
  return '#1d4ed8'; // Heavy Blue
};

export function WeatherMap({ activeLocation, currentWeatherData }: WeatherMapProps) {
  const { units } = useSettings();
  const [activeLayer, setActiveLayer] = useState<'temp' | 'radar' | 'wind'>('temp');
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [radarTileUrl, setRadarTileUrl] = useState<string | null>(null);
  
  // Grid overlay data
  const [gridData, setGridData] = useState<any[]>([]);
  const [overlayLoading, setOverlayLoading] = useState(false);
  const [overlayError, setOverlayError] = useState<boolean>(false);

  const defaultLat = 40.7127;
  const defaultLon = -74.0059;

  const lat = activeLocation?.lat ?? defaultLat;
  const lon = activeLocation?.lon ?? defaultLon;
  const locationName = activeLocation?.name ?? 'New York';

  const currentTemp = currentWeatherData?.current?.temperature ?? 20;
  const currentCondition = currentWeatherData?.current
    ? getWeatherCondition(currentWeatherData.current.conditionCode, currentWeatherData.current.isDay).description
    : 'Sunny';

  // 1. Fetch RainViewer Radar Time Frame URL
  useEffect(() => {
    const fetchRadarPath = async () => {
      try {
        const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
        const data = await res.json();
        if (data && data.radar && data.radar.nowcast && data.radar.nowcast.length > 0) {
          // Get the latest nowcast radar frame
          const latest = data.radar.nowcast[data.radar.nowcast.length - 1];
          setRadarTileUrl(`https://tilecache.rainviewer.com${latest.path}/256/{z}/{x}/{y}/2/1_1.png`);
        }
      } catch (e) {
        console.error("Failed to fetch RainViewer radar paths", e);
      }
    };
    fetchRadarPath();
  }, []);

  // 2. Fetch Open-Meteo Surrounding Grid Weather Overlay (9 coordinate offsets in a box)
  useEffect(() => {
    if (!activeLocation) return;
    
    const fetchGridData = async () => {
      setOverlayLoading(true);
      setOverlayError(false);
      try {
        const offsets = [-0.6, 0, 0.6]; // ~60km box spacing
        const queryLats: number[] = [];
        const queryLons: number[] = [];
        
        offsets.forEach(latOff => {
          offsets.forEach(lonOff => {
            queryLats.push(Number((activeLocation.lat + latOff).toFixed(4)));
            queryLons.push(Number((activeLocation.lon + lonOff).toFixed(4)));
          });
        });

        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${queryLats.join(',')}&longitude=${queryLons.join(',')}&current=temperature_2m,wind_speed_10m,wind_direction_10m,precipitation&timezone=auto`
        );
        
        const data = await response.json();
        const results = Array.isArray(data) ? data : [data];
        
        const parsedPoints = results.map((item, idx) => ({
          lat: queryLats[idx],
          lon: queryLons[idx],
          temp: item.current.temperature_2m,
          windSpeed: item.current.wind_speed_10m,
          windDir: item.current.wind_direction_10m,
          precipitation: item.current.precipitation
        }));
        
        setGridData(parsedPoints);
      } catch (err) {
        console.error("Failed to fetch map grid data", err);
        setOverlayError(true);
      } finally {
        setOverlayLoading(false);
      }
    };

    fetchGridData();
  }, [activeLocation]);

  // Handle dark mode tile switching
  const isDark = document.documentElement.classList.contains('dark');
  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

  // Custom styled Leaflet HTML marker
  const customLocationMarker = L.divIcon({
    html: `
      <div class="relative flex flex-col items-center select-none">
        <div class="w-8 h-8 rounded-full bg-accent-custom/25 border-2 border-accent-custom flex items-center justify-center shadow-md">
          <div class="w-3 h-3 rounded-full bg-accent-custom animate-ping absolute"></div>
          <div class="w-3.5 h-3.5 rounded-full bg-accent-custom z-10 border border-white"></div>
        </div>
      </div>
    `,
    className: 'custom-weather-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  // Custom text marker icons for showing grid values directly on the map
  const getGridTextIcon = (val: string, colorClass: string) => L.divIcon({
    html: `<div class="px-2 py-0.5 rounded-full border border-border-custom font-extrabold text-[9px] text-text-primary shadow-sm ${colorClass}">${val}</div>`,
    className: 'grid-value-marker',
    iconSize: [40, 18],
    iconAnchor: [20, 9]
  });

  const getWindArrowIcon = (speed: number, dir: number) => L.divIcon({
    html: `
      <div class="flex flex-col items-center select-none">
        <div class="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-sm" style="transform: rotate(${dir}deg); transition: transform 0.5s;">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-500">
            <line x1="12" y1="19" x2="12" y2="5"></line>
            <polyline points="5 12 12 5 19 12"></polyline>
          </svg>
        </div>
        <span class="text-[8px] font-bold text-text-muted mt-0.5 bg-surface-strong px-1 rounded-sm border border-border-custom/50">${speed} ${units === 'imperial' ? 'mph' : 'km/h'}</span>
      </div>
    `,
    className: 'grid-wind-marker',
    iconSize: [32, 40],
    iconAnchor: [16, 20]
  });

  // Manual zoom control handlers
  const handleZoomIn = () => mapInstance?.zoomIn();
  const handleZoomOut = () => mapInstance?.zoomOut();
  const handleCenter = () => mapInstance?.setView([lat, lon], 9);

  return (
    <div className="glass-card p-5 sm:p-6 flex flex-col transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xs font-bold text-text-muted uppercase tracking-wider">
            Interactive Weather Map
          </h2>
          {overlayLoading && (
            <span className="text-[10px] text-accent-custom font-semibold flex items-center gap-1 mt-0.5">
              <Loader2 size={10} className="animate-spin" />
              Loading weather overlays...
            </span>
          )}
        </div>
        
        {/* Layer tabs */}
        <div className="flex items-center bg-map-bg border border-border-custom p-0.5 rounded-xl shrink-0">
          <button
            onClick={() => setActiveLayer('temp')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border border-transparent ${
              activeLayer === 'temp' 
                ? 'bg-map-active-bg border-border-custom text-map-active-text font-bold shadow-sm' 
                : 'text-map-text hover:text-map-active-text'
            }`}
          >
            <Thermometer size={12} className={activeLayer === 'temp' ? 'text-accent-custom' : ''} />
            <span>Temperature</span>
          </button>
          
          <button
            onClick={() => setActiveLayer('radar')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border border-transparent ${
              activeLayer === 'radar' 
                ? 'bg-map-active-bg border-border-custom text-map-active-text font-bold shadow-sm' 
                : 'text-map-text hover:text-map-active-text'
            }`}
          >
            <CloudRain size={12} className={activeLayer === 'radar' ? 'text-accent-custom' : ''} />
            <span>Radar / Rain</span>
          </button>
          
          <button
            onClick={() => setActiveLayer('wind')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border border-transparent ${
              activeLayer === 'wind' 
                ? 'bg-map-active-bg border-border-custom text-map-active-text font-bold shadow-sm' 
                : 'text-map-text hover:text-map-active-text'
            }`}
          >
            <Wind size={12} className={activeLayer === 'wind' ? 'text-accent-custom' : ''} />
            <span>Wind Speed</span>
          </button>
        </div>
      </div>

      {/* Map Box */}
      <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden border border-border-custom shadow-inner">
        
        {/* Leaflet MapContainer */}
        <MapContainer
          center={[lat, lon]}
          zoom={9}
          zoomControl={false}
          className="w-full h-full z-10"
        >
          {/* Base Map Tiles */}
          <TileLayer
            url={tileUrl}
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />

          {/* Map Recenter Subcomponent */}
          <RecenterMap lat={lat} lon={lon} />
          
          {/* Map Instance tracker */}
          <MapInstanceTracker setMap={setMapInstance} />

          {/* LAYER 1: Temperature Grid Circles and Labels */}
          {activeLayer === 'temp' && !overlayError && gridData.map((pt, idx) => (
            <React.Fragment key={`temp-pt-${idx}`}>
              <Circle
                center={[pt.lat, pt.lon]}
                radius={32000}
                pathOptions={{
                  fillColor: getTempColor(pt.temp),
                  fillOpacity: 0.25,
                  stroke: true,
                  color: getTempColor(pt.temp),
                  weight: 1,
                  opacity: 0.4
                }}
              />
              <Marker
                position={[pt.lat, pt.lon]}
                icon={getGridTextIcon(`${Math.round(units === 'imperial' ? cToF(pt.temp) : pt.temp)}°`, 'bg-surface-strong')}
              />
            </React.Fragment>
          ))}

          {/* LAYER 2: RainViewer Radar Overlays & Open-Meteo Precipitation Annotations */}
          {activeLayer === 'radar' && (
            <>
              {radarTileUrl && (
                <TileLayer
                  url={radarTileUrl}
                  opacity={0.65}
                  zIndex={10}
                />
              )}
              {/* Optional forecast rain annotations */}
              {!overlayError && gridData.map((pt, idx) => (
                pt.precipitation > 0 && (
                  <Marker
                    key={`precip-pt-${idx}`}
                    position={[pt.lat, pt.lon]}
                    icon={getGridTextIcon(`${pt.precipitation} mm`, 'bg-blue-500/10 text-blue-500 border-blue-500/20')}
                  />
                )
              ))}
            </>
          )}

          {/* LAYER 3: Wind Direction Vectors */}
          {activeLayer === 'wind' && !overlayError && gridData.map((pt, idx) => (
            <Marker
              key={`wind-pt-${idx}`}
              position={[pt.lat, pt.lon]}
              icon={getWindArrowIcon(pt.windSpeed, pt.windDir)}
            />
          ))}

          {/* Primary Current Location marker */}
          <Marker position={[lat, lon]} icon={customLocationMarker}>
            <Popup>
              <div className="p-1 text-left min-w-[120px]">
                <h4 className="font-extrabold text-xs text-text-primary">{locationName}</h4>
                <p className="font-semibold text-[10px] text-accent-custom mt-0.5">
                  {Math.round(units === 'imperial' ? cToF(currentTemp) : currentTemp)}° • {currentCondition}
                </p>
              </div>
            </Popup>
          </Marker>
        </MapContainer>

        {/* Absolute Custom Controls Overlay */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
          <button 
            onClick={handleZoomIn}
            className="w-8 h-8 rounded-full bg-map-bg border border-border-custom hover:bg-map-active-bg flex items-center justify-center text-map-text hover:text-map-active-text transition-all shadow-md cursor-pointer"
            title="Zoom In"
          >
            <Plus size={16} />
          </button>
          
          <button 
            onClick={handleZoomOut}
            className="w-8 h-8 rounded-full bg-map-bg border border-border-custom hover:bg-map-active-bg flex items-center justify-center text-map-text hover:text-map-active-text transition-all shadow-md cursor-pointer"
            title="Zoom Out"
          >
            <Minus size={16} />
          </button>

          <button 
            onClick={handleCenter}
            className="w-8 h-8 rounded-full bg-map-bg border border-border-custom hover:bg-map-active-bg flex items-center justify-center text-map-text hover:text-map-active-text transition-all shadow-md cursor-pointer"
            title="Center on Location"
          >
            <Crosshair size={14} />
          </button>
        </div>

        {/* Dynamic Legend Overlays (Bottom Right) */}
        <div className="absolute bottom-3 right-3 bg-map-bg border border-border-custom px-3 py-2 rounded-2xl shadow-md z-20 select-none animate-in fade-in duration-200">
          {activeLayer === 'temp' && (
            <div className="flex flex-col text-left">
              <span className="text-[8px] font-bold text-text-muted uppercase tracking-wider mb-1">Temperature</span>
              <div className="flex items-center gap-1 text-[9px] font-bold text-text-primary">
                <span className="text-blue-500">&lt;15°</span>
                <div className="w-16 h-1.5 rounded bg-gradient-to-r from-blue-500 via-yellow-400 to-red-500"></div>
                <span className="text-red-500">34°+</span>
              </div>
            </div>
          )}

          {activeLayer === 'radar' && (
            <div className="flex flex-col text-left">
              <span className="text-[8px] font-bold text-text-muted uppercase tracking-wider mb-1">Precipitation Radar</span>
              <div className="flex items-center gap-1 text-[9px] font-bold text-text-primary">
                <span className="text-blue-300">0.1 mm</span>
                <div className="w-16 h-1.5 rounded bg-gradient-to-r from-blue-300 via-blue-500 to-blue-800"></div>
                <span className="text-blue-800">7.0+ mm</span>
              </div>
            </div>
          )}

          {activeLayer === 'wind' && (
            <div className="flex flex-col text-left">
              <span className="text-[8px] font-bold text-text-muted uppercase tracking-wider mb-1">Wind Vectors</span>
              <div className="flex items-center gap-1 text-[9px] font-bold text-text-primary">
                <span className="text-emerald-400">Calm</span>
                <div className="w-16 h-1.5 rounded bg-gradient-to-r from-emerald-400 via-teal-500 to-teal-800"></div>
                <span className="text-teal-800">Brisk</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default WeatherMap;
