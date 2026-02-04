import { describe, it, expect, vi } from 'vitest';
import { POST as matchProducts } from '@/app/api/match/route';
import { NextRequest } from 'next/server';

describe('POST /api/match', () => {
  it('should return product matches', async () => {
    const request = new NextRequest('http://localhost:3000/api/match', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ creatorId: 'creator-001', limit: 5 }),
    });

    const response = await matchProducts(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.data.length).toBeGreaterThan(0);
    expect(data.data.length).toBeLessThanOrEqual(5);
  });

  it('should return 404 for non-existent creator', async () => {
    const request = new NextRequest('http://localhost:3000/api/match', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ creatorId: 'creator-999' }),
    });

    const response = await matchProducts(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('NOT_FOUND');
  });

  it('should respect limit parameter', async () => {
    const request = new NextRequest('http://localhost:3000/api/match', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ creatorId: 'creator-001', limit: 3 }),
    });

    const response = await matchProducts(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data.length).toBeLessThanOrEqual(3);
  });

  it('should include required match fields', async () => {
    const request = new NextRequest('http://localhost:3000/api/match', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ creatorId: 'creator-001' }),
    });

    const response = await matchProducts(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    const match = data.data[0];
    expect(match).toHaveProperty('product');
    expect(match).toHaveProperty('matchScore');
    expect(match).toHaveProperty('matchBreakdown');
    expect(match).toHaveProperty('predictedRevenue');
    expect(match).toHaveProperty('reasoning');
    expect(match).toHaveProperty('confidence');
  });

  it('should have valid match scores', async () => {
    const request = new NextRequest('http://localhost:3000/api/match', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ creatorId: 'creator-001' }),
    });

    const response = await matchProducts(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    data.data.forEach((match: any) => {
      expect(match.matchScore).toBeGreaterThanOrEqual(0);
      expect(match.matchScore).toBeLessThanOrEqual(100);
      expect(match.matchBreakdown.categoryFit).toBeGreaterThanOrEqual(0);
      expect(match.matchBreakdown.categoryFit).toBeLessThanOrEqual(100);
    });
  });

  it('should include revenue predictions', async () => {
    const request = new NextRequest('http://localhost:3000/api/match', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ creatorId: 'creator-001' }),
    });

    const response = await matchProducts(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    const match = data.data[0];
    expect(match.predictedRevenue).toHaveProperty('minimum');
    expect(match.predictedRevenue).toHaveProperty('expected');
    expect(match.predictedRevenue).toHaveProperty('maximum');
    expect(match.predictedRevenue.minimum).toBeLessThanOrEqual(match.predictedRevenue.expected);
    expect(match.predictedRevenue.expected).toBeLessThanOrEqual(match.predictedRevenue.maximum);
  });
});

describe('POST /api/match - INSUFFICIENT_DATA', () => {
  it('should return 400 when creator has fewer than 5 sales records', async () => {
    // Spy on getSalesByCreator to return insufficient data
    const dataModule = await import('@/data');
    const spy = vi.spyOn(dataModule, 'getSalesByCreator').mockReturnValue([
      { id: 'sale-1', creatorId: 'creator-001', productId: 'product-1', productName: 'Product 1', category: 'Beauty', price: 50000, originalPrice: 60000, discountRate: 16.67, quantity: 1, revenue: 50000, commission: 7500, commissionRate: 15, conversionRate: 0.05, clickCount: 100, date: '2024-01-01', platform: 'Instagram' },
      { id: 'sale-2', creatorId: 'creator-001', productId: 'product-2', productName: 'Product 2', category: 'Beauty', price: 30000, originalPrice: 35000, discountRate: 14.29, quantity: 2, revenue: 60000, commission: 9000, commissionRate: 15, conversionRate: 0.06, clickCount: 150, date: '2024-01-02', platform: 'Instagram' },
    ]);

    const request = new NextRequest('http://localhost:3000/api/match', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ creatorId: 'creator-001' }),
    });

    const response = await matchProducts(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INSUFFICIENT_DATA');
    expect(data.error.message).toContain('최소 5건 필요');

    spy.mockRestore();
  });
});

describe('POST /api/match - Error Handling', () => {
  it('should handle ZodError for missing creatorId', async () => {
    const request = new NextRequest('http://localhost:3000/api/match', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}), // Missing creatorId
    });

    const response = await matchProducts(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INVALID_REQUEST');
    expect(data.error.details).toBeDefined();
  });

  it('should handle ZodError for invalid creatorId type', async () => {
    const request = new NextRequest('http://localhost:3000/api/match', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ creatorId: 99999 }), // Number instead of string
    });

    const response = await matchProducts(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INVALID_REQUEST');
  });

  it('should handle generic errors', async () => {
    // Spy on getCreatorById to throw an error
    const dataModule = await import('@/data');
    const spy = vi.spyOn(dataModule, 'getCreatorById').mockImplementation(() => {
      throw new Error('Database connection failed');
    });

    const request = new NextRequest('http://localhost:3000/api/match', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ creatorId: 'creator-001' }),
    });

    const response = await matchProducts(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INTERNAL_ERROR');

    spy.mockRestore();
  });
});
