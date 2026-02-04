import { describe, it, expect } from 'vitest';
import {
  PlatformSchema,
  CategorySchema,
  SeasonSchema,
  CreatorSchema,
  ProductSchema,
  SaleRecordSchema,
  CategoryScoreSchema,
  PriceBucketSchema,
  SeasonalDataSchema,
  CreatorInsightSchema,
  ProductMatchSchema,
  RevenuePredictionSchema,
  GetCreatorInsightRequestSchema,
  GetCreatorInsightResponseSchema,
  GetProductMatchesRequestSchema,
  GetProductMatchesResponseSchema,
  GetRevenuePredictionRequestSchema,
  GetRevenuePredictionResponseSchema,
} from '../../../src/lib/schemas';

describe('PlatformSchema', () => {
  it('should validate valid platforms', () => {
    expect(PlatformSchema.parse('Instagram')).toBe('Instagram');
    expect(PlatformSchema.parse('YouTube')).toBe('YouTube');
    expect(PlatformSchema.parse('TikTok')).toBe('TikTok');
    expect(PlatformSchema.parse('Blog')).toBe('Blog');
  });

  it('should reject invalid platforms', () => {
    expect(() => PlatformSchema.parse('Facebook')).toThrow();
    expect(() => PlatformSchema.parse('twitter')).toThrow();
    expect(() => PlatformSchema.parse('')).toThrow();
  });
});

describe('CategorySchema', () => {
  it('should validate all valid categories', () => {
    const validCategories = [
      'Beauty',
      'Fashion',
      'Lifestyle',
      'Food',
      'Tech',
      'HomeLiving',
      'Health',
      'BabyKids',
      'Pet',
      'Stationery',
    ];

    validCategories.forEach((category) => {
      expect(CategorySchema.parse(category)).toBe(category);
    });
  });

  it('should reject invalid categories', () => {
    expect(() => CategorySchema.parse('InvalidCategory')).toThrow();
    expect(() => CategorySchema.parse('beauty')).toThrow();
  });
});

describe('SeasonSchema', () => {
  it('should validate valid seasons', () => {
    expect(SeasonSchema.parse('Spring')).toBe('Spring');
    expect(SeasonSchema.parse('Summer')).toBe('Summer');
    expect(SeasonSchema.parse('Fall')).toBe('Fall');
    expect(SeasonSchema.parse('Winter')).toBe('Winter');
  });

  it('should reject invalid seasons', () => {
    expect(() => SeasonSchema.parse('Autumn')).toThrow();
    expect(() => SeasonSchema.parse('spring')).toThrow();
  });
});

describe('CreatorSchema', () => {
  const validCreator = {
    id: 'creator-001',
    name: '김지은',
    platform: 'Instagram',
    followerCount: 250000,
    categories: ['Beauty', 'Fashion'],
    email: 'jieun.kim@example.com',
    joinedAt: '2025-01-15T09:00:00Z',
  };

  it('should validate valid creator data', () => {
    const result = CreatorSchema.parse(validCreator);
    expect(result).toEqual(validCreator);
  });

  it('should reject invalid creator ID format', () => {
    expect(() =>
      CreatorSchema.parse({ ...validCreator, id: 'invalid-id' })
    ).toThrow();
    expect(() =>
      CreatorSchema.parse({ ...validCreator, id: 'creator-1' })
    ).toThrow();
  });

  it('should reject empty name', () => {
    expect(() => CreatorSchema.parse({ ...validCreator, name: '' })).toThrow();
  });

  it('should reject invalid follower count', () => {
    expect(() =>
      CreatorSchema.parse({ ...validCreator, followerCount: 5000 })
    ).toThrow();
    expect(() =>
      CreatorSchema.parse({ ...validCreator, followerCount: 2000000 })
    ).toThrow();
    expect(() =>
      CreatorSchema.parse({ ...validCreator, followerCount: 100.5 })
    ).toThrow();
  });

  it('should reject invalid categories count', () => {
    expect(() =>
      CreatorSchema.parse({ ...validCreator, categories: ['Beauty'] })
    ).toThrow();
    expect(() =>
      CreatorSchema.parse({
        ...validCreator,
        categories: ['Beauty', 'Fashion', 'Lifestyle', 'Food'],
      })
    ).toThrow();
  });

  it('should reject invalid email', () => {
    expect(() =>
      CreatorSchema.parse({ ...validCreator, email: 'invalid-email' })
    ).toThrow();
  });

  it('should reject invalid datetime format', () => {
    expect(() =>
      CreatorSchema.parse({ ...validCreator, joinedAt: '2025-01-15' })
    ).toThrow();
  });
});

