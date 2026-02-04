import { describe, it, expect, vi } from 'vitest';
import { POST as analyzeCreator } from '@/app/api/analyze/route';
import { NextRequest } from 'next/server';

describe('POST /api/analyze', () => {
  it('should analyze creator successfully', async () => {
    const request = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ creatorId: 'creator-001' }),
    });

    const response = await analyzeCreator(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(data.data.creatorId).toBe('creator-001');
    expect(data.data.summary).toBeDefined();
    expect(Array.isArray(data.data.strengths)).toBe(true);
    expect(Array.isArray(data.data.topCategories)).toBe(true);
    expect(Array.isArray(data.data.recommendations)).toBe(true);
  });

  it('should return 404 for non-existent creator', async () => {
    const request = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ creatorId: 'creator-999' }),
    });

    const response = await analyzeCreator(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('NOT_FOUND');
  });

  it('should return 400 for invalid creatorId format', async () => {
    const request = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ creatorId: 'invalid-id' }),
    });

    const response = await analyzeCreator(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INVALID_REQUEST');
  });

  it('should include required insight fields', async () => {
    const request = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ creatorId: 'creator-001' }),
    });

    const response = await analyzeCreator(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('id');
    expect(data.data).toHaveProperty('creatorId');
    expect(data.data).toHaveProperty('summary');
    expect(data.data).toHaveProperty('strengths');
    expect(data.data).toHaveProperty('topCategories');
    expect(data.data).toHaveProperty('priceRange');
    expect(data.data).toHaveProperty('seasonalTrends');
    expect(data.data).toHaveProperty('recommendations');
    expect(data.data).toHaveProperty('confidence');
    expect(data.data).toHaveProperty('analyzedAt');
  });

  it('should have valid confidence value', async () => {
    const request = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ creatorId: 'creator-001' }),
    });

    const response = await analyzeCreator(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data.confidence).toBeGreaterThanOrEqual(0);
    expect(data.data.confidence).toBeLessThanOrEqual(1);
  });
});

describe('POST /api/analyze - INSUFFICIENT_DATA', () => {
  it('should return 400 when creator has fewer than 5 sales records', async () => {
    // Spy on getSalesByCreator to return insufficient data
    const dataModule = await import('@/data');
    const spy = vi.spyOn(dataModule, 'getSalesByCreator').mockReturnValue([
      { id: 'sale-1', creatorId: 'creator-001', productId: 'product-1', quantity: 1, revenue: 50000, commission: 7500, conversionRate: 0.05, soldAt: '2024-01-01' },
      { id: 'sale-2', creatorId: 'creator-001', productId: 'product-2', quantity: 1, revenue: 30000, commission: 4500, conversionRate: 0.04, soldAt: '2024-01-02' },
    ]);

    const request = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ creatorId: 'creator-001' }),
    });

    const response = await analyzeCreator(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INSUFFICIENT_DATA');
    expect(data.error.message).toContain('최소 5건 필요');

    spy.mockRestore();
  });
});

describe('POST /api/analyze - Error Handling', () => {
  it('should handle ZodError for missing creatorId', async () => {
    const request = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}), // Missing creatorId
    });

    const response = await analyzeCreator(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INVALID_REQUEST');
    expect(data.error.details).toBeDefined();
  });

  it('should handle ZodError for invalid creatorId type', async () => {
    const request = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ creatorId: 12345 }), // Number instead of string
    });

    const response = await analyzeCreator(request);
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

    const request = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ creatorId: 'creator-001' }),
    });

    const response = await analyzeCreator(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INTERNAL_ERROR');

    spy.mockRestore();
  });
});
