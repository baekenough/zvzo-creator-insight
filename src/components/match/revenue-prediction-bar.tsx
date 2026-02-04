'use client';

import type { RevenuePrediction } from '@/types';
import { formatCurrency } from '@/lib/utils';

export interface RevenuePredictionBarProps {
  prediction: RevenuePrediction;
  className?: string;
}

export function RevenuePredictionBar({ prediction, className = '' }: RevenuePredictionBarProps) {
  const { minimum, expected, maximum } = prediction;
  const total = maximum - minimum;
  const minToExpectedPercent = ((expected - minimum) / total) * 100;
  const expectedToMaxPercent = ((maximum - expected) / total) * 100;

  return (
    <div className={className}>
      {/* Visual range bar */}
      <div className="relative mb-4">
        <div className="flex items-center h-8 bg-gray-100 rounded-lg overflow-hidden">
          {/* Minimum to Expected */}
          <div
            className="h-full bg-gradient-to-r from-blue-200 to-blue-400 transition-all"
            style={{ width: `${minToExpectedPercent}%` }}
          />
          {/* Expected marker */}
          <div className="h-full w-0.5 bg-blue-600 z-10" />
          {/* Expected to Maximum */}
          <div
            className="h-full bg-gradient-to-r from-green-300 to-green-500 transition-all"
            style={{ width: `${expectedToMaxPercent}%` }}
          />
        </div>

        {/* Value labels */}
        <div className="flex justify-between mt-2 text-xs">
          <div className="text-left">
            <p className="text-gray-500">최소</p>
            <p className="font-semibold text-gray-800">{formatCurrency(minimum)}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500">예상</p>
            <p className="font-semibold text-blue-600">{formatCurrency(expected)}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-500">최대</p>
            <p className="font-semibold text-gray-800">{formatCurrency(maximum)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
