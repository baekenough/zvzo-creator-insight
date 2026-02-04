import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  preprocessCreatorData,
  analyzeCreator,
  analyzeCreatorWithData,
  matchProducts,
  matchProductsWithData,
  clearCache,
  invalidateCreatorCache,
} from '../../../src/lib/analysis';
import type { Creator, SaleRecord, Product } from '../../../src/types';
import { OpenAIError } from '../../../src/lib/openai';

// Mock the OpenAI module
vi.mock('../../../src/lib/openai', () => ({
  callOpenAI: vi.fn(),
  OpenAIError: class OpenAIError extends Error {
    constructor(
      message: string,
      public code: string,
      public status?: number,
      public originalError?: unknown
    ) {
      super(message);
      this.name = 'OpenAIError';
    }
  },
}));

import { callOpenAI } from '../../../src/lib/openai';

describe('preprocessCreatorData', () => {
  const mockCreator: any = {
    id: 'creator-001',
    name: 'Test Creator',
    profileImage: 'https://example.com/image.jpg',
    platform: 'instagram',
    followers: 50000,
    engagementRate: 3.5,
    categories: ['Beauty', 'Fashion'],
    joinedAt: '2024-01-01T00:00:00Z',
    totalSales: 100,
    totalRevenue: 5000000,
  };

  const mockSales: any[] = [
    {
      id: 'sale-001',
      productId: 'product-001',
      productName: 'Lipstick A',
      category: 'Beauty',
      price: 30000,
      originalPrice: 35000,
      discountRate: 14.29,
      quantity: 5,
      revenue: 150000,
      commission: 15000,
      commissionRate: 10,
      date: '2024-03-15T00:00:00Z',
      platform: 'instagram',
      season: 'Spring',
    },
    {
      id: 'sale-002',
      productId: 'product-002',
      productName: 'Dress B',
      category: 'Fashion',
      price: 80000,
      originalPrice: 100000,
      discountRate: 20,
      quantity: 3,
      revenue: 240000,
      commission: 24000,
      commissionRate: 10,
      date: '2024-06-20T00:00:00Z',
      platform: 'instagram',
      season: 'Summer',
    },
    {
      id: 'sale-003',
      productId: 'product-003',
      productName: 'Serum C',
      category: 'Beauty',
      price: 45000,
      originalPrice: 50000,
      discountRate: 10,
      quantity: 10,
      revenue: 450000,
      commission: 45000,
      commissionRate: 10,
      date: '2024-03-22T00:00:00Z',
      platform: 'instagram',
      season: 'Spring',
    },
  ];

  it('should calculate basic summary statistics', () => {
    const result = preprocessCreatorData(mockCreator, mockSales);

    expect(result.summary.totalRevenue).toBe(840000);
    expect(result.summary.totalSales).toBe(18);
    expect(result.summary.averageOrderValue).toBe(840000 / 18);
  });

  it('should create category breakdown with correct revenue shares', () => {
    const result = preprocessCreatorData(mockCreator, mockSales);

    expect(result.categoryBreakdown).toHaveLength(2);

    const beautyCategory = result.categoryBreakdown.find((c) => c.category === 'Beauty');
    expect(beautyCategory).toBeDefined();
    expect(beautyCategory!.revenue).toBe(600000);
    expect(beautyCategory!.salesCount).toBe(15);
    expect(beautyCategory!.revenueShare).toBeCloseTo(71.43, 1);

    const fashionCategory = result.categoryBreakdown.find((c) => c.category === 'Fashion');
    expect(fashionCategory).toBeDefined();
    expect(fashionCategory!.revenue).toBe(240000);
    expect(fashionCategory!.salesCount).toBe(3);
    expect(fashionCategory!.revenueShare).toBeCloseTo(28.57, 1);
  });

  it('should sort categories by revenue in descending order', () => {
    const result = preprocessCreatorData(mockCreator, mockSales);

    expect(result.categoryBreakdown[0].category).toBe('Beauty');
    expect(result.categoryBreakdown[1].category).toBe('Fashion');
  });

  it('should create price distribution buckets', () => {
    const result = preprocessCreatorData(mockCreator, mockSales);

    expect(result.priceDistribution.length).toBeGreaterThan(0);

    // 30000 and 45000 are in 30000-40000 and 40000-50000 buckets
    // 80000 is in 80000-90000 bucket
    const bucket30k = result.priceDistribution.find((d) => d.priceRange === '30000-40000');
    const bucket40k = result.priceDistribution.find((d) => d.priceRange === '40000-50000');
    const bucket80k = result.priceDistribution.find((d) => d.priceRange === '80000-90000');

    expect(bucket30k).toBeDefined();
    expect(bucket40k).toBeDefined();
    expect(bucket80k).toBeDefined();
  });

  it('should sort price distribution by range', () => {
    const result = preprocessCreatorData(mockCreator, mockSales);

    for (let i = 0; i < result.priceDistribution.length - 1; i++) {
      const currentMin = parseInt(result.priceDistribution[i].priceRange.split('-')[0]);
      const nextMin = parseInt(result.priceDistribution[i + 1].priceRange.split('-')[0]);
      expect(currentMin).toBeLessThan(nextMin);
    }
  });

  it('should create seasonal pattern', () => {
    const result = preprocessCreatorData(mockCreator, mockSales);

    expect(result.seasonalPattern).toHaveLength(2);

    // Seasons are computed from date field, not season field
    // March (month 3) = spring, June (month 6) = summer
    const spring = result.seasonalPattern.find((s) => s.season === 'spring');
    const summer = result.seasonalPattern.find((s) => s.season === 'summer');

    expect(spring).toBeDefined();
    expect(spring!.salesCount).toBe(15);
    expect(spring!.revenue).toBe(600000);

    expect(summer).toBeDefined();
    expect(summer!.salesCount).toBe(3);
    expect(summer!.revenue).toBe(240000);
  });

  it('should aggregate top products', () => {
    const result = preprocessCreatorData(mockCreator, mockSales);

    expect(result.topProducts).toHaveLength(3);
    expect(result.topProducts[0].name).toBe('Serum C'); // Highest revenue
    expect(result.topProducts[0].revenue).toBe(450000);
    expect(result.topProducts[0].salesCount).toBe(10);
  });

  it('should limit top products to 5', () => {
    const manySales: any[] = Array.from({ length: 10 }, (_, i) => ({
      id: `sale-${String(i).padStart(3, '0')}`,
      productId: `product-${String(i).padStart(3, '0')}`,
      productName: `Product ${i}`,
      category: 'Beauty',
      price: 10000 + i * 1000,
      originalPrice: 12000 + i * 1000,
      discountRate: 10,
      quantity: 1,
      revenue: 10000 + i * 1000,
      commission: 1000,
      commissionRate: 10,
      date: '2024-01-01T00:00:00Z',
      platform: 'instagram',
      season: 'Spring',
    }));

    const result = preprocessCreatorData(mockCreator, manySales);
    expect(result.topProducts.length).toBeLessThanOrEqual(5);
  });

  it('should handle multiple sales of same product', () => {
    const duplicateSales: any[] = [
      ...mockSales,
      {
        id: 'sale-004',
        productId: 'product-001',
        productName: 'Lipstick A',
        category: 'Beauty',
        price: 30000,
        originalPrice: 35000,
        discountRate: 14.29,
        quantity: 2,
        revenue: 60000,
        commission: 6000,
        commissionRate: 10,
        date: '2024-04-01T00:00:00Z',
        platform: 'instagram',
        season: 'Spring',
      },
    ];

    const result = preprocessCreatorData(mockCreator, duplicateSales);

    const lipstick = result.topProducts.find((p) => p.name === 'Lipstick A');
    expect(lipstick).toBeDefined();
    expect(lipstick!.salesCount).toBe(7); // 5 + 2
    expect(lipstick!.revenue).toBe(210000); // 150000 + 60000
  });

  it('should handle empty sales array', () => {
    const result = preprocessCreatorData(mockCreator, []);

    expect(result.summary.totalRevenue).toBe(0);
    expect(result.summary.totalSales).toBe(0);
    expect(result.summary.averageOrderValue).toBe(0);
    expect(result.categoryBreakdown).toHaveLength(0);
    expect(result.priceDistribution).toHaveLength(0);
    expect(result.topProducts).toHaveLength(0);
  });

  it('should include creator information', () => {
    const result = preprocessCreatorData(mockCreator, mockSales);

    expect(result.creator.id).toBe(mockCreator.id);
    expect(result.creator.name).toBe(mockCreator.name);
    expect(result.creator.platform).toBe(mockCreator.platform);
    expect(result.creator.followers).toBe(mockCreator.followers);
    expect(result.creator.engagementRate).toBe(mockCreator.engagementRate);
  });
});