describe('ProductSchema', () => {
  const validProduct = {
    id: 'product-001',
    name: '글로우 세럼',
    category: 'Beauty',
    price: 45000,
    brandName: '글로우랩',
    imageUrl: 'https://example.com/images/glow-serum.jpg',
    description: '피부 탄력을 높여주는 고농축 세럼',
  };

  it('should validate valid product data', () => {
    const result = ProductSchema.parse(validProduct);
    expect(result).toEqual(validProduct);
  });

  it('should reject invalid product ID format', () => {
    expect(() =>
      ProductSchema.parse({ ...validProduct, id: 'invalid-id' })
    ).toThrow();
    expect(() =>
      ProductSchema.parse({ ...validProduct, id: 'product-1' })
    ).toThrow();
  });

  it('should reject invalid price range', () => {
    expect(() =>
      ProductSchema.parse({ ...validProduct, price: 5000 })
    ).toThrow();
    expect(() =>
      ProductSchema.parse({ ...validProduct, price: 300000 })
    ).toThrow();
    expect(() =>
      ProductSchema.parse({ ...validProduct, price: 45000.99 })
    ).toThrow();
  });

  it('should reject invalid URL', () => {
    expect(() =>
      ProductSchema.parse({ ...validProduct, imageUrl: 'not-a-url' })
    ).toThrow();
  });

  it('should reject empty fields', () => {
    expect(() =>
      ProductSchema.parse({ ...validProduct, name: '' })
    ).toThrow();
    expect(() =>
      ProductSchema.parse({ ...validProduct, brandName: '' })
    ).toThrow();
    expect(() =>
      ProductSchema.parse({ ...validProduct, description: '' })
    ).toThrow();
  });
});

describe('SaleRecordSchema', () => {
  const validSaleRecord = {
    id: 'sale-00001',
    creatorId: 'creator-001',
    productId: 'product-015',
    soldAt: '2025-08-15T14:30:00Z',
    quantity: 3,
    revenue: 135000,
    commission: 20250,
    clickCount: 450,
    conversionRate: 3.5,
  };

  it('should validate valid sale record data', () => {
    const result = SaleRecordSchema.parse(validSaleRecord);
    expect(result).toEqual(validSaleRecord);
  });

  it('should reject invalid sale ID format', () => {
    expect(() =>
      SaleRecordSchema.parse({ ...validSaleRecord, id: 'sale-1' })
    ).toThrow();
    expect(() =>
      SaleRecordSchema.parse({ ...validSaleRecord, id: 'invalid-id' })
    ).toThrow();
  });

  it('should reject invalid quantity', () => {
    expect(() =>
      SaleRecordSchema.parse({ ...validSaleRecord, quantity: 0 })
    ).toThrow();
    expect(() =>
      SaleRecordSchema.parse({ ...validSaleRecord, quantity: 2.5 })
    ).toThrow();
  });

  it('should reject negative values', () => {
    expect(() =>
      SaleRecordSchema.parse({ ...validSaleRecord, revenue: -100 })
    ).toThrow();
    expect(() =>
      SaleRecordSchema.parse({ ...validSaleRecord, commission: -50 })
    ).toThrow();
    expect(() =>
      SaleRecordSchema.parse({ ...validSaleRecord, clickCount: -10 })
    ).toThrow();
  });

  it('should reject invalid conversion rate', () => {
    expect(() =>
      SaleRecordSchema.parse({ ...validSaleRecord, conversionRate: -1 })
    ).toThrow();
    expect(() =>
      SaleRecordSchema.parse({ ...validSaleRecord, conversionRate: 101 })
    ).toThrow();
  });
});

