'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Creator } from '@/types';
import { formatNumber, formatCurrency, cn } from '@/lib/utils';

export interface CreatorCardProps {
  creator: Creator;
  onClick?: () => void;
  className?: string;
}

const platformColors = {
  instagram: 'bg-pink-100 text-pink-700',
  youtube: 'bg-red-100 text-red-700',
  tiktok: 'bg-blue-100 text-blue-700',
};

export function CreatorCard({ creator, onClick, className }: CreatorCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    onClick?.();
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

  const formattedFollowers = creator.followers >= 10000
    ? `${(creator.followers / 10000).toFixed(1)}만`
    : formatNumber(creator.followers);

  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        'bg-white rounded-lg border border-gray-200 p-4 transition-all duration-200',
        'hover:shadow-lg hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={`${creator.name} 크리에이터 카드, ${creator.platform} 플랫폼, 팔로워 ${formattedFollowers}명`}
    >
      {/* Profile Image */}
      <div className="flex items-start gap-4 mb-4">
        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
          {!imageError && creator.profileImage ? (
            <Image
              src={creator.profileImage}
              alt={creator.name}
              fill
              className="object-cover"
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xl font-bold">
              {creator.name.charAt(0)}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg truncate">{creator.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={cn(
                'inline-block px-2 py-0.5 rounded text-xs font-medium',
                platformColors[creator.platform.toLowerCase() as keyof typeof platformColors]
              )}
            >
              {creator.platform}
            </span>
            <span className="text-sm text-gray-600">{formattedFollowers} 팔로워</span>
          </div>
        </div>
      </div>

      {/* Categories */}
      {creator.categories && creator.categories.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {creator.categories.slice(0, 3).map((category) => (
            <span
              key={category}
              className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
            >
              {category}
            </span>
          ))}
          {creator.categories.length > 3 && (
            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">
              +{creator.categories.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div>
          <p className="text-xs text-gray-500">참여율</p>
          <p className="text-sm font-semibold">{creator.engagementRate.toFixed(1)}%</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">총 매출</p>
          <p className="text-sm font-semibold text-blue-600">
            {formatCurrency(creator.totalRevenue)}
          </p>
        </div>
      </div>
    </div>
  );
}
