import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface ConfidenceBadgeProps {
  confidence: number;
  className?: string;
}

export function ConfidenceBadge({ confidence, className }: ConfidenceBadgeProps) {
  const getVariantAndLabel = () => {
    if (confidence >= 70) {
      return {
        className: 'bg-green-100 text-green-800 border-green-300',
        label: 'High',
      };
    } else if (confidence >= 40) {
      return {
        className: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        label: 'Medium',
      };
    } else {
      return {
        className: 'bg-red-100 text-red-800 border-red-300',
        label: 'Low',
      };
    }
  };

  const { className: variantClass, label } = getVariantAndLabel();

  return (
    <Badge className={cn(variantClass, className)} variant="outline">
      {label} ({confidence}%)
    </Badge>
  );
}
