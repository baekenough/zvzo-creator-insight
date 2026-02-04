import { describe, it, expect, vi } from 'vitest';

// Mock sales history to return empty for specific creators
vi.mock('@/data/sales-history', () => ({
  salesHistory: [],
}));

vi.mock('@/data/creators', () => ({
  creators: [
    {
      id: 'creator-001',
      name: 'Test Creator',
      profileImage: 'https://example.com/image.jpg',
      platform: 'instagram',
      followerCount: 50000,
      engagementRate: 3.5,
      categories: ['Beauty'],
      joinedAt: '2024-01-01T00:00:00Z',
      totalSales: 0,
      totalRevenue: 0,
    },
  ],
}));

import { getCreatorStats } from '@/data';

describe('getCreatorStats edge cases - no sales', () => {
  it('should return default stats for creator with no sales', () => {
    const stats = getCreatorStats('creator-001');
    expect(stats).toEqual({
      totalSales: 0,
      totalRevenue: 0,
      totalCommission: 0,
      averageConversionRate: 0,
      topCategory: null,
      topProduct: null,
    });
  });
});