describe('CategoryScoreSchema', () => {
  const validCategoryScore = {
    category: 'Beauty',
    score: 85,
    salesCount: 45,
    totalRevenue: 3750000,
    avgConversionRate: 4.2,
  };

  it('should validate valid category score data', () => {
    const result = CategoryScoreSchema.parse(validCategoryScore);
    expect(result).toEqual(validCategoryScore);
  });

  it('should reject invalid score range', () => {
    expect(() =>
      CategoryScoreSchema.parse({ ...validCategoryScore, score: -1 })
    ).toThrow();
    expect(() =>
      CategoryScoreSchema.parse({ ...validCategoryScore, score: 101 })
    ).toThrow();
  });

  it('should reject negative values', () => {
    expect(() =>
      CategoryScoreSchema.parse({ ...validCategoryScore, salesCount: -1 })
    ).toThrow();
    expect(() =>
      CategoryScoreSchema.parse({ ...validCategoryScore, totalRevenue: -100 })
    ).toThrow();
  });
});

describe('PriceBucketSchema', () => {
  const validPriceBucket = {
    range: '30000-50000',
    count: 28,
    revenue: 1120000,
    bestPerformingPrice: 45000,
  };

  it('should validate valid price bucket data', () => {
    const result = PriceBucketSchema.parse(validPriceBucket);
    expect(result).toEqual(validPriceBucket);
  });

  it('should reject invalid range format', () => {
    expect(() =>
      PriceBucketSchema.parse({ ...validPriceBucket, range: '30000' })
    ).toThrow();
    expect(() =>
      PriceBucketSchema.parse({ ...validPriceBucket, range: 'invalid' })
    ).toThrow();
    expect(() =>
      PriceBucketSchema.parse({ ...validPriceBucket, range: '30000-50000-70000' })
    ).toThrow();
  });

  it('should reject negative values', () => {
    expect(() =>
      PriceBucketSchema.parse({ ...validPriceBucket, count: -1 })
    ).toThrow();
  });
});

describe('SeasonalDataSchema', () => {
  const validSeasonalData = {
    season: 'Spring',
    salesCount: 25,
    revenue: 1850000,
    topCategories: ['Beauty', 'Fashion'],
  };

  it('should validate valid seasonal data', () => {
    const result = SeasonalDataSchema.parse(validSeasonalData);
    expect(result).toEqual(validSeasonalData);
  });

  it('should accept up to 3 top categories', () => {
    const data = { ...validSeasonalData, topCategories: ['Beauty', 'Fashion', 'Lifestyle'] };
    expect(SeasonalDataSchema.parse(data)).toEqual(data);
  });

  it('should reject more than 3 top categories', () => {
    expect(() =>
      SeasonalDataSchema.parse({
        ...validSeasonalData,
        topCategories: ['Beauty', 'Fashion', 'Lifestyle', 'Food'],
      })
    ).toThrow();
  });

  it('should accept empty top categories array', () => {
    const data = { ...validSeasonalData, topCategories: [] };
    expect(SeasonalDataSchema.parse(data)).toEqual(data);
  });
});

