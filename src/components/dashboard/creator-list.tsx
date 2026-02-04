'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { Creator } from '@/types';
import { SearchBar } from '@/components/common/search-bar';
import { FilterDropdown, type FilterOption } from '@/components/common/filter-dropdown';
import { CreatorCard } from '@/components/creator/creator-card';
import { ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CreatorListProps {
  creators: Creator[];
  className?: string;
}

type SortType = 'revenue' | 'followers';

const platformOptions: FilterOption[] = [
  { label: '전체', value: 'all' },
  { label: 'Instagram', value: 'instagram' },
  { label: 'YouTube', value: 'youtube' },
  { label: 'TikTok', value: 'tiktok' },
];

const categoryOptions: FilterOption[] = [
  { label: '전체', value: 'all' },
  { label: 'Beauty', value: 'Beauty' },
  { label: 'Fashion', value: 'Fashion' },
  { label: 'Lifestyle', value: 'Lifestyle' },
  { label: 'Food', value: 'Food' },
  { label: 'Tech', value: 'Tech' },
  { label: 'HomeLiving', value: 'HomeLiving' },
  { label: 'Health', value: 'Health' },
  { label: 'BabyKids', value: 'BabyKids' },
  { label: 'Pet', value: 'Pet' },
  { label: 'Stationery', value: 'Stationery' },
];

export function CreatorList({ creators, className }: CreatorListProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortType, setSortType] = useState<SortType>('revenue');

  // Filter and sort creators
  const filteredAndSortedCreators = useMemo(() => {
    let result = [...creators];

    // Apply search filter (debounced in practice, but immediate for simplicity)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((creator) =>
        creator.name.toLowerCase().includes(query)
      );
    }

    // Apply platform filter
    if (platformFilter !== 'all') {
      result = result.filter(
        (creator) => creator.platform.toLowerCase() === platformFilter.toLowerCase()
      );
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter((creator) =>
        creator.categories.includes(categoryFilter)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      if (sortType === 'revenue') {
        return b.totalRevenue - a.totalRevenue;
      } else {
        return b.followers - a.followers;
      }
    });

    return result;
  }, [creators, searchQuery, platformFilter, categoryFilter, sortType]);

  const handleCreatorClick = (creatorId: string) => {
    router.push(`/creator/${creatorId}`);
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Filters Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search Bar */}
        <div className="md:col-span-3">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="크리에이터 이름으로 검색..."
            className="w-full"
          />
        </div>

        {/* Platform Filter */}
        <FilterDropdown
          label="플랫폼"
          options={platformOptions}
          value={platformFilter}
          onChange={setPlatformFilter}
        />

        {/* Category Filter */}
        <FilterDropdown
          label="카테고리"
          options={categoryOptions}
          value={categoryFilter}
          onChange={setCategoryFilter}
        />

        {/* Sort Buttons */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-gray-700">정렬</label>
          <div className="flex gap-2">
            <button
              onClick={() => setSortType('revenue')}
              className={cn(
                'flex-1 inline-flex items-center justify-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                sortType === 'revenue'
                  ? 'bg-zvzo-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              <ArrowUpDown className="w-4 h-4" />
              매출순
            </button>
            <button
              onClick={() => setSortType('followers')}
              className={cn(
                'flex-1 inline-flex items-center justify-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                sortType === 'followers'
                  ? 'bg-zvzo-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              <ArrowUpDown className="w-4 h-4" />
              팔로워순
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        총 <span className="font-semibold text-gray-900">{filteredAndSortedCreators.length}</span>명의 크리에이터
      </div>

      {/* Creator Grid */}
      {filteredAndSortedCreators.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedCreators.map((creator) => (
            <CreatorCard
              key={creator.id}
              creator={creator}
              onClick={() => handleCreatorClick(creator.id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <p className="text-lg font-medium text-gray-900 mb-2">검색 결과 없음</p>
            <p className="text-sm text-gray-600">
              검색 조건을 변경하거나 필터를 초기화해보세요.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setPlatformFilter('all');
                setCategoryFilter('all');
              }}
              className="mt-4 px-4 py-2 bg-zvzo-500 text-white rounded-lg hover:bg-zvzo-600 transition-colors"
            >
              필터 초기화
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
