'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useState } from 'react';
import type { SeasonalData } from '@/types';
import { formatNumber, formatCurrency } from '@/lib/utils';

export interface SeasonalTrendProps {
  data: SeasonalData[];
  height?: number;
  title?: string;
  dataKeys?: Array<'salesCount' | 'revenue'>;
  showLegend?: boolean;
  loading?: boolean;
  className?: string;
}

export function SeasonalTrend({
  data,
  height = 400,
  title,
  dataKeys = ['salesCount', 'revenue'],
  showLegend = true,
  loading = false,
  className = '',
}: SeasonalTrendProps) {
  const [hiddenLines, setHiddenLines] = useState<Set<string>>(new Set());

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
          <p className="text-gray-400 text-sm mt-2">시즌별 판매 데이터가 없습니다</p>
        </div>
      </div>
    );
  }

  const handleLegendClick = (dataKey: string) => {
    setHiddenLines((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(dataKey)) {
        newSet.delete(dataKey);
      } else {
        newSet.add(dataKey);
      }
      return newSet;
    });
  };

  const formatMonth = (month: number) => {
    return `${month}월`;
  };

  const formatTooltipValue = (value: number, name: string) => {
    if (name === '매출' || name === 'revenue') {
      return [formatCurrency(value), '매출'];
    }
    return [`${formatNumber(value)}건`, '판매 건수'];
  };

  return (
    <div className={`${className}`} role="img" aria-label="시즌별 판매 트렌드 차트">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" tickFormatter={formatMonth} />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip
            formatter={formatTooltipValue}
            labelFormatter={formatMonth}
            contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb' }}
          />
          {showLegend && (
            <Legend
              onClick={(e) => handleLegendClick(e.dataKey as string)}
              wrapperStyle={{ cursor: 'pointer' }}
            />
          )}
          {dataKeys.includes('salesCount') && !hiddenLines.has('salesCount') && (
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="salesCount"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
              name="판매 건수"
            />
          )}
          {dataKeys.includes('revenue') && !hiddenLines.has('revenue') && (
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: '#10b981', r: 4 }}
              activeDot={{ r: 6 }}
              name="매출"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
