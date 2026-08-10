import React from 'react';
import { CloudSun, Map, List } from 'lucide-react';

export type MobileTab = 'weather' | 'map' | 'locations';

interface MobileBottomNavProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
}

export function MobileBottomNav({ activeTab, onTabChange }: MobileBottomNavProps) {
  const tabs = [
    { id: 'weather' as MobileTab, label: 'Weather', icon: CloudSun },
    { id: 'map' as MobileTab, label: 'Map', icon: Map },
    { id: 'locations' as MobileTab, label: 'Locations', icon: List }
  ];

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-[360px] bg-bottom-nav-bg backdrop-blur-xl border border-border-custom rounded-full px-6 py-2.5 flex items-center justify-between shadow-lg shadow-black/5 dark:shadow-none z-50 md:hidden animate-in slide-in-from-bottom-6 duration-300 select-none">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
              isActive 
                ? 'text-accent-custom scale-105' 
                : 'text-text-muted hover:text-text-secondary'
            }`}
            aria-label={`Switch to ${tab.label} tab`}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon size={18} className="shrink-0" />
            <span className="text-[9px] font-bold tracking-wider uppercase">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
