'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { ProductMatch } from '@/types';
import { formatCurrency, cn } from '@/lib/utils';
import { MatchScoreGauge } from '../charts/match-score-gauge';
import { MatchScoreBreakdown } from './match-score-breakdown';
import { RevenuePredictionBar } from './revenue-prediction-bar';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface MatchCardProps {
  match: ProductMatch;
  expandable?: boolean;
  onClick?: (match: ProductMatch) => void;
  className?: string;
}

export function MatchCard({
  match,
  expandable = true,
  onClick,
  className,
}: MatchCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleToggle = () => {
    if (expandable) {
      setExpanded((prev) => !prev);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-toggle]')) {
      return;
    }
    onClick?.(match);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const truncateReason = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 80) {
      return { label: '높음', className: 'bg-green-100 text-green-700' };
    }
    if (confidence >= 60) {
      return { label: '보통', className: 'bg-yellow-100 text-yellow-700' };
    }
    return { label: '낮음', className: 'bg-red-100 text-red-700' };
  };

  const confidenceBadge = getConfidenceBadge(match.confidence);

  return (
    <article
      className={cn(
        'bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden transition-all',
        onClick && 'cursor-pointer hover:shadow-md',
        className
      )}
      onClick={handleClick}
      aria-label={`${match.product.name} 매칭 카드, 점수 ${match.matchScore}점`}
    >
      <div className="p-5">
        {/* Product Header */}
        <div className="flex gap-4 mb-4">
          <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
            {!imageError && match.product.imageUrl ? (
              <Image
                src={match.product.imageUrl}
                alt={match.product.name}
                fill
                className="object-cover"
                onError={handleImageError}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                이미지 없음
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg mb-1 truncate">{match.product.name}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                {match.product.category}
              </span>
              <span>•</span>
              <span className="font-medium">{formatCurrency(match.product.price)}</span>
            </div>
          </div>
        </div>

        {/* Match Score */}
        <div className="flex items-center justify-center mb-4">
          <MatchScoreGauge score={match.matchScore} size="sm" />
        </div>

        {/* Reasoning (Truncated) */}
        <div className="mb-4 bg-blue-50 rounded-lg p-3">
          <p className="text-sm text-gray-700 italic">
            {expanded ? match.reasoning : truncateReason(match.reasoning)}
          </p>
        </div>

        {/* Expected Revenue */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-600">예상 매출</span>
          <span className="text-lg font-bold text-green-600">
            {formatCurrency(match.predictedRevenue.expected)}
          </span>
        </div>

        {/* Expanded Content */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
            {/* Confidence Badge */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">신뢰도</span>
              <span
                className={cn(
                  'px-3 py-1 rounded-full text-sm font-medium',
                  confidenceBadge.className
                )}
              >
                {confidenceBadge.label} ({match.confidence}%)
              </span>
            </div>

            {/* Score Breakdown */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">매칭 점수 상세</h4>
              <MatchScoreBreakdown breakdown={match.matchBreakdown} />
            </div>

            {/* Revenue Prediction */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">예상 매출 범위</h4>
              <RevenuePredictionBar prediction={match.predictedRevenue} />
            </div>
          </div>
        )}

        {/* Toggle Button */}
        {expandable && (
          <button
            onClick={handleToggle}
            data-toggle
            className="w-full mt-4 flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium py-2 transition-colors"
            aria-expanded={expanded}
            aria-label={`상세 정보 ${expanded ? '숨기기' : '보기'}`}
          >
            {expanded ? (
              <>
                접기 <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                상세보기 <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>
    </article>
  );
}
