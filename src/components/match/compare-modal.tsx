'use client';

import { X } from 'lucide-react';
import type { ProductMatch } from '@/types';
import { formatCurrency, cn } from '@/lib/utils';
import { MatchScoreGauge } from '../charts/match-score-gauge';

export interface CompareModalProps {
  matches: ProductMatch[];
  open: boolean;
  onClose: () => void;
  className?: string;
}

export function CompareModal({ matches, open, onClose, className }: CompareModalProps) {
  if (!open) return null;

  const limitedMatches = matches.slice(0, 3);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="compare-modal-title"
    >
      <div
        className={cn(
          'bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-auto',
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 id="compare-modal-title" className="text-xl font-bold text-gray-900">
            상품 비교 ({limitedMatches.length}개)
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Table */}
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left p-3 font-semibold text-gray-700 bg-gray-50">항목</th>
                  {limitedMatches.map((match, index) => (
                    <th
                      key={match.product.id}
                      className="p-3 text-center font-semibold text-gray-700 bg-gray-50"
                    >
                      상품 {index + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {/* Product Name */}
                <tr>
                  <td className="p-3 font-medium text-gray-700">상품명</td>
                  {limitedMatches.map((match) => (
                    <td key={match.product.id} className="p-3 text-center">
                      <p className="font-medium">{match.product.name}</p>
                      <p className="text-sm text-gray-500">{match.product.brand}</p>
                    </td>
                  ))}
                </tr>

                {/* Category */}
                <tr className="bg-gray-50">
                  <td className="p-3 font-medium text-gray-700">카테고리</td>
                  {limitedMatches.map((match) => (
                    <td key={match.product.id} className="p-3 text-center">
                      <span className="inline-block px-2 py-1 bg-gray-200 rounded text-sm">
                        {match.product.category}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Price */}
                <tr>
                  <td className="p-3 font-medium text-gray-700">가격</td>
                  {limitedMatches.map((match) => (
                    <td key={match.product.id} className="p-3 text-center font-semibold">
                      {formatCurrency(match.product.price)}
                    </td>
                  ))}
                </tr>

                {/* Match Score */}
                <tr className="bg-gray-50">
                  <td className="p-3 font-medium text-gray-700">매칭 점수</td>
                  {limitedMatches.map((match) => (
                    <td key={match.product.id} className="p-3">
                      <div className="flex justify-center">
                        <MatchScoreGauge score={match.matchScore} size="sm" showLabel={false} />
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Category Fit */}
                <tr>
                  <td className="p-3 font-medium text-gray-700">카테고리 적합도</td>
                  {limitedMatches.map((match) => (
                    <td key={match.product.id} className="p-3 text-center">
                      <span className="font-semibold">{match.matchBreakdown.categoryFit}%</span>
                    </td>
                  ))}
                </tr>

                {/* Price Fit */}
                <tr className="bg-gray-50">
                  <td className="p-3 font-medium text-gray-700">가격대 적합도</td>
                  {limitedMatches.map((match) => (
                    <td key={match.product.id} className="p-3 text-center">
                      <span className="font-semibold">{match.matchBreakdown.priceFit}%</span>
                    </td>
                  ))}
                </tr>

                {/* Season Fit */}
                <tr>
                  <td className="p-3 font-medium text-gray-700">시즌 적합도</td>
                  {limitedMatches.map((match) => (
                    <td key={match.product.id} className="p-3 text-center">
                      <span className="font-semibold">{match.matchBreakdown.seasonFit}%</span>
                    </td>
                  ))}
                </tr>

                {/* Audience Fit */}
                <tr className="bg-gray-50">
                  <td className="p-3 font-medium text-gray-700">타겟 고객 적합도</td>
                  {limitedMatches.map((match) => (
                    <td key={match.product.id} className="p-3 text-center">
                      <span className="font-semibold">{match.matchBreakdown.audienceFit}%</span>
                    </td>
                  ))}
                </tr>

                {/* Expected Revenue */}
                <tr>
                  <td className="p-3 font-medium text-gray-700">예상 매출</td>
                  {limitedMatches.map((match) => (
                    <td key={match.product.id} className="p-3 text-center">
                      <p className="font-bold text-green-600">
                        {formatCurrency(match.predictedRevenue.expected)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatCurrency(match.predictedRevenue.minimum)} ~{' '}
                        {formatCurrency(match.predictedRevenue.maximum)}
                      </p>
                    </td>
                  ))}
                </tr>

                {/* Confidence */}
                <tr className="bg-gray-50">
                  <td className="p-3 font-medium text-gray-700">신뢰도</td>
                  {limitedMatches.map((match) => (
                    <td key={match.product.id} className="p-3 text-center">
                      <span
                        className={cn(
                          'inline-block px-3 py-1 rounded-full text-sm font-medium',
                          match.confidence >= 80 && 'bg-green-100 text-green-700',
                          match.confidence >= 60 &&
                            match.confidence < 80 &&
                            'bg-yellow-100 text-yellow-700',
                          match.confidence < 60 && 'bg-red-100 text-red-700'
                        )}
                      >
                        {match.confidence}%
                      </span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
