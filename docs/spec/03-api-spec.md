# API 명세서

> **Project**: zvzo-creator-insight
> **Version**: 1.0.0
> **Base URL**: `http://localhost:3000/api` (개발), `https://your-domain.com/api` (프로덕션)
> **API Type**: Next.js App Router API Routes (RESTful)
> **Last Updated**: 2025-02-04

---

## 목차

1. [API 개요](#api-개요)
2. [인증 및 보안](#인증-및-보안)
3. [공통 사항](#공통-사항)
4. [에러 코드](#에러-코드)
5. [엔드포인트 목록](#엔드포인트-목록)
6. [OpenAI API 통합](#openai-api-통합)
7. [API Route 구현 가이드](#api-route-구현-가이드)

---

## API 개요

### 설계 원칙

zvzo-creator-insight API는 다음 원칙을 따라 설계되었습니다:

- **RESTful 아키텍처**: 리소스 중심 URL 구조, HTTP 메서드 활용
- **Next.js App Router**: `/app/api/*` 구조, Route Handlers 사용
- **타입 안전성**: Zod 스키마를 통한 요청/응답 검증
- **AI 기반 분석**: OpenAI GPT-4o를 활용한 크리에이터 인사이트 생성
- **에러 핸들링**: 일관된 에러 응답 포맷, 상세한 에러 코드
- **성능 최적화**: 데이터베이스 쿼리 최적화, AI 응답 캐싱 고려

### 기술 스택

| 항목 | 기술 |
|------|------|
| 프레임워크 | Next.js 15 (App Router) |
| 런타임 | Node.js 20+ |
| 데이터베이스 | Supabase (PostgreSQL) |
| AI 엔진 | OpenAI GPT-4o |
| 검증 | Zod |
| HTTP 클라이언트 | fetch (built-in) |

### API 버전 관리

현재 버전: `v1` (URL prefix 없음)

향후 버전 추가 시: `/api/v2/*` 형식 사용 예정

---

## 인증 및 보안

### 현재 버전 (v1)

- **인증 방식**: None (프로토타입 단계)
- **CORS**: Next.js 기본 설정 사용
- **Rate Limiting**: 미구현 (향후 추가 예정)

### 향후 계획

```typescript
// 향후 구현 예정
// 1. API Key 기반 인증
headers: {
  'X-API-Key': 'your-api-key'
}

// 2. Rate Limiting
// - IP 기반: 100 req/min
// - User 기반: 1000 req/hour
```

---

## 공통 사항

### HTTP 메서드

| 메서드 | 용도 | 멱등성 |
|--------|------|--------|
| `GET` | 리소스 조회 | O |
| `POST` | 리소스 생성, AI 분석 | X |
| `PUT` | 리소스 전체 수정 | O |
| `PATCH` | 리소스 부분 수정 | X |
| `DELETE` | 리소스 삭제 | O |

### 요청 헤더

```http
Content-Type: application/json
Accept: application/json
```

### 응답 포맷

#### 성공 응답

```typescript
interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    requestId?: string;
    timestamp: string;
  };
}
```

**예시:**

```json
{
  "success": true,
  "data": {
    "id": "creator-123",
    "name": "김영희"
  },
  "meta": {
    "requestId": "req-abc123",
    "timestamp": "2025-02-04T10:30:00.000Z"
  }
}
```

#### 에러 응답

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;           // 에러 코드 (예: CREATOR_NOT_FOUND)
    message: string;        // 사람이 읽을 수 있는 에러 메시지
    details?: any;          // 추가 상세 정보 (개발 모드에서만)
    statusCode: number;     // HTTP 상태 코드
  };
  meta?: {
    requestId?: string;
    timestamp: string;
  };
}
```

**예시:**

```json
{
  "success": false,
  "error": {
    "code": "CREATOR_NOT_FOUND",
    "message": "요청한 크리에이터를 찾을 수 없습니다.",
    "details": {
      "creatorId": "creator-999"
    },
    "statusCode": 404
  },
  "meta": {
    "requestId": "req-xyz789",
    "timestamp": "2025-02-04T10:35:00.000Z"
  }
}
```

### 페이지네이션

목록 조회 API는 다음 페이지네이션 구조를 사용합니다:

```typescript
interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;          // 현재 페이지 (1부터 시작)
    limit: number;         // 페이지당 항목 수
    total: number;         // 전체 항목 수
    totalPages: number;    // 전체 페이지 수
    hasNext: boolean;      // 다음 페이지 존재 여부
    hasPrev: boolean;      // 이전 페이지 존재 여부
  };
}
```

**쿼리 파라미터:**

- `page` (number, optional, default: 1): 페이지 번호
- `limit` (number, optional, default: 20): 페이지당 항목 수 (max: 100)

**예시:**

```http
GET /api/creators?page=2&limit=10
```

```json
{
  "success": true,
  "data": [ /* 10개 크리에이터 */ ],
  "pagination": {
    "page": 2,
    "limit": 10,
    "total": 47,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": true
  }
}
```

---

## 에러 코드

### 일반 에러 (1xxx)

| 코드 | 상태 코드 | 설명 |
|------|----------|------|
| `INVALID_REQUEST` | 400 | 요청 데이터 검증 실패 |
| `UNAUTHORIZED` | 401 | 인증 실패 (향후 구현) |
| `FORBIDDEN` | 403 | 권한 부족 (향후 구현) |
| `NOT_FOUND` | 404 | 리소스를 찾을 수 없음 |
| `METHOD_NOT_ALLOWED` | 405 | 허용되지 않은 HTTP 메서드 |
| `INTERNAL_ERROR` | 500 | 내부 서버 오류 |
| `SERVICE_UNAVAILABLE` | 503 | 서비스 일시 중단 |

### 크리에이터 관련 에러 (2xxx)

| 코드 | 상태 코드 | 설명 |
|------|----------|------|
| `CREATOR_NOT_FOUND` | 404 | 크리에이터를 찾을 수 없음 |
| `CREATOR_ALREADY_EXISTS` | 409 | 동일한 크리에이터가 이미 존재 |
| `CREATOR_VALIDATION_FAILED` | 400 | 크리에이터 데이터 검증 실패 |
| `CREATOR_SALES_EMPTY` | 400 | 분석할 판매 데이터가 없음 |

### 분석 관련 에러 (3xxx)

| 코드 | 상태 코드 | 설명 |
|------|----------|------|
| `ANALYSIS_FAILED` | 500 | AI 분석 실패 |
| `ANALYSIS_TIMEOUT` | 504 | AI 분석 타임아웃 (30초 초과) |
| `ANALYSIS_INVALID_RESPONSE` | 500 | AI 응답 파싱 실패 |
| `ANALYSIS_RATE_LIMITED` | 429 | AI API 요청 제한 초과 |

### 제품 관련 에러 (4xxx)

| 코드 | 상태 코드 | 설명 |
|------|----------|------|
| `PRODUCT_NOT_FOUND` | 404 | 제품을 찾을 수 없음 |
| `PRODUCT_VALIDATION_FAILED` | 400 | 제품 데이터 검증 실패 |

### OpenAI API 에러 (5xxx)

| 코드 | 상태 코드 | 설명 |
|------|----------|------|
| `OPENAI_ERROR` | 500 | OpenAI API 호출 실패 |
| `OPENAI_RATE_LIMITED` | 429 | OpenAI rate limit 초과 |
| `OPENAI_INVALID_KEY` | 500 | OpenAI API 키 오류 |
| `OPENAI_QUOTA_EXCEEDED` | 500 | OpenAI quota 초과 |
| `OPENAI_CONTENT_FILTERED` | 400 | OpenAI content filter에 의해 차단됨 |

---

## 엔드포인트 목록

### 1. GET /api/creators

크리에이터 목록을 조회합니다. 플랫폼, 카테고리, 정렬 옵션으로 필터링 및 정렬할 수 있습니다.

#### 요청

**URL**: `/api/creators`

**Method**: `GET`

**Query Parameters**:

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|---------|------|------|--------|------|
| `platform` | string | X | - | 플랫폼 필터 (`instagram`, `youtube`, `tiktok`) |
| `category` | string | X | - | 카테고리 필터 (예: `fashion`, `beauty`, `lifestyle`) |
| `sort` | string | X | `name` | 정렬 기준 (`name`, `followers`, `engagement`, `sales`, `createdAt`) |
| `order` | string | X | `asc` | 정렬 순서 (`asc`, `desc`) |
| `page` | number | X | `1` | 페이지 번호 |
| `limit` | number | X | `20` | 페이지당 항목 수 (max: 100) |

**예시 요청**:

```http
GET /api/creators?platform=instagram&category=fashion&sort=followers&order=desc&page=1&limit=10
```

#### 응답

**Status Code**: `200 OK`

**Response Body**:

```typescript
{
  success: true;
  data: Creator[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
```

**예시 응답**:

```json
{
  "success": true,
  "data": [
    {
      "id": "creator-001",
      "name": "김영희",
      "platform": "instagram",
      "profileUrl": "https://instagram.com/younghee.kim",
      "followerCount": 250000,
      "engagementRate": 4.8,
      "category": "fashion",
      "bio": "패션 스타일리스트 | 일상 속 스타일링",
      "createdAt": "2024-01-15T00:00:00.000Z",
      "updatedAt": "2025-02-01T10:30:00.000Z"
    },
    {
      "id": "creator-002",
      "name": "박철수",
      "platform": "youtube",
      "profileUrl": "https://youtube.com/@chulsoo.park",
      "followerCount": 180000,
      "engagementRate": 5.2,
      "category": "fashion",
      "bio": "남성 패션 유튜버 | 직장인 스타일링",
      "createdAt": "2024-03-20T00:00:00.000Z",
      "updatedAt": "2025-01-28T15:45:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 47,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### 에러 응답

| 상태 코드 | 에러 코드 | 설명 |
|----------|----------|------|
| 400 | `INVALID_REQUEST` | 쿼리 파라미터 검증 실패 (예: limit > 100) |
| 500 | `INTERNAL_ERROR` | 데이터베이스 조회 실패 |

**예시 에러 응답**:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "잘못된 요청입니다.",
    "details": {
      "field": "limit",
      "issue": "최대 100까지 허용됩니다."
    },
    "statusCode": 400
  }
}
```

---

### 2. GET /api/creators/[id]

특정 크리에이터의 상세 정보를 조회합니다. 판매 이력, 분석 데이터 등이 포함됩니다.

#### 요청

**URL**: `/api/creators/[id]`

**Method**: `GET`

**Path Parameters**:

| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| `id` | string | O | 크리에이터 ID |

**예시 요청**:

```http
GET /api/creators/creator-001
```

#### 응답

**Status Code**: `200 OK`

**Response Body**:

```typescript
{
  success: true;
  data: CreatorDetail;
}

interface CreatorDetail {
  // 기본 정보
  id: string;
  name: string;
  platform: 'instagram' | 'youtube' | 'tiktok';
  profileUrl: string;
  followerCount: number;
  engagementRate: number;
  category: string;
  bio: string;

  // 판매 이력
  sales: Sale[];

  // 통계
  stats: {
    totalSales: number;          // 총 판매 건수
    totalRevenue: number;        // 총 매출액
    averageOrderValue: number;   // 평균 주문 금액
    topCategory: string;         // 최다 판매 카테고리
    topProduct: {
      id: string;
      name: string;
      soldCount: number;
    } | null;
  };

  // 최근 분석 결과 (있는 경우)
  latestInsight?: CreatorInsight;

  createdAt: string;
  updatedAt: string;
}
```

**예시 응답**:

```json
{
  "success": true,
  "data": {
    "id": "creator-001",
    "name": "김영희",
    "platform": "instagram",
    "profileUrl": "https://instagram.com/younghee.kim",
    "followerCount": 250000,
    "engagementRate": 4.8,
    "category": "fashion",
    "bio": "패션 스타일리스트 | 일상 속 스타일링",
    "sales": [
      {
        "id": "sale-001",
        "creatorId": "creator-001",
        "productId": "prod-100",
        "productName": "가죽 토트백",
        "category": "fashion",
        "price": 89000,
        "quantity": 3,
        "revenue": 267000,
        "soldAt": "2025-01-15T14:30:00.000Z",
        "season": "winter"
      },
      {
        "id": "sale-002",
        "creatorId": "creator-001",
        "productId": "prod-105",
        "productName": "울 코트",
        "category": "fashion",
        "price": 198000,
        "quantity": 2,
        "revenue": 396000,
        "soldAt": "2025-01-20T10:15:00.000Z",
        "season": "winter"
      }
    ],
    "stats": {
      "totalSales": 47,
      "totalRevenue": 8950000,
      "averageOrderValue": 190426,
      "topCategory": "fashion",
      "topProduct": {
        "id": "prod-100",
        "name": "가죽 토트백",
        "soldCount": 12
      }
    },
    "latestInsight": {
      "id": "insight-001",
      "creatorId": "creator-001",
      "summary": "김영희 크리에이터는 고급 패션 아이템에 강한 판매력을 보이며...",
      "strengths": [
        "20-30대 여성 타겟 명확",
        "가죽 제품 판매 실적 우수",
        "프리미엄 브랜드와의 협업 경험"
      ],
      "topCategories": [
        { "category": "fashion", "percentage": 78.5 },
        { "category": "accessories", "percentage": 15.2 },
        { "category": "beauty", "percentage": 6.3 }
      ],
      "priceRange": {
        "min": 50000,
        "max": 300000,
        "average": 145000
      },
      "seasonalTrends": [
        { "season": "winter", "salesCount": 28, "revenue": 5600000 },
        { "season": "fall", "salesCount": 19, "revenue": 3350000 }
      ],
      "recommendations": [
        "프리미엄 가죽 제품 추천 적합",
        "시즌별 패션 아이템 큐레이션 효과적",
        "20-30대 여성 타겟 제품 매칭 우선"
      ],
      "confidence": 0.92,
      "analyzedAt": "2025-02-04T09:30:00.000Z"
    },
    "createdAt": "2024-01-15T00:00:00.000Z",
    "updatedAt": "2025-02-01T10:30:00.000Z"
  }
}
```

#### 에러 응답

| 상태 코드 | 에러 코드 | 설명 |
|----------|----------|------|
| 404 | `CREATOR_NOT_FOUND` | 해당 ID의 크리에이터가 존재하지 않음 |
| 500 | `INTERNAL_ERROR` | 데이터베이스 조회 실패 |

**예시 에러 응답**:

```json
{
  "success": false,
  "error": {
    "code": "CREATOR_NOT_FOUND",
    "message": "요청한 크리에이터를 찾을 수 없습니다.",
    "details": {
      "creatorId": "creator-999"
    },
    "statusCode": 404
  }
}
```

---

### 3. POST /api/analyze

크리에이터의 판매 데이터를 OpenAI GPT-4o로 분석하여 인사이트를 생성합니다.

#### 요청

**URL**: `/api/analyze`

**Method**: `POST`

**Headers**:

```http
Content-Type: application/json
```

**Request Body**:

```typescript
{
  creatorId: string;  // 분석할 크리에이터 ID
}
```

**예시 요청**:

```http
POST /api/analyze
Content-Type: application/json

{
  "creatorId": "creator-001"
}
```

#### 응답

**Status Code**: `200 OK`

**Response Body**:

```typescript
{
  success: true;
  data: CreatorInsight;
}

interface CreatorInsight {
  id: string;
  creatorId: string;
  summary: string;                    // 종합 분석 요약 (200-300자)
  strengths: string[];                // 강점 3-5개
  topCategories: CategoryStat[];      // 카테고리별 판매 비율
  priceRange: {
    min: number;
    max: number;
    average: number;
  };
  seasonalTrends: SeasonalTrend[];    // 시즌별 판매 트렌드
  recommendations: string[];           // AI 추천사항 3-5개
  confidence: number;                  // 분석 신뢰도 (0-1)
  analyzedAt: string;                  // 분석 시각 (ISO 8601)
}
```

**예시 응답**:

```json
{
  "success": true,
  "data": {
    "id": "insight-abc123",
    "creatorId": "creator-001",
    "summary": "김영희 크리에이터는 20-30대 여성을 타겟으로 한 프리미엄 패션 아이템에 강한 판매력을 보입니다. 특히 가죽 제품과 고급 아우터의 판매 실적이 우수하며, 평균 객단가가 14만원대로 높은 편입니다. 겨울 시즌에 가장 활발한 판매 활동을 보이며, 인스타그램 팔로워의 높은 참여도가 구매 전환으로 이어지는 것으로 분석됩니다.",
    "strengths": [
      "20-30대 여성 타겟 명확하며 구매 전환율 높음",
      "가죽 제품 및 프리미엄 아우터 판매 실적 우수",
      "평균 객단가 14만원대로 고가 상품 판매력 입증",
      "겨울 시즌 집중 판매로 시즌 마케팅 효과적",
      "인스타그램 4.8% 참여율로 팔로워 충성도 높음"
    ],
    "topCategories": [
      { "category": "fashion", "percentage": 78.5 },
      { "category": "accessories", "percentage": 15.2 },
      { "category": "beauty", "percentage": 6.3 }
    ],
    "priceRange": {
      "min": 50000,
      "max": 300000,
      "average": 145000
    },
    "seasonalTrends": [
      {
        "season": "winter",
        "salesCount": 28,
        "revenue": 5600000,
        "averageOrderValue": 200000,
        "topProducts": ["울 코트", "가죽 부츠", "캐시미어 머플러"]
      },
      {
        "season": "fall",
        "salesCount": 19,
        "revenue": 3350000,
        "averageOrderValue": 176316,
        "topProducts": ["트렌치코트", "가죽 재킷", "앵클 부츠"]
      }
    ],
    "recommendations": [
      "10-30만원대 프리미엄 가죽 제품(토트백, 지갑, 벨트) 추천 적합",
      "겨울 시즌 프리미엄 아우터(코트, 패딩) 집중 마케팅 효과적",
      "20-30대 여성 타겟 브랜드와의 협업 우선 검토",
      "시즌 한정 컬렉션 큐레이션으로 희소성 마케팅 활용",
      "인스타그램 스토리 스와이프업 기능 적극 활용 추천"
    ],
    "confidence": 0.92,
    "analyzedAt": "2025-02-04T10:45:32.123Z"
  }
}
```

#### 처리 시간

- **예상 시간**: 3-8초 (OpenAI API 응답 시간에 따라 변동)
- **Timeout**: 30초 (초과 시 `ANALYSIS_TIMEOUT` 에러 반환)

#### 에러 응답

| 상태 코드 | 에러 코드 | 설명 |
|----------|----------|------|
| 400 | `INVALID_REQUEST` | 요청 데이터 검증 실패 (creatorId 누락 등) |
| 400 | `CREATOR_SALES_EMPTY` | 분석할 판매 데이터가 없음 (최소 5건 필요) |
| 404 | `CREATOR_NOT_FOUND` | 해당 크리에이터가 존재하지 않음 |
| 429 | `ANALYSIS_RATE_LIMITED` | OpenAI rate limit 초과 |
| 500 | `ANALYSIS_FAILED` | AI 분석 실패 (일반 오류) |
| 500 | `OPENAI_ERROR` | OpenAI API 호출 실패 |
| 500 | `ANALYSIS_INVALID_RESPONSE` | AI 응답 파싱 실패 (JSON 검증 오류) |
| 504 | `ANALYSIS_TIMEOUT` | 분석 타임아웃 (30초 초과) |

**예시 에러 응답**:

```json
{
  "success": false,
  "error": {
    "code": "CREATOR_SALES_EMPTY",
    "message": "분석할 판매 데이터가 충분하지 않습니다.",
    "details": {
      "creatorId": "creator-001",
      "salesCount": 2,
      "minimumRequired": 5
    },
    "statusCode": 400
  }
}
```

#### OpenAI API 호출 설정

```typescript
// OpenAI API 설정
const openaiConfig = {
  model: 'gpt-4o',                    // GPT-4 Optimized
  temperature: 0.3,                   // 일관된 분석을 위해 낮은 temperature
  max_tokens: 2000,                   // 충분한 응답 길이
  response_format: { type: 'json_object' },  // JSON mode 활성화
  timeout: 30000,                     // 30초 타임아웃
};
```

#### 재시도 로직

```typescript
// Exponential backoff 재시도 전략
const retryConfig = {
  maxRetries: 2,                      // 최대 2회 재시도
  initialDelay: 1000,                 // 첫 재시도: 1초 대기
  backoffMultiplier: 2,               // 두 번째 재시도: 2초 대기
  retryableErrors: [
    'rate_limit_exceeded',
    'server_error',
    'timeout'
  ]
};
```

---

### 4. POST /api/match

크리에이터와 제품 카탈로그를 AI로 매칭하고 예상 매출을 예측합니다.

#### 요청

**URL**: `/api/match`

**Method**: `POST`

**Headers**:

```http
Content-Type: application/json
```

**Request Body**:

```typescript
{
  creatorId: string;     // 크리에이터 ID
  limit?: number;        // 반환할 매칭 결과 개수 (기본값: 10, 최대: 50)
}
```

**예시 요청**:

```http
POST /api/match
Content-Type: application/json

{
  "creatorId": "creator-001",
  "limit": 5
}
```

#### 응답

**Status Code**: `200 OK`

**Response Body**:

```typescript
{
  success: true;
  data: {
    matches: ProductMatch[];
    analyzedAt: string;
  };
}

interface ProductMatch {
  product: Product;
  matchScore: number;              // 종합 매칭 점수 (0-100)
  scoreBreakdown: {
    categoryFit: number;           // 카테고리 적합도 (0-100, 가중치 40%)
    priceFit: number;              // 가격대 적합도 (0-100, 가중치 25%)
    seasonFit: number;             // 시즌 적합도 (0-100, 가중치 20%)
    audienceFit: number;           // 타겟 고객 적합도 (0-100, 가중치 15%)
  };
  predictedRevenue: {
    min: number;                   // 최소 예상 매출
    max: number;                   // 최대 예상 매출
    average: number;               // 평균 예상 매출
  };
  reasoning: string;               // AI 매칭 근거 (100-200자)
}
```

**예시 응답**:

```json
{
  "success": true,
  "data": {
    "matches": [
      {
        "product": {
          "id": "prod-200",
          "name": "프리미엄 가죽 토트백",
          "category": "fashion",
          "price": 189000,
          "imageUrl": "https://example.com/images/tote-bag.jpg",
          "description": "이탈리아산 송아지 가죽으로 제작한 프리미엄 토트백",
          "brand": "STUDIO K",
          "stock": 50,
          "tags": ["leather", "tote", "premium", "italian"],
          "season": "all-season"
        },
        "matchScore": 94,
        "scoreBreakdown": {
          "categoryFit": 98,      // 카테고리 완벽 매칭
          "priceFit": 92,         // 평균 객단가 범위 내
          "seasonFit": 85,        // 사계절 제품
          "audienceFit": 95       // 타겟 고객 일치
        },
        "predictedRevenue": {
          "min": 567000,
          "max": 1134000,
          "average": 850500
        },
        "reasoning": "김영희 크리에이터의 가죽 제품 판매 실적이 우수하며(12건, 평균 평점 4.7), 가격대도 평균 객단가 범위 내에 있습니다. 20-30대 여성 팔로워 비율이 높아 프리미엄 토트백 타겟과 정확히 일치합니다."
      },
      {
        "product": {
          "id": "prod-205",
          "name": "울 캐시미어 블렌드 코트",
          "category": "fashion",
          "price": 298000,
          "imageUrl": "https://example.com/images/wool-coat.jpg",
          "description": "울 70% + 캐시미어 30% 블렌드 겨울 코트",
          "brand": "MODERN GRACE",
          "stock": 30,
          "tags": ["wool", "cashmere", "coat", "winter"],
          "season": "winter"
        },
        "matchScore": 91,
        "scoreBreakdown": {
          "categoryFit": 95,
          "priceFit": 88,
          "seasonFit": 100,       // 겨울 시즌 완벽 매칭
          "audienceFit": 90
        },
        "predictedRevenue": {
          "min": 596000,
          "max": 1490000,
          "average": 1043000
        },
        "reasoning": "겨울 시즌 아우터 판매 실적이 매우 우수하며(28건), 프리미엄 가격대 제품 판매력이 입증되었습니다. 현재 시즌(겨울)과 정확히 일치하여 즉각적인 판매 효과가 예상됩니다."
      },
      {
        "product": {
          "id": "prod-178",
          "name": "레더 앵클 부츠",
          "category": "fashion",
          "price": 165000,
          "imageUrl": "https://example.com/images/ankle-boots.jpg",
          "description": "정장/캐주얼 모두 어울리는 심플한 앵클 부츠",
          "brand": "WALK WITH ME",
          "stock": 80,
          "tags": ["leather", "boots", "ankle", "versatile"],
          "season": "fall-winter"
        },
        "matchScore": 88,
        "scoreBreakdown": {
          "categoryFit": 90,
          "priceFit": 95,         // 평균 객단가와 매우 근접
          "seasonFit": 85,
          "audienceFit": 88
        },
        "predictedRevenue": {
          "min": 495000,
          "max": 990000,
          "average": 742500
        },
        "reasoning": "가죽 제품에 대한 높은 판매력과 신발 카테고리 경험이 결합된 제품입니다. 가격대가 평균 객단가와 매우 근접하여 구매 저항이 낮을 것으로 예상됩니다."
      }
    ],
    "analyzedAt": "2025-02-04T11:20:15.456Z"
  }
}
```

#### 매칭 스코어 산출 기준

```typescript
// 매칭 스코어 계산 로직
const calculateMatchScore = (breakdown: ScoreBreakdown): number => {
  const weights = {
    categoryFit: 0.40,    // 카테고리 적합도 40%
    priceFit: 0.25,       // 가격대 적합도 25%
    seasonFit: 0.20,      // 시즌 적합도 20%
    audienceFit: 0.15,    // 타겟 고객 적합도 15%
  };

  return Math.round(
    breakdown.categoryFit * weights.categoryFit +
    breakdown.priceFit * weights.priceFit +
    breakdown.seasonFit * weights.seasonFit +
    breakdown.audienceFit * weights.audienceFit
  );
};
```

**각 요소별 평가 기준:**

1. **categoryFit (카테고리 적합도, 40%)**:
   - 크리에이터의 과거 판매 카테고리 분포와 제품 카테고리 일치도
   - 예: 패션 78.5% 판매 → 패션 제품 높은 점수

2. **priceFit (가격대 적합도, 25%)**:
   - 크리에이터의 평균 객단가 범위 내 여부
   - 예: 평균 14만원 → 10-20만원 제품 높은 점수

3. **seasonFit (시즌 적합도, 20%)**:
   - 현재 시즌 및 크리에이터의 시즌별 판매 트렌드 일치도
   - 예: 겨울 판매 강함 → 겨울 제품 높은 점수

4. **audienceFit (타겟 고객 적합도, 15%)**:
   - 크리에이터 팔로워 특성과 제품 타겟 고객 일치도
   - 예: 20-30대 여성 팔로워 → 여성 타겟 제품 높은 점수

#### 처리 시간

- **예상 시간**: 4-10초 (OpenAI API 응답 시간 + 제품 카탈로그 조회)
- **Timeout**: 30초

#### 에러 응답

| 상태 코드 | 에러 코드 | 설명 |
|----------|----------|------|
| 400 | `INVALID_REQUEST` | 요청 데이터 검증 실패 |
| 404 | `CREATOR_NOT_FOUND` | 해당 크리에이터가 존재하지 않음 |
| 500 | `ANALYSIS_FAILED` | 매칭 분석 실패 |
| 500 | `OPENAI_ERROR` | OpenAI API 호출 실패 |
| 504 | `ANALYSIS_TIMEOUT` | 분석 타임아웃 |

---

### 5. GET /api/products

제품 카탈로그를 조회합니다. 카테고리, 가격대로 필터링 및 정렬할 수 있습니다.

#### 요청

**URL**: `/api/products`

**Method**: `GET`

**Query Parameters**:

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|---------|------|------|--------|------|
| `category` | string | X | - | 카테고리 필터 (예: `fashion`, `beauty`, `lifestyle`) |
| `minPrice` | number | X | - | 최소 가격 (원) |
| `maxPrice` | number | X | - | 최대 가격 (원) |
| `season` | string | X | - | 시즌 필터 (`spring`, `summer`, `fall`, `winter`, `all-season`) |
| `brand` | string | X | - | 브랜드 필터 |
| `inStock` | boolean | X | - | 재고 있는 제품만 조회 (true/false) |
| `sort` | string | X | `name` | 정렬 기준 (`name`, `price`, `stock`, `createdAt`) |
| `order` | string | X | `asc` | 정렬 순서 (`asc`, `desc`) |
| `page` | number | X | `1` | 페이지 번호 |
| `limit` | number | X | `20` | 페이지당 항목 수 (max: 100) |

**예시 요청**:

```http
GET /api/products?category=fashion&minPrice=100000&maxPrice=300000&season=winter&inStock=true&sort=price&order=asc&page=1&limit=10
```

#### 응답

**Status Code**: `200 OK`

**Response Body**:

```typescript
{
  success: true;
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
```

**예시 응답**:

```json
{
  "success": true,
  "data": [
    {
      "id": "prod-200",
      "name": "프리미엄 가죽 토트백",
      "category": "fashion",
      "price": 189000,
      "imageUrl": "https://example.com/images/tote-bag.jpg",
      "description": "이탈리아산 송아지 가죽으로 제작한 프리미엄 토트백",
      "brand": "STUDIO K",
      "stock": 50,
      "tags": ["leather", "tote", "premium", "italian"],
      "season": "all-season",
      "createdAt": "2024-11-01T00:00:00.000Z",
      "updatedAt": "2025-01-15T10:00:00.000Z"
    },
    {
      "id": "prod-205",
      "name": "울 캐시미어 블렌드 코트",
      "category": "fashion",
      "price": 298000,
      "imageUrl": "https://example.com/images/wool-coat.jpg",
      "description": "울 70% + 캐시미어 30% 블렌드 겨울 코트",
      "brand": "MODERN GRACE",
      "stock": 30,
      "tags": ["wool", "cashmere", "coat", "winter"],
      "season": "winter",
      "createdAt": "2024-10-15T00:00:00.000Z",
      "updatedAt": "2025-01-20T14:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 23,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### 에러 응답

| 상태 코드 | 에러 코드 | 설명 |
|----------|----------|------|
| 400 | `INVALID_REQUEST` | 쿼리 파라미터 검증 실패 |
| 500 | `INTERNAL_ERROR` | 데이터베이스 조회 실패 |

---

## OpenAI API 통합

### 1. 크리에이터 분석 (POST /api/analyze)

#### 시스템 프롬프트

```plaintext
You are an expert data analyst specializing in creator commerce and sales analytics.

Your task is to analyze a creator's sales history and generate actionable insights for product recommendations and marketing strategies.

Response Requirements:
1. Analyze sales patterns across categories, price ranges, and seasons
2. Identify the creator's strengths and target audience characteristics
3. Provide data-driven recommendations for future product matches
4. Calculate confidence score based on data sufficiency and consistency
5. Return response in valid JSON format matching the schema

Analysis Guidelines:
- Minimum 5 sales records required for reliable analysis
- Consider recency: recent sales (last 3 months) weight 1.5x
- Identify outliers and exclude them from average calculations
- Focus on actionable insights, not just descriptive statistics
- Confidence score formula: (data_sufficiency * 0.4) + (pattern_consistency * 0.3) + (recency * 0.3)

Output Format:
Return a JSON object with the following structure:
{
  "summary": "200-300 character comprehensive analysis",
  "strengths": ["strength 1", "strength 2", "..."],
  "topCategories": [{"category": "fashion", "percentage": 78.5}, ...],
  "priceRange": {"min": 50000, "max": 300000, "average": 145000},
  "seasonalTrends": [{"season": "winter", "salesCount": 28, "revenue": 5600000, ...}, ...],
  "recommendations": ["recommendation 1", "recommendation 2", "..."],
  "confidence": 0.92
}
```

#### 유저 프롬프트 템플릿

```typescript
const generateAnalysisPrompt = (creator: Creator, sales: Sale[]): string => {
  const salesData = sales.map(sale => ({
    productName: sale.productName,
    category: sale.category,
    price: sale.price,
    quantity: sale.quantity,
    revenue: sale.revenue,
    soldAt: sale.soldAt,
    season: sale.season,
  }));

  return `
Analyze the following creator's sales data and provide insights:

Creator Information:
- Name: ${creator.name}
- Platform: ${creator.platform}
- Followers: ${creator.followerCount.toLocaleString()}
- Engagement Rate: ${creator.engagementRate}%
- Category: ${creator.category}
- Bio: ${creator.bio}

Sales History (${sales.length} records):
${JSON.stringify(salesData, null, 2)}

Analysis Request:
1. Summarize this creator's sales performance and patterns (200-300 characters)
2. Identify 3-5 key strengths based on sales data
3. Calculate category distribution (percentage for each category)
4. Determine price range (min, max, average) and pricing strategy
5. Analyze seasonal trends (sales count, revenue, average order value per season)
6. Provide 3-5 actionable recommendations for product matching and marketing
7. Calculate confidence score (0-1) based on data quality and consistency

Current Date: ${new Date().toISOString().split('T')[0]}
Current Season: ${getCurrentSeason()}

Return analysis in the specified JSON format.
`.trim();
};

// 헬퍼 함수: 현재 시즌 계산
const getCurrentSeason = (): string => {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'fall';
  return 'winter';
};
```

#### API 호출 코드

```typescript
import OpenAI from 'openai';
import { z } from 'zod';

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 응답 스키마 정의
const CreatorInsightSchema = z.object({
  summary: z.string().min(100).max(500),
  strengths: z.array(z.string()).min(3).max(5),
  topCategories: z.array(z.object({
    category: z.string(),
    percentage: z.number().min(0).max(100),
  })),
  priceRange: z.object({
    min: z.number().positive(),
    max: z.number().positive(),
    average: z.number().positive(),
  }),
  seasonalTrends: z.array(z.object({
    season: z.enum(['spring', 'summer', 'fall', 'winter']),
    salesCount: z.number().int().nonnegative(),
    revenue: z.number().nonnegative(),
    averageOrderValue: z.number().nonnegative().optional(),
    topProducts: z.array(z.string()).optional(),
  })),
  recommendations: z.array(z.string()).min(3).max(5),
  confidence: z.number().min(0).max(1),
});

// 분석 함수
async function analyzeCreator(
  creator: Creator,
  sales: Sale[]
): Promise<CreatorInsight> {
  // 최소 데이터 요구사항 검증
  if (sales.length < 5) {
    throw new Error('CREATOR_SALES_EMPTY: 최소 5건의 판매 데이터가 필요합니다.');
  }

  const systemPrompt = `[위의 시스템 프롬프트 전문]`;
  const userPrompt = generateAnalysisPrompt(creator, sales);

  // OpenAI API 호출 (재시도 로직 포함)
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
        timeout: 30000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('ANALYSIS_INVALID_RESPONSE: OpenAI 응답이 비어있습니다.');
      }

      // JSON 파싱
      const parsedData = JSON.parse(content);

      // Zod 검증
      const validatedData = CreatorInsightSchema.parse(parsedData);

      // CreatorInsight 객체 생성
      return {
        id: generateId('insight'),
        creatorId: creator.id,
        ...validatedData,
        analyzedAt: new Date().toISOString(),
      };

    } catch (error) {
      lastError = error as Error;

      // 재시도 가능한 에러인지 판단
      const isRetryable =
        error.message.includes('rate_limit') ||
        error.message.includes('timeout') ||
        error.message.includes('server_error');

      if (!isRetryable || attempt === 2) {
        break;
      }

      // Exponential backoff
      const delay = 1000 * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // 최종 실패
  throw new Error(`ANALYSIS_FAILED: ${lastError?.message}`);
}
```

---

### 2. 제품 매칭 (POST /api/match)

#### 시스템 프롬프트

```plaintext
You are an expert product matching analyst specializing in creator-product alignment and revenue prediction.

Your task is to match products from a catalog with a creator based on their sales history and audience characteristics, then predict potential revenue.

Matching Criteria:
1. Category Fit (40% weight): How well the product category matches creator's top-selling categories
2. Price Fit (25% weight): How well the product price aligns with creator's average order value
3. Season Fit (20% weight): How well the product season matches current season and creator's seasonal trends
4. Audience Fit (15% weight): How well the product target audience matches creator's follower demographics

Score Calculation:
- Each criterion scored 0-100
- Final match score = weighted sum of all criteria
- Only return products with match score >= 70

Revenue Prediction:
- Based on creator's historical performance with similar products
- Consider: average order value, sales frequency, category performance
- Formula: (historical_avg_revenue * category_multiplier * season_multiplier * price_fit_factor)
- Return min (conservative), max (optimistic), and average (realistic) predictions

Output Format:
Return a JSON object with array of matches:
{
  "matches": [
    {
      "productId": "prod-200",
      "matchScore": 94,
      "scoreBreakdown": {
        "categoryFit": 98,
        "priceFit": 92,
        "seasonFit": 85,
        "audienceFit": 95
      },
      "predictedRevenue": {
        "min": 567000,
        "max": 1134000,
        "average": 850500
      },
      "reasoning": "100-200 character explanation of why this match is good"
    },
    ...
  ]
}
```

#### 유저 프롬프트 템플릿

```typescript
const generateMatchingPrompt = (
  creator: Creator,
  sales: Sale[],
  products: Product[],
  limit: number
): string => {
  // 크리에이터 통계 계산
  const stats = {
    totalSales: sales.length,
    totalRevenue: sales.reduce((sum, s) => sum + s.revenue, 0),
    averageOrderValue: sales.reduce((sum, s) => sum + s.revenue, 0) / sales.length,
    categoryDistribution: calculateCategoryDistribution(sales),
    seasonalPerformance: calculateSeasonalPerformance(sales),
    priceRange: {
      min: Math.min(...sales.map(s => s.price)),
      max: Math.max(...sales.map(s => s.price)),
      average: sales.reduce((sum, s) => sum + s.price, 0) / sales.length,
    },
  };

  return `
Match products from the catalog with the following creator and predict potential revenue:

Creator Profile:
- Name: ${creator.name}
- Platform: ${creator.platform}
- Followers: ${creator.followerCount.toLocaleString()}
- Engagement Rate: ${creator.engagementRate}%
- Primary Category: ${creator.category}

Sales Performance:
- Total Sales: ${stats.totalSales}
- Total Revenue: ₩${stats.totalRevenue.toLocaleString()}
- Average Order Value: ₩${Math.round(stats.averageOrderValue).toLocaleString()}
- Price Range: ₩${stats.priceRange.min.toLocaleString()} - ₩${stats.priceRange.max.toLocaleString()}

Category Distribution:
${JSON.stringify(stats.categoryDistribution, null, 2)}

Seasonal Performance:
${JSON.stringify(stats.seasonalPerformance, null, 2)}

Product Catalog (${products.length} products):
${JSON.stringify(products.map(p => ({
  id: p.id,
  name: p.name,
  category: p.category,
  price: p.price,
  brand: p.brand,
  season: p.season,
  tags: p.tags,
})), null, 2)}

Matching Requirements:
1. Analyze each product against creator's profile and sales history
2. Calculate match score (0-100) using weighted criteria:
   - Category Fit: 40%
   - Price Fit: 25%
   - Season Fit: 20%
   - Audience Fit: 15%
3. Predict potential revenue (min, max, average) based on historical performance
4. Provide reasoning for each match (100-200 characters)
5. Return top ${limit} matches sorted by match score (descending)
6. Only include matches with score >= 70

Current Date: ${new Date().toISOString().split('T')[0]}
Current Season: ${getCurrentSeason()}

Return matches in the specified JSON format.
`.trim();
};

// 헬퍼 함수들
const calculateCategoryDistribution = (sales: Sale[]) => {
  const categoryMap = new Map<string, number>();
  sales.forEach(sale => {
    categoryMap.set(
      sale.category,
      (categoryMap.get(sale.category) || 0) + 1
    );
  });

  const total = sales.length;
  return Array.from(categoryMap.entries()).map(([category, count]) => ({
    category,
    percentage: Math.round((count / total) * 1000) / 10,
  }));
};

const calculateSeasonalPerformance = (sales: Sale[]) => {
  const seasonMap = new Map<string, { count: number; revenue: number }>();

  sales.forEach(sale => {
    const current = seasonMap.get(sale.season) || { count: 0, revenue: 0 };
    seasonMap.set(sale.season, {
      count: current.count + 1,
      revenue: current.revenue + sale.revenue,
    });
  });

  return Array.from(seasonMap.entries()).map(([season, data]) => ({
    season,
    salesCount: data.count,
    revenue: data.revenue,
    averageOrderValue: Math.round(data.revenue / data.count),
  }));
};
```

#### API 호출 코드

```typescript
// 응답 스키마 정의
const ProductMatchSchema = z.object({
  matches: z.array(z.object({
    productId: z.string(),
    matchScore: z.number().min(0).max(100),
    scoreBreakdown: z.object({
      categoryFit: z.number().min(0).max(100),
      priceFit: z.number().min(0).max(100),
      seasonFit: z.number().min(0).max(100),
      audienceFit: z.number().min(0).max(100),
    }),
    predictedRevenue: z.object({
      min: z.number().nonnegative(),
      max: z.number().nonnegative(),
      average: z.number().nonnegative(),
    }),
    reasoning: z.string().min(50).max(300),
  })),
});

// 매칭 함수
async function matchProducts(
  creator: Creator,
  sales: Sale[],
  products: Product[],
  limit: number = 10
): Promise<{ matches: ProductMatch[]; analyzedAt: string }> {
  // 최소 데이터 요구사항 검증
  if (sales.length < 5) {
    throw new Error('CREATOR_SALES_EMPTY: 최소 5건의 판매 데이터가 필요합니다.');
  }

  if (products.length === 0) {
    throw new Error('PRODUCT_CATALOG_EMPTY: 제품 카탈로그가 비어있습니다.');
  }

  const systemPrompt = `[위의 시스템 프롬프트 전문]`;
  const userPrompt = generateMatchingPrompt(creator, sales, products, limit);

  // OpenAI API 호출 (재시도 로직 포함)
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 3000,
        response_format: { type: 'json_object' },
        timeout: 30000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('ANALYSIS_INVALID_RESPONSE: OpenAI 응답이 비어있습니다.');
      }

      // JSON 파싱
      const parsedData = JSON.parse(content);

      // Zod 검증
      const validatedData = ProductMatchSchema.parse(parsedData);

      // 제품 정보를 매칭 결과에 병합
      const matches: ProductMatch[] = validatedData.matches.map(match => {
        const product = products.find(p => p.id === match.productId);
        if (!product) {
          throw new Error(`PRODUCT_NOT_FOUND: ${match.productId}`);
        }

        return {
          product,
          matchScore: match.matchScore,
          scoreBreakdown: match.scoreBreakdown,
          predictedRevenue: match.predictedRevenue,
          reasoning: match.reasoning,
        };
      });

      return {
        matches,
        analyzedAt: new Date().toISOString(),
      };

    } catch (error) {
      lastError = error as Error;

      // 재시도 가능한 에러인지 판단
      const isRetryable =
        error.message.includes('rate_limit') ||
        error.message.includes('timeout') ||
        error.message.includes('server_error');

      if (!isRetryable || attempt === 2) {
        break;
      }

      // Exponential backoff
      const delay = 1000 * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // 최종 실패
  throw new Error(`ANALYSIS_FAILED: ${lastError?.message}`);
}
```

---

## API Route 구현 가이드

### 1. GET /api/creators

**파일 경로**: `/app/api/creators/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// 쿼리 파라미터 스키마
const CreatorsQuerySchema = z.object({
  platform: z.enum(['instagram', 'youtube', 'tiktok']).optional(),
  category: z.string().optional(),
  sort: z.enum(['name', 'followers', 'engagement', 'sales', 'createdAt']).default('name'),
  order: z.enum(['asc', 'desc']).default('asc'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export async function GET(request: NextRequest) {
  try {
    // 쿼리 파라미터 파싱 및 검증
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const query = CreatorsQuerySchema.parse(searchParams);

    // Supabase 클라이언트 초기화
    const supabase = createClient();

    // 쿼리 빌드
    let dbQuery = supabase
      .from('creators')
      .select('*', { count: 'exact' });

    // 필터 적용
    if (query.platform) {
      dbQuery = dbQuery.eq('platform', query.platform);
    }
    if (query.category) {
      dbQuery = dbQuery.eq('category', query.category);
    }

    // 정렬 적용
    dbQuery = dbQuery.order(query.sort, { ascending: query.order === 'asc' });

    // 페이지네이션 적용
    const from = (query.page - 1) * query.limit;
    const to = from + query.limit - 1;
    dbQuery = dbQuery.range(from, to);

    // 실행
    const { data, count, error } = await dbQuery;

    if (error) {
      throw error;
    }

    // 페이지네이션 정보 계산
    const total = count || 0;
    const totalPages = Math.ceil(total / query.limit);

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages,
        hasNext: query.page < totalPages,
        hasPrev: query.page > 1,
      },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: '잘못된 요청입니다.',
          details: error.errors,
          statusCode: 400,
        },
      }, { status: 400 });
    }

    console.error('[GET /api/creators] Error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '서버 오류가 발생했습니다.',
        statusCode: 500,
      },
    }, { status: 500 });
  }
}
```

---

### 2. GET /api/creators/[id]

**파일 경로**: `/app/api/creators/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Supabase 클라이언트 초기화
    const supabase = createClient();

    // 크리에이터 조회
    const { data: creator, error: creatorError } = await supabase
      .from('creators')
      .select('*')
      .eq('id', id)
      .single();

    if (creatorError || !creator) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'CREATOR_NOT_FOUND',
          message: '요청한 크리에이터를 찾을 수 없습니다.',
          details: { creatorId: id },
          statusCode: 404,
        },
      }, { status: 404 });
    }

    // 판매 이력 조회
    const { data: sales, error: salesError } = await supabase
      .from('sales')
      .select('*')
      .eq('creator_id', id)
      .order('sold_at', { ascending: false });

    if (salesError) {
      throw salesError;
    }

    // 통계 계산
    const totalSales = sales?.length || 0;
    const totalRevenue = sales?.reduce((sum, s) => sum + s.revenue, 0) || 0;
    const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

    // 카테고리별 판매 집계
    const categoryMap = new Map<string, number>();
    sales?.forEach(sale => {
      categoryMap.set(
        sale.category,
        (categoryMap.get(sale.category) || 0) + 1
      );
    });
    const topCategory = categoryMap.size > 0
      ? Array.from(categoryMap.entries()).sort((a, b) => b[1] - a[1])[0][0]
      : '';

    // 최다 판매 제품
    const productMap = new Map<string, { name: string; count: number }>();
    sales?.forEach(sale => {
      const current = productMap.get(sale.product_id) || { name: sale.product_name, count: 0 };
      productMap.set(sale.product_id, {
        name: current.name,
        count: current.count + sale.quantity,
      });
    });
    const topProduct = productMap.size > 0
      ? Array.from(productMap.entries())
          .sort((a, b) => b[1].count - a[1].count)[0]
      : null;

    // 최근 인사이트 조회
    const { data: latestInsight } = await supabase
      .from('creator_insights')
      .select('*')
      .eq('creator_id', id)
      .order('analyzed_at', { ascending: false })
      .limit(1)
      .single();

    // 응답 구성
    const creatorDetail = {
      ...creator,
      sales: sales || [],
      stats: {
        totalSales,
        totalRevenue,
        averageOrderValue: Math.round(averageOrderValue),
        topCategory,
        topProduct: topProduct ? {
          id: topProduct[0],
          name: topProduct[1].name,
          soldCount: topProduct[1].count,
        } : null,
      },
      latestInsight: latestInsight || undefined,
    };

    return NextResponse.json({
      success: true,
      data: creatorDetail,
    });

  } catch (error) {
    console.error('[GET /api/creators/[id]] Error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '서버 오류가 발생했습니다.',
        statusCode: 500,
      },
    }, { status: 500 });
  }
}
```

---

### 3. POST /api/analyze

**파일 경로**: `/app/api/analyze/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { analyzeCreator } from '@/lib/ai/analyze';
import { z } from 'zod';

// 요청 스키마
const AnalyzeRequestSchema = z.object({
  creatorId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    // 요청 바디 파싱 및 검증
    const body = await request.json();
    const { creatorId } = AnalyzeRequestSchema.parse(body);

    // Supabase 클라이언트 초기화
    const supabase = createClient();

    // 크리에이터 조회
    const { data: creator, error: creatorError } = await supabase
      .from('creators')
      .select('*')
      .eq('id', creatorId)
      .single();

    if (creatorError || !creator) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'CREATOR_NOT_FOUND',
          message: '요청한 크리에이터를 찾을 수 없습니다.',
          details: { creatorId },
          statusCode: 404,
        },
      }, { status: 404 });
    }

    // 판매 이력 조회
    const { data: sales, error: salesError } = await supabase
      .from('sales')
      .select('*')
      .eq('creator_id', creatorId)
      .order('sold_at', { ascending: false });

    if (salesError) {
      throw salesError;
    }

    // 최소 데이터 검증
    if (!sales || sales.length < 5) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'CREATOR_SALES_EMPTY',
          message: '분석할 판매 데이터가 충분하지 않습니다.',
          details: {
            creatorId,
            salesCount: sales?.length || 0,
            minimumRequired: 5,
          },
          statusCode: 400,
        },
      }, { status: 400 });
    }

    // AI 분석 실행
    const insight = await analyzeCreator(creator, sales);

    // 인사이트 저장
    const { error: insertError } = await supabase
      .from('creator_insights')
      .insert({
        id: insight.id,
        creator_id: insight.creatorId,
        summary: insight.summary,
        strengths: insight.strengths,
        top_categories: insight.topCategories,
        price_range: insight.priceRange,
        seasonal_trends: insight.seasonalTrends,
        recommendations: insight.recommendations,
        confidence: insight.confidence,
        analyzed_at: insight.analyzedAt,
      });

    if (insertError) {
      console.error('[POST /api/analyze] Insert error:', insertError);
      // 저장 실패해도 분석 결과는 반환
    }

    return NextResponse.json({
      success: true,
      data: insight,
    });

  } catch (error) {
    console.error('[POST /api/analyze] Error:', error);

    // 에러 타입별 처리
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: '잘못된 요청입니다.',
          details: error.errors,
          statusCode: 400,
        },
      }, { status: 400 });
    }

    const errorMessage = error instanceof Error ? error.message : String(error);

    // OpenAI 관련 에러
    if (errorMessage.includes('OPENAI')) {
      const statusCode = errorMessage.includes('RATE_LIMITED') ? 429 : 500;
      return NextResponse.json({
        success: false,
        error: {
          code: errorMessage.split(':')[0],
          message: errorMessage.split(':')[1]?.trim() || 'OpenAI API 오류',
          statusCode,
        },
      }, { status: statusCode });
    }

    // 분석 관련 에러
    if (errorMessage.includes('ANALYSIS')) {
      const statusCode = errorMessage.includes('TIMEOUT') ? 504 : 500;
      return NextResponse.json({
        success: false,
        error: {
          code: errorMessage.split(':')[0],
          message: errorMessage.split(':')[1]?.trim() || 'AI 분석 실패',
          statusCode,
        },
      }, { status: statusCode });
    }

    // 일반 서버 오류
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '서버 오류가 발생했습니다.',
        statusCode: 500,
      },
    }, { status: 500 });
  }
}
```

---

### 4. POST /api/match

**파일 경로**: `/app/api/match/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { matchProducts } from '@/lib/ai/match';
import { z } from 'zod';

// 요청 스키마
const MatchRequestSchema = z.object({
  creatorId: z.string().min(1),
  limit: z.number().int().positive().max(50).default(10),
});

export async function POST(request: NextRequest) {
  try {
    // 요청 바디 파싱 및 검증
    const body = await request.json();
    const { creatorId, limit } = MatchRequestSchema.parse(body);

    // Supabase 클라이언트 초기화
    const supabase = createClient();

    // 크리에이터 조회
    const { data: creator, error: creatorError } = await supabase
      .from('creators')
      .select('*')
      .eq('id', creatorId)
      .single();

    if (creatorError || !creator) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'CREATOR_NOT_FOUND',
          message: '요청한 크리에이터를 찾을 수 없습니다.',
          details: { creatorId },
          statusCode: 404,
        },
      }, { status: 404 });
    }

    // 판매 이력 조회
    const { data: sales, error: salesError } = await supabase
      .from('sales')
      .select('*')
      .eq('creator_id', creatorId)
      .order('sold_at', { ascending: false });

    if (salesError) {
      throw salesError;
    }

    // 최소 데이터 검증
    if (!sales || sales.length < 5) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'CREATOR_SALES_EMPTY',
          message: '분석할 판매 데이터가 충분하지 않습니다.',
          details: {
            creatorId,
            salesCount: sales?.length || 0,
            minimumRequired: 5,
          },
          statusCode: 400,
        },
      }, { status: 400 });
    }

    // 제품 카탈로그 조회
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('stock', 'gt', 0);  // 재고 있는 제품만

    if (productsError) {
      throw productsError;
    }

    if (!products || products.length === 0) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'PRODUCT_CATALOG_EMPTY',
          message: '매칭할 제품이 없습니다.',
          statusCode: 400,
        },
      }, { status: 400 });
    }

    // AI 매칭 실행
    const result = await matchProducts(creator, sales, products, limit);

    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error('[POST /api/match] Error:', error);

    // 에러 타입별 처리
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: '잘못된 요청입니다.',
          details: error.errors,
          statusCode: 400,
        },
      }, { status: 400 });
    }

    const errorMessage = error instanceof Error ? error.message : String(error);

    // OpenAI 관련 에러
    if (errorMessage.includes('OPENAI')) {
      const statusCode = errorMessage.includes('RATE_LIMITED') ? 429 : 500;
      return NextResponse.json({
        success: false,
        error: {
          code: errorMessage.split(':')[0],
          message: errorMessage.split(':')[1]?.trim() || 'OpenAI API 오류',
          statusCode,
        },
      }, { status: statusCode });
    }

    // 분석 관련 에러
    if (errorMessage.includes('ANALYSIS')) {
      const statusCode = errorMessage.includes('TIMEOUT') ? 504 : 500;
      return NextResponse.json({
        success: false,
        error: {
          code: errorMessage.split(':')[0],
          message: errorMessage.split(':')[1]?.trim() || 'AI 분석 실패',
          statusCode,
        },
      }, { status: statusCode });
    }

    // 일반 서버 오류
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '서버 오류가 발생했습니다.',
        statusCode: 500,
      },
    }, { status: 500 });
  }
}
```

---

### 5. GET /api/products

**파일 경로**: `/app/api/products/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// 쿼리 파라미터 스키마
const ProductsQuerySchema = z.object({
  category: z.string().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  season: z.enum(['spring', 'summer', 'fall', 'winter', 'all-season']).optional(),
  brand: z.string().optional(),
  inStock: z.coerce.boolean().optional(),
  sort: z.enum(['name', 'price', 'stock', 'createdAt']).default('name'),
  order: z.enum(['asc', 'desc']).default('asc'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export async function GET(request: NextRequest) {
  try {
    // 쿼리 파라미터 파싱 및 검증
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const query = ProductsQuerySchema.parse(searchParams);

    // Supabase 클라이언트 초기화
    const supabase = createClient();

    // 쿼리 빌드
    let dbQuery = supabase
      .from('products')
      .select('*', { count: 'exact' });

    // 필터 적용
    if (query.category) {
      dbQuery = dbQuery.eq('category', query.category);
    }
    if (query.minPrice !== undefined) {
      dbQuery = dbQuery.gte('price', query.minPrice);
    }
    if (query.maxPrice !== undefined) {
      dbQuery = dbQuery.lte('price', query.maxPrice);
    }
    if (query.season) {
      dbQuery = dbQuery.eq('season', query.season);
    }
    if (query.brand) {
      dbQuery = dbQuery.eq('brand', query.brand);
    }
    if (query.inStock) {
      dbQuery = dbQuery.gt('stock', 0);
    }

    // 정렬 적용
    dbQuery = dbQuery.order(query.sort, { ascending: query.order === 'asc' });

    // 페이지네이션 적용
    const from = (query.page - 1) * query.limit;
    const to = from + query.limit - 1;
    dbQuery = dbQuery.range(from, to);

    // 실행
    const { data, count, error } = await dbQuery;

    if (error) {
      throw error;
    }

    // 페이지네이션 정보 계산
    const total = count || 0;
    const totalPages = Math.ceil(total / query.limit);

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages,
        hasNext: query.page < totalPages,
        hasPrev: query.page > 1,
      },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: '잘못된 요청입니다.',
          details: error.errors,
          statusCode: 400,
        },
      }, { status: 400 });
    }

    console.error('[GET /api/products] Error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '서버 오류가 발생했습니다.',
        statusCode: 500,
      },
    }, { status: 500 });
  }
}
```

---

## 부록: 환경 변수

`.env.local` 파일에 다음 환경 변수를 설정해야 합니다:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# App
NODE_ENV=development
```

---

## 부록: 타입 정의

전체 타입 정의는 `/lib/types.ts`에서 관리됩니다:

```typescript
// Creator Types
export interface Creator {
  id: string;
  name: string;
  platform: 'instagram' | 'youtube' | 'tiktok';
  profileUrl: string;
  followerCount: number;
  engagementRate: number;
  category: string;
  bio: string;
  createdAt: string;
  updatedAt: string;
}

export interface Sale {
  id: string;
  creatorId: string;
  productId: string;
  productName: string;
  category: string;
  price: number;
  quantity: number;
  revenue: number;
  soldAt: string;
  season: 'spring' | 'summer' | 'fall' | 'winter';
}

export interface CreatorInsight {
  id: string;
  creatorId: string;
  summary: string;
  strengths: string[];
  topCategories: CategoryStat[];
  priceRange: {
    min: number;
    max: number;
    average: number;
  };
  seasonalTrends: SeasonalTrend[];
  recommendations: string[];
  confidence: number;
  analyzedAt: string;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  imageUrl: string;
  description: string;
  brand: string;
  stock: number;
  tags: string[];
  season: 'spring' | 'summer' | 'fall' | 'winter' | 'all-season';
  createdAt: string;
  updatedAt: string;
}

export interface ProductMatch {
  product: Product;
  matchScore: number;
  scoreBreakdown: {
    categoryFit: number;
    priceFit: number;
    seasonFit: number;
    audienceFit: number;
  };
  predictedRevenue: {
    min: number;
    max: number;
    average: number;
  };
  reasoning: string;
}

// Helper Types
export interface CategoryStat {
  category: string;
  percentage: number;
}

export interface SeasonalTrend {
  season: 'spring' | 'summer' | 'fall' | 'winter';
  salesCount: number;
  revenue: number;
  averageOrderValue?: number;
  topProducts?: string[];
}
```

---

**문서 끝**
