'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Creator } from '@/types';
import { formatNumber, formatCurrency, cn } from '@/lib/utils';

export interface CreatorProfileProps {
  creator: Creator;
  className?: string;
}

const platformColors = {
  instagram: 'bg-pink-100 text-pink-700 border-pink-300',
  youtube: 'bg-red-100 text-red-700 border-red-300',
  tiktok: 'bg-blue-100 text-blue-700 border-blue-300',
};

export function CreatorProfile({ creator, className }: CreatorProfileProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  const formattedFollowers = creator.followers >= 10000
    ? `${(creator.followers / 10000).toFixed(1)}만`
    : formatNumber(creator.followers);

  const joinedDate = new Date(creator.joinedAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className={cn('bg-white rounded-xl shadow-sm border border-gray-200 p-8', className)}>
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Profile Image */}
        <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
          {!imageError && creator.profileImage ? (
            <>
              <Image
                src={creator.profileImage}
                alt={creator.name}
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
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-500 text-white text-4xl font-bold">
              {creator.name.charAt(0)}
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h1 className="text-3xl font-bold mb-2">{creator.name}</h1>
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border',
                    platformColors[creator.platform.toLowerCase() as keyof typeof platformColors]
                  )}
                >
                  {creator.platform}
                </span>
                <span className="text-gray-600">
                  <span className="font-semibold text-gray-900">{formattedFollowers}</span> 팔로워
                </span>
              </div>
            </div>
          </div>

          {/* Categories */}
          {creator.categories && creator.categories.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">주요 카테고리</p>
              <div className="flex flex-wrap gap-2">
                {creator.categories.map((category) => (
                  <span
                    key={category}
                    className="inline-block px-3 py-1.5 bg-gray-100 text-gray-800 text-sm rounded-lg font-medium"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">참여율</p>
              <p className="text-xl font-bold text-gray-900">
                {creator.engagementRate.toFixed(1)}%
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">총 판매</p>
              <p className="text-xl font-bold text-blue-600">
                {formatNumber(creator.totalSales)}건
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">총 매출</p>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(creator.totalRevenue)}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">가입일</p>
              <p className="text-sm font-semibold text-gray-900">{joinedDate}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
