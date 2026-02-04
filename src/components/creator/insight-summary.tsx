'use client';

import type { CreatorInsight } from '@/types';
import { Sparkles, TrendingUp, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface InsightSummaryProps {
  insight: CreatorInsight;
  className?: string;
}

export function InsightSummary({ insight, className }: InsightSummaryProps) {
  return (
    <div
      className={cn(
        'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-xl p-6 border border-blue-100',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-bold text-gray-900">AI 분석 요약</h3>
      </div>

      {/* Summary */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 mb-4">
        <p className="text-gray-800 leading-relaxed">{insight.summary}</p>
      </div>

      {/* Strengths */}
      {insight.strengths && insight.strengths.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <h4 className="text-sm font-semibold text-gray-900">강점</h4>
          </div>
          <div className="space-y-2">
            {insight.strengths.map((strength, index) => (
              <div
                key={index}
                className="flex items-start gap-2 bg-green-50/80 backdrop-blur-sm rounded-lg p-3"
              >
                <span className="flex-shrink-0 w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                  {index + 1}
                </span>
                <p className="text-sm text-gray-800">{strength}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {insight.recommendations && insight.recommendations.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-amber-600" />
            <h4 className="text-sm font-semibold text-gray-900">개선 제안</h4>
          </div>
          <div className="space-y-2">
            {insight.recommendations.map((recommendation, index) => (
              <div
                key={index}
                className="flex items-start gap-2 bg-amber-50/80 backdrop-blur-sm rounded-lg p-3"
              >
                <span className="flex-shrink-0 w-5 h-5 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                  {index + 1}
                </span>
                <p className="text-sm text-gray-800">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="mt-4 pt-4 border-t border-gray-200/50">
        <p className="text-xs text-gray-500">
          분석 일시:{' '}
          {new Date(insight.analyzedAt).toLocaleString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
}
