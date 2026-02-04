import { z } from 'zod';

/**
 * Platform Zod schema
 */
export const PlatformSchema = z.enum(['Instagram', 'YouTube', 'TikTok', 'Blog']);

/**
 * Category Zod schema
 */
export const CategorySchema = z.enum([
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
]);

/**
 * Season Zod schema
 */
export const SeasonSchema = z.enum(['Spring', 'Summer', 'Fall', 'Winter']);

/**
 * Creator Zod schema
 */
export const CreatorSchema = z.object({
  id: z.string().regex(/^creator-\d{3}$/, 'ID는 creator-XXX 형식이어야 합니다'),
  name: z.string().min(1, '이름은 필수입니다'),
  platform: PlatformSchema,
  followers: z
    .number()
    .int('정수여야 합니다')
    .min(10000, '최소 팔로워 수는 10,000명입니다')
    .max(1000000, '최대 팔로워 수는 1,000,000명입니다'),
  categories: z
    .array(CategorySchema)
    .min(2, '최소 2개의 카테고리가 필요합니다')
    .max(3, '최대 3개의 카테고리만 가능합니다'),
  email: z.string().email('유효한 이메일 주소여야 합니다'),
  joinedAt: z.string().datetime('ISO 8601 날짜 형식이어야 합니다'),
});

/**
 * Product Zod schema
 */
export const ProductSchema = z.object({
  id: z.string().regex(/^product-\d{3}$/, 'ID는 product-XXX 형식이어야 합니다'),
  name: z.string().min(1, '제품명은 필수입니다'),
  category: CategorySchema,
  price: z
    .number()
    .int('정수여야 합니다')
    .min(10000, '최소 가격은 10,000원입니다')
    .max(200000, '최대 가격은 200,000원입니다'),
  brand: z.string().min(1, '브랜드명은 필수입니다'),
  imageUrl: z.string().url('유효한 URL이어야 합니다'),
  description: z.string().min(1, '제품 설명은 필수입니다'),
});

/**
 * SaleRecord Zod schema
 */
export const SaleRecordSchema = z.object({
  id: z.string().regex(/^sale-\d{5}$/, 'ID는 sale-XXXXX 형식이어야 합니다'),
  creatorId: z.string().regex(/^creator-\d{3}$/),
  productId: z.string().regex(/^product-\d{3}$/),
  date: z.string().datetime('ISO 8601 날짜 형식이어야 합니다'),
  quantity: z.number().int().min(1, '최소 판매 수량은 1개입니다'),
  revenue: z.number().min(0, '수익은 0 이상이어야 합니다'),
  commission: z.number().min(0, '수수료는 0 이상이어야 합니다'),
  clickCount: z.number().int().min(0, '클릭 수는 0 이상이어야 합니다'),
  conversionRate: z
    .number()
    .min(0, '전환율은 0% 이상이어야 합니다')
    .max(100, '전환율은 100% 이하여야 합니다'),
});

/**
 * CategoryScore Zod schema
 */
export const CategoryScoreSchema = z.object({
  category: CategorySchema,
  score: z
    .number()
    .min(0, '점수는 0 이상이어야 합니다')
    .max(100, '점수는 100 이하여야 합니다'),
  salesCount: z.number().int().min(0),
  totalRevenue: z.number().min(0),
  avgConversionRate: z.number().min(0).max(100),
});

/**
 * PriceBucket Zod schema
 */
export const PriceBucketSchema = z.object({
  range: z
    .string()
    .regex(
      /^\d+-\d+$/,
      '가격 범위는 "최소-최대" 형식이어야 합니다 (예: "30000-50000")'
    ),
  count: z.number().int().min(0),
  revenue: z.number().min(0),
  bestPerformingPrice: z.number().min(0),
});

/**
 * SeasonalData Zod schema
 */
export const SeasonalDataSchema = z.object({
  season: SeasonSchema,
  salesCount: z.number().int().min(0),
  revenue: z.number().min(0),
  topCategories: z.array(CategorySchema).max(3),
});

/**
 * CreatorInsight Zod schema
 */
export const CreatorInsightSchema = z.object({
  creatorId: z.string().regex(/^creator-\d{3}$/),
  categoryScores: z.array(CategoryScoreSchema),
  priceBuckets: z.array(PriceBucketSchema),
  seasonalData: z.array(SeasonalDataSchema),
  topProducts: z.array(z.string().regex(/^product-\d{3}$/)).max(10),
  averageConversionRate: z.number().min(0).max(100),
  totalRevenue: z.number().min(0),
  analyzedAt: z.string().datetime(),
});