describe('analyzeCreator', () => {
  it('should throw error when called without data', async () => {
    await expect(
      analyzeCreator('creator-001')
    ).rejects.toThrow('should be called with creator and sales data from the API route');
  });
});

describe('analyzeCreatorWithData', () => {
  const mockCreator: any = {
    id: 'creator-001',
    name: 'Test Creator',
    profileImage: 'https://example.com/image.jpg',
    platform: 'instagram',
    followers: 50000,
    engagementRate: 3.5,
    categories: ['Beauty', 'Fashion'],
    joinedAt: '2024-01-01T00:00:00Z',
    totalSales: 100,
    totalRevenue: 5000000,
  };

  const mockSales: any[] = Array.from({ length: 10 }, (_, i) => ({
    id: `sale-${String(i).padStart(5, '0')}`,
    productId: `product-${String(i % 3).padStart(3, '0')}`,
    productName: `Product ${i % 3}`,
    category: i % 2 === 0 ? 'Beauty' : 'Fashion',
    price: 30000 + i * 5000,
    originalPrice: 35000 + i * 5000,
    discountRate: 10,
    quantity: 2 + i,
    revenue: (30000 + i * 5000) * (2 + i),
    commission: (30000 + i * 5000) * (2 + i) * 0.1,
    commissionRate: 10,
    date: `2024-0${(i % 9) + 1}-01T00:00:00Z`,
    platform: 'instagram',
    season: ['Spring', 'Summer', 'Fall', 'Winter'][i % 4] as any,
  }));

  beforeEach(() => {
    vi.clearAllMocks();
    clearCache();
  });

  it('should throw error when sales data is insufficient', async () => {
    const fewSales = mockSales.slice(0, 3);

    await expect(
      analyzeCreatorWithData(mockCreator, fewSales)
    ).rejects.toThrow(OpenAIError);

    try {
      await analyzeCreatorWithData(mockCreator, fewSales);
    } catch (error) {
      expect(error).toBeInstanceOf(OpenAIError);
      expect((error as OpenAIError).code).toBe('CREATOR_SALES_EMPTY');
    }
  });

  it('should call OpenAI with preprocessed data and return insight', async () => {
    const mockAIResponse = {
      summary: 'Creator specializes in Beauty products with strong conversion rates.',
      strengths: ['High engagement in Beauty category', 'Consistent sales performance'],
      topCategories: [
        { category: 'Beauty', percentage: 60 },
        { category: 'Fashion', percentage: 40 },
      ],
      priceRange: { min: 30000, max: 75000, average: 52500 },
      seasonalTrends: [
        { season: 'Spring', salesCount: 10, revenue: 500000 },
        { season: 'Summer', salesCount: 8, revenue: 400000 },
      ],
      recommendations: ['Focus on Beauty products', 'Target mid-range prices'],
      confidence: 0.85,
    };

    vi.mocked(callOpenAI).mockResolvedValue(mockAIResponse);

    const result = await analyzeCreatorWithData(mockCreator, mockSales);

    expect(callOpenAI).toHaveBeenCalledTimes(1);
    expect(result.creatorId).toBe(mockCreator.id);
    expect(result.summary).toBe(mockAIResponse.summary);
    expect(result.strengths).toEqual(mockAIResponse.strengths);
    // topCategories format changed to include score, salesCount, totalRevenue
    expect(result.topCategories).toEqual([
      { category: 'Beauty', score: 60, salesCount: 0, totalRevenue: 0 },
      { category: 'Fashion', score: 40, salesCount: 0, totalRevenue: 0 },
    ]);
    expect(result.priceRange).toEqual(mockAIResponse.priceRange);
    expect(result.seasonalTrends).toEqual(mockAIResponse.seasonalTrends);
    expect(result.recommendations).toEqual(mockAIResponse.recommendations);
    expect(result.confidence).toBe(mockAIResponse.confidence);
    expect(result.id).toMatch(/^insight-/);
    expect(result.analyzedAt).toBeDefined();
  });

  it('should use cache on subsequent calls', async () => {
    const mockAIResponse = {
      summary: 'Test summary',
      strengths: ['Strength 1'],
      topCategories: [{ category: 'Beauty', percentage: 100 }],
      priceRange: { min: 10000, max: 50000, average: 30000 },
      seasonalTrends: [],
      recommendations: ['Rec 1'],
      confidence: 0.9,
    };

    vi.mocked(callOpenAI).mockResolvedValue(mockAIResponse);

    // First call
    const result1 = await analyzeCreatorWithData(mockCreator, mockSales);

    // Second call (should use cache)
    const result2 = await analyzeCreatorWithData(mockCreator, mockSales);

    expect(callOpenAI).toHaveBeenCalledTimes(1); // Only called once
    expect(result1).toEqual(result2);
  });

  it('should pass correct system and user prompts to OpenAI', async () => {
    const mockAIResponse = {
      summary: 'Test',
      strengths: ['Test'],
      topCategories: [{ category: 'Beauty', percentage: 100 }],
      priceRange: { min: 10000, max: 50000, average: 30000 },
      seasonalTrends: [],
      recommendations: ['Test'],
      confidence: 0.8,
    };

    vi.mocked(callOpenAI).mockResolvedValue(mockAIResponse);

    await analyzeCreatorWithData(mockCreator, mockSales);

    const callArgs = vi.mocked(callOpenAI).mock.calls[0];
    const systemPrompt = callArgs[0];
    const userPrompt = callArgs[1];

    expect(systemPrompt).toContain('크리에이터 판매 데이터 분석 전문가');
    expect(systemPrompt).toContain('JSON 형식으로 응답');
    expect(userPrompt).toContain(mockCreator.name);
    expect(userPrompt).toContain(mockCreator.platform);
  });

  it('should use correct OpenAI options', async () => {
    const mockAIResponse = {
      summary: 'Test',
      strengths: ['Test'],
      topCategories: [{ category: 'Beauty', percentage: 100 }],
      priceRange: { min: 10000, max: 50000, average: 30000 },
      seasonalTrends: [],
      recommendations: ['Test'],
      confidence: 0.8,
    };

    vi.mocked(callOpenAI).mockResolvedValue(mockAIResponse);

    await analyzeCreatorWithData(mockCreator, mockSales);

    const callArgs = vi.mocked(callOpenAI).mock.calls[0];
    const options = callArgs[3];

    expect(options).toEqual({
      temperature: 0.3,
      maxTokens: 2000,
    });
  });
});

