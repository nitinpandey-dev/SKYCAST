import React from 'react';
import { Navigation } from 'lucide-react';

interface LocationButtonProps {
  onClick: () => void;
  loading?: boolean;
}

export function LocationButton({ onClick, loading }: LocationButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2.5 rounded-full font-medium text-sm transition-colors text-primary bg-primary/10 hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label="Use my location"
    >
      <Navigation className={`w-4 h-4 ${loading ? 'animate-pulse' : ''}`} />
      <span className="hidden sm:inline">Use my location</span>
    </button>
  );
}
