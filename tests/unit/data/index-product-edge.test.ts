import { describe, it, expect, vi } from 'vitest';

// Mock products to return empty array
vi.mock('@/data/products', () => ({
  products: [],
}));

// Mock sales history with sales for a product that doesn't exist
vi.mock('@/data/sales-history', () => ({
  salesHistory: [
    {
      id: 'sale-test-1',
      creatorId: 'creator-001',
      productId: 'nonexistent-product-1',
      productName: 'Test Product 1',
      category: 'Beauty',
      price: 30000,
      originalPrice: 35000,
      discountRate: 14.29,
      quantity: 5,
      revenue: 150000,
      commission: 15000,
      commissionRate: 10,
      conversionRate: 3.5,
      date: '2024-01-15',
      platform: 'instagram',
      season: 'Spring',
    },
    {
      id: 'sale-test-2',
      creatorId: 'creator-001',
      productId: 'nonexistent-product-2',
      productName: 'Test Product 2',
      category: 'Fashion',
      price: 50000,
      originalPrice: 60000,
      discountRate: 16.67,
      quantity: 3,
      revenue: 150000,
      commission: 15000,
      commissionRate: 10,
      conversionRate: 4.2,
      date: '2024-02-20',
      platform: 'instagram',
      season: 'Spring',
    },
  ],
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
      categories: ['Beauty', 'Fashion'],
      joinedAt: '2024-01-01T00:00:00Z',
      totalSales: 8,
      totalRevenue: 300000,
    },
  ],
}));

import { getCreatorStats } from '@/data';

describe('getCreatorStats edge cases - missing products', () => {
  it('should handle sales with non-existent products', () => {
    const stats = getCreatorStats('creator-001');

    expect(stats).not.toBeNull();

    if (stats) {
      // Should have sales data
      expect(stats.totalSales).toBe(8);
      expect(stats.totalRevenue).toBe(300000);

      // topCategory should be null since product lookup fails
      // (categoryCounts stays empty when getProductById returns undefined)
      expect(stats.topCategory).toBeNull();

      // topProduct should have productId but name should be 'Unknown'
      // (productCounts gets populated with sale.productId, but getProductById returns undefined)
      expect(stats.topProduct).not.toBeNull();
      if (stats.topProduct) {
        expect(stats.topProduct.name).toBe('Unknown');
        expect(stats.topProduct.salesCount).toBeGreaterThan(0);
      }
    }
  });
});
