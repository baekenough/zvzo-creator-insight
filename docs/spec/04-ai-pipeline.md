# AI 분석 파이프라인 스펙

> ZVZO Creator Insight - OpenAI GPT-4o 기반 크리에이터 판매 데이터 분석 시스템

## 1. 파이프라인 개요

### 1.1 목적

크리에이터의 과거 판매 데이터를 분석하여:
- 판매 성향 및 강점 카테고리 파악
- 최적 제품 매칭 및 추천
- 예상 매출 예측
- 데이터 기반 인사이트 제공

### 1.2 기술 스택

| 구성 요소 | 기술 |
|----------|------|
| AI 모델 | OpenAI GPT-4o |
| 응답 형식 | JSON mode (structured output) |
| 언어 | TypeScript |
| 검증 | Zod schema validation |
| 캐싱 | In-memory cache (node-cache) |

### 1.3 전체 흐름

```
Raw Data → Preprocessing → AI Analysis → Product Matching → Revenue Prediction → Insights
```

---

## 2. Step 1: 데이터 전처리 (preprocessCreatorData)

### 2.1 목적

원시 판매 데이터를 AI가 분석하기 쉬운 구조화된 통계 요약으로 변환

### 2.2 입력 데이터 구조

```typescript
interface Creator {
  id: string;
  name: string;
  platform: 'instagram' | 'youtube' | 'tiktok';
  followers: number;
  engagementRate: number;
}

interface SaleRecord {
  id: string;
  productName: string;
  category: string;
  price: number;
  discountRate: number;
  commissionRate: number;
  salesCount: number;
  revenue: number;
  soldAt: Date;
  season: 'spring' | 'summer' | 'fall' | 'winter';
}

interface RawCreatorData {
  creator: Creator;
  sales: SaleRecord[];
}
```

### 2.3 출력 데이터 구조

```typescript
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
    conversionRate: number; // 총판매건수 / 팔로워수
    averageDiscount: number;
    averageCommission: number;
  };

  categoryBreakdown: Array<{
    category: string;
    revenue: number;
    salesCount: number;
    averagePrice: number;
    revenueShare: number; // 해당 카테고리가 전체 매출에서 차지하는 비율 (%)
  }>;

  priceDistribution: Array<{
    priceRange: string; // "0-10000", "10000-20000", ...
    salesCount: number;
    revenue: number;
    conversionRate: number;
  }>;

  seasonalPattern: Array<{
    month: number; // 1~12
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
```

### 2.4 전처리 로직 상세

```typescript
import { SaleRecord, Creator, PreprocessedData } from './types';

export function preprocessCreatorData(
  creator: Creator,
  sales: SaleRecord[]
): PreprocessedData {
  // 1. 기본 통계 계산
  const totalRevenue = sales.reduce((sum, s) => sum + s.revenue, 0);
  const totalSales = sales.reduce((sum, s) => sum + s.salesCount, 0);
  const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;
  const conversionRate = creator.followers > 0
    ? (totalSales / creator.followers) * 100
    : 0;

  const averageDiscount = sales.length > 0
    ? sales.reduce((sum, s) => sum + s.discountRate, 0) / sales.length
    : 0;

  const averageCommission = sales.length > 0
    ? sales.reduce((sum, s) => sum + s.commissionRate, 0) / sales.length
    : 0;

  // 2. 카테고리별 집계
  const categoryMap = new Map<string, {
    revenue: number;
    salesCount: number;
    prices: number[];
  }>();

  sales.forEach(sale => {
    const existing = categoryMap.get(sale.category) || {
      revenue: 0,
      salesCount: 0,
      prices: []
    };

    existing.revenue += sale.revenue;
    existing.salesCount += sale.salesCount;
    existing.prices.push(sale.price);

    categoryMap.set(sale.category, existing);
  });

  const categoryBreakdown = Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      revenue: data.revenue,
      salesCount: data.salesCount,
      averagePrice: data.prices.reduce((a, b) => a + b, 0) / data.prices.length,
      revenueShare: (data.revenue / totalRevenue) * 100
    }))
    .sort((a, b) => b.revenue - a.revenue); // 매출 높은 순 정렬

  // 3. 가격대별 분포 (1만원 단위 버킷)
  const priceRanges = Array.from({ length: 20 }, (_, i) => ({
    min: i * 10000,
    max: (i + 1) * 10000,
    label: `${i * 10000}-${(i + 1) * 10000}`
  }));

  const priceDistribution = priceRanges.map(range => {
    const salesInRange = sales.filter(
      s => s.price >= range.min && s.price < range.max
    );

    const salesCount = salesInRange.reduce((sum, s) => sum + s.salesCount, 0);
    const revenue = salesInRange.reduce((sum, s) => sum + s.revenue, 0);
    const conversionRate = creator.followers > 0
      ? (salesCount / creator.followers) * 100
      : 0;

    return {
      priceRange: range.label,
      salesCount,
      revenue,
      conversionRate
    };
  }).filter(d => d.salesCount > 0); // 판매가 있는 구간만 포함

  // 4. 월별 시즌 패턴 집계
  const monthlyMap = new Map<number, { salesCount: number; revenue: number }>();

  sales.forEach(sale => {
    const month = new Date(sale.soldAt).getMonth() + 1; // 1~12
    const existing = monthlyMap.get(month) || { salesCount: 0, revenue: 0 };

    existing.salesCount += sale.salesCount;
    existing.revenue += sale.revenue;

    monthlyMap.set(month, existing);
  });

  const seasonalPattern = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const data = monthlyMap.get(month) || { salesCount: 0, revenue: 0 };
    return {
      month,
      salesCount: data.salesCount,
      revenue: data.revenue
    };
  });

  // 5. 상위 판매 제품 (매출 기준 Top 5)
  const productMap = new Map<string, {
    name: string;
    category: string;
    price: number;
    salesCount: number;
    revenue: number;
  }>();

  sales.forEach(sale => {
    const existing = productMap.get(sale.productName);
    if (existing) {
      existing.salesCount += sale.salesCount;
      existing.revenue += sale.revenue;
    } else {
      productMap.set(sale.productName, {
        name: sale.productName,
        category: sale.category,
        price: sale.price,
        salesCount: sale.salesCount,
        revenue: sale.revenue
      });
    }
  });

  const topProducts = Array.from(productMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // 6. 최종 데이터 반환
  return {
    creator: {
      id: creator.id,
      name: creator.name,
      platform: creator.platform,
      followers: creator.followers,
      engagementRate: creator.engagementRate
    },
    summary: {
      totalRevenue,
      totalSales,
      averageOrderValue,
      conversionRate,
      averageDiscount,
      averageCommission
    },
    categoryBreakdown,
    priceDistribution,
    seasonalPattern,
    topProducts
  };
}
```

---

