'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Product } from '@/types';
import { formatCurrency, cn } from '@/lib/utils';

export interface ProductCardProps {
  product: Product;
  onClick?: (id: string) => void;
  className?: string;
}

export function ProductCard({ product, onClick, className }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    onClick?.(product.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const discountRate =
    product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        'bg-white rounded-lg border border-gray-200 p-4 transition-all duration-200',
        'hover:shadow-md hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={`${product.name}, ${product.brand}, ${formatCurrency(product.price)}`}
    >
      {/* Product Image */}
      <div className="flex items-start gap-4 mb-4">
        <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
          {!imageError && product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-500 text-white text-2xl font-bold">
              {product.name.charAt(0)}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg truncate">{product.name}</h3>
          <p className="text-sm text-gray-500 truncate mt-0.5">{product.brand}</p>
          <div className="mt-1">
            <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
              {product.category}
            </span>
          </div>
        </div>
      </div>

      {/* Price and Commission */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div>
          <p className="text-xs text-gray-500">가격</p>
          <p className="text-sm font-semibold text-gray-900">{formatCurrency(product.price)}</p>
          {discountRate > 0 && (
            <p className="text-xs text-red-600 font-medium">{discountRate}% 할인</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">수수료율</p>
          <p className="text-sm font-semibold text-blue-600">
            {product.avgCommissionRate.toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
}
