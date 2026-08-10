import React, { useEffect, useState } from 'react';
import { Sunrise, Sunset } from 'lucide-react';
import { formatTime } from '../utils/weatherUtils';

interface SunriseSunsetProps {
  sunrise: string;
  sunset: string;
}

export function SunriseSunset({ sunrise, sunset }: SunriseSunsetProps) {
  const [sunPos, setSunPos] = useState({ x: 10, y: 35 });
  const [isDaylight, setIsDaylight] = useState(false);
  const [daylightDuration, setDaylightDuration] = useState('');

  useEffect(() => {
    const calcSunPosition = () => {
      try {
        const now = new Date();
        const rise = new Date(sunrise);
        const set = new Date(sunset);

        // Calculate Daylight Duration
        const diffMs = set.getTime() - rise.getTime();
        const diffHours = Math.floor(diffMs / 3600000);
        const diffMins = Math.round((diffMs % 3600000) / 60000);
        setDaylightDuration(`${diffHours}h ${diffMins}m`);

        if (now >= rise && now <= set) {
          setIsDaylight(true);
          const totalDuration = set.getTime() - rise.getTime();
          const currentProgress = now.getTime() - rise.getTime();
          const t = currentProgress / totalDuration;

          const x0 = 10, y0 = 35;
          const x1 = 50, y1 = 5;
          const x2 = 90, y2 = 35;

          const x = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * x1 + t * t * x2;
          const y = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * y1 + t * t * y2;

          setSunPos({ x, y });
        } else {
          setIsDaylight(false);
          setSunPos({ x: now < rise ? 10 : 90, y: 35 });
        }
      } catch (e) {
        console.error("Failed to parse sunrise/sunset times", e);
      }
    };

    calcSunPosition();
    const interval = setInterval(calcSunPosition, 60000);
    return () => clearInterval(interval);
  }, [sunrise, sunset]);

  return (
    <div className="glass-card p-6 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-bold text-text-muted uppercase tracking-wider">Sun Position</h2>
        {daylightDuration && (
          <span className="text-[10px] text-text-muted font-bold">
            Daylight: {daylightDuration}
          </span>
        )}
      </div>

      {/* Sun curve visualization */}
      <div className="relative w-full h-16 flex items-center justify-center mb-6">
        <svg viewBox="0 0 100 40" className="w-full max-w-[280px] h-full overflow-visible">
          {/* Baseline horizon */}
          <line x1="5" y1="35" x2="95" y2="35" stroke="var(--border-custom)" strokeWidth="0.8" />
          
          {/* Sun path curve */}
          <path 
            d="M 10 35 Q 50 5 90 35" 
            fill="none" 
            stroke="var(--text-muted)" 
            strokeDasharray="2,3" 
            strokeWidth="0.8"
            opacity="0.3"
          />
          
          {/* Highlight path traveled */}
          {isDaylight && (
            <path 
              d="M 10 35 Q 50 5 90 35" 
              fill="none" 
              stroke="#F59E0B" 
              strokeWidth="1.2"
              strokeDasharray="100"
              style={{
                strokeDashoffset: 100 - (sunPos.x - 10) * 1.25
              }}
            />
          )}

          {/* Sun indicator */}
          <circle 
            cx={sunPos.x} 
            cy={sunPos.y} 
            r="3.5" 
            fill="#FBBF24" 
            stroke="var(--surface-strong)"
            strokeWidth="1"
            className={`${isDaylight ? 'animate-pulse' : 'opacity-40'}`} 
            style={{ filter: isDaylight ? 'drop-shadow(0px 0px 3px rgba(245, 158, 11, 0.6))' : 'none' }}
          />
        </svg>
      </div>

      {/* Rise / Set labels */}
      <div className="flex items-center justify-between text-xs font-semibold text-text-secondary">
        <div className="flex items-center gap-1.5">
          <Sunrise size={14} className="text-orange-400 shrink-0" />
          <div>
            <div className="text-[8px] font-bold text-text-muted uppercase leading-none mb-0.5">Sunrise</div>
            <div className="text-text-primary font-bold">{formatTime(sunrise)}</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Sunset size={14} className="text-red-400 shrink-0" />
          <div>
            <div className="text-[8px] font-bold text-text-muted uppercase leading-none mb-0.5">Sunset</div>
            <div className="text-text-primary font-bold">{formatTime(sunset)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
