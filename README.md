# ZVZO Creator Insight

> 크리에이터와 제품을 양방향으로 AI 매칭하여 최적의 협업을 제안하는 플랫폼

AI 기반 크리에이터-제품 매칭 플랫폼으로, 크리에이터에게는 최적의 제품을, 기업에게는 최적의 크리에이터를 추천합니다. 과거 판매 이력을 학습하여 각 크리에이터의 강점과 최적 가격대를 파악하고, 제품 특성에 맞는 크리에이터를 발굴합니다.

---

## ✨ 주요 기능

### 1. 크리에이터 분석
AI가 크리에이터의 판매 이력을 심층 분석하여 다음을 파악합니다:
- **강점 카테고리**: 가장 높은 매출을 올린 제품 카테고리 식별
- **최적 가격대**: 전환율이 가장 높은 가격 구간 분석
- **시즌 패턴**: 월별 판매 트렌드와 성수기/비수기 파악
- **전환 메트릭**: 팔로워 대비 구매 전환율 및 카테고리별 성과 지표

### 2. 제품 매칭
크리에이터 특성에 맞는 최적 제품을 AI가 스코어링하여 추천합니다:
- **4가지 적합도 평가**: 카테고리, 가격대, 시즌, 타겟 고객 적합도
- **종합 매칭 점수**: 0~100점 척도로 적합도 시각화
- **AI 추론 설명**: 추천 근거를 자연어로 제공
- **신뢰도 표시**: 추천의 확실성을 백분율로 표시

### 3. 매출 예측
크리에이터가 추천 제품을 판매할 때의 예상 매출을 시뮬레이션합니다:
- **최소/예상/최대 매출 범위**: 3가지 시나리오 제공
- **예상 판매 수량**: 과거 데이터 기반 수량 추정
- **예상 커미션**: 크리에이터가 받을 예상 수익
- **근거 제시**: 예측의 기반이 되는 데이터 명시

### 4. 제품 기반 크리에이터 추천
기업이 제품을 기준으로 최적의 크리에이터를 AI가 추천합니다:
- **제품 카탈로그**: 50개 제품을 카테고리, 가격대별로 탐색
- **역방향 매칭**: 제품 특성에 맞는 크리에이터를 4가지 적합도로 평가
- **크리에이터 비교**: 추천된 크리에이터 2~3명을 나란히 비교
- **판매 이력 분석**: 해당 제품의 크리에이터별 판매 실적 확인

---

## 🛠️ 기술 스택

| 카테고리 | 기술 |
|---------|------|
| **프레임워크** | Next.js 14 (App Router) |
| **언어** | TypeScript (strict mode) |
| **스타일링** | Tailwind CSS |
| **UI 컴포넌트** | Custom components (shadcn/ui 스타일) |
| **차트** | Recharts |
| **AI** | OpenAI GPT-4o |
| **테스트** | Vitest + React Testing Library |
| **코드 품질** | ESLint + Prettier |
| **Git 훅** | Husky + lint-staged + commitlint |
| **배포** | Vercel |
| **CI/CD** | GitHub Actions |

---

## 📁 프로젝트 구조

```
zvzo-creator-insight/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── analyze/           # POST /api/analyze
│   │   │   ├── creators/          # GET /api/creators
│   │   │   ├── products/          # GET /api/products
│   │   │   └── match/
│   │   │       ├── route.ts       # POST /api/match (creator→product)
│   │   │       └── creators/
│   │   │           └── route.ts   # POST /api/match/creators (product→creator)
│   │   ├── creator/
│   │   │   └── [id]/
│   │   │       ├── page.tsx       # Creator detail
│   │   │       └── match/
│   │   │           └── page.tsx   # Product match for creator
│   │   ├── products/
│   │   │   ├── page.tsx           # Product catalog
│   │   │   └── [id]/
│   │   │       ├── page.tsx       # Product detail
│   │   │       └── match/
│   │   │           └── page.tsx   # Creator match for product
│   │   ├── dashboard/             # Creator dashboard
│   │   ├── about/                 # About page
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── match/                 # Match components
│   │   │   ├── match-card.tsx            # Product match card
│   │   │   ├── match-section.tsx         # Product match section
│   │   │   ├── creator-match-card.tsx    # Creator match card (NEW)
│   │   │   ├── creator-match-section.tsx # Creator match section (NEW)
│   │   │   ├── match-score-breakdown.tsx
│   │   │   ├── revenue-prediction-bar.tsx
│   │   │   ├── compare-modal.tsx
│   │   │   └── reasoning-text.tsx
│   │   ├── charts/                # Recharts components
│   │   │   ├── match-score-gauge.tsx
│   │   │   ├── category-chart.tsx
│   │   │   ├── price-distribution.tsx
│   │   │   ├── seasonal-trend.tsx
│   │   │   └── revenue-forecast.tsx
│   │   ├── creator/               # Creator components
│   │   │   ├── creator-card.tsx
│   │   │   ├── creator-profile.tsx
│   │   │   ├── analysis-section.tsx
│   │   │   ├── analyze-button.tsx
│   │   │   ├── insight-summary.tsx
│   │   │   └── sales-table.tsx
│   │   ├── products/              # Product components (NEW)
│   │   │   ├── product-list.tsx
│   │   │   ├── product-card.tsx
│   │   │   ├── product-profile.tsx
│   │   │   └── product-sales-table.tsx
│   │   ├── dashboard/             # Dashboard components
│   │   │   └── creator-list.tsx
│   │   ├── common/                # Shared components
│   │   ├── layout/                # Layout components
│   │   └── ui/                    # Base UI components
│   ├── data/                      # Mock data (20 creators, 50 products, sales history)
│   ├── types/                     # TypeScript type definitions
│   └── lib/                       # Utilities, analysis, OpenAI integration
├── tests/                         # 835 tests (Vitest + RTL)
│   └── unit/
│       ├── api/                   # API route tests
│       ├── components/            # Component tests
│       ├── lib/                   # Library tests
│       ├── data/                  # Data layer tests
│       └── pages/                 # Page tests
├── public/
├── vitest.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
└── package.json
```

