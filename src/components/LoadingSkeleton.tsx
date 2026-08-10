import React from 'react';

export function LoadingSkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 animate-pulse">
      {/* Current Weather Skeleton */}
      <div className="h-64 md:h-80 bg-black/10 dark:bg-white/10 rounded-3xl mb-6"></div>
      
      {/* Favorites Skeleton */}
      <div className="h-40 bg-black/5 dark:bg-white/5 rounded-3xl mb-6 hidden md:block"></div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Hourly Forecast Skeleton */}
          <div className="h-64 bg-black/10 dark:bg-white/10 rounded-3xl"></div>
          
          {/* Details Skeleton */}
          <div className="h-80 bg-black/10 dark:bg-white/10 rounded-3xl"></div>
        </div>
        
        <div className="space-y-6">
          {/* Daily Forecast Skeleton */}
          <div className="h-96 bg-black/10 dark:bg-white/10 rounded-3xl"></div>
          
          {/* Map Skeleton */}
          <div className="h-64 bg-black/10 dark:bg-white/10 rounded-3xl"></div>
        </div>
      </div>
    </div>
  );
}
