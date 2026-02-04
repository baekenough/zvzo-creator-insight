# 02. 데이터 모델 & Mock 데이터 스펙

> **프로젝트**: zvzo-creator-insight
> **작성일**: 2026-02-04
> **버전**: 1.0.0

## 목차

1. [TypeScript 인터페이스 정의](#1-typescript-인터페이스-정의)
2. [Mock 데이터 생성 규칙](#2-mock-데이터-생성-규칙)
3. [Mock 데이터 파일 구조](#3-mock-데이터-파일-구조)
4. [데이터 간 관계](#4-데이터-간-관계)
5. [Zod 스키마 정의](#5-zod-스키마-정의)
6. [샘플 Mock 데이터](#6-샘플-mock-데이터)

---

## 1. TypeScript 인터페이스 정의

### 1.1 Core Entities (핵심 엔티티)

#### Platform (플랫폼)

```typescript
/**
 * 크리에이터가 활동하는 소셜 미디어 플랫폼
 *
 * @remarks
 * - Instagram: 이미지/릴스 중심, 패션/뷰티 강세
 * - YouTube: 동영상 중심, 다양한 카테고리
 * - TikTok: 숏폼 중심, 트렌디한 콘텐츠
 * - Blog: 블로그 기반, 상세 리뷰
 */
export enum Platform {
  Instagram = 'Instagram',
  YouTube = 'YouTube',
  TikTok = 'TikTok',
  Blog = 'Blog',
}
```

#### Category (카테고리)

```typescript
/**
 * 제품 카테고리 및 크리에이터 전문 분야
 *
 * @remarks
 * 각 카테고리별로 다른 전환율과 시즌별 패턴을 가짐
 */
export enum Category {
  Beauty = 'Beauty',           // 뷰티 (화장품, 스킨케어)
  Fashion = 'Fashion',         // 패션 (의류, 액세서리)
  Lifestyle = 'Lifestyle',     // 라이프스타일 (생활용품)
  Food = 'Food',               // 식품 (건강식품, 간편식)
  Tech = 'Tech',               // 테크 (전자기기, 가젯)
  HomeLiving = 'HomeLiving',   // 홈리빙 (인테리어, 가구)
  Health = 'Health',           // 건강 (운동기구, 건강용품)
  BabyKids = 'BabyKids',       // 유아 (유아용품, 완구)
  Pet = 'Pet',                 // 반려동물 (펫 용품, 사료)
  Stationery = 'Stationery',   // 문구 (문구류, 오피스용품)
}
```

#### Season (시즌)

```typescript
/**
 * 시즌별 판매 패턴 분석을 위한 계절 구분
 *
 * @remarks
 * - Spring (3-5월): 패션, 뷰티 증가
 * - Summer (6-8월): 라이프스타일, 식품 증가
 * - Fall (9-11월): 홈리빙, 건강 증가
 * - Winter (12-2월): 테크, 유아 증가
 */
export enum Season {
  Spring = 'Spring',   // 봄 (3-5월)
  Summer = 'Summer',   // 여름 (6-8월)
  Fall = 'Fall',       // 가을 (9-11월)
  Winter = 'Winter',   // 겨울 (12-2월)
}
```

#### Creator (크리에이터)

```typescript
/**
 * 크리에이터 정보
 *
 * @remarks
 * ZVZO 플랫폼에 등록된 인플루언서 정보를 나타냄.
 * 각 크리에이터는 하나 이상의 전문 카테고리를 가지며,
 * 플랫폼별로 다른 팔로워 규모와 영향력을 가질 수 있음.
 */
export interface Creator {
  /**
   * 크리에이터 고유 식별자
   * @example "creator-001"
   */
  id: string;

  /**
   * 크리에이터 이름
   * @example "김지은"
   */
  name: string;

  /**
   * 활동 플랫폼
   * @see Platform
   */
  platform: Platform;

  /**
   * 팔로워 수
   * @remarks
   * - 10,000 ~ 1,000,000 범위
   * - 로그 분포를 따름
   * @minimum 10000
   * @maximum 1000000
   * @example 250000
   */
  followerCount: number;

  /**
   * 전문 카테고리 목록 (2~3개)
   * @remarks
   * 크리에이터가 주로 다루는 제품 카테고리.
   * 최소 2개, 최대 3개의 카테고리를 가짐.
   * @minItems 2
   * @maxItems 3
   * @example ["Beauty", "Fashion"]
   */
  categories: Category[];

  /**
   * 이메일 주소
   * @format email
   * @example "jieun.kim@example.com"
   */
  email: string;

  /**
   * ZVZO 플랫폼 가입일
   * @format date-time
   * @example "2025-01-15T09:00:00Z"
   */
  joinedAt: string;
}
```

#### Product (제품)

```typescript
/**
 * 판매 제품 정보
 *
 * @remarks
 * ZVZO 플랫폼에서 크리에이터가 홍보/판매할 수 있는 제품 정보.
 * 각 제품은 특정 카테고리에 속하며, 가격대에 따라 다른 전환율을 보임.
 */
export interface Product {
  /**
   * 제품 고유 식별자
   * @example "product-001"
   */
  id: string;

  /**
   * 제품명
   * @example "글로우 세럼"
   */
  name: string;

  /**
   * 제품 카테고리
   * @see Category
   */
  category: Category;

  /**
   * 제품 가격 (KRW)
   * @remarks
   * - 10,000원 ~ 200,000원 범위
   * - 카테고리별 특성 반영:
   *   - Beauty: 30,000 ~ 80,000
   *   - Fashion: 40,000 ~ 150,000
   *   - Tech: 80,000 ~ 200,000
   *   - Food: 10,000 ~ 50,000
   * @minimum 10000
   * @maximum 200000
   * @example 45000
   */
  price: number;

  /**
   * 브랜드명
   * @example "글로우랩"
   */
  brandName: string;

  /**
   * 제품 이미지 URL
   * @format uri
   * @example "https://example.com/images/glow-serum.jpg"
   */
  imageUrl: string;

  /**
   * 제품 설명
   * @example "피부 탄력을 높여주는 고농축 세럼"
   */
  description: string;
}
```

#### SaleRecord (판매 이력)

```typescript
/**
 * 크리에이터별 제품 판매 이력
 *
 * @remarks
 * 특정 크리에이터가 특정 제품을 홍보하여 발생한 판매 기록.
 * 클릭 수, 전환율, 수익 등의 성과 지표를 포함.
 */
export interface SaleRecord {
  /**
   * 판매 기록 고유 식별자
   * @example "sale-00001"
   */
  id: string;

  /**
   * 크리에이터 ID
   * @see Creator.id
   * @example "creator-001"
   */
  creatorId: string;

  /**
   * 제품 ID
   * @see Product.id
   * @example "product-015"
   */
  productId: string;

  /**
   * 판매 발생 일시
   * @format date-time
   * @remarks
   * 최근 6개월 내 데이터
   * @example "2025-08-15T14:30:00Z"
   */
  soldAt: string;

  /**
   * 판매 수량
   * @minimum 1
   * @example 3
   */
  quantity: number;

  /**
   * 총 판매 금액 (KRW)
   * @remarks
   * quantity * Product.price
   * @example 135000
   */
  revenue: number;

  /**
   * 크리에이터 수수료 (KRW)
   * @remarks
   * revenue의 10~20% (제품 카테고리에 따라 상이)
   * @example 20250
   */
  commission: number;

  /**
   * 링크 클릭 수
   * @remarks
   * 크리에이터가 공유한 제품 링크의 클릭 수
   * @minimum 0
   * @example 450
   */
  clickCount: number;

  /**
   * 전환율 (%)
   * @remarks
   * (quantity / clickCount) * 100
   * 카테고리별 평균 전환율:
   * - Beauty: 3-5%
   * - Fashion: 2-4%
   * - Food: 4-6%
   * - Tech: 1-3%
   * @minimum 0
   * @maximum 100
   * @example 3.5
   */
  conversionRate: number;
}
```

---

### 1.2 AI Analysis Types (AI 분석 결과)

#### CreatorInsight (크리에이터 인사이트)

```typescript
/**
 * 크리에이터의 판매 성과에 대한 AI 종합 분석 결과
 *
 * @remarks
 * - 카테고리별 강점 분석
 * - 가격대별 성과 분석
 * - 시즌별 트렌드 분석
 * - 베스트 판매 제품 분석
 *
 * AI 모델(Claude)이 과거 판매 데이터를 기반으로 생성.
 */
export interface CreatorInsight {
  /**
   * 분석 대상 크리에이터 ID
   * @see Creator.id
   * @example "creator-001"
   */
  creatorId: string;

  /**
   * 카테고리별 성과 점수
   * @remarks
   * 각 카테고리에서의 판매 성과를 0~100점으로 평가
   * @example [{ category: "Beauty", score: 85, ... }, ...]
   */
  categoryScores: CategoryScore[];

  /**
   * 가격대별 성과 분포
   * @remarks
   * 어떤 가격대의 제품이 잘 팔리는지 분석
   * @example [{ range: "30000-50000", count: 45, ... }, ...]
   */
  priceBuckets: PriceBucket[];

  /**
   * 시즌별 판매 데이터
   * @remarks
   * 봄/여름/가을/겨울 각 시즌별 판매 패턴 분석
   * @example [{ season: "Spring", salesCount: 120, ... }, ...]
   */
  seasonalData: SeasonalData[];

  /**
   * 베스트 판매 제품 목록 (상위 10개)
   * @remarks
   * 판매량 기준 상위 제품 ID 목록
   * @minItems 0
   * @maxItems 10
   * @example ["product-015", "product-023", "product-008"]
   */
  topProducts: string[];

  /**
   * 평균 전환율 (%)
   * @remarks
   * 전체 판매 기록의 평균 전환율
   * @minimum 0
   * @maximum 100
   * @example 3.8
   */
  averageConversionRate: number;

  /**
   * 총 판매 수익 (KRW)
   * @remarks
   * 분석 기간 동안의 총 수익
   * @example 15750000
   */
  totalRevenue: number;

  /**
   * 분석 생성 일시
   * @format date-time
   * @example "2026-02-04T10:00:00Z"
   */
  analyzedAt: string;
}
```

#### CategoryScore (카테고리 점수)

```typescript
/**
 * 특정 카테고리에서의 크리에이터 성과 점수
 *
 * @remarks
 * 판매량, 수익, 전환율을 종합하여 0~100점으로 평가
 */
export interface CategoryScore {
  /**
   * 카테고리
   * @see Category
   */
  category: Category;

  /**
   * 성과 점수 (0~100)
   * @remarks
   * AI가 판매량, 수익, 전환율을 종합하여 산출
   * - 90~100: 최상위 (Top tier)
   * - 70~89: 상위 (High performer)
   * - 50~69: 중위 (Average)
   * - 30~49: 하위 (Below average)
   * - 0~29: 최하위 (Poor)
   * @minimum 0
   * @maximum 100
   * @example 85
   */
  score: number;

  /**
   * 해당 카테고리 총 판매 건수
   * @minimum 0
   * @example 45
   */
  salesCount: number;

  /**
   * 해당 카테고리 총 수익 (KRW)
   * @minimum 0
   * @example 3750000
   */
  totalRevenue: number;

  /**
   * 해당 카테고리 평균 전환율 (%)
   * @minimum 0
   * @maximum 100
   * @example 4.2
   */
  avgConversionRate: number;
}
```

#### PriceBucket (가격대 분포)

```typescript
/**
 * 특정 가격대에서의 판매 성과
 *
 * @remarks
 * 크리에이터가 어떤 가격대의 제품을 잘 판매하는지 분석
 */
export interface PriceBucket {
  /**
   * 가격 범위 (KRW)
   * @remarks
   * "최소가격-최대가격" 형식
   * @pattern ^\d+-\d+$
   * @example "30000-50000"
   */
  range: string;

  /**
   * 해당 가격대 판매 건수
   * @minimum 0
   * @example 28
   */
  count: number;

  /**
   * 해당 가격대 총 수익 (KRW)
   * @minimum 0
   * @example 1120000
   */
  revenue: number;

  /**
   * 해당 가격대 최고 성과 제품의 가격 (KRW)
   * @remarks
   * 이 가격대에서 가장 많이 팔린 제품의 가격
   * @example 45000
   */
  bestPerformingPrice: number;
}
```

#### SeasonalData (시즌별 데이터)

```typescript
/**
 * 특정 시즌에서의 판매 데이터
 *
 * @remarks
 * 시즌별로 강세를 보이는 카테고리와 판매량 분석
 */
export interface SeasonalData {
  /**
   * 시즌
   * @see Season
   */
  season: Season;

  /**
   * 해당 시즌 총 판매 건수
   * @minimum 0
   * @example 65
   */
  salesCount: number;

  /**
   * 해당 시즌 총 수익 (KRW)
   * @minimum 0
   * @example 4250000
   */
  revenue: number;

  /**
   * 해당 시즌 상위 카테고리 (최대 3개)
   * @remarks
   * 이 시즌에 가장 많이 팔린 카테고리 순서대로 정렬
   * @minItems 0
   * @maxItems 3
   * @example ["Beauty", "Fashion"]
   */
  topCategories: Category[];
}
```

---

### 1.3 AI Recommendation Types (AI 추천 결과)

#### ProductMatch (제품 매칭)

```typescript
/**
 * AI가 추천하는 크리에이터-제품 매칭 결과
 *
 * @remarks
 * 크리에이터의 과거 성과, 전문 카테고리, 팔로워 특성 등을 고려하여
 * 특정 제품이 해당 크리에이터에게 적합한지 AI가 평가.
 */
export interface ProductMatch {
  /**
   * 추천 제품 ID
   * @see Product.id
   * @example "product-023"
   */
  productId: string;

  /**
   * 대상 크리에이터 ID
   * @see Creator.id
   * @example "creator-005"
   */
  creatorId: string;

  /**
   * 매칭 점수 (0~100)
   * @remarks
   * AI가 평가한 크리에이터-제품 적합도
   * - 90~100: 매우 높은 적합도 (Excellent match)
   * - 70~89: 높은 적합도 (Good match)
   * - 50~69: 보통 적합도 (Fair match)
   * - 30~49: 낮은 적합도 (Poor match)
   * - 0~29: 매우 낮은 적합도 (Bad match)
   * @minimum 0
   * @maximum 100
   * @example 87
   */
  matchScore: number;

  /**
   * 추천 사유
   * @remarks
   * AI가 생성한 추천 근거 설명
   * @example "김지은님은 뷰티 카테고리에서 평균 4.2%의 높은 전환율을 기록 중이며, 30,000~50,000원 가격대 제품에서 강세를 보입니다. 이 세럼은 해당 가격대에 속하며, 봄 시즌 뷰티 제품 판매가 20% 증가하는 패턴과 일치합니다."
   */
  reason: string;

  /**
   * 예상 수익 (KRW)
   * @remarks
   * AI가 예측한 이 제품의 예상 판매 수익
   * @minimum 0
   * @example 850000
   */
  expectedRevenue: number;

  /**
   * 신뢰도 수준
   * @remarks
   * AI 예측의 신뢰도
   * - High: 충분한 유사 데이터 존재, 높은 신뢰도
   * - Medium: 일부 유사 데이터 존재, 중간 신뢰도
   * - Low: 유사 데이터 부족, 낮은 신뢰도
   */
  confidenceLevel: 'High' | 'Medium' | 'Low';
}
```

#### RevenuePrediction (매출 예측)

```typescript
/**
 * 특정 크리에이터-제품 조합의 예상 매출 예측
 *
 * @remarks
 * 과거 판매 데이터, 시즌 트렌드, 카테고리 성과 등을 기반으로
 * AI가 예측한 향후 매출 정보.
 */
export interface RevenuePrediction {
  /**
   * 제품 ID
   * @see Product.id
   * @example "product-023"
   */
  productId: string;

  /**
   * 크리에이터 ID
   * @see Creator.id
   * @example "creator-005"
   */
  creatorId: string;

  /**
   * 예측 매출 (KRW)
   * @remarks
   * AI가 예측한 향후 1개월간 예상 매출
   * @minimum 0
   * @example 1250000
   */
  predictedRevenue: number;

  /**
   * 신뢰 구간
   * @remarks
   * 예측의 불확실성을 나타내는 최소~최대 범위
   * @example { min: 950000, max: 1550000 }
   */
  confidenceInterval: {
    /**
     * 최소 예상 매출 (KRW)
     * @minimum 0
     */
    min: number;

    /**
     * 최대 예상 매출 (KRW)
     * @minimum 0
     */
    max: number;
  };

  /**
   * 예측 근거 요인들
   * @remarks
   * AI가 고려한 주요 요인들 (자연어)
   * @minItems 1
   * @example [
   *   "과거 동일 카테고리 평균 전환율 4.2%",
   *   "봄 시즌 뷰티 제품 판매 20% 증가 패턴",
   *   "팔로워 25만명, 참여율 3.5%",
   *   "유사 가격대 제품 평균 판매량 35개/월"
   * ]
   */
  factors: string[];
}
```

---

### 1.4 API Request/Response Types

#### GetCreatorInsightRequest

```typescript
/**
 * 크리에이터 인사이트 조회 요청
 */
export interface GetCreatorInsightRequest {
  /**
   * 조회할 크리에이터 ID
   * @see Creator.id
   * @example "creator-001"
   */
  creatorId: string;
}
```

#### GetCreatorInsightResponse

```typescript
/**
 * 크리에이터 인사이트 조회 응답
 */
export interface GetCreatorInsightResponse {
  /**
   * 요청 성공 여부
   */
  success: boolean;

  /**
   * 인사이트 데이터 (성공 시)
   * @see CreatorInsight
   */
  data: CreatorInsight | null;

  /**
   * 에러 메시지 (실패 시)
   * @example "크리에이터를 찾을 수 없습니다."
   */
  error?: string;
}
```

#### GetProductMatchesRequest

```typescript
/**
 * 제품 매칭 추천 조회 요청
 */
export interface GetProductMatchesRequest {
  /**
   * 대상 크리에이터 ID
   * @see Creator.id
   * @example "creator-005"
   */
  creatorId: string;

  /**
   * 반환할 최대 추천 개수
   * @default 10
   * @minimum 1
   * @maximum 50
   * @example 10
   */
  limit?: number;
}
```

#### GetProductMatchesResponse

```typescript
/**
 * 제품 매칭 추천 조회 응답
 */
export interface GetProductMatchesResponse {
  /**
   * 요청 성공 여부
   */
  success: boolean;

  /**
   * 추천 제품 매칭 목록 (성공 시)
   * @remarks
   * matchScore 기준 내림차순 정렬
   */
  data: ProductMatch[];

  /**
   * 에러 메시지 (실패 시)
   * @example "크리에이터를 찾을 수 없습니다."
   */
  error?: string;
}
```

#### GetRevenuePredictionRequest

```typescript
/**
 * 매출 예측 조회 요청
 */
export interface GetRevenuePredictionRequest {
  /**
   * 대상 크리에이터 ID
   * @see Creator.id
   * @example "creator-005"
   */
  creatorId: string;

  /**
   * 대상 제품 ID
   * @see Product.id
   * @example "product-023"
   */
  productId: string;
}
```

#### GetRevenuePredictionResponse

```typescript
/**
 * 매출 예측 조회 응답
 */
export interface GetRevenuePredictionResponse {
  /**
   * 요청 성공 여부
   */
  success: boolean;

  /**
   * 매출 예측 데이터 (성공 시)
   * @see RevenuePrediction
   */
  data: RevenuePrediction | null;

  /**
   * 에러 메시지 (실패 시)
   * @example "크리에이터 또는 제품을 찾을 수 없습니다."
   */
  error?: string;
}
```

---

## 2. Mock 데이터 생성 규칙

### 2.1 Creators (크리에이터 20명)

#### 플랫폼별 분포

| 플랫폼 | 인원 | 주력 카테고리 |
|--------|------|--------------|
| Instagram | 8명 | Fashion, Beauty 중심 |
| YouTube | 7명 | Lifestyle, Tech, Food 중심 |
| TikTok | 5명 | 다양한 카테고리 골고루 분포 |

#### 팔로워 수 분포

```
로그 스케일 분포:
- 마이크로 인플루언서 (10,000 ~ 50,000): 6명 (30%)
- 중형 인플루언서 (50,000 ~ 200,000): 8명 (40%)
- 대형 인플루언서 (200,000 ~ 1,000,000): 6명 (30%)
```

#### 카테고리 할당 규칙

```
각 크리에이터:
- 주력 카테고리: 2~3개
- 플랫폼별 특성 반영:
  * Instagram: Beauty + Fashion 조합 많음
  * YouTube: Tech + Lifestyle, Food + Health 조합
  * TikTok: 다양한 조합 (트렌드 반영)
```

#### ID 생성 규칙

```
형식: "creator-{3자리 숫자}"
예시: "creator-001", "creator-002", ..., "creator-020"
```

---

### 2.2 Products (제품 50개)

#### 카테고리별 분포 (각 5개)

| 카테고리 | 개수 | 가격대 (KRW) | 주요 제품 예시 |
|----------|------|--------------|----------------|
| Beauty | 5 | 30,000 ~ 80,000 | 세럼, 크림, 마스크팩, 립스틱, 아이섀도우 |
| Fashion | 5 | 40,000 ~ 150,000 | 청바지, 니트, 코트, 가방, 운동화 |
| Lifestyle | 5 | 20,000 ~ 100,000 | 디퓨저, 캔들, 텀블러, 쿠션, 담요 |
| Food | 5 | 10,000 ~ 50,000 | 프로틴바, 견과류, 차, 건강즙, 간편식 |
| Tech | 5 | 80,000 ~ 200,000 | 이어폰, 스마트워치, 충전기, 마우스, 키보드 |
| HomeLiving | 5 | 30,000 ~ 120,000 | 수납함, 조명, 식탁, 의자, 러그 |
| Health | 5 | 25,000 ~ 90,000 | 요가매트, 덤벨, 마사지기, 밴드, 폼롤러 |
| BabyKids | 5 | 20,000 ~ 80,000 | 기저귀, 완구, 책, 식기, 의류 |
| Pet | 5 | 15,000 ~ 70,000 | 사료, 간식, 장난감, 목줄, 방석 |
| Stationery | 5 | 10,000 ~ 40,000 | 플래너, 펜, 노트, 파일, 스티커 |

#### 가격 생성 규칙

```typescript
// 카테고리별 가격 범위
const priceRanges: Record<Category, [number, number]> = {
  Beauty: [30000, 80000],
  Fashion: [40000, 150000],
  Lifestyle: [20000, 100000],
  Food: [10000, 50000],
  Tech: [80000, 200000],
  HomeLiving: [30000, 120000],
  Health: [25000, 90000],
  BabyKids: [20000, 80000],
  Pet: [15000, 70000],
  Stationery: [10000, 40000],
};

// 가격은 천원 단위로 반올림
// 예: 33000, 45000, 78000
```

#### ID 생성 규칙

```
형식: "product-{3자리 숫자}"
예시: "product-001", "product-002", ..., "product-050"
```

---

### 2.3 Sales History (판매 이력)

#### 생성 규칙

```
크리에이터당: 30~80건 (랜덤)
기간: 최근 6개월 (2025-08-01 ~ 2026-02-01)
총 예상 레코드 수: 약 1,000~1,600건
```

#### 시즌별 패턴 반영

```typescript
// 시즌별 카테고리 판매량 가중치
const seasonalWeights = {
  Spring: {  // 3-5월
    Beauty: 1.3,      // 30% 증가
    Fashion: 1.2,     // 20% 증가
    Lifestyle: 1.0,
    Food: 0.9,
    // ...
  },
  Summer: {  // 6-8월
    Lifestyle: 1.3,
    Food: 1.2,
    Health: 1.1,
    // ...
  },
  Fall: {    // 9-11월
    HomeLiving: 1.3,
    Health: 1.2,
    Fashion: 1.1,
    // ...
  },
  Winter: {  // 12-2월
    Tech: 1.3,
    BabyKids: 1.2,
    Pet: 1.1,
    // ...
  },
};
```

#### 카테고리별 전환율

```typescript
const conversionRates: Record<Category, [number, number]> = {
  Beauty: [3.0, 5.0],          // 3~5%
  Fashion: [2.0, 4.0],         // 2~4%
  Lifestyle: [2.5, 4.5],       // 2.5~4.5%
  Food: [4.0, 6.0],            // 4~6%
  Tech: [1.0, 3.0],            // 1~3%
  HomeLiving: [2.0, 3.5],      // 2~3.5%
  Health: [2.5, 4.0],          // 2.5~4%
  BabyKids: [3.0, 5.0],        // 3~5%
  Pet: [3.5, 5.5],             // 3.5~5.5%
  Stationery: [2.0, 3.5],      // 2~3.5%
};
```

#### 가격대별 전환율 보정

```typescript
const priceConversionMultiplier = (price: number): number => {
  if (price < 30000) return 1.5;      // 저가: +50%
  if (price < 80000) return 1.0;      // 중가: 기준
  return 0.7;                         // 고가: -30%
};
```

#### 판매량 생성 규칙

```typescript
// 1. 기본 클릭 수 생성 (100~1000)
const clickCount = random(100, 1000);

// 2. 카테고리별 전환율 적용
const baseConversionRate = random(
  conversionRates[category][0],
  conversionRates[category][1]
);

// 3. 가격대별 보정
const finalConversionRate =
  baseConversionRate * priceConversionMultiplier(price);

// 4. 판매량 계산
const quantity = Math.floor(clickCount * (finalConversionRate / 100));

// 5. 수익 계산
const revenue = quantity * price;

// 6. 수수료 계산 (10~20%, 카테고리별 상이)
const commissionRate = getCommissionRate(category); // 0.10 ~ 0.20
const commission = revenue * commissionRate;
```

#### ID 생성 규칙

```
형식: "sale-{5자리 숫자}"
예시: "sale-00001", "sale-00002", ..., "sale-01600"
```

---

## 3. Mock 데이터 파일 구조

```
src/data/
├── creators.json         # Creator[] 배열 (20개)
├── products.json         # Product[] 배열 (50개)
├── sales-history.json    # SaleRecord[] 배열 (약 1,000~1,600개)
└── index.ts             # 데이터 로딩 유틸리티
```

### 3.1 creators.json

```json
[
  {
    "id": "creator-001",
    "name": "김지은",
    "platform": "Instagram",
    "followerCount": 250000,
    "categories": ["Beauty", "Fashion"],
    "email": "jieun.kim@example.com",
    "joinedAt": "2025-01-15T09:00:00Z"
  },
  ...
]
```

### 3.2 products.json

```json
[
  {
    "id": "product-001",
    "name": "글로우 세럼",
    "category": "Beauty",
    "price": 45000,
    "brandName": "글로우랩",
    "imageUrl": "https://example.com/images/glow-serum.jpg",
    "description": "피부 탄력을 높여주는 고농축 세럼"
  },
  ...
]
```

### 3.3 sales-history.json

```json
[
  {
    "id": "sale-00001",
    "creatorId": "creator-001",
    "productId": "product-015",
    "soldAt": "2025-08-15T14:30:00Z",
    "quantity": 3,
    "revenue": 135000,
    "commission": 20250,
    "clickCount": 450,
    "conversionRate": 3.5
  },
  ...
]
```

### 3.4 index.ts (로딩 유틸리티)

```typescript
import creatorsData from './creators.json';
import productsData from './products.json';
import salesHistoryData from './sales-history.json';
import type { Creator, Product, SaleRecord } from '../types';

/**
 * 크리에이터 데이터 로드
 *
 * @returns 크리에이터 목록
 * @example
 * const creators = await loadCreators();
 * console.log(`총 ${creators.length}명의 크리에이터`);
 */
export async function loadCreators(): Promise<Creator[]> {
  return creatorsData as Creator[];
}

/**
 * 제품 데이터 로드
 *
 * @returns 제품 목록
 * @example
 * const products = await loadProducts();
 * const beautyProducts = products.filter(p => p.category === 'Beauty');
 */
export async function loadProducts(): Promise<Product[]> {
  return productsData as Product[];
}

/**
 * 판매 이력 데이터 로드
 *
 * @returns 판매 이력 목록
 * @example
 * const sales = await loadSalesHistory();
 * const recentSales = sales.filter(s =>
 *   new Date(s.soldAt) > new Date('2025-12-01')
 * );
 */
export async function loadSalesHistory(): Promise<SaleRecord[]> {
  return salesHistoryData as SaleRecord[];
}

/**
 * 모든 데이터 일괄 로드
 *
 * @returns 크리에이터, 제품, 판매 이력 전체 데이터
 * @example
 * const { creators, products, salesHistory } = await loadAllData();
 */
export async function loadAllData(): Promise<{
  creators: Creator[];
  products: Product[];
  salesHistory: SaleRecord[];
}> {
  const [creators, products, salesHistory] = await Promise.all([
    loadCreators(),
    loadProducts(),
    loadSalesHistory(),
  ]);

  return { creators, products, salesHistory };
}

/**
 * 특정 크리에이터의 판매 이력 조회
 *
 * @param creatorId - 크리에이터 ID
 * @returns 해당 크리에이터의 판매 이력
 * @example
 * const sales = await getSalesByCreator('creator-001');
 */
export async function getSalesByCreator(
  creatorId: string
): Promise<SaleRecord[]> {
  const salesHistory = await loadSalesHistory();
  return salesHistory.filter(sale => sale.creatorId === creatorId);
}

/**
 * 특정 제품의 판매 이력 조회
 *
 * @param productId - 제품 ID
 * @returns 해당 제품의 판매 이력
 * @example
 * const sales = await getSalesByProduct('product-015');
 */
export async function getSalesByProduct(
  productId: string
): Promise<SaleRecord[]> {
  const salesHistory = await loadSalesHistory();
  return salesHistory.filter(sale => sale.productId === productId);
}

/**
 * ID로 크리에이터 조회
 *
 * @param id - 크리에이터 ID
 * @returns 크리에이터 정보 (없으면 undefined)
 * @example
 * const creator = await getCreatorById('creator-001');
 */
export async function getCreatorById(
  id: string
): Promise<Creator | undefined> {
  const creators = await loadCreators();
  return creators.find(c => c.id === id);
}

/**
 * ID로 제품 조회
 *
 * @param id - 제품 ID
 * @returns 제품 정보 (없으면 undefined)
 * @example
 * const product = await getProductById('product-015');
 */
export async function getProductById(
  id: string
): Promise<Product | undefined> {
  const products = await loadProducts();
  return products.find(p => p.id === id);
}
```

---

## 4. 데이터 간 관계

### 4.1 ERD (텍스트 기반)

```
┌──────────────────────────┐
│       Creator            │
├──────────────────────────┤
│ id (PK)                  │
│ name                     │
│ platform                 │
│ followerCount            │
│ categories[]             │
│ email                    │
│ joinedAt                 │
└──────────┬───────────────┘
           │
           │ 1
           │
           │ N
           ▼
┌──────────────────────────┐        N ┌──────────────────────────┐
│      SaleRecord          │◄─────────┤        Product           │
├──────────────────────────┤          ├──────────────────────────┤
│ id (PK)                  │          │ id (PK)                  │
│ creatorId (FK)           │          │ name                     │
│ productId (FK)           │          │ category                 │
│ soldAt                   │          │ price                    │
│ quantity                 │          │ brandName                │
│ revenue                  │          │ imageUrl                 │
│ commission               │          │ description              │
│ clickCount               │          └──────────────────────────┘
│ conversionRate           │
└──────────────────────────┘


┌──────────────────────────┐
│    CreatorInsight        │
├──────────────────────────┤
│ creatorId (FK)           │◄────┐
│ categoryScores[]         │     │
│ priceBuckets[]           │     │ 1:1
│ seasonalData[]           │     │
│ topProducts[]            │     │
│ averageConversionRate    │     │
│ totalRevenue             │     │
│ analyzedAt               │     │
└──────────────────────────┘     │
           │                     │
           │                     │
           ├─────────────────────┘
           │
           │ contains
           │
           ├──> CategoryScore[]
           │    ├── category
           │    ├── score
           │    ├── salesCount
           │    ├── totalRevenue
           │    └── avgConversionRate
           │
           ├──> PriceBucket[]
           │    ├── range
           │    ├── count
           │    ├── revenue
           │    └── bestPerformingPrice
           │
           └──> SeasonalData[]
                ├── season
                ├── salesCount
                ├── revenue
                └── topCategories[]


┌──────────────────────────┐
│     ProductMatch         │
├──────────────────────────┤
│ productId (FK)           │────┐
│ creatorId (FK)           │    │ N:1
│ matchScore               │    │
│ reason                   │    │
│ expectedRevenue          │    ▼
│ confidenceLevel          │  Product
└──────────────────────────┘
           │
           │ N:1
           ▼
        Creator


┌──────────────────────────┐
│   RevenuePrediction      │
├──────────────────────────┤
│ productId (FK)           │────┐
│ creatorId (FK)           │    │ N:1
│ predictedRevenue         │    │
│ confidenceInterval       │    │
│   ├── min                │    ▼
│   └── max                │  Product
│ factors[]                │
└──────────────────────────┘
           │
           │ N:1
           ▼
        Creator
```

### 4.2 관계 설명

| 관계 | 설명 | 카디널리티 |
|------|------|-----------|
| Creator ↔ SaleRecord | 한 크리에이터는 여러 판매 이력을 가짐 | 1:N |
| Product ↔ SaleRecord | 한 제품은 여러 판매 이력을 가짐 | 1:N |
| Creator ↔ CreatorInsight | 한 크리에이터는 하나의 인사이트를 가짐 | 1:1 |
| Creator ↔ ProductMatch | 한 크리에이터는 여러 제품 추천을 받음 | 1:N |
| Product ↔ ProductMatch | 한 제품은 여러 크리에이터에게 추천될 수 있음 | 1:N |
| Creator ↔ RevenuePrediction | 한 크리에이터는 여러 매출 예측을 가질 수 있음 | 1:N |
| Product ↔ RevenuePrediction | 한 제품은 여러 크리에이터에 대한 예측을 가질 수 있음 | 1:N |

### 4.3 데이터 흐름

```
[Raw Data]
Creator + Product + SaleRecord (Mock Data)
           │
           ▼
[Analysis] ───────────────────────────────┐
AI 분석 (Claude API)                      │
- 카테고리별 성과 집계                     │
- 가격대별 성과 분석                       │
- 시즌별 트렌드 파악                       │
           │                              │
           ▼                              │
[Result]                                  │
CreatorInsight 생성                        │
           │                              │
           ▼                              │
[Recommendation] ◄────────────────────────┘
AI 추천 (Claude API)
- 제품 매칭 점수 산출
- 매출 예측
           │
           ▼
ProductMatch + RevenuePrediction 생성
```

---

## 5. Zod 스키마 정의

### 5.1 기본 스키마

```typescript
import { z } from 'zod';

/**
 * Platform Zod 스키마
 */
export const PlatformSchema = z.enum([
  'Instagram',
  'YouTube',
  'TikTok',
  'Blog',
]);

/**
 * Category Zod 스키마
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
 * Season Zod 스키마
 */
export const SeasonSchema = z.enum([
  'Spring',
  'Summer',
  'Fall',
  'Winter',
]);

/**
 * Creator Zod 스키마
 */
export const CreatorSchema = z.object({
  id: z.string().regex(/^creator-\d{3}$/, 'ID는 creator-XXX 형식이어야 합니다'),
  name: z.string().min(1, '이름은 필수입니다'),
  platform: PlatformSchema,
  followerCount: z.number()
    .int('정수여야 합니다')
    .min(10000, '최소 팔로워 수는 10,000명입니다')
    .max(1000000, '최대 팔로워 수는 1,000,000명입니다'),
  categories: z.array(CategorySchema)
    .min(2, '최소 2개의 카테고리가 필요합니다')
    .max(3, '최대 3개의 카테고리만 가능합니다'),
  email: z.string().email('유효한 이메일 주소여야 합니다'),
  joinedAt: z.string().datetime('ISO 8601 날짜 형식이어야 합니다'),
});

/**
 * Product Zod 스키마
 */
export const ProductSchema = z.object({
  id: z.string().regex(/^product-\d{3}$/, 'ID는 product-XXX 형식이어야 합니다'),
  name: z.string().min(1, '제품명은 필수입니다'),
  category: CategorySchema,
  price: z.number()
    .int('정수여야 합니다')
    .min(10000, '최소 가격은 10,000원입니다')
    .max(200000, '최대 가격은 200,000원입니다'),
  brandName: z.string().min(1, '브랜드명은 필수입니다'),
  imageUrl: z.string().url('유효한 URL이어야 합니다'),
  description: z.string().min(1, '제품 설명은 필수입니다'),
});

/**
 * SaleRecord Zod 스키마
 */
export const SaleRecordSchema = z.object({
  id: z.string().regex(/^sale-\d{5}$/, 'ID는 sale-XXXXX 형식이어야 합니다'),
  creatorId: z.string().regex(/^creator-\d{3}$/),
  productId: z.string().regex(/^product-\d{3}$/),
  soldAt: z.string().datetime('ISO 8601 날짜 형식이어야 합니다'),
  quantity: z.number().int().min(1, '최소 판매 수량은 1개입니다'),
  revenue: z.number().min(0, '수익은 0 이상이어야 합니다'),
  commission: z.number().min(0, '수수료는 0 이상이어야 합니다'),
  clickCount: z.number().int().min(0, '클릭 수는 0 이상이어야 합니다'),
  conversionRate: z.number()
    .min(0, '전환율은 0% 이상이어야 합니다')
    .max(100, '전환율은 100% 이하여야 합니다'),
});
```

### 5.2 AI 분석 스키마

```typescript
/**
 * CategoryScore Zod 스키마
 */
export const CategoryScoreSchema = z.object({
  category: CategorySchema,
  score: z.number()
    .min(0, '점수는 0 이상이어야 합니다')
    .max(100, '점수는 100 이하여야 합니다'),
  salesCount: z.number().int().min(0),
  totalRevenue: z.number().min(0),
  avgConversionRate: z.number().min(0).max(100),
});

/**
 * PriceBucket Zod 스키마
 */
export const PriceBucketSchema = z.object({
  range: z.string().regex(
    /^\d+-\d+$/,
    '가격 범위는 "최소-최대" 형식이어야 합니다 (예: "30000-50000")'
  ),
  count: z.number().int().min(0),
  revenue: z.number().min(0),
  bestPerformingPrice: z.number().min(0),
});

/**
 * SeasonalData Zod 스키마
 */
export const SeasonalDataSchema = z.object({
  season: SeasonSchema,
  salesCount: z.number().int().min(0),
  revenue: z.number().min(0),
  topCategories: z.array(CategorySchema).max(3),
});

/**
 * CreatorInsight Zod 스키마
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
```

### 5.3 AI 추천 스키마

```typescript
/**
 * ProductMatch Zod 스키마
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
 * RevenuePrediction Zod 스키마
 */
export const RevenuePredictionSchema = z.object({
  productId: z.string().regex(/^product-\d{3}$/),
  creatorId: z.string().regex(/^creator-\d{3}$/),
  predictedRevenue: z.number().min(0),
  confidenceInterval: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
  }).refine(
    data => data.max >= data.min,
    '최대값은 최소값 이상이어야 합니다'
  ),
  factors: z.array(z.string()).min(1, '최소 1개 이상의 예측 근거가 필요합니다'),
});
```

### 5.4 API 스키마

```typescript
/**
 * GetCreatorInsightRequest Zod 스키마
 */
export const GetCreatorInsightRequestSchema = z.object({
  creatorId: z.string().regex(/^creator-\d{3}$/),
});

/**
 * GetCreatorInsightResponse Zod 스키마
 */
export const GetCreatorInsightResponseSchema = z.object({
  success: z.boolean(),
  data: CreatorInsightSchema.nullable(),
  error: z.string().optional(),
});

/**
 * GetProductMatchesRequest Zod 스키마
 */
export const GetProductMatchesRequestSchema = z.object({
  creatorId: z.string().regex(/^creator-\d{3}$/),
  limit: z.number().int().min(1).max(50).default(10).optional(),
});

/**
 * GetProductMatchesResponse Zod 스키마
 */
export const GetProductMatchesResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(ProductMatchSchema),
  error: z.string().optional(),
});

/**
 * GetRevenuePredictionRequest Zod 스키마
 */
export const GetRevenuePredictionRequestSchema = z.object({
  creatorId: z.string().regex(/^creator-\d{3}$/),
  productId: z.string().regex(/^product-\d{3}$/),
});

/**
 * GetRevenuePredictionResponse Zod 스키마
 */
export const GetRevenuePredictionResponseSchema = z.object({
  success: z.boolean(),
  data: RevenuePredictionSchema.nullable(),
  error: z.string().optional(),
});
```

### 5.5 스키마 사용 예시

```typescript
import { CreatorSchema } from './schemas';

// 데이터 검증
const validateCreator = (data: unknown) => {
  try {
    const creator = CreatorSchema.parse(data);
    console.log('✓ 유효한 크리에이터 데이터:', creator);
    return { success: true, data: creator };
  } catch (error) {
    console.error('✗ 검증 실패:', error);
    return { success: false, error };
  }
};

// 예시 데이터
const creatorData = {
  id: 'creator-001',
  name: '김지은',
  platform: 'Instagram',
  followerCount: 250000,
  categories: ['Beauty', 'Fashion'],
  email: 'jieun.kim@example.com',
  joinedAt: '2025-01-15T09:00:00Z',
};

validateCreator(creatorData); // ✓ 유효함

// 잘못된 데이터
const invalidData = {
  id: 'invalid-id',  // 형식 불일치
  name: '',          // 빈 문자열
  followerCount: 5000,  // 최소값 미만
  categories: ['Beauty'],  // 최소 개수 미달
};

validateCreator(invalidData); // ✗ 검증 실패
```

---

## 6. 샘플 Mock 데이터

### 6.1 Creator 샘플 (5개)

```json
[
  {
    "id": "creator-001",
    "name": "김지은",
    "platform": "Instagram",
    "followerCount": 250000,
    "categories": ["Beauty", "Fashion"],
    "email": "jieun.kim@example.com",
    "joinedAt": "2025-01-15T09:00:00Z"
  },
  {
    "id": "creator-002",
    "name": "박준호",
    "platform": "YouTube",
    "followerCount": 580000,
    "categories": ["Tech", "Lifestyle"],
    "email": "junho.park@example.com",
    "joinedAt": "2024-11-20T10:30:00Z"
  },
  {
    "id": "creator-003",
    "name": "이서연",
    "platform": "Instagram",
    "followerCount": 380000,
    "categories": ["Fashion", "Lifestyle"],
    "email": "seoyeon.lee@example.com",
    "joinedAt": "2025-02-01T08:00:00Z"
  },
  {
    "id": "creator-004",
    "name": "최민수",
    "platform": "TikTok",
    "followerCount": 120000,
    "categories": ["Food", "Health"],
    "email": "minsu.choi@example.com",
    "joinedAt": "2024-12-10T14:20:00Z"
  },
  {
    "id": "creator-005",
    "name": "정하은",
    "platform": "YouTube",
    "followerCount": 450000,
    "categories": ["Beauty", "Health", "Lifestyle"],
    "email": "haeun.jung@example.com",
    "joinedAt": "2024-10-05T11:45:00Z"
  }
]
```

### 6.2 Product 샘플 (5개)

```json
[
  {
    "id": "product-001",
    "name": "글로우 세럼",
    "category": "Beauty",
    "price": 45000,
    "brandName": "글로우랩",
    "imageUrl": "https://example.com/images/glow-serum.jpg",
    "description": "피부 탄력을 높여주는 고농축 세럼"
  },
  {
    "id": "product-015",
    "name": "데일리 청바지",
    "category": "Fashion",
    "price": 89000,
    "brandName": "어반스타일",
    "imageUrl": "https://example.com/images/daily-jeans.jpg",
    "description": "편안한 핏의 데일리 청바지"
  },
  {
    "id": "product-023",
    "name": "블루투스 이어폰",
    "category": "Tech",
    "price": 125000,
    "brandName": "사운드프로",
    "imageUrl": "https://example.com/images/bt-earphone.jpg",
    "description": "노이즈 캔슬링 지원 무선 이어폰"
  },
  {
    "id": "product-032",
    "name": "프로틴바 (12개입)",
    "category": "Food",
    "price": 28000,
    "brandName": "헬씨핏",
    "imageUrl": "https://example.com/images/protein-bar.jpg",
    "description": "고단백 저칼로리 간식"
  },
  {
    "id": "product-041",
    "name": "아로마 디퓨저",
    "category": "Lifestyle",
    "price": 35000,
    "brandName": "홈센트",
    "imageUrl": "https://example.com/images/aroma-diffuser.jpg",
    "description": "자동 타이머 기능이 있는 디퓨저"
  }
]
```

### 6.3 SaleRecord 샘플 (5개)

```json
[
  {
    "id": "sale-00001",
    "creatorId": "creator-001",
    "productId": "product-001",
    "soldAt": "2025-08-15T14:30:00Z",
    "quantity": 5,
    "revenue": 225000,
    "commission": 33750,
    "clickCount": 620,
    "conversionRate": 4.2
  },
  {
    "id": "sale-00002",
    "creatorId": "creator-002",
    "productId": "product-023",
    "soldAt": "2025-09-20T10:15:00Z",
    "quantity": 2,
    "revenue": 250000,
    "commission": 37500,
    "clickCount": 880,
    "conversionRate": 2.3
  },
  {
    "id": "sale-00003",
    "creatorId": "creator-001",
    "productId": "product-015",
    "soldAt": "2025-10-05T16:45:00Z",
    "quantity": 3,
    "revenue": 267000,
    "commission": 40050,
    "clickCount": 450,
    "conversionRate": 3.5
  },
  {
    "id": "sale-00004",
    "creatorId": "creator-004",
    "productId": "product-032",
    "soldAt": "2025-11-12T11:20:00Z",
    "quantity": 8,
    "revenue": 224000,
    "commission": 33600,
    "clickCount": 520,
    "conversionRate": 5.8
  },
  {
    "id": "sale-00005",
    "creatorId": "creator-005",
    "productId": "product-041",
    "soldAt": "2025-12-18T09:30:00Z",
    "quantity": 4,
    "revenue": 140000,
    "commission": 21000,
    "clickCount": 390,
    "conversionRate": 4.1
  }
]
```

### 6.4 CreatorInsight 샘플

```json
{
  "creatorId": "creator-001",
  "categoryScores": [
    {
      "category": "Beauty",
      "score": 88,
      "salesCount": 45,
      "totalRevenue": 3750000,
      "avgConversionRate": 4.2
    },
    {
      "category": "Fashion",
      "score": 75,
      "salesCount": 32,
      "totalRevenue": 2850000,
      "avgConversionRate": 3.1
    }
  ],
  "priceBuckets": [
    {
      "range": "30000-50000",
      "count": 28,
      "revenue": 1120000,
      "bestPerformingPrice": 45000
    },
    {
      "range": "50000-80000",
      "count": 35,
      "revenue": 2275000,
      "bestPerformingPrice": 65000
    },
    {
      "range": "80000-150000",
      "count": 14,
      "revenue": 1255000,
      "bestPerformingPrice": 89000
    }
  ],
  "seasonalData": [
    {
      "season": "Spring",
      "salesCount": 25,
      "revenue": 1850000,
      "topCategories": ["Beauty", "Fashion"]
    },
    {
      "season": "Summer",
      "salesCount": 18,
      "revenue": 1350000,
      "topCategories": ["Fashion"]
    },
    {
      "season": "Fall",
      "salesCount": 20,
      "revenue": 1600000,
      "topCategories": ["Beauty", "Fashion"]
    },
    {
      "season": "Winter",
      "salesCount": 14,
      "revenue": 850000,
      "topCategories": ["Beauty"]
    }
  ],
  "topProducts": [
    "product-001",
    "product-015",
    "product-007",
    "product-012",
    "product-009"
  ],
  "averageConversionRate": 3.8,
  "totalRevenue": 5650000,
  "analyzedAt": "2026-02-04T10:00:00Z"
}
```

### 6.5 ProductMatch 샘플

```json
{
  "productId": "product-023",
  "creatorId": "creator-002",
  "matchScore": 92,
  "reason": "박준호님은 Tech 카테고리에서 평균 2.5%의 전환율을 기록 중이며, 80,000~150,000원 가격대 제품에서 강세를 보입니다. 이 블루투스 이어폰은 해당 가격대에 속하며, 겨울 시즌 테크 제품 판매가 30% 증가하는 패턴과 일치합니다. 팔로워 58만명의 높은 참여율(4.1%)을 고려할 때 월 평균 35개 이상의 판매가 예상됩니다.",
  "expectedRevenue": 1750000,
  "confidenceLevel": "High"
}
```

### 6.6 RevenuePrediction 샘플

```json
{
  "productId": "product-001",
  "creatorId": "creator-001",
  "predictedRevenue": 1350000,
  "confidenceInterval": {
    "min": 1050000,
    "max": 1650000
  },
  "factors": [
    "과거 Beauty 카테고리 평균 전환율 4.2%",
    "봄 시즌 뷰티 제품 판매 30% 증가 패턴",
    "팔로워 25만명, 참여율 3.8%",
    "유사 가격대(30,000~50,000원) 제품 평균 판매량 28개/월",
    "최근 3개월 Beauty 카테고리 성과 점수 88점 (상위 15%)"
  ]
}
```

---

## 7. 추가 참고 사항

### 7.1 타입 가드 함수

```typescript
/**
 * Platform 타입 가드
 */
export function isPlatform(value: unknown): value is Platform {
  return (
    typeof value === 'string' &&
    ['Instagram', 'YouTube', 'TikTok', 'Blog'].includes(value)
  );
}

/**
 * Category 타입 가드
 */
export function isCategory(value: unknown): value is Category {
  return (
    typeof value === 'string' &&
    [
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
    ].includes(value)
  );
}

/**
 * Season 타입 가드
 */
export function isSeason(value: unknown): value is Season {
  return (
    typeof value === 'string' &&
    ['Spring', 'Summer', 'Fall', 'Winter'].includes(value)
  );
}

/**
 * Creator 타입 가드
 */
export function isCreator(value: unknown): value is Creator {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;

  return (
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    isPlatform(obj.platform) &&
    typeof obj.followerCount === 'number' &&
    Array.isArray(obj.categories) &&
    obj.categories.every(isCategory) &&
    typeof obj.email === 'string' &&
    typeof obj.joinedAt === 'string'
  );
}
```

### 7.2 유틸리티 함수

```typescript
/**
 * 날짜를 Season으로 변환
 *
 * @param date - 날짜 (Date 또는 ISO 문자열)
 * @returns 해당 날짜의 시즌
 * @example
 * getSeasonFromDate(new Date('2025-04-15')); // 'Spring'
 */
export function getSeasonFromDate(date: Date | string): Season {
  const d = typeof date === 'string' ? new Date(date) : date;
  const month = d.getMonth() + 1; // 0-indexed to 1-indexed

  if (month >= 3 && month <= 5) return Season.Spring;
  if (month >= 6 && month <= 8) return Season.Summer;
  if (month >= 9 && month <= 11) return Season.Fall;
  return Season.Winter;
}

/**
 * 가격대 범위 문자열 파싱
 *
 * @param range - 가격대 범위 (예: "30000-50000")
 * @returns { min, max } 객체
 * @throws {Error} 형식이 올바르지 않은 경우
 * @example
 * parsePriceRange("30000-50000"); // { min: 30000, max: 50000 }
 */
export function parsePriceRange(range: string): { min: number; max: number } {
  const parts = range.split('-');
  if (parts.length !== 2) {
    throw new Error(`Invalid price range format: ${range}`);
  }

  const min = parseInt(parts[0], 10);
  const max = parseInt(parts[1], 10);

  if (isNaN(min) || isNaN(max)) {
    throw new Error(`Invalid price range values: ${range}`);
  }

  return { min, max };
}

/**
 * 가격이 특정 범위에 속하는지 확인
 *
 * @param price - 제품 가격
 * @param range - 가격대 범위 (예: "30000-50000")
 * @returns 범위 내 포함 여부
 * @example
 * isPriceInRange(45000, "30000-50000"); // true
 */
export function isPriceInRange(price: number, range: string): boolean {
  const { min, max } = parsePriceRange(range);
  return price >= min && price <= max;
}

/**
 * 카테고리에 따른 수수료율 반환
 *
 * @param category - 제품 카테고리
 * @returns 수수료율 (0.10 ~ 0.20)
 * @example
 * getCommissionRate('Beauty'); // 0.15
 */
export function getCommissionRate(category: Category): number {
  const rates: Record<Category, number> = {
    Beauty: 0.15,
    Fashion: 0.12,
    Lifestyle: 0.13,
    Food: 0.18,
    Tech: 0.10,
    HomeLiving: 0.14,
    Health: 0.16,
    BabyKids: 0.17,
    Pet: 0.15,
    Stationery: 0.12,
  };

  return rates[category];
}
```

---

## 8. 버전 관리 및 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0.0 | 2026-02-04 | 초기 버전 작성 |

---

**문서 작성**: lang-typescript-expert
**검토 필요**: AI 분석 로직 구현 시 실제 필드 요구사항 재검토
**다음 단계**: Mock 데이터 생성 스크립트 작성 (03-mock-data-generation.md)