---

## 🚀 시작하기

### 사전 요구사항

- **Node.js** 20 이상
- **pnpm** 8 이상
- **OpenAI API Key** (AI 분석 기능 사용 시 필요)

### 설치

1. 레포지토리 클론

```bash
git clone https://github.com/baekenough/zvzo-creator-insight.git
cd zvzo-creator-insight
```

2. 의존성 설치

```bash
pnpm install
```

3. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일 생성 후 다음 내용 추가:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

OpenAI API 키는 [OpenAI Platform](https://platform.openai.com/api-keys)에서 발급받을 수 있습니다.

### 개발 서버 실행

```bash
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 애플리케이션을 확인하세요.

### 테스트 실행

```bash
# 테스트 실행 (watch mode)
pnpm test

# 테스트 1회 실행
pnpm test:run

# 커버리지 리포트 생성
pnpm test:coverage

# 테스트 UI 실행
pnpm test:ui
```

### 빌드

프로덕션 빌드 생성:

```bash
pnpm build
```

빌드된 애플리케이션 실행:

```bash
pnpm start
```

### 린트 & 포매팅

```bash
# ESLint 실행
pnpm lint

# ESLint 자동 수정
pnpm lint:fix

# Prettier 포매팅
pnpm format

# Prettier 검사
pnpm format:check

# 타입 체크
pnpm typecheck
```

---

## 📡 API 엔드포인트

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/creators | 크리에이터 목록 (필터링, 정렬, 페이지네이션) |
| GET | /api/products | 제품 목록 (필터링, 정렬, 페이지네이션) |
| POST | /api/analyze | AI 크리에이터 분석 |
| POST | /api/match | 크리에이터→제품 매칭 |
| POST | /api/match/creators | 제품→크리에이터 매칭 |

---

## 🏗️ 아키텍처

### 데이터 흐름

```
Mock Data (20 creators, 50 products, sales history)
        │
        ▼
    Data Loader (src/data/index.ts)
        │
    ┌───┴───┐
    ▼       ▼
/api/analyze  /api/match    /api/match/creators
(Creator AI)  (Creator→Product)  (Product→Creator)
    │         │                    │
    ▼         ▼                    ▼
OpenAI GPT-4o (with fallback scoring)
    │
    ▼
Structured Response (Zod validated)
    │
    ▼
React Components (Dashboard, Product Catalog, Match pages)
```

### AI 분석 파이프라인

4단계 AI 분석 프로세스:

1. **데이터 집계 (Data Aggregation)**
   - 크리에이터의 모든 판매 기록 수집
   - 카테고리별, 가격대별, 시즌별 데이터 그룹화
   - 통계 메트릭 계산 (평균, 중앙값, 분포)

2. **패턴 분석 (Pattern Analysis)**
   - GPT-4o에 집계된 데이터 전달
   - 강점 카테고리, 최적 가격대, 시즌 패턴 식별
   - 크리에이터의 판매 특성 프로파일링

3. **제품 스코어링 (Product Scoring)**
   - 크리에이터 프로파일과 제품 특성 매칭
   - 4가지 차원의 적합도 계산 (카테고리, 가격, 시즌, 고객)
   - 종합 매칭 점수 산출 (0-100점)

4. **매출 예측 (Revenue Prediction)**
   - 과거 유사 제품의 판매 실적 분석
   - 최소/예상/최대 매출 시나리오 생성
   - 예상 판매 수량 및 커미션 계산

각 단계는 구조화된 JSON 형식으로 결과를 반환하며, Zod를 사용한 타입 검증을 거칩니다.

---

## 🧪 개발 도구

### 코드 품질

- **ESLint**: 코드 품질 검사 및 잠재적 버그 탐지
- **Prettier**: 일관된 코드 포매팅 유지
- **TypeScript strict mode**: 컴파일 타임 타입 안전성 보장

### Git 워크플로우

- **Husky**: Git 훅 자동화
- **lint-staged**: 스테이징된 파일만 린트/포맷
- **commitlint**: 커밋 메시지 규칙 강제 (Conventional Commits)

커밋 메시지 규칙 예시:
```
feat: Add creator profile component
fix: Fix revenue prediction calculation bug
docs: Update README installation steps
style: Format code with prettier
refactor: Reorganize match components
test: Add tests for match-card component
```

### 테스트

- **Vitest**: 빠른 단위 테스트 실행 (835개 테스트)
- **React Testing Library**: 컴포넌트 테스트
- **@vitest/coverage-v8**: 코드 커버리지 측정
- **테스트 범위**: API routes, components, pages, libraries, data layer
