'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { Product } from '@/types';
import { SearchBar } from '@/components/common/search-bar';
import { FilterDropdown, type FilterOption } from '@/components/common/filter-dropdown';
import { ProductCard } from '@/components/products/product-card';
import { ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ProductListProps {
  products: Product[];
  className?: string;
}

type SortType = 'price' | 'name';

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

export function ProductList({ products, className }: ProductListProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortType, setSortType] = useState<SortType>('price');

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // Apply search filter (by name or brand)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.brand.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter((product) => product.category === categoryFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      if (sortType === 'price') {
        return b.price - a.price;
      } else {
        return a.name.localeCompare(b.name);
      }
    });

    return result;
  }, [products, searchQuery, categoryFilter, sortType]);

  const handleProductClick = (productId: string) => {
    router.push(`/products/${productId}`);
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
            placeholder="상품명 또는 브랜드로 검색..."
            className="w-full"
          />
        </div>

        {/* Category Filter */}
        <FilterDropdown
          label="카테고리"
          options={categoryOptions}
          value={categoryFilter}
          onChange={setCategoryFilter}
        />

        {/* Sort Buttons */}
        <div className="flex flex-col space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-gray-700">정렬</label>
          <div className="flex gap-2">
            <button
              onClick={() => setSortType('price')}
              className={cn(
                'flex-1 inline-flex items-center justify-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                sortType === 'price'
                  ? 'bg-zvzo-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              <ArrowUpDown className="w-4 h-4" />
              가격순
            </button>
            <button
              onClick={() => setSortType('name')}
              className={cn(
                'flex-1 inline-flex items-center justify-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                sortType === 'name'
                  ? 'bg-zvzo-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              <ArrowUpDown className="w-4 h-4" />
              이름순
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        총 <span className="font-semibold text-gray-900">{filteredAndSortedProducts.length}</span>개의 상품
      </div>

      {/* Product Grid */}
      {filteredAndSortedProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => handleProductClick(product.id)}
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