## 3. Step 2: 크리에이터 분석 (analyzeCreator)

### 3.1 목적

전처리된 데이터를 기반으로 크리에이터의 판매 성향, 강점, 최적 전략을 AI로 분석

### 3.2 시스템 프롬프트

```typescript
const SYSTEM_PROMPT = `당신은 소셜 커머스 플랫폼 ZVZO의 크리에이터 판매 데이터 분석 전문가입니다.

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
```

### 3.3 유저 프롬프트 템플릿

```typescript
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
- 평균 주문 가치: ${data.summary.averageOrderValue.toLocaleString()}원
- 전환율: ${data.summary.conversionRate.toFixed(2)}%
- 평균 할인율: ${data.summary.averageDiscount.toFixed(1)}%
- 평균 커미션율: ${data.summary.averageCommission.toFixed(1)}%

## 카테고리별 성과
${data.categoryBreakdown.map(cat =>
  `- ${cat.category}: 매출 ${cat.revenue.toLocaleString()}원 (${cat.revenueShare.toFixed(1)}%), 판매 ${cat.salesCount}건, 평균 가격 ${cat.averagePrice.toLocaleString()}원`
).join('\n')}

## 가격대별 분포
${data.priceDistribution.slice(0, 5).map(dist =>
  `- ${dist.priceRange}원: 판매 ${dist.salesCount}건, 매출 ${dist.revenue.toLocaleString()}원, 전환율 ${dist.conversionRate.toFixed(3)}%`
).join('\n')}

## 월별 판매 패턴
${data.seasonalPattern.filter(m => m.salesCount > 0).map(m =>
  `- ${m.month}월: 판매 ${m.salesCount}건, 매출 ${m.revenue.toLocaleString()}원`
).join('\n')}

## 상위 판매 제품
${data.topProducts.map((p, i) =>
  `${i + 1}. ${p.name} (${p.category}): 판매 ${p.salesCount}건, 매출 ${p.revenue.toLocaleString()}원`
).join('\n')}

위 데이터를 기반으로 다음을 JSON 형식으로 제공해주세요:
1. strengths: 크리에이터의 주요 강점 3가지 (구체적 데이터 포함)
2. weaknesses: 개선이 필요한 영역 2가지 (건설적 제안 포함)
3. bestCategories: 가장 성과가 좋은 카테고리 Top 3
4. optimalPriceRange: 최적 가격대 (min, max, reason)
5. seasonalInsights: 계절별 판매 특성 및 추천 시기
6. audienceProfile: 타겟 오디언스 특성 분석
7. recommendations: 구체적 실행 전략 3가지`;
}
```

### 3.4 Few-shot 예시

```typescript
// 예시 입력
const exampleInput = {
  creator: {
    id: "cr001",
    name: "뷰티_지니",
    platform: "instagram",
    followers: 85000,
    engagementRate: 4.2
  },
  summary: {
    totalRevenue: 12500000,
    totalSales: 320,
    averageOrderValue: 39062.5,
    conversionRate: 0.376,
    averageDiscount: 15.3,
    averageCommission: 12.5
  },
  categoryBreakdown: [
    {
      category: "스킨케어",
      revenue: 6800000,
      salesCount: 180,
      averagePrice: 37777,
      revenueShare: 54.4
    },
    {
      category: "메이크업",
      revenue: 3200000,
      salesCount: 95,
      averagePrice: 33684,
      revenueShare: 25.6
    },
    {
      category: "헤어케어",
      revenue: 2500000,
      salesCount: 45,
      averagePrice: 55555,
      revenueShare: 20.0
    }
  ],
  priceDistribution: [
    { priceRange: "20000-30000", salesCount: 120, revenue: 3000000, conversionRate: 0.141 },
    { priceRange: "30000-40000", salesCount: 95, revenue: 3325000, conversionRate: 0.112 },
    { priceRange: "40000-50000", salesCount: 70, revenue: 3150000, conversionRate: 0.082 },
    { priceRange: "50000-60000", salesCount: 35, revenue: 1925000, conversionRate: 0.041 }
  ],
  seasonalPattern: [
    { month: 1, salesCount: 45, revenue: 1800000 },
    { month: 2, salesCount: 38, revenue: 1500000 },
    { month: 3, salesCount: 52, revenue: 2100000 },
    { month: 4, salesCount: 48, revenue: 1900000 },
    { month: 5, salesCount: 65, revenue: 2600000 },
    { month: 6, salesCount: 72, revenue: 2600000 }
  ],
  topProducts: [
    { name: "하이드레이팅 세럼", category: "스킨케어", price: 42000, salesCount: 65, revenue: 2730000 },
    { name: "글로우 쿠션", category: "메이크업", price: 35000, salesCount: 48, revenue: 1680000 },
    { name: "시카 크림", category: "스킨케어", price: 38000, salesCount: 42, revenue: 1596000 }
  ]
};

// 예시 출력
const exampleOutput = {
  strengths: [
    "스킨케어 카테고리에서 압도적 강점 (전체 매출의 54.4%, 180건 판매)",
    "2-5만원 중가 제품에서 높은 전환율 (0.14% 달성, 업계 평균 0.08% 대비 1.75배)",
    "봄-여름 시즌 판매력 우수 (5-6월 월평균 매출 260만원, 전체 평균 208만원 대비 125%)"
  ],
  weaknesses: [
    "전환율 0.376%로 팔로워 대비 실제 구매 전환이 낮음 → 콘텐츠 내 CTA 강화 및 한정 프로모션 필요",
    "헤어케어 카테고리 판매 건수 적음 (45건) → 타겟 세분화하여 두피/모발 고민 맞춤 콘텐츠 제작 권장"
  ],
  bestCategories: ["스킨케어", "메이크업", "헤어케어"],
  optimalPriceRange: {
    min: 25000,
    max: 50000,
    reason: "2-5만원 구간이 전체 판매의 89%를 차지하며, 3-4만원대에서 전환율이 가장 높음 (0.112-0.141%). 팔로워의 구매력과 뷰티 제품 선호 가격대가 일치."
  },
  seasonalInsights: "봄(3-5월) 및 초여름(6월)에 판매가 급증하는 패턴. 건조한 겨울철보다 보습/진정 제품 수요가 높은 환절기/여름철 집중 공략 권장. 8-9월 가을 시즌 대비 제품 사전 기획 필요.",
  audienceProfile: "25-35세 여성, 중가 뷰티 제품 선호, 스킨케어 관심도 높음, 트렌디한 성분(시카, 히알루론산 등)에 민감, 할인보다 제품 품질과 리뷰 중시",
  recommendations: [
    "스킨케어 라인업 확대: 세럼-크림 세트 구성으로 객단가 상승 유도 (현재 평균 39,062원 → 목표 55,000원)",
    "시즌 선제 기획: 7-8월에 가을 신제품 사전 론칭하여 9-10월 판매 공백 최소화",
    "라이브 커머스 도입: 참여율 4.2%로 높은 편, 실시간 Q&A 및 한정 할인으로 전환율 0.5% 이상 목표"
  ]
};
```

