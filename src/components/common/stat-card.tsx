import * as React from 'react';
import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  className?: string;
}

export function StatCard({ label, value, icon: Icon, trend, className }: StatCardProps) {
  const TrendIcon = trend?.direction === 'up' ? TrendingUp : TrendingDown;
  const trendColor = trend?.direction === 'up' ? 'text-green-600' : 'text-red-600';

  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{label}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
            {trend && (
              <div className={cn('mt-2 flex items-center text-sm font-medium', trendColor)}>
                <TrendIcon className="mr-1 h-4 w-4" />
                <span>{Math.abs(trend.value)}%</span>
              </div>
            )}
          </div>
          {Icon && (
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zvzo-50">
              <Icon className="h-6 w-6 text-zvzo-500" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