describe('CreatorInsightSchema', () => {
  const validCreatorInsight = {
    creatorId: 'creator-001',
    categoryScores: [
      {
        category: 'Beauty',
        score: 88,
        salesCount: 45,
        totalRevenue: 3750000,
        avgConversionRate: 4.2,
      },
    ],
    priceBuckets: [
      {
        range: '30000-50000',
        count: 28,
        revenue: 1120000,
        bestPerformingPrice: 45000,
      },
    ],
    seasonalData: [
      {
        season: 'Spring',
        salesCount: 25,
        revenue: 1850000,
        topCategories: ['Beauty', 'Fashion'],
      },
    ],
    topProducts: ['product-001', 'product-015', 'product-007'],
    averageConversionRate: 3.8,
    totalRevenue: 5650000,
    analyzedAt: '2026-02-04T10:00:00Z',
  };

  it('should validate valid creator insight data', () => {
    const result = CreatorInsightSchema.parse(validCreatorInsight);
    expect(result).toEqual(validCreatorInsight);
  });

  it('should reject more than 10 top products', () => {
    const manyProducts = Array.from({ length: 11 }, (_, i) => `product-${String(i + 1).padStart(3, '0')}`);
    expect(() =>
      CreatorInsightSchema.parse({ ...validCreatorInsight, topProducts: manyProducts })
    ).toThrow();
  });

  it('should accept empty arrays', () => {
    const data = {
      ...validCreatorInsight,
      categoryScores: [],
      priceBuckets: [],
      seasonalData: [],
      topProducts: [],
    };
    expect(CreatorInsightSchema.parse(data)).toEqual(data);
  });
});

describe('ProductMatchSchema', () => {
  const validProductMatch = {
    productId: 'product-023',
    creatorId: 'creator-002',
    matchScore: 92,
    reason: '박준호님은 Tech 카테고리에서 평균 2.5%의 전환율을 기록 중입니다.',
    expectedRevenue: 1750000,
    confidenceLevel: 'High',
  };

  it('should validate valid product match data', () => {
    const result = ProductMatchSchema.parse(validProductMatch);
    expect(result).toEqual(validProductMatch);
  });

  it('should reject invalid match score range', () => {
    expect(() =>
      ProductMatchSchema.parse({ ...validProductMatch, matchScore: -1 })
    ).toThrow();
    expect(() =>
      ProductMatchSchema.parse({ ...validProductMatch, matchScore: 101 })
    ).toThrow();
  });

  it('should reject short reason', () => {
    expect(() =>
      ProductMatchSchema.parse({ ...validProductMatch, reason: 'Too short' })
    ).toThrow();
  });

  it('should accept all confidence levels', () => {
    const levels = ['High', 'Medium', 'Low'];
    levels.forEach((level) => {
      const data = { ...validProductMatch, confidenceLevel: level };
      expect(ProductMatchSchema.parse(data)).toEqual(data);
    });
  });

  it('should reject invalid confidence level', () => {
    expect(() =>
      ProductMatchSchema.parse({ ...validProductMatch, confidenceLevel: 'VeryHigh' })
    ).toThrow();
  });
});

describe('RevenuePredictionSchema', () => {
  const validRevenuePrediction = {
    productId: 'product-001',
    creatorId: 'creator-001',
    predictedRevenue: 1350000,
    confidenceInterval: {
      min: 1050000,
      max: 1650000,
    },
    factors: [
      '과거 Beauty 카테고리 평균 전환율 4.2%',
      '봄 시즌 뷰티 제품 판매 30% 증가 패턴',
    ],
  };

  it('should validate valid revenue prediction data', () => {
    const result = RevenuePredictionSchema.parse(validRevenuePrediction);
    expect(result).toEqual(validRevenuePrediction);
  });

  it('should reject when max < min in confidence interval', () => {
    expect(() =>
      RevenuePredictionSchema.parse({
        ...validRevenuePrediction,
        confidenceInterval: { min: 1650000, max: 1050000 },
      })
    ).toThrow();
  });

  it('should accept when max equals min', () => {
    const data = {
      ...validRevenuePrediction,
      confidenceInterval: { min: 1350000, max: 1350000 },
    };
    expect(RevenuePredictionSchema.parse(data)).toEqual(data);
  });

  it('should reject empty factors array', () => {
    expect(() =>
      RevenuePredictionSchema.parse({ ...validRevenuePrediction, factors: [] })
    ).toThrow();
  });

  it('should reject negative values', () => {
    expect(() =>
      RevenuePredictionSchema.parse({ ...validRevenuePrediction, predictedRevenue: -100 })
    ).toThrow();
  });
});