describe('matchProducts', () => {
  it('should throw error when called without data', async () => {
    await expect(
      matchProducts('creator-001', 10)
    ).rejects.toThrow('should be called with full data from the API route');
  });
});

describe('matchProductsWithData', () => {
  const mockCreator: any = {
    id: 'creator-001',
    name: 'Test Creator',
    profileImage: 'https://example.com/image.jpg',
    platform: 'instagram',
    followers: 50000,
    engagementRate: 3.5,
    categories: ['Beauty', 'Fashion'],
    joinedAt: '2024-01-01T00:00:00Z',
    totalSales: 100,
    totalRevenue: 5000000,
  };

  const mockSales: any[] = Array.from({ length: 10 }, (_, i) => ({
    id: `sale-${String(i).padStart(5, '0')}`,
    productId: `product-${String(i % 3).padStart(3, '0')}`,
    productName: `Product ${i % 3}`,
    category: 'Beauty',
    price: 30000,
    originalPrice: 35000,
    discountRate: 10,
    quantity: 2,
    revenue: 60000,
    commission: 6000,
    commissionRate: 10,
    date: '2024-01-01T00:00:00Z',
    platform: 'instagram',
    season: 'Spring',
  }));

  const mockProducts: any[] = [
    {
      id: 'product-001',
      name: 'Lipstick Pro',
      category: 'Beauty',
      price: 35000,
      stock: 100,
      seasonality: ['spring', 'summer'],
    },
    {
      id: 'product-002',
      name: 'Face Cream',
      category: 'Beauty',
      price: 50000,
      stock: 50,
      seasonality: ['winter', 'fall'],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    clearCache();
  });

  it('should throw error when sales data is insufficient', async () => {
    const fewSales = mockSales.slice(0, 3);

    await expect(
      matchProductsWithData(mockCreator, fewSales, mockProducts)
    ).rejects.toThrow(OpenAIError);

    try {
      await matchProductsWithData(mockCreator, fewSales, mockProducts);
    } catch (error) {
      expect(error).toBeInstanceOf(OpenAIError);
      expect((error as OpenAIError).code).toBe('CREATOR_SALES_EMPTY');
    }
  });

  it('should throw error when product catalog is empty', async () => {
    await expect(
      matchProductsWithData(mockCreator, mockSales, [])
    ).rejects.toThrow(OpenAIError);

    try {
      await matchProductsWithData(mockCreator, mockSales, []);
    } catch (error) {
      expect(error).toBeInstanceOf(OpenAIError);
      expect((error as OpenAIError).code).toBe('PRODUCT_CATALOG_EMPTY');
    }
  });

  it('should call OpenAI and return matched products', async () => {
    const mockAIResponse = {
      matches: [
        {
          productId: 'product-001',
          matchScore: 85,
          scoreBreakdown: {
            categoryFit: 90,
            priceFit: 80,
            seasonFit: 85,
            audienceFit: 85,
          },
          predictedRevenue: {
            min: 500000,
            max: 1000000,
            average: 750000,
          },
          reasoning: 'Perfect fit for creator audience and category expertise',
        },
      ],
    };

    vi.mocked(callOpenAI).mockResolvedValue(mockAIResponse);

    const result = await matchProductsWithData(mockCreator, mockSales, mockProducts, 10);

    expect(callOpenAI).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(1);
    expect(result[0].product.id).toBe('product-001');
    expect(result[0].matchScore).toBe(85);
    expect(result[0].matchBreakdown).toEqual(mockAIResponse.matches[0].scoreBreakdown);
    expect(result[0].scoreBreakdown).toEqual(mockAIResponse.matches[0].scoreBreakdown);
    expect(result[0].predictedRevenue).toEqual({
      minimum: 500000,
      expected: 750000,
      maximum: 1000000,
      predictedQuantity: 0,
      predictedCommission: 0,
      basis: 'AI analysis based on creator sales history',
    });
    expect(result[0].reasoning).toBe(mockAIResponse.matches[0].reasoning);
    expect(result[0].confidence).toBe(0.85);
  });

  it('should filter out matches for non-existent products', async () => {
    const mockAIResponse = {
      matches: [
        {
          productId: 'product-001',
          matchScore: 85,
          scoreBreakdown: { categoryFit: 90, priceFit: 80, seasonFit: 85, audienceFit: 85 },
          predictedRevenue: { min: 500000, max: 1000000, average: 750000 },
          reasoning: 'Good match',
        },
        {
          productId: 'product-999', // Non-existent
          matchScore: 90,
          scoreBreakdown: { categoryFit: 95, priceFit: 85, seasonFit: 90, audienceFit: 90 },
          predictedRevenue: { min: 600000, max: 1200000, average: 900000 },
          reasoning: 'Great match',
        },
      ],
    };

    vi.mocked(callOpenAI).mockResolvedValue(mockAIResponse);

    const result = await matchProductsWithData(mockCreator, mockSales, mockProducts, 10);

    expect(result).toHaveLength(1);
    expect(result[0].product.id).toBe('product-001');
  });

  it('should sort matches by score in descending order', async () => {
    const mockAIResponse = {
      matches: [
        {
          productId: 'product-001',
          matchScore: 75,
          scoreBreakdown: { categoryFit: 70, priceFit: 80, seasonFit: 75, audienceFit: 75 },
          predictedRevenue: { min: 400000, max: 800000, average: 600000 },
          reasoning: 'Good match',
        },
        {
          productId: 'product-002',
          matchScore: 90,
          scoreBreakdown: { categoryFit: 95, priceFit: 85, seasonFit: 90, audienceFit: 90 },
          predictedRevenue: { min: 600000, max: 1200000, average: 900000 },
          reasoning: 'Great match',
        },
      ],
    };

    vi.mocked(callOpenAI).mockResolvedValue(mockAIResponse);

    const result = await matchProductsWithData(mockCreator, mockSales, mockProducts, 10);

    expect(result[0].product.id).toBe('product-002'); // Higher score first
    expect(result[1].product.id).toBe('product-001');
  });

  it('should respect the limit parameter', async () => {
    const mockAIResponse = {
      matches: [
        {
          productId: 'product-001',
          matchScore: 85,
          scoreBreakdown: { categoryFit: 90, priceFit: 80, seasonFit: 85, audienceFit: 85 },
          predictedRevenue: { min: 500000, max: 1000000, average: 750000 },
          reasoning: 'Good match',
        },
        {
          productId: 'product-002',
          matchScore: 80,
          scoreBreakdown: { categoryFit: 85, priceFit: 75, seasonFit: 80, audienceFit: 80 },
          predictedRevenue: { min: 400000, max: 800000, average: 600000 },
          reasoning: 'Good match',
        },
      ],
    };

    vi.mocked(callOpenAI).mockResolvedValue(mockAIResponse);

    const result = await matchProductsWithData(mockCreator, mockSales, mockProducts, 1);

    expect(result).toHaveLength(1);
    expect(result[0].product.id).toBe('product-001'); // Highest score
  });

  it('should use cache on subsequent calls', async () => {
    const mockAIResponse = {
      matches: [
        {
          productId: 'product-001',
          matchScore: 85,
          scoreBreakdown: { categoryFit: 90, priceFit: 80, seasonFit: 85, audienceFit: 85 },
          predictedRevenue: { min: 500000, max: 1000000, average: 750000 },
          reasoning: 'Good match',
        },
      ],
    };

    vi.mocked(callOpenAI).mockResolvedValue(mockAIResponse);

    // First call
    const result1 = await matchProductsWithData(mockCreator, mockSales, mockProducts, 10);

    // Second call (should use cache)
    const result2 = await matchProductsWithData(mockCreator, mockSales, mockProducts, 10);

    expect(callOpenAI).toHaveBeenCalledTimes(1); // Only called once
    expect(result1).toEqual(result2);
  });

  it('should pass correct prompts to OpenAI', async () => {
    const mockAIResponse = {
      matches: [],
    };

    vi.mocked(callOpenAI).mockResolvedValue(mockAIResponse);

    await matchProductsWithData(mockCreator, mockSales, mockProducts, 5);

    const callArgs = vi.mocked(callOpenAI).mock.calls[0];
    const systemPrompt = callArgs[0];
    const userPrompt = callArgs[1];

    expect(systemPrompt).toContain('제품-크리에이터 매칭 전문가');
    expect(systemPrompt).toContain('categoryFit');
    expect(userPrompt).toContain(mockCreator.name);
    expect(userPrompt).toContain('최대 5개까지');
  });

  it('should use correct OpenAI options', async () => {
    const mockAIResponse = {
      matches: [],
    };

    vi.mocked(callOpenAI).mockResolvedValue(mockAIResponse);

    await matchProductsWithData(mockCreator, mockSales, mockProducts, 10);

    const callArgs = vi.mocked(callOpenAI).mock.calls[0];
    const options = callArgs[3];

    expect(options).toEqual({
      temperature: 0.2,
      maxTokens: 3000,
    });
  });
});

