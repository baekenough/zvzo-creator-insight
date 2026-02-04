import type { Creator, SaleRecord, CreatorInsight, Product, ProductMatch } from '@/types';
import { callOpenAI, OpenAIError } from './openai';
import {
  CreatorInsightResponseSchema,
  ProductMatchListSchema,
  type CreatorInsightResponse,
} from './schemas';
import { getSeasonFromMonth } from './utils';

// Simple in-memory cache with TTL
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<any>>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCacheKey(prefix: string, id: string): string {
  return `${prefix}:${id}`;
}

function getFromCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return entry.data as T;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, {
    data,
    expiresAt: Date.now() + CACHE_TTL,
  });
}

// Preprocessed data structure
interface PreprocessedData {
  creator: {
    id: string;
    name: string;
    platform: string;
    followers: number;
    engagementRate: number;
  };
  summary: {
    totalRevenue: number;
    totalSales: number;
    averageOrderValue: number;
  };
  categoryBreakdown: Array<{
    category: string;
    revenue: number;
    salesCount: number;
    averagePrice: number;
    revenueShare: number;
  }>;
  priceDistribution: Array<{
    priceRange: string;
    salesCount: number;
    revenue: number;
  }>;
  seasonalPattern: Array<{
    season: string;
    salesCount: number;
    revenue: number;
  }>;
  topProducts: Array<{
    name: string;
    category: string;
    price: number;
    salesCount: number;
    revenue: number;
  }>;
}

/**
 * Preprocess creator data for AI analysis
 */
