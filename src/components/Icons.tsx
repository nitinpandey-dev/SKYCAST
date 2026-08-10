import React from 'react';
import * as LucideIcons from 'lucide-react';
import { LucideProps } from 'lucide-react';

interface WeatherIconProps extends LucideProps {
  name: string;
  animate?: boolean;
}

export const WeatherIcon = ({ name, animate = true, className = '', ...props }: WeatherIconProps) => {
  // @ts-ignore
  const Icon = LucideIcons[name] || LucideIcons.Cloud;
  
  // Dynamic CSS classes for animations based on the icon name
  let animationClass = '';
  if (animate) {
    switch (name) {
      case 'Sun':
        animationClass = 'animate-[spin_40s_linear_infinite] hover:scale-110 transition-transform duration-500';
        break;
      case 'Moon':
        animationClass = 'animate-[pulse_5s_ease-in-out_infinite] hover:scale-110 transition-transform duration-500';
        break;
      case 'CloudSun':
      case 'CloudMoon':
        animationClass = 'animate-[pulse_4s_ease-in-out_infinite]';
        break;
      case 'Cloud':
      case 'CloudFog':
        animationClass = 'animate-[pulse_6s_ease-in-out_infinite]';
        break;
      case 'CloudRain':
      case 'CloudDrizzle':
        animationClass = 'animate-[bounce_3s_infinite_margin]';
        break;
      case 'CloudLightning':
        animationClass = 'animate-[pulse_1s_ease-in-out_infinite]';
        break;
      case 'Snowflake':
        animationClass = 'animate-[spin_30s_linear_infinite]';
        break;
      default:
        animationClass = '';
    }
  }

  return <Icon className={`${animationClass} ${className}`} {...props} />;
};