describe('API Request/Response Schemas', () => {
  describe('GetCreatorInsightRequestSchema', () => {
    it('should validate valid request', () => {
      const request = { creatorId: 'creator-001' };
      expect(GetCreatorInsightRequestSchema.parse(request)).toEqual(request);
    });

    it('should reject invalid creator ID', () => {
      expect(() =>
        GetCreatorInsightRequestSchema.parse({ creatorId: 'invalid' })
      ).toThrow();
    });
  });

  describe('GetCreatorInsightResponseSchema', () => {
    it('should validate successful response', () => {
      const response = {
        success: true,
        data: {
          creatorId: 'creator-001',
          categoryScores: [],
          priceBuckets: [],
          seasonalData: [],
          topProducts: [],
          averageConversionRate: 3.8,
          totalRevenue: 5650000,
          analyzedAt: '2026-02-04T10:00:00Z',
        },
      };
      expect(GetCreatorInsightResponseSchema.parse(response)).toEqual(response);
    });

    it('should validate error response', () => {
      const response = {
        success: false,
        data: null,
        error: '크리에이터를 찾을 수 없습니다.',
      };
      expect(GetCreatorInsightResponseSchema.parse(response)).toEqual(response);
    });
  });

  describe('GetProductMatchesRequestSchema', () => {
    it('should validate request with limit', () => {
      const request = { creatorId: 'creator-001', limit: 20 };
      expect(GetProductMatchesRequestSchema.parse(request)).toEqual(request);
    });

    it('should apply default limit when not provided', () => {
      const request = { creatorId: 'creator-001' };
      const result = GetProductMatchesRequestSchema.parse(request);
      expect(result.limit).toBe(10);
    });

    it('should reject limit out of range', () => {
      expect(() =>
        GetProductMatchesRequestSchema.parse({ creatorId: 'creator-001', limit: 0 })
      ).toThrow();
      expect(() =>
        GetProductMatchesRequestSchema.parse({ creatorId: 'creator-001', limit: 51 })
      ).toThrow();
    });
  });

  describe('GetProductMatchesResponseSchema', () => {
    it('should validate successful response with matches', () => {
      const response = {
        success: true,
        data: [
          {
            productId: 'product-023',
            creatorId: 'creator-002',
            matchScore: 92,
            reason: '박준호님은 Tech 카테고리에서 평균 2.5%의 전환율을 기록 중입니다.',
            expectedRevenue: 1750000,
            confidenceLevel: 'High',
          },
        ],
      };
      expect(GetProductMatchesResponseSchema.parse(response)).toEqual(response);
    });

    it('should validate empty matches', () => {
      const response = { success: true, data: [] };
      expect(GetProductMatchesResponseSchema.parse(response)).toEqual(response);
    });
  });

  describe('GetRevenuePredictionRequestSchema', () => {
    it('should validate valid request', () => {
      const request = {
        creatorId: 'creator-001',
        productId: 'product-023',
      };
      expect(GetRevenuePredictionRequestSchema.parse(request)).toEqual(request);
    });

    it('should reject invalid IDs', () => {
      expect(() =>
        GetRevenuePredictionRequestSchema.parse({
          creatorId: 'invalid',
          productId: 'product-023',
        })
      ).toThrow();
    });
  });

  describe('GetRevenuePredictionResponseSchema', () => {
    it('should validate successful response', () => {
      const response = {
        success: true,
        data: {
          productId: 'product-001',
          creatorId: 'creator-001',
          predictedRevenue: 1350000,
          confidenceInterval: { min: 1050000, max: 1650000 },
          factors: ['과거 Beauty 카테고리 평균 전환율 4.2%'],
        },
      };
      expect(GetRevenuePredictionResponseSchema.parse(response)).toEqual(response);
    });

    it('should validate error response', () => {
      const response = {
        success: false,
        data: null,
        error: '크리에이터 또는 제품을 찾을 수 없습니다.',
      };
      expect(GetRevenuePredictionResponseSchema.parse(response)).toEqual(response);
    });
  });
});
