'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { CreatorMatch } from '@/types';
import { formatCurrency, formatNumber, cn } from '@/lib/utils';
import { MatchScoreGauge } from '../charts/match-score-gauge';
import { MatchScoreBreakdown } from './match-score-breakdown';
import { RevenuePredictionBar } from './revenue-prediction-bar';
import { ConfidenceBadge } from '../common/confidence-badge';
import { PlatformBadge } from '../common/platform-badge';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface CreatorMatchCardProps {
  match: CreatorMatch;
  selected?: boolean;
  onSelect?: (id: string) => void;
  className?: string;
}

export function CreatorMatchCard({
  match,
  selected = false,
  onSelect,
  className,
}: CreatorMatchCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleToggle = () => {
    setExpanded((prev) => !prev);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const truncateReason = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const platformForBadge = match.creator.platform.toLowerCase() as 'instagram' | 'youtube' | 'tiktok';

  return (
    <article
      className={cn(
        'bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden transition-all hover:shadow-md',
        className
      )}
      aria-label={`${match.creator.name} 매칭 카드, 점수 ${match.matchScore}점`}
    >
      <div className="p-5">
        {/* Checkbox */}
        {onSelect && (
          <div className="absolute top-4 right-4 z-10">
            <input
              type="checkbox"
              checked={selected}
              onChange={(e) => onSelect(match.creator.id)}
              className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              aria-label={`${match.creator.name} 선택`}
            />
          </div>
        )}

        {/* Creator Header */}
        <div className="flex gap-4 mb-4">
          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
            {!imageError && match.creator.profileImage ? (
              <Image
                src={match.creator.profileImage}
                alt={match.creator.name}
                fill
                className="object-cover"
                onError={handleImageError}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-600 text-sm font-semibold">
                {getInitials(match.creator.name)}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg mb-1 truncate">{match.creator.name}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <PlatformBadge platform={platformForBadge} />
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-600">
              <span>팔로워 {formatNumber(match.creator.followers)}</span>
              <span>•</span>
              <span>참여율 {match.creator.engagementRate}%</span>
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
              <ConfidenceBadge confidence={match.confidence} />
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

            {/* Creator Categories */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">전문 분야</h4>
              <div className="flex flex-wrap gap-2">
                {match.creator.categories.map((category) => (
                  <span
                    key={category}
                    className="inline-block px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>

            {/* Creator Stats */}
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-500 mb-1">총 판매량</p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatNumber(match.creator.totalSales)}건
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">총 매출액</p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatCurrency(match.creator.totalRevenue)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Toggle Button */}
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
      </div>
    </article>
  );
}
