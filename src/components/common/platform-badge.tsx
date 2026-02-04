import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type Platform = 'instagram' | 'youtube' | 'tiktok';

export interface PlatformBadgeProps {
  platform: Platform;
  className?: string;
}

const platformConfig: Record<Platform, { label: string; className: string }> = {
  instagram: {
    label: 'Instagram',
    className: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-transparent',
  },
  youtube: {
    label: 'YouTube',
    className: 'bg-red-600 text-white border-transparent',
  },
  tiktok: {
    label: 'TikTok',
    className: 'bg-black text-white border-transparent',
  },
};

export function PlatformBadge({ platform, className }: PlatformBadgeProps) {
  const config = platformConfig[platform];

  return (
    <Badge className={cn(config.className, className)} variant="default">
      {config.label}
    </Badge>
  );
}
