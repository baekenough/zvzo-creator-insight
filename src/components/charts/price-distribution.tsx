'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useState } from 'react';
import type { PriceBucket } from '@/types';
import { formatNumber, formatCurrency } from '@/lib/utils';

export interface PriceDistributionProps {
  data: PriceBucket[];
  height?: number;
  title?: string;
  onBarClick?: (bucket: PriceBucket) => void;
  loading?: boolean;
  className?: string;
}

export function PriceDistribution({
  data,
  height = 350,
  title,
  onBarClick,
  loading = false,
  className = '',
}: PriceDistributionProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (loading) {
    return (
      <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`} style={{ height }} />
    );
  }

  if (!data || data.length === 0) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-50 rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="text-center">
          <p className="text-gray-600 font-medium">데이터 없음</p>
          <p className="text-gray-400 text-sm mt-2">가격대별 판매 데이터가 없습니다</p>
        </div>
      </div>
    );
  }

  const handleBarClick = (data: PriceBucket, index: number) => {
    setActiveIndex(index);
    onBarClick?.(data);
  };

  const formatPriceRange = (range: string) => {
    // "30000-50000" -> "3만~5만원"
    const [min, max] = range.split('-').map(Number);
    return `${(min / 10000).toFixed(0)}만~${(max / 10000).toFixed(0)}만원`;
  };

  return (
    <div className={`${className}`} role="img" aria-label="가격대별 판매 분포 차트">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="range"
            angle={-45}
            textAnchor="end"
            height={80}
            tickFormatter={formatPriceRange}
          />
          <YAxis label={{ value: '판매 건수', angle: -90, position: 'insideLeft' }} />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload as PriceBucket;
                return (
                  <div className="bg-white p-3 rounded-lg shadow-lg border">
                    <p className="font-semibold mb-2">{formatPriceRange(data.range)}</p>
                    <p className="text-sm text-gray-600">
                      판매 건수: {formatNumber(data.count)}건
                    </p>
                    <p className="text-sm text-gray-600">
                      매출: {formatCurrency(data.revenue)}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar
            dataKey="count"
            radius={[8, 8, 0, 0]}
            onClick={(data, index) => handleBarClick(data, index)}
            cursor={onBarClick ? 'pointer' : 'default'}
          >
            {data.map((entry, index) => (
              /* c8 ignore next */
              <Cell
                key={`cell-${index}`}
                fill={activeIndex === index ? '#2563eb' : '#3b82f6'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