/**
 * ProductMatch Zod schema
 */
export const ProductMatchSchema = z.object({
  productId: z.string().regex(/^product-\d{3}$/),
  creatorId: z.string().regex(/^creator-\d{3}$/),
  matchScore: z.number().min(0).max(100),
  reason: z.string().min(10, '추천 사유는 최소 10자 이상이어야 합니다'),
  expectedRevenue: z.number().min(0),
  confidenceLevel: z.enum(['High', 'Medium', 'Low']),
});

/**
 * RevenuePrediction Zod schema
 */
export const RevenuePredictionSchema = z.object({
  productId: z.string().regex(/^product-\d{3}$/),
  creatorId: z.string().regex(/^creator-\d{3}$/),
  predictedRevenue: z.number().min(0),
  confidenceInterval: z
    .object({
      min: z.number().min(0),
      max: z.number().min(0),
    })
    .refine((data) => data.max >= data.min, '최대값은 최소값 이상이어야 합니다'),
  factors: z.array(z.string()).min(1, '최소 1개 이상의 예측 근거가 필요합니다'),
});

/**
 * GetCreatorInsightRequest Zod schema
 */
export const GetCreatorInsightRequestSchema = z.object({
  creatorId: z.string().regex(/^creator-\d{3}$/),
});

/**
 * GetCreatorInsightResponse Zod schema
 */
export const GetCreatorInsightResponseSchema = z.object({
  success: z.boolean(),
  data: CreatorInsightSchema.nullable(),
  error: z.string().optional(),
});

/**
 * GetProductMatchesRequest Zod schema
 */
export const GetProductMatchesRequestSchema = z.object({
  creatorId: z.string().regex(/^creator-\d{3}$/),
  limit: z.number().int().min(1).max(50).optional().default(10),
});

/**
 * GetProductMatchesResponse Zod schema
 */
export const GetProductMatchesResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(ProductMatchSchema),
  error: z.string().optional(),
});

/**
 * GetRevenuePredictionRequest Zod schema
 */
export const GetRevenuePredictionRequestSchema = z.object({
  creatorId: z.string().regex(/^creator-\d{3}$/),
  productId: z.string().regex(/^product-\d{3}$/),
});

/**
 * GetRevenuePredictionResponse Zod schema
 */
export const GetRevenuePredictionResponseSchema = z.object({
  success: z.boolean(),
  data: RevenuePredictionSchema.nullable(),
  error: z.string().optional(),
});

/**
 * Query schema for listing creators
 */
export const CreatorsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  platform: z.string().optional(),
  category: z.string().optional(),
  search: z.string().optional(),
  sort: z.enum(['name', 'followers', 'engagement', 'createdAt']).optional().default('name'),
  order: z.enum(['asc', 'desc']).optional().default('asc'),
});

/**
 * AI analysis response schemas (used internally by analysis.ts)
 */

// Schema for OpenAI's creator insight analysis response
export const CreatorInsightResponseSchema = z.object({
  summary: z.string(),
  strengths: z.array(z.string()),
  topCategories: z.array(
    z.object({
      category: z.string(),
      percentage: z.number(),
    })
  ),
  priceRange: z.object({
    min: z.number(),
    max: z.number(),
    average: z.number(),
  }),
  seasonalTrends: z.array(
    z.object({
      season: z.string(),
      salesCount: z.number(),
      revenue: z.number(),
    })
  ),
  recommendations: z.array(z.string()),
  confidence: z.number().min(0).max(1),
});

// Type export for CreatorInsightResponse
export type CreatorInsightResponse = z.infer<typeof CreatorInsightResponseSchema>;

// Schema for OpenAI's product match response
export const ProductMatchListSchema = z.object({
  matches: z.array(
    z.object({
      productId: z.string(),
      matchScore: z.number().min(0).max(100),
      scoreBreakdown: z.object({
        categoryFit: z.number().min(0).max(100),
        priceFit: z.number().min(0).max(100),
        seasonFit: z.number().min(0).max(100),
        audienceFit: z.number().min(0).max(100),
      }),
      predictedRevenue: z.object({
        min: z.number(),
        max: z.number(),
        average: z.number(),
        predictedQuantity: z.number().optional(),
        predictedCommission: z.number().optional(),
      }),
      reasoning: z.string(),
    })
  ),
});
