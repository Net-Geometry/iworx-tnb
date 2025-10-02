import { 
  Map, 
  Building2, 
  Zap, 
  Activity, 
  MapPin, 
  HelpCircle,
  LucideIcon
} from 'lucide-react';

// Map of icon names to Lucide React components
const iconMap: Record<string, LucideIcon> = {
  'map': Map,
  'building2': Building2,
  'zap': Zap,
  'activity': Activity,
  'map-pin': MapPin,
  'mappin': MapPin,
};

/**
 * Resolves an icon name string to a Lucide React icon component
 * @param iconName - The name of the icon (e.g., "map", "building2")
 * @returns The corresponding Lucide icon component or HelpCircle as fallback
 */
export function resolveIcon(iconName: string | undefined | null): LucideIcon {
  if (!iconName) return HelpCircle;
  
  const normalizedName = iconName.toLowerCase().trim();
  return iconMap[normalizedName] || HelpCircle;
}