### 3.5 응답 JSON 스키마

```typescript
import { z } from 'zod';

export const CreatorInsightSchema = z.object({
  strengths: z.array(z.string()).length(3),
  weaknesses: z.array(z.string()).length(2),
  bestCategories: z.array(z.string()).min(1).max(5),
  optimalPriceRange: z.object({
    min: z.number().positive(),
    max: z.number().positive(),
    reason: z.string()
  }),
  seasonalInsights: z.string(),
  audienceProfile: z.string(),
  recommendations: z.array(z.string()).length(3)
});

export type CreatorInsight = z.infer<typeof CreatorInsightSchema>;
```

### 3.6 OpenAI API 호출 코드

```typescript
import OpenAI from 'openai';
import { PreprocessedData, CreatorInsight, CreatorInsightSchema } from './types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function analyzeCreator(
  data: PreprocessedData
): Promise<CreatorInsight> {
  const systemPrompt = SYSTEM_PROMPT;
  const userPrompt = buildAnalysisPrompt(data);

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3, // 일관성 있는 분석을 위해 낮은 값
      max_tokens: 2000,
      response_format: { type: 'json_object' } // JSON mode 활성화
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('OpenAI response content is empty');
    }

    // JSON 파싱
    const parsed = JSON.parse(content);

    // Zod 스키마 검증
    const validated = CreatorInsightSchema.parse(parsed);

    return validated;

  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      console.error('OpenAI API Error:', {
        status: error.status,
        message: error.message,
        code: error.code,
        type: error.type
      });
      throw new Error(`OpenAI API failed: ${error.message}`);
    }

    if (error instanceof z.ZodError) {
      console.error('Validation Error:', error.errors);
      throw new Error('AI response validation failed');
    }

    throw error;
  }
}
```

---

## 4. Step 3: 제품 매칭 (matchProducts)

### 4.1 목적

크리에이터 분석 결과를 바탕으로 최적의 제품을 매칭하고 우선순위 스코어 산출

### 4.2 입력 데이터 구조

```typescript
interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  discountPrice?: number;
  commissionRate: number;
  seasonality: string[]; // ['spring', 'summer', 'fall', 'winter']
  targetAge: string; // "20-30", "30-40", "40-50"
  tags: string[]; // ["보습", "진정", "미백", ...]
  stockStatus: 'available' | 'low' | 'out';
}
```

### 4.3 시스템 프롬프트

```typescript
const MATCHING_SYSTEM_PROMPT = `당신은 ZVZO 플랫폼의 제품-크리에이터 매칭 전문가입니다.

역할:
- 크리에이터의 판매 분석 결과와 제품 정보를 매칭하여 최적의 제품을 추천합니다
- 카테고리, 가격대, 시즌, 타겟 오디언스 등 다각도로 적합도를 평가합니다
- 각 제품에 대한 매칭 스코어와 구체적인 이유를 제공합니다

평가 기준 (총 100점):
1. categoryFit (40점): 크리에이터의 강점 카테고리와 제품 카테고리의 일치도
   - 1순위 카테고리 일치: 40점
   - 2순위 카테고리 일치: 30점
   - 3순위 카테고리 일치: 20점
   - 기타: 10점

2. priceFit (25점): 크리에이터의 최적 가격대와 제품 가격의 일치도
   - 최적 범위 정중앙: 25점
   - 최적 범위 내: 20-25점 (중앙에서 거리에 따라)
   - 최적 범위 ±20% 이내: 10-15점
   - 그 외: 5점

3. seasonFit (20점): 현재 시즌과 제품 시즌성의 일치도
   - 현재 시즌 포함: 20점
   - 다음 시즌 포함: 15점
   - 전 시즌 제품: 10점
   - 시즌 무관: 5점

4. audienceFit (15점): 크리에이터 오디언스와 제품 타겟의 일치도
   - 타겟 연령대 정확히 일치: 15점
   - 타겟 연령대 인접 (±10세): 10점
   - 타겟 연령대 포괄: 7점
   - 불일치: 3점

최종 점수 = categoryFit + priceFit + seasonFit + audienceFit (최대 100점)

출력 형식:
- 반드시 유효한 JSON 배열 형식으로 응답하세요
- 매칭 스코어 높은 순으로 정렬하세요
- 각 제품마다 구체적인 매칭 이유를 제공하세요`;
```

### 4.4 유저 프롬프트 템플릿

```typescript
function buildMatchingPrompt(
  insight: CreatorInsight,
  products: Product[],
  currentSeason: string
): string {
  return `다음 크리에이터에게 적합한 제품을 매칭해주세요:

## 크리에이터 분석 결과
- 강점 카테고리: ${insight.bestCategories.join(', ')}
- 최적 가격대: ${insight.optimalPriceRange.min.toLocaleString()}원 ~ ${insight.optimalPriceRange.max.toLocaleString()}원
- 가격대 선정 이유: ${insight.optimalPriceRange.reason}
- 타겟 오디언스: ${insight.audienceProfile}
- 시즌 인사이트: ${insight.seasonalInsights}

## 현재 시즌
${currentSeason}

## 매칭 대상 제품 목록
${products.map((p, i) => `
제품 ${i + 1}:
- ID: ${p.id}
- 이름: ${p.name}
- 브랜드: ${p.brand}
- 카테고리: ${p.category}
- 가격: ${p.price.toLocaleString()}원${p.discountPrice ? ` (할인가: ${p.discountPrice.toLocaleString()}원)` : ''}
- 커미션율: ${p.commissionRate}%
- 시즌: ${p.seasonality.join(', ')}
- 타겟 연령: ${p.targetAge}세
- 태그: ${p.tags.join(', ')}
- 재고: ${p.stockStatus === 'available' ? '충분' : p.stockStatus === 'low' ? '부족' : '품절'}
`).join('\n')}

위 제품들을 크리에이터와 매칭하여 다음 JSON 배열로 반환해주세요:
[
  {
    "productId": "제품 ID",
    "productName": "제품 이름",
    "matchScore": 매칭 스코어 (0-100),
    "categoryFit": 카테고리 적합도 점수 (0-40),
    "priceFit": 가격 적합도 점수 (0-25),
    "seasonFit": 시즌 적합도 점수 (0-20),
    "audienceFit": 오디언스 적합도 점수 (0-15),
    "reason": "구체적인 매칭 이유 (100자 이내)",
    "recommendedStrategy": "추천 판매 전략 (150자 이내)"
  }
]

매칭 스코어 70점 이상인 제품만 포함하고, 최대 10개까지 반환하세요.`;
}
```