export function preprocessCreatorData(
  creator: Creator,
  sales: SaleRecord[]
): PreprocessedData {
  // Basic statistics
  const totalRevenue = sales.reduce((sum, s) => sum + s.revenue, 0);
  const totalSales = sales.reduce((sum, s) => sum + s.quantity, 0);
  const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

  // Category breakdown
  const categoryMap = new Map<
    string,
    { revenue: number; salesCount: number; prices: number[] }
  >();

  sales.forEach((sale) => {
    const existing = categoryMap.get(sale.category) || {
      revenue: 0,
      salesCount: 0,
      prices: [],
    };

    existing.revenue += sale.revenue;
    existing.salesCount += sale.quantity;
    existing.prices.push(sale.price);

    categoryMap.set(sale.category, existing);
  });

  const categoryBreakdown = Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      revenue: data.revenue,
      salesCount: data.salesCount,
      averagePrice: data.prices.reduce((a, b) => a + b, 0) / data.prices.length,
      revenueShare: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  // Price distribution (10k buckets)
  const priceMap = new Map<string, { salesCount: number; revenue: number }>();

  sales.forEach((sale) => {
    const bucket = Math.floor(sale.price / 10000);
    const range = `${bucket * 10000}-${(bucket + 1) * 10000}`;
    const existing = priceMap.get(range) || { salesCount: 0, revenue: 0 };

    existing.salesCount += sale.quantity;
    existing.revenue += sale.revenue;

    priceMap.set(range, existing);
  });

  const priceDistribution = Array.from(priceMap.entries())
    .map(([priceRange, data]) => ({
      priceRange,
      salesCount: data.salesCount,
      revenue: data.revenue,
    }))
    .filter((d) => d.salesCount > 0)
    .sort((a, b) => {
      const aMin = parseInt(a.priceRange.split('-')[0]);
      const bMin = parseInt(b.priceRange.split('-')[0]);
      return aMin - bMin;
    });

  // Seasonal pattern
  const seasonMap = new Map<string, { salesCount: number; revenue: number }>();

  sales.forEach((sale) => {
    const saleDate = new Date(sale.date);
    const month = saleDate.getMonth() + 1;
    const season = getSeasonFromMonth(month);
    const existing = seasonMap.get(season) || { salesCount: 0, revenue: 0 };

    existing.salesCount += sale.quantity;
    existing.revenue += sale.revenue;

    seasonMap.set(season, existing);
  });

  const seasonalPattern = Array.from(seasonMap.entries()).map(
    ([season, data]) => ({
      season,
      salesCount: data.salesCount,
      revenue: data.revenue,
    })
  );

  // Top products by revenue
  const productMap = new Map<
    string,
    {
      name: string;
      category: string;
      price: number;
      salesCount: number;
      revenue: number;
    }
  >();

  sales.forEach((sale) => {
    const existing = productMap.get(sale.productName);
    if (existing) {
      existing.salesCount += sale.quantity;
      existing.revenue += sale.revenue;
    } else {
      productMap.set(sale.productName, {
        name: sale.productName,
        category: sale.category,
        price: sale.price,
        salesCount: sale.quantity,
        revenue: sale.revenue,
      });
    }
  });

  const topProducts = Array.from(productMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return {
    creator: {
      id: creator.id,
      name: creator.name,
      platform: creator.platform,
      followers: creator.followers,
      engagementRate: creator.engagementRate,
    },
    summary: {
      totalRevenue,
      totalSales,
      averageOrderValue,
    },
    categoryBreakdown,
    priceDistribution,
    seasonalPattern,
    topProducts,
  };
}

/**
 * Build analysis prompt for OpenAI
 */
function buildAnalysisPrompt(data: PreprocessedData): string {
  return `다음 크리에이터의 판매 데이터를 분석해주세요:

## 크리에이터 정보
- 이름: ${data.creator.name}
- 플랫폼: ${data.creator.platform}
- 팔로워 수: ${data.creator.followers.toLocaleString()}명
- 참여율: ${data.creator.engagementRate.toFixed(2)}%

## 판매 요약
- 총 매출: ${data.summary.totalRevenue.toLocaleString()}원
- 총 판매 건수: ${data.summary.totalSales.toLocaleString()}건
- 평균 주문 가치: ${Math.round(data.summary.averageOrderValue).toLocaleString()}원

## 카테고리별 성과
${data.categoryBreakdown
  .map(
    (cat) =>
      `- ${cat.category}: 매출 ${cat.revenue.toLocaleString()}원 (${cat.revenueShare.toFixed(
        1
      )}%), 판매 ${cat.salesCount}건, 평균 가격 ${Math.round(cat.averagePrice).toLocaleString()}원`
  )
  .join('\n')}

## 가격대별 분포
${data.priceDistribution
  .map(
    (dist) =>
      `- ${dist.priceRange}원: 판매 ${dist.salesCount}건, 매출 ${dist.revenue.toLocaleString()}원`
  )
  .join('\n')}

## 시즌별 판매 패턴
${data.seasonalPattern
  .map(
    (m) =>
      `- ${m.season}: 판매 ${m.salesCount}건, 매출 ${m.revenue.toLocaleString()}원`
  )
  .join('\n')}

## 상위 판매 제품
${data.topProducts
  .map(
    (p, i) =>
      `${i + 1}. ${p.name} (${p.category}): 판매 ${p.salesCount}건, 매출 ${p.revenue.toLocaleString()}원`
  )
  .join('\n')}

위 데이터를 기반으로 다음 JSON 형식으로 분석을 제공해주세요:
{
  "summary": "크리에이터 판매 성향 종합 분석 (200-300자)",
  "strengths": ["구체적 데이터 기반 강점 1", "강점 2", "강점 3"],
  "topCategories": [{"category": "카테고리명", "percentage": 비율}, ...],
  "priceRange": {"min": 최소가격, "max": 최대가격, "average": 평균가격},
  "seasonalTrends": [{"season": "시즌", "salesCount": 판매건수, "revenue": 매출}, ...],
  "recommendations": ["실행 가능한 추천 1", "추천 2", "추천 3"],
  "confidence": 0.0에서 1.0 사이의 신뢰도
}`;
}

/**
 * Analyze creator using OpenAI
 */
export async function analyzeCreator(creatorId: string): Promise<CreatorInsight> {
  // Check cache
  const cacheKey = getCacheKey('analyze', creatorId);
  const cached = getFromCache<CreatorInsight>(cacheKey);
  /* c8 ignore next 4 */
  if (cached) {
    console.log(`[Analysis] Cache hit for ${creatorId}`);
    return cached;
  }

  // This function should be called with data from the API route
  // For now, we'll throw an error indicating it should be called differently
  throw new Error(
    'analyzeCreator should be called with creator and sales data from the API route'
  );
}

/**
 * Internal function to analyze creator with data
 * This is exported for use in API routes
 */
export async function analyzeCreatorWithData(
  creator: Creator,
  sales: SaleRecord[]
): Promise<CreatorInsight> {
  // Check cache
  const cacheKey = getCacheKey('analyze', creator.id);
  const cached = getFromCache<CreatorInsight>(cacheKey);
  if (cached) {
    console.log(`[Analysis] Cache hit for ${creator.id}`);
    return cached;
  }

  // Validate minimum data
  if (sales.length < 5) {
    throw new OpenAIError(
      '분석할 판매 데이터가 충분하지 않습니다.',
      'CREATOR_SALES_EMPTY',
      400
    );
  }

  // Preprocess data
  const preprocessed = preprocessCreatorData(creator, sales);

  // System prompt
  const systemPrompt = `당신은 소셜 커머스 플랫폼 ZVZO의 크리에이터 판매 데이터 분석 전문가입니다.

역할:
- 크리에이터의 과거 판매 데이터를 분석하여 판매 성향과 강점을 파악합니다
- 데이터 기반으로 최적의 제품 카테고리와 가격대를 추천합니다
- 구체적이고 실행 가능한 인사이트를 제공합니다

분석 원칙:
1. 정량적 데이터를 우선하되, 질적 인사이트를 함께 제공합니다
2. 매출 비중, 전환율, 계절성 등 다각도로 분석합니다
3. 강점은 명확히, 개선점은 건설적으로 제시합니다
4. 실행 가능한 구체적 전략을 제안합니다

출력 형식:
- 반드시 유효한 JSON 형식으로 응답하세요
- 모든 텍스트는 한국어로 작성하세요
- 숫자는 소수점 2자리까지 반올림하세요`;

  // User prompt
  const userPrompt = buildAnalysisPrompt(preprocessed);

  // Call OpenAI
  const response = await callOpenAI(
    systemPrompt,
    userPrompt,
    CreatorInsightResponseSchema,
    {
      temperature: 0.3,
      maxTokens: 2000,
    }
  );

  // Create insight object
  const insight: CreatorInsight = {
    id: `insight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    creatorId: creator.id,
    summary: response.summary,
    strengths: response.strengths,
    topCategories: response.topCategories.map((cat) => ({
      category: cat.category,
      score: cat.percentage,
      salesCount: 0,
      totalRevenue: 0,
    })),
    priceRange: response.priceRange,
    seasonalTrends: response.seasonalTrends,
    recommendations: response.recommendations,
    confidence: response.confidence,
    analyzedAt: new Date().toISOString(),
  };

  // Cache the result
  setCache(cacheKey, insight);

  return insight;
}

/**
 * Build product matching prompt
 */
function buildMatchingPrompt(
  creator: Creator,
  sales: SaleRecord[],
  products: Product[],
  limit: number
): string {
  // Calculate stats
  const preprocessed = preprocessCreatorData(creator, sales);
  const currentMonth = new Date().getMonth() + 1;
  const currentSeason = getSeasonFromMonth(currentMonth);

  return `다음 크리에이터에게 적합한 제품을 매칭해주세요:

## 크리에이터 정보
- 이름: ${creator.name}
- 플랫폼: ${creator.platform}
- 팔로워: ${creator.followers.toLocaleString()}명
- 참여율: ${creator.engagementRate}%

## 판매 성향
- 주요 카테고리: ${preprocessed.categoryBreakdown.map((c) => c.category).join(', ')}
- 평균 주문 가치: ${Math.round(preprocessed.summary.averageOrderValue).toLocaleString()}원
- 시즌 성과: ${preprocessed.seasonalPattern.map((s) => `${s.season}(${s.salesCount}건)`).join(', ')}

## 현재 시즌
${currentSeason} (${currentMonth}월)

## 매칭 대상 제품 목록 (${products.length}개)
${products
  .map(
    (p, i) => `
제품 ${i + 1}:
- ID: ${p.id}
- 이름: ${p.name}
- 카테고리: ${p.category}
- 가격: ${p.price.toLocaleString()}원
- 시즌: ${p.seasonality.join(', ')}`
  )
  .join('\n')}

위 제품들을 크리에이터와 매칭하여 다음 JSON 형식으로 반환해주세요:
{
  "matches": [
    {
      "productId": "제품 ID",
      "matchScore": 0-100 사이의 매칭 점수,
      "scoreBreakdown": {
        "categoryFit": 0-100,
        "priceFit": 0-100,
        "seasonFit": 0-100,
        "audienceFit": 0-100
      },
      "predictedRevenue": {
        "min": 최소 예상 매출,
        "max": 최대 예상 매출,
        "average": 평균 예상 매출
      },
      "reasoning": "매칭 이유 (100-200자)"
    }
  ]
}

매칭 스코어 70점 이상인 제품만 포함하고, 최대 ${limit}개까지 반환하세요.
점수가 높은 순으로 정렬해주세요.`;
}

/**
 * Match products to creator using OpenAI
 */
export async function matchProducts(
  creatorId: string,
  limit: number = 10
): Promise<ProductMatch[]> {
  // Check cache
  const cacheKey = getCacheKey('match', `${creatorId}-${limit}`);
  const cached = getFromCache<ProductMatch[]>(cacheKey);
  /* c8 ignore next 4 */
  if (cached) {
    console.log(`[Matching] Cache hit for ${creatorId}`);
    return cached;
  }

  throw new Error(
    'matchProducts should be called with full data from the API route'
  );
}

/**
 * Internal function to match products with data
 * This is exported for use in API routes
 */
export async function matchProductsWithData(
  creator: Creator,
  sales: SaleRecord[],
  products: Product[],
  limit: number = 10
): Promise<ProductMatch[]> {
  // Check cache
  const cacheKey = getCacheKey('match', `${creator.id}-${limit}`);
  const cached = getFromCache<ProductMatch[]>(cacheKey);
  if (cached) {
    console.log(`[Matching] Cache hit for ${creator.id}`);
    return cached;
  }

  // Validate minimum data
  if (sales.length < 5) {
    throw new OpenAIError(
      '분석할 판매 데이터가 충분하지 않습니다.',
      'CREATOR_SALES_EMPTY',
      400
    );
  }

  if (products.length === 0) {
    throw new OpenAIError(
      '매칭할 제품이 없습니다.',
      'PRODUCT_CATALOG_EMPTY',
      400
    );
  }

  // System prompt
  const systemPrompt = `당신은 ZVZO 플랫폼의 제품-크리에이터 매칭 전문가입니다.

역할:
- 크리에이터의 판매 성향과 제품 정보를 매칭하여 최적의 제품을 추천합니다
- 카테고리, 가격대, 시즌, 타겟 오디언스 등 다각도로 적합도를 평가합니다
- 각 제품에 대한 매칭 스코어와 구체적인 이유를 제공합니다

평가 기준 (총 100점):
1. categoryFit (40점): 크리에이터의 강점 카테고리와 제품 카테고리의 일치도
2. priceFit (30점): 크리에이터의 평균 객단가와 제품 가격의 일치도
3. seasonFit (20점): 현재 시즌과 제품 시즌성의 일치도
4. audienceFit (10점): 크리에이터 오디언스와 제품 타겟의 일치도

출력 형식:
- 반드시 유효한 JSON 형식으로 응답하세요
- 매칭 스코어 높은 순으로 정렬하세요
- 각 제품마다 구체적인 매칭 이유를 제공하세요`;

  // User prompt
  const userPrompt = buildMatchingPrompt(creator, sales, products, limit);

  // Call OpenAI
  const response = await callOpenAI(
    systemPrompt,
    userPrompt,
    ProductMatchListSchema,
    {
      temperature: 0.2,
      maxTokens: 3000,
    }
  );

  // Map response to ProductMatch objects
  const matches: ProductMatch[] = response.matches
    .map((match) => {
      const product = products.find((p) => p.id === match.productId);
      if (!product) {
        console.warn(`Product not found: ${match.productId}`);
        return null;
      }

      return {
        product,
        matchScore: match.matchScore,
        matchBreakdown: match.scoreBreakdown,
        scoreBreakdown: match.scoreBreakdown,
        predictedRevenue: {
          minimum: match.predictedRevenue.min,
          expected: match.predictedRevenue.average,
          maximum: match.predictedRevenue.max,
          predictedQuantity: match.predictedRevenue.predictedQuantity || 0,
          predictedCommission: match.predictedRevenue.predictedCommission || 0,
          basis: 'AI analysis based on creator sales history',
        },
        reasoning: match.reasoning,
        confidence: match.matchScore / 100,
      };
    })
    .filter((m): m is NonNullable<typeof m> => m !== null)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);

  // Cache the result
  setCache(cacheKey, matches);

  return matches;
}

// Export cache management functions
export function clearCache(): void {
  cache.clear();
}

export function invalidateCreatorCache(creatorId: string): void {
  const keysToDelete: string[] = [];
  cache.forEach((_, key) => {
    if (key.includes(creatorId)) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach((key) => cache.delete(key));
}
