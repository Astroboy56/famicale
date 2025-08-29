'use client';

import { Sun, Moon, Cloud, CloudRain, Zap, Snowflake, CloudFog, Loader2 } from 'lucide-react';
import { getWeatherIcon } from '@/lib/weatherService';

interface WeatherIconProps {
  iconCode: string;
  size?: number;
  className?: string;
  isLoading?: boolean;
}

const iconComponents: { [key: string]: React.ComponentType<{ size?: number; className?: string }> } = {
  Sun,
  Moon,
  Cloud,
  CloudRain,
  Zap,
  Snowflake,
  CloudFog,
};

export default function WeatherIcon({ 
  iconCode, 
  size = 16, 
  className = '',
  isLoading = false 
}: WeatherIconProps) {
  if (isLoading) {
    return (
      <Loader2 
        size={size} 
        className={`animate-spin text-white text-opacity-70 ${className}`} 
      />
    );
  }

  const iconName = getWeatherIcon(iconCode);
  const IconComponent = iconComponents[iconName] || Cloud;

  return (
    <IconComponent 
      size={size} 
      className={`text-white text-opacity-70 ${className}`} 
    />
  );
}
