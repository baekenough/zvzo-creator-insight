'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Product, CreatorMatch } from '@/types';
import { CreatorMatchCard } from './creator-match-card';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { ChevronLeft, AlertCircle, RefreshCcw, Loader2 } from 'lucide-react';

export interface CreatorMatchSectionProps {
  product: Product;
}

export function CreatorMatchSection({ product }: CreatorMatchSectionProps) {
  const [matches, setMatches] = useState<CreatorMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMatches, setSelectedMatches] = useState<Set<string>>(new Set());
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  const fetchMatches = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/match/creators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch matches');
      }

      setMatches(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [product.id]);

  const handleCheckboxChange = (creatorId: string) => {
    setSelectedMatches((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(creatorId)) {
        newSet.delete(creatorId);
      } else {
        newSet.add(creatorId);
      }
      return newSet;
    });
  };

  const handleCompareClick = () => {
    setCompareModalOpen(true);
  };

  const handleCloseModal = () => {
    setCompareModalOpen(false);
  };

  const selectedMatchesArray = matches.filter((match) =>
    selectedMatches.has(match.creator.id)
  );

  const topTargetAudience = product.targetAudience.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href={`/product/${product.id}`}
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors font-medium"
      >
        <ChevronLeft className="w-5 h-5" />
        상품 상세로 돌아가기
      </Link>

      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI 크리에이터 매칭</h1>
        <p className="text-gray-600">
          {product.name}에 최적화된 크리에이터를 AI가 추천합니다
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className="text-lg text-gray-600">AI가 최적의 크리에이터를 찾고 있습니다...</p>
          <p className="text-sm text-gray-500 mt-2">잠시만 기다려주세요</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">매칭 실패</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={fetchMatches}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <RefreshCcw className="w-4 h-4" />
            다시 시도
          </button>
        </div>
      )}

      {/* Content */}
      {!loading && !error && matches.length > 0 && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sidebar - Product Summary */}
          <aside className="lg:col-span-1 lg:sticky lg:top-20 lg:self-start">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6 space-y-4">
              <h2 className="text-xl font-bold text-gray-900">상품 요약</h2>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">상품명</h3>
                <p className="text-base text-gray-900">{product.name}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">카테고리</h3>
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
                  {product.category}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">가격</h3>
                <p className="text-lg font-bold text-green-600">{formatCurrency(product.price)}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">타겟 고객</h3>
                <div className="flex flex-wrap gap-2">
                  {topTargetAudience.map((audience) => (
                    <span
                      key={audience}
                      className="inline-block px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full font-medium"
                    >
                      {audience}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-blue-200">
                <p className="text-xs text-gray-600 italic">
                  AI 분석 기반 추천 정보입니다
                </p>
              </div>
            </div>
          </aside>

          {/* Main Content - Match Cards */}
          <div className="lg:col-span-2 space-y-6">
            {/* Compare Bar */}
            {selectedMatches.size > 0 && (
              <div className="sticky top-20 z-10 bg-white border border-blue-300 rounded-lg p-4 shadow-md">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-700">
                    {selectedMatches.size}명 크리에이터 선택됨
                  </p>
                  <button
                    onClick={handleCompareClick}
                    disabled={selectedMatches.size < 2 || selectedMatches.size > 3}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    비교하기
                  </button>
                </div>
                {(selectedMatches.size < 2 || selectedMatches.size > 3) && (
                  <p className="text-xs text-gray-500 mt-2">
                    2~3명의 크리에이터를 선택해주세요
                  </p>
                )}
              </div>
            )}

            {/* Match Cards Grid */}
            <div className="grid gap-6">
              {matches.slice(0, 5).map((match) => (
                <CreatorMatchCard
                  key={match.creator.id}
                  match={match}
                  selected={selectedMatches.has(match.creator.id)}
                  onSelect={handleCheckboxChange}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && !error && matches.length === 0 && (
        <div className="text-center py-20">
          <p className="text-lg text-gray-600">매칭된 크리에이터가 없습니다</p>
        </div>
      )}

      {/* Compare Modal - Simple Inline Table */}
      {compareModalOpen && selectedMatchesArray.length >= 2 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                크리에이터 비교 ({selectedMatchesArray.length}명)
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="닫기"
              >
                ✕
              </button>
            </div>

            {/* Comparison Table */}
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left p-3 font-semibold text-gray-700 bg-gray-50">항목</th>
                      {selectedMatchesArray.map((match, index) => (
                        <th
                          key={match.creator.id}
                          className="p-3 text-center font-semibold text-gray-700 bg-gray-50"
                        >
                          크리에이터 {index + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {/* Creator Name */}
                    <tr>
                      <td className="p-3 font-medium text-gray-700">이름</td>
                      {selectedMatchesArray.map((match) => (
                        <td key={match.creator.id} className="p-3 text-center">
                          <p className="font-medium">{match.creator.name}</p>
                        </td>
                      ))}
                    </tr>

                    {/* Platform */}
                    <tr className="bg-gray-50">
                      <td className="p-3 font-medium text-gray-700">플랫폼</td>
                      {selectedMatchesArray.map((match) => (
                        <td key={match.creator.id} className="p-3 text-center">
                          <span className="inline-block px-2 py-1 bg-gray-200 rounded text-sm">
                            {match.creator.platform}
                          </span>
                        </td>
                      ))}
                    </tr>

                    {/* Followers */}
                    <tr>
                      <td className="p-3 font-medium text-gray-700">팔로워</td>
                      {selectedMatchesArray.map((match) => (
                        <td key={match.creator.id} className="p-3 text-center font-semibold">
                          {formatNumber(match.creator.followers)}
                        </td>
                      ))}
                    </tr>

                    {/* Engagement Rate */}
                    <tr className="bg-gray-50">
                      <td className="p-3 font-medium text-gray-700">참여율</td>
                      {selectedMatchesArray.map((match) => (
                        <td key={match.creator.id} className="p-3 text-center font-semibold">
                          {match.creator.engagementRate}%
                        </td>
                      ))}
                    </tr>

                    {/* Match Score */}
                    <tr>
                      <td className="p-3 font-medium text-gray-700">매칭 점수</td>
                      {selectedMatchesArray.map((match) => (
                        <td key={match.creator.id} className="p-3 text-center">
                          <span className="font-bold text-lg">{match.matchScore}점</span>
                        </td>
                      ))}
                    </tr>

                    {/* Category Fit */}
                    <tr className="bg-gray-50">
                      <td className="p-3 font-medium text-gray-700">카테고리 적합도</td>
                      {selectedMatchesArray.map((match) => (
                        <td key={match.creator.id} className="p-3 text-center">
                          <span className="font-semibold">{match.matchBreakdown.categoryFit}%</span>
                        </td>
                      ))}
                    </tr>

                    {/* Price Fit */}
                    <tr>
                      <td className="p-3 font-medium text-gray-700">가격대 적합도</td>
                      {selectedMatchesArray.map((match) => (
                        <td key={match.creator.id} className="p-3 text-center">
                          <span className="font-semibold">{match.matchBreakdown.priceFit}%</span>
                        </td>
                      ))}
                    </tr>

                    {/* Season Fit */}
                    <tr className="bg-gray-50">
                      <td className="p-3 font-medium text-gray-700">시즌 적합도</td>
                      {selectedMatchesArray.map((match) => (
                        <td key={match.creator.id} className="p-3 text-center">
                          <span className="font-semibold">{match.matchBreakdown.seasonFit}%</span>
                        </td>
                      ))}
                    </tr>

                    {/* Audience Fit */}
                    <tr>
                      <td className="p-3 font-medium text-gray-700">타겟 고객 적합도</td>
                      {selectedMatchesArray.map((match) => (
                        <td key={match.creator.id} className="p-3 text-center">
                          <span className="font-semibold">{match.matchBreakdown.audienceFit}%</span>
                        </td>
                      ))}
                    </tr>

                    {/* Expected Revenue */}
                    <tr className="bg-gray-50">
                      <td className="p-3 font-medium text-gray-700">예상 매출</td>
                      {selectedMatchesArray.map((match) => (
                        <td key={match.creator.id} className="p-3 text-center">
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
                    <tr>
                      <td className="p-3 font-medium text-gray-700">신뢰도</td>
                      {selectedMatchesArray.map((match) => (
                        <td key={match.creator.id} className="p-3 text-center">
                          <span className="font-semibold">{match.confidence}%</span>
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
                onClick={handleCloseModal}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