### 4.5 매칭 스코어 산출 기준 상세

```typescript
interface MatchingScoreBreakdown {
  categoryFit: number; // 0-40
  priceFit: number; // 0-25
  seasonFit: number; // 0-20
  audienceFit: number; // 0-15
  total: number; // 0-100
}

function calculateCategoryFit(
  productCategory: string,
  bestCategories: string[]
): number {
  const index = bestCategories.indexOf(productCategory);

  if (index === 0) return 40; // 1순위
  if (index === 1) return 30; // 2순위
  if (index === 2) return 20; // 3순위

  // 카테고리 유사도 체크 (예: "스킨케어"와 "기초케어")
  const similarCategories = getSimilarCategories(productCategory);
  const hasSimilar = bestCategories.some(cat =>
    similarCategories.includes(cat)
  );

  return hasSimilar ? 15 : 10;
}

function calculatePriceFit(
  productPrice: number,
  optimalMin: number,
  optimalMax: number
): number {
  const optimalCenter = (optimalMin + optimalMax) / 2;
  const optimalRange = optimalMax - optimalMin;

  // 최적 범위 내
  if (productPrice >= optimalMin && productPrice <= optimalMax) {
    const distanceFromCenter = Math.abs(productPrice - optimalCenter);
    const normalizedDistance = distanceFromCenter / (optimalRange / 2);
    return Math.round(25 - (normalizedDistance * 5)); // 20-25점
  }

  // 최적 범위 ±20% 이내
  const lowerBound = optimalMin * 0.8;
  const upperBound = optimalMax * 1.2;

  if (productPrice >= lowerBound && productPrice <= upperBound) {
    const distanceRatio = Math.min(
      Math.abs(productPrice - optimalMin) / optimalMin,
      Math.abs(productPrice - optimalMax) / optimalMax
    );
    return Math.round(15 - (distanceRatio * 10)); // 10-15점
  }

  return 5; // 그 외
}

function calculateSeasonFit(
  productSeasonality: string[],
  currentSeason: string
): number {
  // 현재 시즌 포함
  if (productSeasonality.includes(currentSeason)) {
    return 20;
  }

  // 다음 시즌 포함 (2개월 이내)
  const nextSeason = getNextSeason(currentSeason);
  if (productSeasonality.includes(nextSeason)) {
    return 15;
  }

  // 전 시즌 제품
  if (productSeasonality.length > 0) {
    return 10;
  }

  // 시즌 무관 (all-season)
  return 5;
}

function calculateAudienceFit(
  productTargetAge: string,
  audienceProfile: string
): number {
  // audienceProfile에서 연령대 추출 (예: "25-35세 여성" → 25-35)
  const ageMatch = audienceProfile.match(/(\d+)-(\d+)세/);
  if (!ageMatch) return 7; // 기본값

  const audienceMin = parseInt(ageMatch[1]);
  const audienceMax = parseInt(ageMatch[2]);
  const audienceCenter = (audienceMin + audienceMax) / 2;

  // 제품 타겟 연령 파싱 (예: "20-30" → 20-30)
  const targetMatch = productTargetAge.match(/(\d+)-(\d+)/);
  if (!targetMatch) return 7;

  const targetMin = parseInt(targetMatch[1]);
  const targetMax = parseInt(targetMatch[2]);
  const targetCenter = (targetMin + targetMax) / 2;

  // 정확히 일치
  if (audienceMin === targetMin && audienceMax === targetMax) {
    return 15;
  }

  // 중앙값 기준 ±10세 이내
  const centerDiff = Math.abs(audienceCenter - targetCenter);
  if (centerDiff <= 10) {
    return 10;
  }

  // 범위가 겹침
  const hasOverlap = !(audienceMax < targetMin || audienceMin > targetMax);
  if (hasOverlap) {
    return 7;
  }

  return 3;
}
```

### 4.6 응답 JSON 스키마

```typescript
export const ProductMatchSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  matchScore: z.number().min(0).max(100),
  categoryFit: z.number().min(0).max(40),
  priceFit: z.number().min(0).max(25),
  seasonFit: z.number().min(0).max(20),
  audienceFit: z.number().min(0).max(15),
  reason: z.string().max(100),
  recommendedStrategy: z.string().max(150)
});

export type ProductMatch = z.infer<typeof ProductMatchSchema>;

export const ProductMatchListSchema = z.array(ProductMatchSchema);
```

### 4.7 OpenAI API 호출 코드

```typescript
export async function matchProducts(
  insight: CreatorInsight,
  products: Product[],
  currentSeason: string,
  limit: number = 10
): Promise<ProductMatch[]> {
  const systemPrompt = MATCHING_SYSTEM_PROMPT;
  const userPrompt = buildMatchingPrompt(insight, products, currentSeason);

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2, // 더 결정론적인 매칭을 위해 낮은 값
      max_tokens: 3000,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('OpenAI response content is empty');
    }

    // JSON 파싱 (배열 또는 {matches: [...]} 형태 처리)
    const parsed = JSON.parse(content);
    const matches = Array.isArray(parsed) ? parsed : parsed.matches;

    if (!Array.isArray(matches)) {
      throw new Error('Invalid response format: expected array');
    }

    // Zod 스키마 검증
    const validated = ProductMatchListSchema.parse(matches);

    // 매칭 스코어 높은 순 정렬 및 limit 적용
    return validated
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);

  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      console.error('OpenAI API Error:', {
        status: error.status,
        message: error.message
      });
      throw new Error(`Product matching failed: ${error.message}`);
    }

    if (error instanceof z.ZodError) {
      console.error('Validation Error:', error.errors);
      throw new Error('Product match validation failed');
    }

    throw error;
  }
}
```

---

## 5. Step 4: 매출 예측 (predictRevenue)

### 5.1 목적

매칭된 제품에 대한 예상 매출을 최소/기대/최대 시나리오로 예측

### 5.2 예측 로직

