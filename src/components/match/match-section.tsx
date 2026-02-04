'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Creator, ProductMatch } from '@/types';
import { MatchCard } from './match-card';
import { CompareModal } from './compare-modal';
import { formatCurrency } from '@/lib/utils';
import { ChevronLeft, AlertCircle, RefreshCcw, Loader2 } from 'lucide-react';

export interface MatchSectionProps {
  creator: Creator;
}

export function MatchSection({ creator }: MatchSectionProps) {
  const [matches, setMatches] = useState<ProductMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMatches, setSelectedMatches] = useState<Set<string>>(new Set());
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  const fetchMatches = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorId: creator.id }),
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
  }, [creator.id]);

  const handleCheckboxChange = (productId: string, checked: boolean) => {
    setSelectedMatches((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(productId);
      } else {
        newSet.delete(productId);
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
    selectedMatches.has(match.product.id)
  );

  const topCategories = creator.categories.slice(0, 3);
  const bestPriceRange = formatCurrency(50000); // Placeholder - in real implementation, get from insight data

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href={`/creator/${creator.id}`}
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors font-medium"
      >
        <ChevronLeft className="w-5 h-5" />
        크리에이터 상세로 돌아가기
      </Link>

      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI 제품 매칭</h1>
        <p className="text-gray-600">
          {creator.name}님에게 최적화된 제품을 AI가 추천합니다
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className="text-lg text-gray-600">AI가 최적의 제품을 찾고 있습니다...</p>
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
        <div className="grid lg:grid-cols-[300px_1fr] gap-6">
          {/* Sidebar - Creator Summary */}
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6 space-y-4">
              <h2 className="text-xl font-bold text-gray-900">크리에이터 요약</h2>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">이름</h3>
                <p className="text-base text-gray-900">{creator.name}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">강점 카테고리</h3>
                <div className="flex flex-wrap gap-2">
                  {topCategories.map((category) => (
                    <span
                      key={category}
                      className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">최적 가격대</h3>
                <p className="text-lg font-bold text-green-600">{bestPriceRange}</p>
              </div>

              <div className="pt-4 border-t border-blue-200">
                <p className="text-xs text-gray-600 italic">
                  AI 분석 기반 추천 정보입니다
                </p>
              </div>
            </div>
          </aside>

          {/* Main Content - Match Cards */}
          <div className="space-y-6">
            {/* Compare Bar */}
            {selectedMatches.size > 0 && (
              <div className="sticky top-20 z-10 bg-white border border-blue-300 rounded-lg p-4 shadow-md">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-700">
                    {selectedMatches.size}개 상품 선택됨
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
                    2~3개의 상품을 선택해주세요
                  </p>
                )}
              </div>
            )}

            {/* Match Cards Grid */}
            <div className="grid gap-6">
              {matches.slice(0, 5).map((match) => (
                <div key={match.product.id} className="relative">
                  <label className="absolute top-4 right-4 z-10 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedMatches.has(match.product.id)}
                      onChange={(e) =>
                        handleCheckboxChange(match.product.id, e.target.checked)
                      }
                      className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">비교</span>
                  </label>
                  <MatchCard match={match} expandable />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && !error && matches.length === 0 && (
        <div className="text-center py-20">
          <p className="text-lg text-gray-600">매칭된 제품이 없습니다</p>
        </div>
      )}

      {/* Compare Modal */}
      <CompareModal
        matches={selectedMatchesArray}
        open={compareModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
