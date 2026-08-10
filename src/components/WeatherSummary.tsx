import React from 'react';
import { Info } from 'lucide-react';

interface WeatherSummaryProps {
  text: string;
}

export function WeatherSummary({ text }: WeatherSummaryProps) {
  if (!text) return null;

  return (
    <div className="glass-card p-[18px] md:p-[22px] flex gap-3 items-start w-full select-none">
      <Info size={16} className="text-accent-custom shrink-0 mt-0.5" />
      <p className="text-xs text-text-secondary dark:text-[#D9E2EF] leading-relaxed font-semibold">
        {text}
      </p>
    </div>
  );
}
export default WeatherSummary;