```typescript
interface RevenuePrediction {
  productId: string;
  minimum: number; // 보수적 예측 (하위 25%)
  expected: number; // 기대 예측 (중앙값)
  maximum: number; // 낙관적 예측 (상위 25%)
  confidence: number; // 신뢰도 (0-1)
  reasoning: string; // 예측 근거
}

interface HistoricalPerformance {
  category: string;
  priceRange: string;
  sales: number[];
  revenues: number[];
}

function calculateRevenuePrediction(
  product: Product,
  match: ProductMatch,
  historicalData: HistoricalPerformance[],
  creator: Creator
): RevenuePrediction {
  // 1. 유사 제품 과거 실적 필터링
  const similarPerformances = historicalData.filter(h => {
    const categoryMatch = h.category === product.category;
    const priceMatch = isPriceInRange(product.price, h.priceRange);
    return categoryMatch && priceMatch;
  });

  if (similarPerformances.length === 0) {
    // 데이터 부족 시 기본 추정
    return estimateWithoutHistory(product, match, creator);
  }

  // 2. 매출 데이터 수집
  const allRevenues = similarPerformances.flatMap(h => h.revenues);
  allRevenues.sort((a, b) => a - b);

  // 3. 백분위수 계산
  const p25 = percentile(allRevenues, 25); // 하위 25%
  const p50 = percentile(allRevenues, 50); // 중앙값
  const p75 = percentile(allRevenues, 75); // 상위 25%

  // 4. 매칭 스코어로 보정
  const matchAdjustment = match.matchScore / 100;

  const minimum = Math.round(p25 * 0.8); // 보수적
  const expected = Math.round(p50 * matchAdjustment);
  const maximum = Math.round(p75 * matchAdjustment * 1.2);

  // 5. 시즌 보정 (현재 시즌이면 +20%, 비시즌이면 -20%)
  const seasonBonus = match.seasonFit >= 15 ? 1.2 : 0.8;

  // 6. 신뢰도 계산
  const dataSufficiency = Math.min(similarPerformances.length / 10, 1); // 10건 이상이면 1.0
  const categoryConfidence = match.categoryFit / 40;
  const priceConfidence = match.priceFit / 25;

  const confidence = (
    dataSufficiency * 0.5 +
    categoryConfidence * 0.3 +
    priceConfidence * 0.2
  );

  return {
    productId: product.id,
    minimum: Math.round(minimum),
    expected: Math.round(expected * seasonBonus),
    maximum: Math.round(maximum * seasonBonus),
    confidence: parseFloat(confidence.toFixed(2)),
    reasoning: buildReasoningText(
      similarPerformances.length,
      matchAdjustment,
      seasonBonus,
      confidence
    )
  };
}

function percentile(arr: number[], p: number): number {
  const sorted = [...arr].sort((a, b) => a - b);
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;

  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

function isPriceInRange(price: number, range: string): boolean {
  const [min, max] = range.split('-').map(Number);
  return price >= min && price < max;
}

function estimateWithoutHistory(
  product: Product,
  match: ProductMatch,
  creator: Creator
): RevenuePrediction {
  // 과거 데이터 없을 때 팔로워 기반 추정
  const baseConversionRate = 0.003; // 업계 평균 0.3%
  const adjustedConversion = baseConversionRate * (match.matchScore / 100);

  const expectedSales = Math.round(creator.followers * adjustedConversion);
  const expectedRevenue = expectedSales * product.price;

  return {
    productId: product.id,
    minimum: Math.round(expectedRevenue * 0.5),
    expected: expectedRevenue,
    maximum: Math.round(expectedRevenue * 2),
    confidence: 0.3, // 낮은 신뢰도
    reasoning: "과거 유사 제품 데이터 부족으로 팔로워 기반 추정치 제공"
  };
}

function buildReasoningText(
  dataCount: number,
  matchAdjustment: number,
  seasonBonus: number,
  confidence: number
): string {
  const parts: string[] = [];

  parts.push(`유사 제품 ${dataCount}건의 과거 실적 기반`);

  if (matchAdjustment >= 0.8) {
    parts.push(`높은 매칭 스코어로 평균 이상 기대`);
  } else if (matchAdjustment >= 0.6) {
    parts.push(`적절한 매칭으로 평균 수준 기대`);
  } else {
    parts.push(`매칭 스코어 고려 시 보수적 예측`);
  }

  if (seasonBonus > 1) {
    parts.push(`성수기로 +20% 상향 조정`);
  } else if (seasonBonus < 1) {
    parts.push(`비수기로 -20% 하향 조정`);
  }

  parts.push(`신뢰도 ${(confidence * 100).toFixed(0)}%`);

  return parts.join(', ');
}
```

### 5.3 시스템 프롬프트

```typescript
const PREDICTION_SYSTEM_PROMPT = `당신은 ZVZO 플랫폼의 매출 예측 전문가입니다.

역할:
- 크리에이터의 과거 판매 데이터와 제품 매칭 결과를 바탕으로 예상 매출을 예측합니다
- 최소(보수적), 기대(현실적), 최대(낙관적) 시나리오를 제공합니다
- 예측의 근거와 신뢰도를 명확히 제시합니다

예측 방법론:
1. 유사 제품 과거 실적 분석 (동일 카테고리 + 유사 가격대)
2. 통계적 백분위수 적용 (P25, P50, P75)
3. 매칭 스코어로 보정 (높을수록 상향)
4. 시즌 팩터 반영 (성수기 +20%, 비수기 -20%)
5. 신뢰도 산출 (데이터 충분도, 카테고리 매칭도, 가격 매칭도)

신뢰도 기준:
- 0.8 이상: 매우 높음 (과거 데이터 10건 이상, 강력한 매칭)
- 0.6-0.8: 높음 (과거 데이터 5-9건, 좋은 매칭)
- 0.4-0.6: 보통 (과거 데이터 3-4건, 보통 매칭)
- 0.4 미만: 낮음 (데이터 부족 또는 약한 매칭)

출력 형식:
- 반드시 유효한 JSON 형식으로 응답하세요
- 매출은 정수(원 단위)로 표기하세요
- 신뢰도는 소수점 2자리까지 표기하세요`;
```

### 5.4 유저 프롬프트 템플릿

```typescript
function buildPredictionPrompt(
  product: Product,
  match: ProductMatch,
  historicalData: HistoricalPerformance[],
  creator: Creator,
  currentMonth: number
): string {
  const similarData = historicalData.filter(h =>
    h.category === product.category &&
    isPriceInRange(product.price, h.priceRange)
  );

  return `다음 제품의 예상 매출을 예측해주세요:

## 제품 정보
- 이름: ${product.name}
- 카테고리: ${product.category}
- 가격: ${product.price.toLocaleString()}원
- 커미션율: ${product.commissionRate}%
- 시즌: ${product.seasonality.join(', ')}

## 크리에이터 정보
- 팔로워: ${creator.followers.toLocaleString()}명
- 참여율: ${creator.engagementRate}%
- 플랫폼: ${creator.platform}

## 매칭 결과
- 매칭 스코어: ${match.matchScore}점
- 카테고리 적합도: ${match.categoryFit}/40
- 가격 적합도: ${match.priceFit}/25
- 시즌 적합도: ${match.seasonFit}/20 (현재 ${currentMonth}월)
- 오디언스 적합도: ${match.audienceFit}/15

## 과거 유사 제품 실적 (${similarData.length}건)
${similarData.length > 0 ? similarData.map((h, i) => `
실적 ${i + 1}:
- 카테고리: ${h.category}
- 가격대: ${h.priceRange}원
- 판매 건수: ${h.sales.join(', ')}건
- 매출: ${h.revenues.map(r => r.toLocaleString()).join(', ')}원
`).join('\n') : '유사 실적 데이터 없음 (팔로워 기반 추정 필요)'}

