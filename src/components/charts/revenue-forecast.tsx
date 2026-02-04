'use client';

import type { RevenuePrediction } from '@/types';
import { formatCurrency } from '@/lib/utils';

export interface RevenueForecastProps {
  prediction: RevenuePrediction;
  height?: number;
  title?: string;
  loading?: boolean;
  className?: string;
}

export function RevenueForecast({
  prediction,
  height = 300,
  title,
  loading = false,
  className = '',
}: RevenueForecastProps) {
  if (loading) {
    return (
      <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`} style={{ height }} />
    );
  }

  if (!prediction) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-50 rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="text-center">
          <p className="text-gray-600 font-medium">데이터 없음</p>
          <p className="text-gray-400 text-sm mt-2">매출 예측 데이터가 없습니다</p>
        </div>
      </div>
    );
  }

  const { minimum, expected, maximum } = prediction;
  const total = maximum - minimum;
  const minToExpectedPercent = ((expected - minimum) / total) * 100;
  const expectedToMaxPercent = ((maximum - expected) / total) * 100;

  return (
    <div
      className={`${className} p-6`}
      role="img"
      aria-label="예상 매출 범위 차트"
      aria-describedby="forecast-description"
    >
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}

      <div className="space-y-6">
        {/* Visual range bar */}
        <div className="relative">
          <div className="flex items-center h-12 bg-gray-100 rounded-lg overflow-hidden">
            {/* Minimum to Expected */}
            <div
              className="h-full bg-gradient-to-r from-blue-200 to-blue-400 transition-all"
              style={{ width: `${minToExpectedPercent}%` }}
            />
            {/* Expected marker */}
            <div className="h-full w-1 bg-blue-600 z-10" />
            {/* Expected to Maximum */}
            <div
              className="h-full bg-gradient-to-r from-green-300 to-green-500 transition-all"
              style={{ width: `${expectedToMaxPercent}%` }}
            />
          </div>

          {/* Value labels */}
          <div className="flex justify-between mt-3 text-sm">
            <div className="text-left">
              <p className="text-gray-500">최소</p>
              <p className="font-semibold text-gray-800">{formatCurrency(minimum)}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-500">예상</p>
              <p className="font-semibold text-blue-600 text-lg">{formatCurrency(expected)}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-500">최대</p>
              <p className="font-semibold text-gray-800">{formatCurrency(maximum)}</p>
            </div>
          </div>
        </div>

        {/* Additional details */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <p className="text-sm text-gray-500">예상 판매 수량</p>
            <p className="text-lg font-semibold">{prediction.predictedQuantity}개</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">예상 수수료</p>
            <p className="text-lg font-semibold">{formatCurrency(prediction.predictedCommission)}</p>
          </div>
        </div>

        {prediction.basis && (
          <div className="pt-4 border-t">
            <p className="text-sm text-gray-500 mb-1">예측 근거</p>
            <p className="text-sm text-gray-700">{prediction.basis}</p>
          </div>
        )}
      </div>

      <p id="forecast-description" className="sr-only">
        최소 {formatCurrency(minimum)}, 예상 {formatCurrency(expected)}, 최대{' '}
        {formatCurrency(maximum)}
      </p>
    </div>
  );
}
