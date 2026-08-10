import React from 'react';
import * as LucideIcons from 'lucide-react';
import { LucideProps } from 'lucide-react';

export const WeatherIcon = ({ name, ...props }: { name: string } & LucideProps) => {
  // @ts-ignore
  const Icon = LucideIcons[name] || LucideIcons.Cloud;
  return <Icon {...props} />;
};
