import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as matchCreators } from '@/app/api/match/creators/route';
import { NextRequest } from 'next/server';
import type { Creator, Product } from '@/types';

// Mock the data layer
vi.mock('@/data', () => ({
  getProductById: vi.fn(),
  getCreators: vi.fn(),
  getSalesByCreator: vi.fn(),
}));

// Mock the analysis module
vi.mock('@/lib/analysis', () => ({
  matchCreatorsToProduct: vi.fn(),
}));

import { getProductById, getCreators } from '@/data';
import { matchCreatorsToProduct } from '@/lib/analysis';

describe('POST /api/match/creators', () => {
  const mockProduct: Product = {
    id: 'product-001',
    name: '글로우 세럼',
    brand: 'GlowCo',
    category: 'Beauty',
    subcategory: 'Skincare',
    price: 45000,
    originalPrice: 60000,
    description: 'Premium glow serum for radiant skin',
    imageUrl: 'https://example.com/glow-serum.jpg',
    tags: ['skincare', 'glow', 'anti-aging'],
    targetAudience: ['20-30대 여성', '스킨케어 관심층'],
    seasonality: ['spring', 'summer'],
    avgCommissionRate: 0.15,
  };

  const mockCreators: Creator[] = [
    {
      id: 'creator-001',
      name: '뷰티맘',
      profileImage: 'https://example.com/beautymom.jpg',
      platform: 'Instagram',
      followers: 150000,
      engagementRate: 4.2,
      categories: ['Beauty', 'Lifestyle'],
      email: 'beautymom@example.com',
      joinedAt: '2023-06-15T00:00:00Z',
      totalSales: 450,
      totalRevenue: 15000000,
    },
    {
      id: 'creator-002',
      name: '패션킹',
      profileImage: 'https://example.com/fashionking.jpg',
      platform: 'YouTube',
      followers: 200000,
      engagementRate: 3.8,
      categories: ['Fashion', 'Beauty'],
      email: 'fashionking@example.com',
      joinedAt: '2023-03-20T00:00:00Z',
      totalSales: 320,
      totalRevenue: 12000000,
    },
  ];

  const mockMatches = [
    {
      creator: mockCreators[0],
      matchScore: 88,
      matchBreakdown: {
        categoryFit: 95,
        priceFit: 85,
        seasonFit: 90,
        audienceFit: 82,
      },
      predictedRevenue: {
        minimum: 800000,
        expected: 1200000,
        maximum: 1800000,
        predictedQuantity: 30,
        predictedCommission: 180000,
        basis: '월평균 30건 판매 기준',
      },
      reasoning: '뷰티맘님은 주력 카테고리(Beauty)에서 활동하며, 평균 주문 가치 42,000원으로 제품 가격대와 매우 유사합니다.',
      confidence: 85,
    },
    {
      creator: mockCreators[1],
      matchScore: 72,
      matchBreakdown: {
        categoryFit: 80,
        priceFit: 70,
        seasonFit: 75,
        audienceFit: 65,
      },
      predictedRevenue: {
        minimum: 600000,
        expected: 900000,
        maximum: 1350000,
        predictedQuantity: 20,
        predictedCommission: 135000,
        basis: '월평균 20건 판매 기준',
      },
      reasoning: '패션킹님은 관련 카테고리(Beauty)에서 활동하며, 평균 주문 가치 38,000원으로 제품 가격대와 적절한 범위입니다.',
      confidence: 72,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return matched creators for valid product', async () => {
    vi.mocked(getProductById).mockReturnValue(mockProduct);
    vi.mocked(getCreators).mockReturnValue(mockCreators);
    vi.mocked(matchCreatorsToProduct).mockResolvedValue(mockMatches);

    const request = new NextRequest('http://localhost:3000/api/match/creators', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productId: 'product-001', limit: 10 }),
    });

    const response = await matchCreators(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.data.length).toBe(2);
    expect(data.data[0].creator.id).toBe('creator-001');
    expect(data.data[0].matchScore).toBe(88);
  });

  it('should return 404 for non-existent product', async () => {
    vi.mocked(getProductById).mockReturnValue(undefined);

    const request = new NextRequest('http://localhost:3000/api/match/creators', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productId: 'product-999' }),
    });

    const response = await matchCreators(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('NOT_FOUND');
    expect(data.error.message).toBe('제품을 찾을 수 없습니다.');
  });

  it('should return 400 for missing productId', async () => {
    const request = new NextRequest('http://localhost:3000/api/match/creators', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    const response = await matchCreators(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INVALID_REQUEST');
    expect(data.error.message).toBe('잘못된 요청입니다.');
    expect(data.error.details).toBeDefined();
  });

  it('should return 400 for invalid request body (bad productId type)', async () => {
    const request = new NextRequest('http://localhost:3000/api/match/creators', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productId: 12345 }), // Number instead of string
    });

    const response = await matchCreators(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INVALID_REQUEST');
  });

  it('should return 400 for empty productId', async () => {
    const request = new NextRequest('http://localhost:3000/api/match/creators', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productId: '' }),
    });

    const response = await matchCreators(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INVALID_REQUEST');
  });

  it('should return 500 on internal error', async () => {
    vi.mocked(getProductById).mockImplementation(() => {
      throw new Error('Database connection failed');
    });

    const request = new NextRequest('http://localhost:3000/api/match/creators', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productId: 'product-001' }),
    });

    const response = await matchCreators(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INTERNAL_ERROR');
    expect(data.error.message).toBe('서버 오류가 발생했습니다.');
  });

  it('should pass limit parameter to matchCreatorsToProduct', async () => {
    vi.mocked(getProductById).mockReturnValue(mockProduct);
    vi.mocked(getCreators).mockReturnValue(mockCreators);
    vi.mocked(matchCreatorsToProduct).mockResolvedValue([mockMatches[0]]);

    const request = new NextRequest('http://localhost:3000/api/match/creators', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productId: 'product-001', limit: 5 }),
    });

    await matchCreators(request);

    expect(matchCreatorsToProduct).toHaveBeenCalledWith(
      mockProduct,
      mockCreators,
      5
    );
  });

  it('should use default limit of 10', async () => {
    vi.mocked(getProductById).mockReturnValue(mockProduct);
    vi.mocked(getCreators).mockReturnValue(mockCreators);
    vi.mocked(matchCreatorsToProduct).mockResolvedValue(mockMatches);

    const request = new NextRequest('http://localhost:3000/api/match/creators', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productId: 'product-001' }),
    });

    await matchCreators(request);

    expect(matchCreatorsToProduct).toHaveBeenCalledWith(
      mockProduct,
      mockCreators,
      10
    );
  });

  it('should return proper response structure { success, data }', async () => {
    vi.mocked(getProductById).mockReturnValue(mockProduct);
    vi.mocked(getCreators).mockReturnValue(mockCreators);
    vi.mocked(matchCreatorsToProduct).mockResolvedValue(mockMatches);

    const request = new NextRequest('http://localhost:3000/api/match/creators', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productId: 'product-001' }),
    });

    const response = await matchCreators(request);
    const data = await response.json();

    expect(data).toHaveProperty('success');
    expect(data).toHaveProperty('data');
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  });

  it('should include all required fields in creator match', async () => {
    vi.mocked(getProductById).mockReturnValue(mockProduct);
    vi.mocked(getCreators).mockReturnValue(mockCreators);
    vi.mocked(matchCreatorsToProduct).mockResolvedValue(mockMatches);

    const request = new NextRequest('http://localhost:3000/api/match/creators', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productId: 'product-001' }),
    });

    const response = await matchCreators(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    const match = data.data[0];
    expect(match).toHaveProperty('creator');
    expect(match).toHaveProperty('matchScore');
    expect(match).toHaveProperty('matchBreakdown');
    expect(match).toHaveProperty('predictedRevenue');
    expect(match).toHaveProperty('reasoning');
    expect(match).toHaveProperty('confidence');
  });

  it('should have valid match scores', async () => {
    vi.mocked(getProductById).mockReturnValue(mockProduct);
    vi.mocked(getCreators).mockReturnValue(mockCreators);
    vi.mocked(matchCreatorsToProduct).mockResolvedValue(mockMatches);

    const request = new NextRequest('http://localhost:3000/api/match/creators', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productId: 'product-001' }),
    });

    const response = await matchCreators(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    data.data.forEach((match: any) => {
      expect(match.matchScore).toBeGreaterThanOrEqual(0);
      expect(match.matchScore).toBeLessThanOrEqual(100);
      expect(match.matchBreakdown.categoryFit).toBeGreaterThanOrEqual(0);
      expect(match.matchBreakdown.categoryFit).toBeLessThanOrEqual(100);
      expect(match.matchBreakdown.priceFit).toBeGreaterThanOrEqual(0);
      expect(match.matchBreakdown.priceFit).toBeLessThanOrEqual(100);
      expect(match.matchBreakdown.seasonFit).toBeGreaterThanOrEqual(0);
      expect(match.matchBreakdown.seasonFit).toBeLessThanOrEqual(100);
      expect(match.matchBreakdown.audienceFit).toBeGreaterThanOrEqual(0);
      expect(match.matchBreakdown.audienceFit).toBeLessThanOrEqual(100);
    });
  });

  it('should include revenue predictions', async () => {
    vi.mocked(getProductById).mockReturnValue(mockProduct);
    vi.mocked(getCreators).mockReturnValue(mockCreators);
    vi.mocked(matchCreatorsToProduct).mockResolvedValue(mockMatches);

    const request = new NextRequest('http://localhost:3000/api/match/creators', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productId: 'product-001' }),
    });

    const response = await matchCreators(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    const match = data.data[0];
    expect(match.predictedRevenue).toHaveProperty('minimum');
    expect(match.predictedRevenue).toHaveProperty('expected');
    expect(match.predictedRevenue).toHaveProperty('maximum');
    expect(match.predictedRevenue).toHaveProperty('predictedQuantity');
    expect(match.predictedRevenue).toHaveProperty('predictedCommission');
    expect(match.predictedRevenue).toHaveProperty('basis');
    expect(match.predictedRevenue.minimum).toBeLessThanOrEqual(match.predictedRevenue.expected);
    expect(match.predictedRevenue.expected).toBeLessThanOrEqual(match.predictedRevenue.maximum);
  });

  it('should return matches sorted by matchScore descending', async () => {
    vi.mocked(getProductById).mockReturnValue(mockProduct);
    vi.mocked(getCreators).mockReturnValue(mockCreators);
    vi.mocked(matchCreatorsToProduct).mockResolvedValue(mockMatches);

    const request = new NextRequest('http://localhost:3000/api/match/creators', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productId: 'product-001' }),
    });

    const response = await matchCreators(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data[0].matchScore).toBe(88);
    expect(data.data[1].matchScore).toBe(72);
    expect(data.data[0].matchScore).toBeGreaterThan(data.data[1].matchScore);
  });
});
