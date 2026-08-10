import React from 'react';
import { Info } from 'lucide-react';

interface WeatherSummaryProps {
  text: string;
}

export function WeatherSummary({ text }: WeatherSummaryProps) {
  if (!text) return null;

  return (
    <div className="glass-card weather-summary-card p-[18px] md:p-[22px] flex gap-3 items-start w-full select-none">
      <Info size={16} className="text-accent-custom shrink-0 mt-0.5" />
      <p className="text-sm text-[#334155] dark:text-text-primary leading-relaxed font-normal">
        {text}
      </p>
    </div>
  );
}
export default WeatherSummary;