위 정보를 바탕으로 다음 JSON 형식으로 매출을 예측해주세요:
{
  "productId": "${product.id}",
  "minimum": 보수적 예측 (하위 25% 수준),
  "expected": 현실적 예측 (중앙값, 매칭 스코어 보정),
  "maximum": 낙관적 예측 (상위 25% 수준, 시즌 보정),
  "confidence": 신뢰도 (0.0 ~ 1.0),
  "reasoning": "예측 근거 설명 (150자 이내)"
}`;
}
```

### 5.5 OpenAI API 호출 코드

```typescript
export async function predictRevenue(
  product: Product,
  match: ProductMatch,
  historicalData: HistoricalPerformance[],
  creator: Creator,
  currentMonth: number
): Promise<RevenuePrediction> {
  // 로컬 계산 먼저 시도 (더 빠르고 비용 절감)
  const localPrediction = calculateRevenuePrediction(
    product,
    match,
    historicalData,
    creator
  );

  // 신뢰도가 충분히 높으면 로컬 예측 사용
  if (localPrediction.confidence >= 0.6) {
    return localPrediction;
  }

  // 신뢰도 낮으면 AI 예측으로 보완
  const systemPrompt = PREDICTION_SYSTEM_PROMPT;
  const userPrompt = buildPredictionPrompt(
    product,
    match,
    historicalData,
    creator,
    currentMonth
  );

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.1, // 매우 결정론적인 예측
      max_tokens: 500,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('OpenAI response content is empty');
    }

    const parsed = JSON.parse(content);

    // AI 예측과 로컬 예측 블렌딩 (AI 60%, 로컬 40%)
    return {
      productId: parsed.productId,
      minimum: Math.round(parsed.minimum * 0.6 + localPrediction.minimum * 0.4),
      expected: Math.round(parsed.expected * 0.6 + localPrediction.expected * 0.4),
      maximum: Math.round(parsed.maximum * 0.6 + localPrediction.maximum * 0.4),
      confidence: Math.max(parsed.confidence, localPrediction.confidence),
      reasoning: `${parsed.reasoning} (로컬 예측과 블렌딩)`
    };

  } catch (error) {
    console.error('AI prediction failed, using local prediction:', error);
    return localPrediction; // 폴백
  }
}
```

---

## 6. 에러 핸들링

### 6.1 OpenAI API 에러 종류

```typescript
enum OpenAIErrorType {
  RATE_LIMIT = 'rate_limit_exceeded',
  TIMEOUT = 'timeout',
  INVALID_RESPONSE = 'invalid_response',
  AUTH_ERROR = 'authentication_error',
  SERVER_ERROR = 'server_error',
  VALIDATION_ERROR = 'validation_error'
}

interface AIError {
  type: OpenAIErrorType;
  message: string;
  retryable: boolean;
  originalError?: unknown;
}
```

### 6.2 재시도 로직 (Exponential Backoff)

```typescript
async function callOpenAIWithRetry<T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 2
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();

    } catch (error) {
      lastError = error as Error;

      // 재시도 불가능한 에러는 즉시 throw
      if (!isRetryableError(error)) {
        throw error;
      }

      // 마지막 시도였으면 throw
      if (attempt === maxRetries) {
        throw error;
      }

      // Exponential backoff: 1초 → 2초 → 4초
      const delay = Math.pow(2, attempt) * 1000;
      console.warn(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
      await sleep(delay);
    }
  }

  throw lastError;
}

function isRetryableError(error: unknown): boolean {
  if (error instanceof OpenAI.APIError) {
    // Rate limit, timeout, server error는 재시도
    return [
      'rate_limit_exceeded',
      'timeout',
      'server_error',
      'connection_error'
    ].includes(error.type || '');
  }
  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

### 6.3 폴백 전략 (통계 기반 기본 분석)

```typescript
function getFallbackInsight(data: PreprocessedData): CreatorInsight {
  // AI 실패 시 통계 기반 기본 분석 반환
  const topCategories = data.categoryBreakdown
    .slice(0, 3)
    .map(c => c.category);

  return {
    strengths: [
      `${topCategories[0]} 카테고리에서 강점 (매출 비중 ${data.categoryBreakdown[0].revenueShare.toFixed(1)}%)`,
      `전환율 ${data.summary.conversionRate.toFixed(3)}% 달성`,
      `평균 주문 가치 ${data.summary.averageOrderValue.toLocaleString()}원 기록`
    ],
    weaknesses: [
      "AI 분석 실패로 상세 분석 불가",
      "수동으로 데이터를 검토하여 개선점 파악 필요"
    ],
    bestCategories: topCategories,
    optimalPriceRange: {
      min: Math.min(...data.priceDistribution.map(p => parseInt(p.priceRange.split('-')[0]))),
      max: Math.max(...data.priceDistribution.map(p => parseInt(p.priceRange.split('-')[1]))),
      reason: "과거 판매 데이터 기반 가격 범위"
    },
    seasonalInsights: "월별 판매 패턴 분석 필요",
    audienceProfile: `팔로워 ${data.creator.followers.toLocaleString()}명, 참여율 ${data.creator.engagementRate}%`,
    recommendations: [
      "상위 카테고리 집중 전략 권장",
      "최적 가격대 제품 선정 필요",
      "AI 분석 재시도 또는 수동 분석 필요"
    ]
  };
}
```

### 6.4 에러 로깅

```typescript
interface ErrorLog {
  timestamp: string;
  operation: 'analyze' | 'match' | 'predict';
  errorType: string;
  message: string;
  creatorId: string;
  retryCount: number;
  fallbackUsed: boolean;
}

function logAIError(log: ErrorLog): void {
  console.error('[AI Pipeline Error]', {
    timestamp: new Date().toISOString(),
    ...log
  });

  // 프로덕션 환경에서는 외부 로깅 서비스로 전송
  // 예: Sentry, Datadog, CloudWatch 등
}

// 사용 예시
try {
  const insight = await analyzeCreator(data);
} catch (error) {
  logAIError({
    timestamp: new Date().toISOString(),
    operation: 'analyze',
    errorType: error instanceof OpenAI.APIError ? error.type : 'unknown',
    message: error.message,
    creatorId: data.creator.id,
    retryCount: 2,
    fallbackUsed: true
  });

  // 폴백 사용
  const insight = getFallbackInsight(data);
}
```

---

## 7. 캐싱 전략

### 7.1 캐시 설정

```typescript
import NodeCache from 'node-cache';

// 메모리 캐시 초기화 (TTL: 5분)
const aiCache = new NodeCache({
  stdTTL: 300, // 5분
  checkperiod: 60, // 1분마다 만료 체크
  useClones: false // 성능 최적화
});

