'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Product } from '@/types';
import { formatCurrency, cn } from '@/lib/utils';

export interface ProductProfileProps {
  product: Product;
  className?: string;
}

export function ProductProfile({ product, className }: ProductProfileProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  const discountRate =
    product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  return (
    <div className={cn('bg-white rounded-xl shadow-sm border border-gray-200 p-8', className)}>
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Product Image */}
        <div className="relative w-48 h-48 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
          {!imageError && product.imageUrl ? (
            <>
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className={cn(
                  'object-cover transition-opacity duration-300',
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                )}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
              {!imageLoaded && (
                <div className="absolute inset-0 animate-pulse bg-gray-300" />
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-500 text-white text-6xl font-bold">
              {product.name.charAt(0)}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-lg text-gray-600">{product.brand}</span>
                <span className="inline-block px-3 py-1.5 bg-blue-100 text-blue-800 text-sm rounded-lg font-medium">
                  {product.category}
                </span>
                {product.subcategory && (
                  <span className="inline-block px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg">
                    {product.subcategory}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Price Section */}
          <div className="mb-6">
            <div className="flex items-baseline gap-3">
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(product.price)}</p>
              {product.originalPrice > product.price && (
                <>
                  <p className="text-lg text-gray-400 line-through">
                    {formatCurrency(product.originalPrice)}
                  </p>
                  <p className="text-lg font-semibold text-red-600">{discountRate}% 할인</p>
                </>
              )}
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="mb-4">
              <p className="text-sm text-gray-700 leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">태그</p>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-block px-3 py-1.5 bg-gray-100 text-gray-800 text-sm rounded-lg"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Target Audience */}
          {product.targetAudience && product.targetAudience.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">타겟 고객</p>
              <div className="flex flex-wrap gap-2">
                {product.targetAudience.map((audience) => (
                  <span
                    key={audience}
                    className="inline-block px-3 py-1.5 bg-purple-100 text-purple-800 text-sm rounded-lg font-medium"
                  >
                    {audience}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Seasonality */}
          {product.seasonality && product.seasonality.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">계절성</p>
              <div className="flex flex-wrap gap-2">
                {product.seasonality.map((season) => (
                  <span
                    key={season}
                    className="inline-block px-3 py-1.5 bg-green-100 text-green-800 text-sm rounded-lg font-medium"
                  >
                    {season}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Commission Rate */}
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-1">평균 수수료율</p>
            <p className="text-2xl font-bold text-blue-600">
              {product.avgCommissionRate.toFixed(1)}%
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">현재 가격</p>
              <p className="text-lg font-bold text-blue-600">{formatCurrency(product.price)}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">정가</p>
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(product.originalPrice)}
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">할인율</p>
              <p className="text-lg font-bold text-red-600">{discountRate}%</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">수수료율</p>
              <p className="text-lg font-bold text-green-600">
                {product.avgCommissionRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
