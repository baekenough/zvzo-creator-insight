'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useState } from 'react';
import type { CategoryScore } from '@/types';
import { formatNumber, formatCurrency } from '@/lib/utils';

export interface CategoryChartProps {
  data: CategoryScore[];
  height?: number;
  title?: string;
  onBarClick?: (category: CategoryScore) => void;
  loading?: boolean;
  className?: string;
}

export function CategoryChart({
  data,
  height = 400,
  title,
  onBarClick,
  loading = false,
  className = '',
}: CategoryChartProps) {
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);

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
          <p className="text-gray-400 text-sm mt-2">카테고리 성과 데이터가 없습니다</p>
        </div>
      </div>
    );
  }

  const handleMouseEnter = (category: string) => {
    setHoveredBar(category);
  };

  const handleMouseLeave = () => {
    setHoveredBar(null);
  };

  const handleClick = (data: CategoryScore) => {
    onBarClick?.(data);
  };

  const getBarColor = (score: number) => {
    if (score >= 80) return '#10b981'; // green-500
    if (score >= 60) return '#3b82f6'; // blue-500
    if (score >= 40) return '#f59e0b'; // yellow-500
    return '#ef4444'; // red-500
  };

  return (
    <div className={`${className}`} role="img" aria-label="카테고리별 성과 점수 차트">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 100]} />
          <YAxis type="category" dataKey="category" />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload as CategoryScore;
                return (
                  <div
                    className="bg-white p-3 rounded-lg shadow-lg border"
                    role="status"
                    aria-live="polite"
                  >
                    <p className="font-semibold mb-2">{data.category}</p>
                    <p className="text-sm text-gray-600">점수: {data.score}</p>
                    <p className="text-sm text-gray-600">
                      판매 건수: {formatNumber(data.salesCount)}건
                    </p>
                    <p className="text-sm text-gray-600">
                      매출: {formatCurrency(data.totalRevenue)}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar
            dataKey="score"
            radius={[0, 8, 8, 0]}
            onMouseEnter={(data) => handleMouseEnter(data.category)}
            onMouseLeave={handleMouseLeave}
            onClick={(data) => handleClick(data)}
            cursor={onBarClick ? 'pointer' : 'default'}
          >
            {data.map((entry, index) => (
              /* c8 ignore next */
              <Cell
                key={`cell-${index}`}
                fill={getBarColor(entry.score)}
                fillOpacity={hoveredBar === entry.category ? 0.8 : 1}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
