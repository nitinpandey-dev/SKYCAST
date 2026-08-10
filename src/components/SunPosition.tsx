import React, { useMemo } from 'react';
import { formatTime } from '../utils/weatherUtils';
import { Sunrise, Sunset } from 'lucide-react';

interface SunPositionProps {
  sunrise: string;
  sunset: string;
}

export function SunPosition({ sunrise, sunset }: SunPositionProps) {
  const daylightDuration = useMemo(() => {
    try {
      const rise = new Date(sunrise);
      const set = new Date(sunset);
      const diffMs = set.getTime() - rise.getTime();
      if (diffMs <= 0) return null;
      
      const hours = Math.floor(diffMs / 3600000);
      const minutes = Math.floor((diffMs % 3600000) / 60000);
      return `${hours}h ${minutes}m`;
    } catch (e) {
      return null;
    }
  }, [sunrise, sunset]);

  // Calculate current sun position percentage along the arc
  const sunPositionPercent = useMemo(() => {
    try {
      const now = new Date();
      const rise = new Date(sunrise);
      const set = new Date(sunset);
      
      if (now < rise) return 0;
      if (now > set) return 100;
      
      const total = set.getTime() - rise.getTime();
      const current = now.getTime() - rise.getTime();
      return (current / total) * 100;
    } catch (e) {
      return 50;
    }
  }, [sunrise, sunset]);

  // Translate percentage to SVG coordinates along a semi-circle arc (rx=45, ry=25)
  const sunCoords = useMemo(() => {
    const angleRad = Math.PI - (sunPositionPercent / 100) * Math.PI;
    const x = 50 + 40 * Math.cos(angleRad);
    const y = 35 - 20 * Math.sin(angleRad);
    return { x, y };
  }, [sunPositionPercent]);

  return (
    <div className="glass-card p-4 sm:p-5 transition-all duration-300 w-full select-none">
      <div className="flex items-center justify-between mb-3 border-b border-border-custom/25 pb-2">
        <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider">Sun Position</h2>
        {daylightDuration && (
          <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
            Daylight: {daylightDuration}
          </span>
        )}
      </div>

      {/* Arc visualization wrapper */}
      <div className="relative w-full h-14 flex items-center justify-center mb-2">
        <svg viewBox="0 0 100 40" className="w-full max-w-[240px] h-full overflow-visible">
          {/* Horizon line */}
          <line x1="5" y1="35" x2="95" y2="35" stroke="var(--border)" strokeWidth="0.8" />
          
          {/* Dotted sun arc path */}
          <path 
            d="M 10 35 A 40 20 0 0 1 90 35" 
            fill="none" 
            stroke="var(--border)" 
            strokeDasharray="2 2" 
            strokeWidth="0.8" 
          />
          
          {/* Colored progress arc */}
          <path 
            d={`M 10 35 A 40 20 0 0 1 ${sunCoords.x} ${sunCoords.y}`} 
            fill="none" 
            stroke="var(--accent)" 
            strokeWidth="1" 
          />
          
          {/* Animated sun dot */}
          <circle cx={sunCoords.x} cy={sunCoords.y} r="2.5" fill="#FBBF24" />
          <circle cx={sunCoords.x} cy={sunCoords.y} r="4" fill="none" stroke="#FBBF24" strokeWidth="0.5" className="animate-pulse" />
        </svg>
      </div>

      {/* Sunrise & Sunset times */}
      <div className="flex items-center justify-between mt-2.5 text-[10px] text-text-secondary font-semibold">
        <div className="flex items-center gap-1.5">
          <Sunrise size={12} className="text-amber-400" />
          <div className="text-left">
            <span className="text-[8px] text-text-muted uppercase block leading-none">Sunrise</span>
            <strong className="text-text-primary">{formatTime(sunrise)}</strong>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Sunset size={12} className="text-orange-400" />
          <div className="text-left text-right">
            <span className="text-[8px] text-text-muted uppercase block leading-none">Sunset</span>
            <strong className="text-text-primary">{formatTime(sunset)}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
export default SunPosition;
