'use client';

import { cn } from '@/lib/utils';

export interface MatchScoreBreakdownProps {
  breakdown: {
    categoryFit: number;
    priceFit: number;
    seasonFit: number;
    audienceFit: number;
  };
  className?: string;
}

const breakdownLabels = {
  categoryFit: '카테고리 적합도',
  priceFit: '가격대 적합도',
  seasonFit: '시즌 적합도',
  audienceFit: '타겟 고객 적합도',
};

export function MatchScoreBreakdown({ breakdown, className }: MatchScoreBreakdownProps) {
  const getColor = (score: number) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const items = Object.entries(breakdown).map(([key, score]) => ({
    key,
    label: breakdownLabels[key as keyof typeof breakdownLabels],
    score,
  }));

  return (
    <div className={cn('space-y-3', className)}>
      {items.map(({ key, label, score }) => (
        <div key={key}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-700">{label}</span>
            <span className="text-sm font-semibold text-gray-900">{score}%</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-500 ease-out',
                getColor(score)
              )}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