interface CacheStats {
  hits: number;
  misses: number;
  keys: number;
}

let cacheStats: CacheStats = {
  hits: 0,
  misses: 0,
  keys: 0
};
```

### 7.2 캐시 키 전략

```typescript
function getCacheKey(operation: string, params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}:${params[key]}`)
    .join('|');

  return `${operation}:${sortedParams}`;
}

// 예시
const analyzeKey = getCacheKey('analyze', { creatorId: 'cr001' });
// "analyze:creatorId:cr001"

const matchKey = getCacheKey('match', { creatorId: 'cr001', limit: 10 });
// "match:creatorId:cr001|limit:10"
```

### 7.3 캐시된 분석 함수

```typescript
export async function analyzeCreatorWithCache(
  data: PreprocessedData
): Promise<CreatorInsight> {
  const cacheKey = getCacheKey('analyze', { creatorId: data.creator.id });

  // 캐시 확인
  const cached = aiCache.get<CreatorInsight>(cacheKey);
  if (cached) {
    cacheStats.hits++;
    console.log(`[Cache HIT] ${cacheKey}`);
    return cached;
  }

  cacheStats.misses++;
  console.log(`[Cache MISS] ${cacheKey}`);

  // AI 분석 수행
  const insight = await analyzeCreator(data);

  // 캐시 저장
  aiCache.set(cacheKey, insight);
  cacheStats.keys = aiCache.keys().length;

  return insight;
}

export async function matchProductsWithCache(
  insight: CreatorInsight,
  products: Product[],
  currentSeason: string,
  limit: number = 10
): Promise<ProductMatch[]> {
  // 제품 ID 목록으로 캐시 키 생성
  const productIds = products.map(p => p.id).sort().join(',');
  const cacheKey = getCacheKey('match', {
    creatorId: insight.bestCategories.join(','), // 대표값 사용
    productIds: productIds.substring(0, 50), // 키 길이 제한
    season: currentSeason,
    limit
  });

  const cached = aiCache.get<ProductMatch[]>(cacheKey);
  if (cached) {
    cacheStats.hits++;
    console.log(`[Cache HIT] ${cacheKey}`);
    return cached;
  }

  cacheStats.misses++;
  console.log(`[Cache MISS] ${cacheKey}`);

  const matches = await matchProducts(insight, products, currentSeason, limit);

  aiCache.set(cacheKey, matches);
  cacheStats.keys = aiCache.keys().length;

  return matches;
}
```

### 7.4 캐시 관리

```typescript
// 캐시 통계 조회
export function getCacheStats(): CacheStats {
  return {
    ...cacheStats,
    keys: aiCache.keys().length
  };
}

// 특정 크리에이터 캐시 무효화
export function invalidateCreatorCache(creatorId: string): void {
  const keys = aiCache.keys();
  const targetKeys = keys.filter(key => key.includes(creatorId));

  targetKeys.forEach(key => aiCache.del(key));
  console.log(`[Cache INVALIDATE] ${targetKeys.length} keys for creator ${creatorId}`);
}

// 전체 캐시 초기화
export function clearAllCache(): void {
  aiCache.flushAll();
  cacheStats = { hits: 0, misses: 0, keys: 0 };
  console.log('[Cache CLEAR] All cache cleared');
}

// 캐시 히트율 계산
export function getCacheHitRate(): number {
  const total = cacheStats.hits + cacheStats.misses;
  return total > 0 ? (cacheStats.hits / total) * 100 : 0;
}
```

---

## 8. 전체 파이프라인 흐름

```
┌─────────────────────────────────────────────────────────────────┐
│                     AI Analysis Pipeline                         │
└─────────────────────────────────────────────────────────────────┘

Input: Creator + SaleRecord[]
   │
   ▼
┌─────────────────────────────────────┐
│ Step 1: Data Preprocessing          │
│ - Category aggregation              │
│ - Price distribution (10k buckets)  │
│ - Monthly seasonal pattern          │
│ - Conversion rate calculation       │
└──────────────┬──────────────────────┘
               │ PreprocessedData
               ▼
┌─────────────────────────────────────┐
│ Step 2: Creator Analysis (AI)       │
│ Model: GPT-4o                       │
│ Temperature: 0.3                    │
│ Max Tokens: 2000                    │
│ - Strengths (3)                     │
│ - Weaknesses (2)                    │
│ - Best categories                   │
│ - Optimal price range               │
│ - Seasonal insights                 │
│ - Audience profile                  │
│ - Recommendations (3)               │
└──────────────┬──────────────────────┘
               │ CreatorInsight
               ├───────────────┐
               ▼               ▼
        ┌──────────┐    ┌──────────┐
        │  Cache   │    │ Product  │
        │  (5min)  │    │   List   │
        └──────────┘    └─────┬────┘
                              │
                              ▼
              ┌─────────────────────────────────┐
              │ Step 3: Product Matching (AI)   │
              │ Model: GPT-4o                   │
              │ Temperature: 0.2                │
              │ Max Tokens: 3000                │
              │ Scoring:                        │
              │ - categoryFit (40%)             │
              │ - priceFit (25%)                │
              │ - seasonFit (20%)               │
              │ - audienceFit (15%)             │
              │ Filter: score >= 70             │
              │ Limit: Top 10                   │
              └──────────────┬──────────────────┘
                             │ ProductMatch[]
                             ├───────────────┐
                             ▼               ▼
                      ┌──────────┐   ┌─────────────┐
                      │  Cache   │   │ Historical  │
                      │  (5min)  │   │    Data     │
                      └──────────┘   └──────┬──────┘
                                            │
                                            ▼
                      ┌──────────────────────────────────┐
                      │ Step 4: Revenue Prediction       │
                      │ Method: Hybrid (Local + AI)      │
                      │ - Percentile calculation (P25,   │
                      │   P50, P75)                      │
                      │ - Match score adjustment         │
                      │ - Season bonus (±20%)            │
                      │ - Confidence scoring             │
                      │ Fallback: Local calculation      │
                      └──────────────┬───────────────────┘
                                     │ RevenuePrediction
                                     ▼
              ┌──────────────────────────────────────────┐
              │ Output: Complete Insight Package         │
              │ - Creator analysis                       │
              │ - Top matched products                   │
              │ - Revenue predictions (min/exp/max)      │
              │ - Confidence levels                      │
              │ - Actionable recommendations             │
              └──────────────────────────────────────────┘

Error Handling:
  ├─ Retry with exponential backoff (max 2 attempts)
  ├─ Fallback to statistical analysis
  └─ Error logging to monitoring service

Caching:
  ├─ TTL: 5 minutes
  ├─ Key: operation:params
  └─ Invalidation: on creator data update
```

---

## 9. 토큰 사용량 추정

