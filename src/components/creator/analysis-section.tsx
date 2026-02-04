'use client';

import { useState } from 'react';
import type { CreatorInsight } from '@/types';
import { AnalyzeButton } from '@/components/creator/analyze-button';
import { InsightSummary } from '@/components/creator/insight-summary';
import { CategoryChart } from '@/components/charts/category-chart';
import { PriceDistribution } from '@/components/charts/price-distribution';
import { SeasonalTrend } from '@/components/charts/seasonal-trend';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AnalysisSectionProps {
  creatorId: string;
  className?: string;
}

export function AnalysisSection({ creatorId, className }: AnalysisSectionProps) {
  const [insight, setInsight] = useState<CreatorInsight | null>(null);

  const handleAnalysisComplete = (newInsight: CreatorInsight) => {
    setInsight(newInsight);
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-900">AI 성과 분석</h2>
        </div>
        {!insight && (
          <AnalyzeButton creatorId={creatorId} onComplete={handleAnalysisComplete} />
        )}
      </div>

      {/* Analysis Content */}
      {!insight ? (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-12 border border-blue-100">
          <div className="text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
              <Sparkles className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              AI 분석을 시작하세요
            </h3>
            <p className="text-gray-600 mb-6">
              크리에이터의 판매 데이터를 AI가 분석하여 카테고리별 성과, 최적 가격대,
              시즌별 트렌드, 그리고 맞춤 인사이트를 제공합니다.
            </p>
            <div className="flex justify-center">
              <AnalyzeButton creatorId={creatorId} onComplete={handleAnalysisComplete} />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Insight Summary */}
          <InsightSummary insight={insight} />

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Performance Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                카테고리별 성과
              </h3>
              <CategoryChart data={insight.topCategories} height={350} />
            </div>

            {/* Price Distribution Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                가격대별 판매 분포
              </h3>
              <PriceDistribution data={insight.priceRange?.distribution || []} height={350} />
            </div>
          </div>

          {/* Seasonal Trend Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              시즌별 판매 트렌드
            </h3>
            <SeasonalTrend data={insight.seasonalPattern || insight.seasonalTrends || []} height={400} />
          </div>

          {/* Conversion Metrics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">전환 지표</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">평균 전환율</p>
                <p className="text-2xl font-bold text-blue-600">
                  {insight.conversionMetrics?.avgConversionRate.toFixed(2)}%
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">최고 전환 카테고리</p>
                <p className="text-2xl font-bold text-green-600">
                  {insight.conversionMetrics?.bestConversionCategory}
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">팔로워당 구매 비율</p>
                <p className="text-2xl font-bold text-purple-600">
                  {insight.conversionMetrics?.followerToPurchaseRatio.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>

          {/* Re-analyze Button */}
          <div className="flex justify-center pt-4">
            <button
              onClick={() => setInsight(null)}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              다시 분석하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
