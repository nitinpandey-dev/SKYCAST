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

  useEffect(() => {
    const calcSunPosition = () => {
      try {
        const now = new Date();
        const rise = new Date(sunrise);
        const set = new Date(sunset);

        if (now >= rise && now <= set) {
          setIsDaylight(true);
          // Progress ratio between 0 and 1
          const totalDuration = set.getTime() - rise.getTime();
          const currentProgress = now.getTime() - rise.getTime();
          const t = currentProgress / totalDuration;

          // Bezier coordinates P0=(10, 35), P1=(50, 5) control, P2=(90, 35)
          // B(t) = (1-t)^2 * P0 + 2(1-t)t * P1 + t^2 * P2
          const x0 = 10, y0 = 35;
          const x1 = 50, y1 = 5;
          const x2 = 90, y2 = 35;

          const x = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * x1 + t * t * x2;
          const y = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * y1 + t * t * y2;

          setSunPos({ x, y });
        } else {
          setIsDaylight(false);
          // Night time: Place sun resting at end
          setSunPos({ x: now < rise ? 10 : 90, y: 35 });
        }
      } catch (e) {
        console.error("Failed to parse sunrise/sunset times", e);
      }
    };

    calcSunPosition();
    const interval = setInterval(calcSunPosition, 60000); // Recalculate position every minute
    return () => clearInterval(interval);
  }, [sunrise, sunset]);

  return (
    <div className="glass-card p-6 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sun Position</h2>
      </div>

      {/* Sun curve visualization */}
      <div className="relative w-full h-16 flex items-center justify-center mb-6">
        <svg viewBox="0 0 100 40" className="w-full max-w-[280px] h-full overflow-visible">
          {/* Baseline horizon */}
          <line x1="5" y1="35" x2="95" y2="35" stroke="currentColor" strokeWidth="0.5" className="text-gray-200 dark:text-gray-800" />
          
          {/* Sun path curve */}
          <path 
            d="M 10 35 Q 50 5 90 35" 
            fill="none" 
            stroke="currentColor" 
            strokeDasharray="2,3" 
            strokeWidth="0.8"
            className="text-gray-300 dark:text-gray-700" 
          />
          
          {/* Highlight path traveled */}
          {isDaylight && (
            <path 
              d="M 10 35 Q 50 5 90 35" 
              fill="none" 
              stroke="url(#sunPathGrad)" 
              strokeWidth="1.2"
              strokeDasharray="100"
              // Approximating progress stroke-dashoffset
              style={{
                strokeDashoffset: 100 - (sunPos.x - 10) * 1.25
              }}
            />
          )}

          {/* Gradients */}
          <defs>
            <linearGradient id="sunPathGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#amber-400" />
            </linearGradient>
            <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="1" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Sun indicator */}
          <circle 
            cx={sunPos.x} 
            cy={sunPos.y} 
            r="3.5" 
            fill="#f59e0b" 
            stroke="#ffffff"
            strokeWidth="1"
            className={`${isDaylight ? 'animate-pulse' : 'opacity-40 text-gray-400'}`} 
            style={{ filter: isDaylight ? 'drop-shadow(0px 0px 3px rgba(245, 158, 11, 0.6))' : 'none' }}
          />
        </svg>
      </div>

      {/* Rise / Set labels */}
      <div className="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1.5">
          <Sunrise size={14} className="text-orange-400 shrink-0" />
          <div>
            <div className="text-[8px] font-bold text-gray-400 uppercase leading-none mb-0.5">Sunrise</div>
            <div className="text-gray-700 dark:text-gray-200 font-bold">{formatTime(sunrise)}</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Sunset size={14} className="text-red-400 shrink-0" />
          <div>
            <div className="text-[8px] font-bold text-gray-400 uppercase leading-none mb-0.5">Sunset</div>
            <div className="text-gray-700 dark:text-gray-200 font-bold">{formatTime(sunset)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