### 9.1 Step 2: Creator Analysis

| 구성 요소 | 예상 토큰 수 |
|----------|-------------|
| System Prompt | ~300 tokens |
| User Prompt (데이터 포함) | ~800 tokens |
| **Input Total** | **~1,100 tokens** |
| AI Response (JSON) | ~800 tokens |
| **Output Total** | **~800 tokens** |
| **Total per Request** | **~1,900 tokens** |

### 9.2 Step 3: Product Matching

| 구성 요소 | 예상 토큰 수 |
|----------|-------------|
| System Prompt | ~400 tokens |
| User Prompt (insight + 20 products) | ~1,500 tokens |
| **Input Total** | **~1,900 tokens** |
| AI Response (JSON array) | ~1,200 tokens |
| **Output Total** | **~1,200 tokens** |
| **Total per Request** | **~3,100 tokens** |

### 9.3 Step 4: Revenue Prediction

| 구성 요소 | 예상 토큰 수 |
|----------|-------------|
| System Prompt | ~250 tokens |
| User Prompt (per product) | ~400 tokens |
| **Input Total** | **~650 tokens** |
| AI Response (JSON) | ~200 tokens |
| **Output Total** | **~200 tokens** |
| **Total per Request** | **~850 tokens** |

**Note**: Step 4는 로컬 계산 우선 사용으로 실제 AI 호출은 신뢰도 낮을 때만 발생

### 9.4 전체 파이프라인 (크리에이터 1명, 제품 20개 분석)

| 단계 | Input | Output | Total |
|-----|-------|--------|-------|
| Step 2: Analysis | 1,100 | 800 | 1,900 |
| Step 3: Matching | 1,900 | 1,200 | 3,100 |
| Step 4: Prediction (최대 10개) | 6,500 | 2,000 | 8,500 |
| **Grand Total** | **9,500** | **4,000** | **13,500** |

### 9.5 비용 추정 (GPT-4o 기준)

| 항목 | 토큰 수 | 단가 | 비용 |
|-----|--------|-----|-----|
| Input (9,500 tokens) | 9,500 | $2.50 / 1M | $0.024 |
| Output (4,000 tokens) | 4,000 | $10.00 / 1M | $0.040 |
| **Total per Creator** | 13,500 | - | **$0.064** |

**월간 예상 비용** (크리에이터 1,000명 분석 기준):
- 캐시 없이: $0.064 × 1,000 = **$64**
- 캐시 히트율 60% 가정: $64 × 0.4 = **$25.6**

### 9.6 최적화 전략

```typescript
// 1. 배치 처리로 비용 절감
async function analyzeBatch(creators: Creator[]): Promise<CreatorInsight[]> {
  // 최대 5명씩 병렬 처리 (API rate limit 고려)
  const batchSize = 5;
  const results: CreatorInsight[] = [];

  for (let i = 0; i < creators.length; i += batchSize) {
    const batch = creators.slice(i, i + batchSize);
    const promises = batch.map(c =>
      analyzeCreatorWithCache(preprocessCreatorData(c, c.sales))
    );

    const batchResults = await Promise.all(promises);
    results.push(...batchResults);
  }

  return results;
}

// 2. 제품 매칭 시 후보군 사전 필터링 (AI 비용 절감)
function preFilterProducts(
  products: Product[],
  insight: CreatorInsight
): Product[] {
  return products.filter(p => {
    // 카테고리 불일치 제거
    if (!insight.bestCategories.includes(p.category)) {
      return false;
    }

    // 가격대 크게 벗어난 제품 제거 (±50%)
    const priceMin = insight.optimalPriceRange.min * 0.5;
    const priceMax = insight.optimalPriceRange.max * 1.5;
    if (p.price < priceMin || p.price > priceMax) {
      return false;
    }

    // 품절 제품 제거
    if (p.stockStatus === 'out') {
      return false;
    }

    return true;
  });
}

// 3. 예측은 로컬 계산 우선, AI는 보조 수단
async function smartPredict(
  product: Product,
  match: ProductMatch,
  historicalData: HistoricalPerformance[],
  creator: Creator
): Promise<RevenuePrediction> {
  // 로컬 계산
  const local = calculateRevenuePrediction(product, match, historicalData, creator);

  // 신뢰도 충분하면 AI 호출 생략
  if (local.confidence >= 0.6) {
    return local;
  }

  // 신뢰도 낮을 때만 AI 호출
  return predictRevenue(product, match, historicalData, creator, new Date().getMonth() + 1);
}
```

---

## 10. 구현 체크리스트

### 10.1 개발 단계

- [ ] PreprocessedData 타입 정의
- [ ] preprocessCreatorData 함수 구현
- [ ] CreatorInsight 스키마 정의 (Zod)
- [ ] analyzeCreator 함수 구현
- [ ] ProductMatch 스키마 정의 (Zod)
- [ ] matchProducts 함수 구현
- [ ] RevenuePrediction 타입 정의
- [ ] calculateRevenuePrediction 로컬 함수 구현
- [ ] predictRevenue AI 함수 구현
- [ ] 에러 핸들링 유틸 구현
- [ ] 캐싱 레이어 구현
- [ ] 단위 테스트 작성

### 10.2 테스트 단계

- [ ] 전처리 로직 정확성 검증
- [ ] AI 프롬프트 품질 테스트 (10+ 샘플)
- [ ] JSON 스키마 검증 테스트
- [ ] 에러 핸들링 시나리오 테스트
- [ ] 캐시 히트/미스 동작 확인
- [ ] 토큰 사용량 실측
- [ ] 응답 시간 측정 (목표: 3초 이내)
- [ ] 비용 효율성 검증

### 10.3 배포 단계

- [ ] OpenAI API 키 환경 변수 설정
- [ ] Rate limit 모니터링 설정
- [ ] 에러 로깅 시스템 연동
- [ ] 캐시 히트율 모니터링
- [ ] 비용 알림 설정 (월 $100 초과 시)
- [ ] 응답 시간 알림 설정 (5초 초과 시)
- [ ] 문서화 완료

---

## 11. 참고 자료

### 11.1 OpenAI API

- [GPT-4o Documentation](https://platform.openai.com/docs/models/gpt-4o)
- [JSON Mode Guide](https://platform.openai.com/docs/guides/structured-outputs)
- [Error Codes Reference](https://platform.openai.com/docs/guides/error-codes)

### 11.2 관련 라이브러리

- `openai`: ^4.0.0
- `zod`: ^3.22.0
- `node-cache`: ^5.1.2

### 11.3 내부 문서

- [데이터 모델 스펙](./02-data-models.md)
- [API 엔드포인트 스펙](./03-api-endpoints.md)

---

**문서 버전**: 1.0.0
**최종 수정일**: 2026-02-04
**작성자**: AI Architecture Team