describe('Cache management', () => {
  const mockCreator: any = {
    id: 'creator-001',
    name: 'Test Creator',
    profileImage: 'https://example.com/image.jpg',
    platform: 'instagram',
    followers: 50000,
    engagementRate: 3.5,
    categories: ['Beauty'],
    joinedAt: '2024-01-01T00:00:00Z',
    totalSales: 100,
    totalRevenue: 5000000,
  };

  const mockSales: any[] = Array.from({ length: 10 }, (_, i) => ({
    id: `sale-${String(i).padStart(5, '0')}`,
    productId: `product-${String(i).padStart(3, '0')}`,
    productName: `Product ${i}`,
    category: 'Beauty',
    price: 30000,
    originalPrice: 35000,
    discountRate: 10,
    quantity: 2,
    revenue: 60000,
    commission: 6000,
    commissionRate: 10,
    date: '2024-01-01T00:00:00Z',
    platform: 'instagram',
    season: 'Spring',
  }));

  const mockProducts: any[] = [
    {
      id: 'product-001',
      name: 'Test Product',
      category: 'Beauty',
      price: 35000,
      stock: 100,
      seasonality: ['spring', 'summer'],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    clearCache();
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should clear all cache', async () => {
    const mockAIResponse = {
      summary: 'Test',
      strengths: ['Test'],
      topCategories: [{ category: 'Beauty', percentage: 100 }],
      priceRange: { min: 10000, max: 50000, average: 30000 },
      seasonalTrends: [],
      recommendations: ['Test'],
      confidence: 0.8,
    };

    vi.mocked(callOpenAI).mockResolvedValue(mockAIResponse);

    // Cache a result
    await analyzeCreatorWithData(mockCreator, mockSales);
    expect(callOpenAI).toHaveBeenCalledTimes(1);

    // Clear cache
    clearCache();

    // Should call API again
    await analyzeCreatorWithData(mockCreator, mockSales);
    expect(callOpenAI).toHaveBeenCalledTimes(2);
  });

  it('should invalidate cache for specific creator', async () => {
    const mockAIResponse1 = {
      summary: 'Test 1',
      strengths: ['Test'],
      topCategories: [{ category: 'Beauty', percentage: 100 }],
      priceRange: { min: 10000, max: 50000, average: 30000 },
      seasonalTrends: [],
      recommendations: ['Test'],
      confidence: 0.8,
    };

    const mockAIResponse2 = {
      matches: [
        {
          productId: 'product-001',
          matchScore: 85,
          scoreBreakdown: { categoryFit: 90, priceFit: 80, seasonFit: 85, audienceFit: 85 },
          predictedRevenue: { min: 500000, max: 1000000, average: 750000 },
          reasoning: 'Good match',
        },
      ],
    };

    vi.mocked(callOpenAI)
      .mockResolvedValueOnce(mockAIResponse1)
      .mockResolvedValueOnce(mockAIResponse2);

    // Cache both results
    await analyzeCreatorWithData(mockCreator, mockSales);
    await matchProductsWithData(mockCreator, mockSales, mockProducts, 10);
    expect(callOpenAI).toHaveBeenCalledTimes(2);

    // Invalidate creator cache
    invalidateCreatorCache(mockCreator.id);

    vi.mocked(callOpenAI)
      .mockResolvedValueOnce(mockAIResponse1)
      .mockResolvedValueOnce(mockAIResponse2);

    // Both should call API again
    await analyzeCreatorWithData(mockCreator, mockSales);
    await matchProductsWithData(mockCreator, mockSales, mockProducts, 10);
    expect(callOpenAI).toHaveBeenCalledTimes(4);
  });

  it('should not return expired cache entries', async () => {
    const mockAIResponse = {
      summary: 'Test',
      strengths: ['Test'],
      topCategories: [{ category: 'Beauty', percentage: 100 }],
      priceRange: { min: 10000, max: 50000, average: 30000 },
      seasonalTrends: [],
      recommendations: ['Test'],
      confidence: 0.8,
    };

    vi.mocked(callOpenAI).mockResolvedValue(mockAIResponse);

    // First call to cache the result
    await analyzeCreatorWithData(mockCreator, mockSales);
    expect(callOpenAI).toHaveBeenCalledTimes(1);

    // Advance time beyond cache TTL (5 minutes + 1 ms)
    vi.useFakeTimers();
    vi.advanceTimersByTime(5 * 60 * 1000 + 1);

    // Second call should NOT use expired cache
    await analyzeCreatorWithData(mockCreator, mockSales);
    expect(callOpenAI).toHaveBeenCalledTimes(2);

    vi.useRealTimers();
  });
});
