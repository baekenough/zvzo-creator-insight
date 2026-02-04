# 06. 컴포넌트 스펙

> **프로젝트**: zvzo-creator-insight
> **작성일**: 2026-02-04
> **버전**: 1.0.0

## 목차

1. [컴포넌트 디렉토리 구조](#1-컴포넌트-디렉토리-구조)
2. [레이아웃 컴포넌트](#2-레이아웃-컴포넌트-layout)
3. [차트 컴포넌트](#3-차트-컴포넌트-charts)
4. [크리에이터 컴포넌트](#4-크리에이터-컴포넌트-creator)
5. [매칭 컴포넌트](#5-매칭-컴포넌트-match)
6. [공통 컴포넌트](#6-공통-컴포넌트-common)
7. [UI 컴포넌트](#7-ui-컴포넌트-ui)
8. [접근성 가이드](#8-접근성-가이드)
9. [테스트 전략](#9-테스트-전략)

---

## 1. 컴포넌트 디렉토리 구조

```
src/components/
├── ui/                 # shadcn/ui 기본 컴포넌트
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── label.tsx
│   ├── select.tsx
│   ├── table.tsx
│   ├── tabs.tsx
│   ├── toast.tsx
│   ├── dialog.tsx
│   ├── badge.tsx
│   ├── skeleton.tsx
│   └── dropdown-menu.tsx
│
├── layout/             # 레이아웃 컴포넌트
│   ├── header.tsx
│   ├── footer.tsx
│   └── page-container.tsx
│
├── charts/             # 데이터 시각화 컴포넌트
│   ├── category-chart.tsx
│   ├── price-distribution.tsx
│   ├── seasonal-trend.tsx
│   ├── revenue-forecast.tsx
│   └── match-score-gauge.tsx
│
├── creator/            # 크리에이터 관련 컴포넌트
│   ├── creator-card.tsx
│   ├── creator-profile.tsx
│   ├── sales-table.tsx
│   ├── insight-summary.tsx
│   └── analyze-button.tsx
│
├── match/              # 매칭 관련 컴포넌트
│   ├── match-card.tsx
│   ├── match-score-breakdown.tsx
│   ├── revenue-prediction-bar.tsx
│   ├── compare-modal.tsx
│   └── reasoning-text.tsx
│
└── common/             # 공통 유틸 컴포넌트
    ├── stat-card.tsx
    ├── search-bar.tsx
    ├── filter-dropdown.tsx
    ├── platform-badge.tsx
    ├── confidence-badge.tsx
    ├── empty-state.tsx
    └── error-state.tsx
```

---

## 2. 레이아웃 컴포넌트 (layout/)

### 2.1 Header

**파일**: `src/components/layout/header.tsx`

#### TypeScript Props

```typescript
/**
 * Header 컴포넌트 Props
 */
export interface HeaderProps {
  /**
   * 현재 활성화된 메뉴 항목
   * @default undefined
   */
  activeMenu?: string;

  /**
   * 로고 클릭 시 콜백
   * @default () => router.push('/')
   */
  onLogoClick?: () => void;

  /**
   * 사용자 정보 (인증 시)
   * @optional
   */
  user?: {
    name: string;
    email: string;
    avatarUrl?: string;
  };

  /**
   * 헤더를 sticky로 고정할지 여부
   * @default true
   */
  sticky?: boolean;
}
```

#### 내부 상태

```typescript
const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
const [scrolled, setScrolled] = useState(false);
```

#### 이벤트 핸들러

```typescript
/**
 * 모바일 메뉴 토글
 */
const handleMenuToggle = () => {
  setMobileMenuOpen((prev) => !prev);
};

/**
 * 스크롤 감지 (shadow 효과용)
 */
useEffect(() => {
  const handleScroll = () => {
    setScrolled(window.scrollY > 10);
  };
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);

/**
 * 메뉴 아이템 클릭
 */
const handleMenuClick = (menuId: string) => {
  setMobileMenuOpen(false);
  router.push(`/${menuId}`);
};
```

#### 접근성

- `<nav>` 태그 사용, `aria-label="Main navigation"`
- 모바일 메뉴 버튼: `aria-expanded={mobileMenuOpen}`, `aria-label="메뉴 열기"`
- 키보드 네비게이션: Tab, Enter, Escape (메뉴 닫기)
- Focus trap: 모바일 메뉴 열렸을 때 메뉴 내부에만 포커스

#### 반응형

- **Desktop (≥1024px)**: 수평 메뉴, 사용자 프로필 우측
- **Tablet (768px~1023px)**: 수평 메뉴 축약
- **Mobile (<768px)**: 햄버거 메뉴, 풀스크린 오버레이

#### 테스트 시나리오

```typescript
describe('Header', () => {
  it('should render logo and menu items', () => {});
  it('should toggle mobile menu on button click', () => {});
  it('should close mobile menu on menu item click', () => {});
  it('should add shadow on scroll', () => {});
  it('should navigate on logo click', () => {});
  it('should handle keyboard navigation', () => {});
});
```

#### 사용 예시

```tsx
<Header
  activeMenu="dashboard"
  user={{
    name: '김지은',
    email: 'jieun@example.com',
    avatarUrl: '/avatars/jieun.jpg',
  }}
  sticky={true}
/>
```

---

### 2.2 Footer

**파일**: `src/components/layout/footer.tsx`

#### TypeScript Props

```typescript
/**
 * Footer 컴포넌트 Props
 */
export interface FooterProps {
  /**
   * 추가 CSS 클래스
   * @optional
   */
  className?: string;
}
```

#### 내부 상태

없음 (정적 컴포넌트)

#### 접근성

- `<footer>` 태그 사용
- 링크에 명확한 텍스트 제공
- 소셜 미디어 아이콘: `aria-label="Instagram으로 이동"`

#### 반응형

- **Desktop**: 4개 컬럼 그리드
- **Tablet**: 2개 컬럼
- **Mobile**: 1개 컬럼, 스택 레이아웃

#### 테스트 시나리오

```typescript
describe('Footer', () => {
  it('should render company info', () => {});
  it('should render all navigation links', () => {});
  it('should render copyright year dynamically', () => {});
});
```

#### 사용 예시

```tsx
<Footer className="mt-auto" />
```

---

### 2.3 PageContainer

**파일**: `src/components/layout/page-container.tsx`

#### TypeScript Props

```typescript
/**
 * PageContainer 컴포넌트 Props
 */
export interface PageContainerProps {
  /**
   * 자식 요소
   */
  children: React.ReactNode;

  /**
   * 컨테이너 최대 너비
   * @default "7xl"
   */
  maxWidth?: 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | '7xl' | 'full';

  /**
   * 브레드크럼 데이터
   * @optional
   */
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;

  /**
   * 페이지 타이틀
   * @optional
   */
  title?: string;

  /**
   * 페이지 설명
   * @optional
   */
  description?: string;

  /**
   * 추가 액션 버튼
   * @optional
   */
  actions?: React.ReactNode;

  /**
   * 추가 CSS 클래스
   * @optional
   */
  className?: string;
}
```

#### 내부 상태

없음

#### 접근성

- `<main>` 태그 사용
- 브레드크럼: `<nav aria-label="Breadcrumb">`
- 타이틀: `<h1>` 태그, 페이지당 하나

#### 반응형

- **Desktop**: 좌우 여백 `px-8`
- **Tablet**: 여백 `px-6`
- **Mobile**: 여백 `px-4`

#### 테스트 시나리오

```typescript
describe('PageContainer', () => {
  it('should render children', () => {});
  it('should render breadcrumbs when provided', () => {});
  it('should render title and description', () => {});
  it('should render action buttons', () => {});
  it('should apply max-width class', () => {});
});
```

#### 사용 예시

```tsx
<PageContainer
  maxWidth="7xl"
  breadcrumbs={[
    { label: '홈', href: '/' },
    { label: '대시보드', href: '/dashboard' },
    { label: '크리에이터 분석' },
  ]}
  title="크리에이터 분석"
  description="AI 기반 판매 성과 인사이트를 확인하세요"
  actions={<Button>분석 요청</Button>}
>
  {/* 페이지 콘텐츠 */}
</PageContainer>
```

---

## 3. 차트 컴포넌트 (charts/)

### 3.1 CategoryChart

**파일**: `src/components/charts/category-chart.tsx`

#### TypeScript Props

```typescript
import type { CategoryScore } from '@/types';

/**
 * CategoryChart 컴포넌트 Props
 */
export interface CategoryChartProps {
  /**
   * 카테고리별 점수 데이터
   * @remarks
   * 최소 1개 이상의 데이터 필요
   */
  data: CategoryScore[];

  /**
   * 차트 높이 (px)
   * @default 400
   */
  height?: number;

  /**
   * 차트 제목
   * @optional
   */
  title?: string;

  /**
   * 바 클릭 시 콜백
   * @optional
   */
  onBarClick?: (category: CategoryScore) => void;

  /**
   * 로딩 상태
   * @default false
   */
  loading?: boolean;

  /**
   * 추가 CSS 클래스
   * @optional
   */
  className?: string;
}
```

#### 내부 상태

```typescript
const [hoveredBar, setHoveredBar] = useState<string | null>(null);
```

#### 이벤트 핸들러

```typescript
/**
 * 바 호버 핸들러
 */
const handleMouseEnter = (category: string) => {
  setHoveredBar(category);
};

const handleMouseLeave = () => {
  setHoveredBar(null);
};

/**
 * 바 클릭 핸들러
 */
const handleClick = (data: CategoryScore) => {
  onBarClick?.(data);
};
```

#### 접근성

- `role="img"`, `aria-label="카테고리별 성과 점수 차트"`
- Tooltip에 `aria-live="polite"` 추가 (호버 시 스크린 리더에 정보 전달)
- 키보드 네비게이션: Tab으로 바 선택, Enter로 클릭

#### 반응형

- **Desktop**: 최대 너비 활용
- **Tablet**: 폰트 크기 축소
- **Mobile**: 가로 스크롤 가능, 최소 높이 350px

#### Loading/Error States

```tsx
{loading && <Skeleton className="h-[400px] w-full" />}
{!loading && data.length === 0 && (
  <EmptyState
    title="데이터 없음"
    description="카테고리 성과 데이터가 없습니다"
  />
)}
```

#### 테스트 시나리오

```typescript
describe('CategoryChart', () => {
  it('should render chart with data', () => {});
  it('should show tooltip on hover', () => {});
  it('should call onBarClick on bar click', () => {});
  it('should show loading skeleton when loading', () => {});
  it('should show empty state when no data', () => {});
  it('should apply color gradient based on score', () => {});
});
```

#### 사용 예시

```tsx
<CategoryChart
  data={[
    {
      category: 'Beauty',
      score: 88,
      salesCount: 45,
      totalRevenue: 3750000,
      avgConversionRate: 4.2,
    },
    {
      category: 'Fashion',
      score: 75,
      salesCount: 32,
      totalRevenue: 2850000,
      avgConversionRate: 3.1,
    },
  ]}
  height={400}
  title="카테고리별 성과"
  onBarClick={(data) => console.log('Clicked:', data.category)}
/>
```

---

### 3.2 PriceDistribution

**파일**: `src/components/charts/price-distribution.tsx`

#### TypeScript Props

```typescript
import type { PriceBucket } from '@/types';

/**
 * PriceDistribution 컴포넌트 Props
 */
export interface PriceDistributionProps {
  /**
   * 가격대별 판매 데이터
   */
  data: PriceBucket[];

  /**
   * 차트 높이 (px)
   * @default 350
   */
  height?: number;

  /**
   * 차트 제목
   * @optional
   */
  title?: string;

  /**
   * Y축 레이블 (판매 건수/매출)
   * @default "판매 건수"
   */
  yAxisLabel?: '판매 건수' | '매출';

  /**
   * 바 클릭 시 콜백
   * @optional
   */
  onBarClick?: (bucket: PriceBucket) => void;

  /**
   * 로딩 상태
   * @default false
   */
  loading?: boolean;

  /**
   * 추가 CSS 클래스
   * @optional
   */
  className?: string;
}
```

#### 내부 상태

```typescript
const [activeIndex, setActiveIndex] = useState<number | null>(null);
```

#### 이벤트 핸들러

```typescript
/**
 * 바 클릭 핸들러
 */
const handleBarClick = (data: PriceBucket, index: number) => {
  setActiveIndex(index);
  onBarClick?.(data);
};

/**
 * Tooltip 포맷터
 */
const formatTooltip = (value: number, name: string) => {
  if (yAxisLabel === '매출') {
    return [`${(value / 10000).toFixed(0)}만원`, name];
  }
  return [`${value}건`, name];
};
```

#### 접근성

- `role="img"`, `aria-label="가격대별 판매 분포 차트"`
- X축 레이블: 가격대 명시 (예: "3만~5만원")
- Tooltip: 수치 명확하게 제공

#### 반응형

- **Desktop**: 바 너비 40px
- **Tablet**: 바 너비 30px
- **Mobile**: 바 너비 20px, 가로 스크롤

#### 테스트 시나리오

```typescript
describe('PriceDistribution', () => {
  it('should render histogram with data', () => {});
  it('should format price range labels', () => {});
  it('should toggle between count and revenue view', () => {});
  it('should highlight active bar on click', () => {});
  it('should show tooltip with formatted values', () => {});
});
```

#### 사용 예시

```tsx
<PriceDistribution
  data={[
    {
      range: '30000-50000',
      count: 28,
      revenue: 1120000,
      bestPerformingPrice: 45000,
    },
    {
      range: '50000-80000',
      count: 35,
      revenue: 2275000,
      bestPerformingPrice: 65000,
    },
  ]}
  height={350}
  title="가격대별 판매 분포"
  yAxisLabel="판매 건수"
  onBarClick={(bucket) => console.log('Clicked bucket:', bucket.range)}
/>
```

---

### 3.3 SeasonalTrend

**파일**: `src/components/charts/seasonal-trend.tsx`

#### TypeScript Props

```typescript
import type { SeasonalData } from '@/types';

/**
 * SeasonalTrend 컴포넌트 Props
 */
export interface SeasonalTrendProps {
  /**
   * 시즌별 판매 데이터 (12개월)
   * @remarks
   * 배열 길이는 4 (Spring, Summer, Fall, Winter)
   * 또는 12 (월별 데이터)
   */
  data: SeasonalData[];

  /**
   * 차트 높이 (px)
   * @default 400
   */
  height?: number;

  /**
   * 차트 제목
   * @optional
   */
  title?: string;

  /**
   * 표시할 데이터 타입
   * @default ["sales", "revenue"]
   */
  dataKeys?: Array<'salesCount' | 'revenue'>;

  /**
   * 범례 표시 여부
   * @default true
   */
  showLegend?: boolean;

  /**
   * 로딩 상태
   * @default false
   */
  loading?: boolean;

  /**
   * 추가 CSS 클래스
   * @optional
   */
  className?: string;
}
```

#### 내부 상태

```typescript
const [hiddenLines, setHiddenLines] = useState<Set<string>>(new Set());
```

#### 이벤트 핸들러

```typescript
/**
 * 범례 클릭 핸들러 (라인 토글)
 */
const handleLegendClick = (dataKey: string) => {
  setHiddenLines((prev) => {
    const newSet = new Set(prev);
    if (newSet.has(dataKey)) {
      newSet.delete(dataKey);
    } else {
      newSet.add(dataKey);
    }
    return newSet;
  });
};

/**
 * Tooltip 포맷터
 */
const formatTooltipValue = (value: number, name: string) => {
  if (name === 'revenue') {
    return [`${(value / 10000).toFixed(0)}만원`, '매출'];
  }
  return [`${value}건`, '판매 건수'];
};
```

#### 접근성

- `role="img"`, `aria-label="시즌별 판매 트렌드 차트"`
- 범례 버튼: `aria-pressed={!hidden}`, `aria-label="판매 건수 라인 표시/숨기기"`
- Tooltip: 명확한 값 표시

#### 반응형

- **Desktop**: 2개 라인, 범례 우측
- **Tablet**: 범례 하단
- **Mobile**: 라인 1px 두께, 포인트 크기 축소

#### 테스트 시나리오

```typescript
describe('SeasonalTrend', () => {
  it('should render multi-line chart with data', () => {});
  it('should toggle line visibility on legend click', () => {});
  it('should show tooltip with seasonal data', () => {});
  it('should format month labels (3월, 4월, ...)', () => {});
  it('should highlight trend periods', () => {});
});
```

#### 사용 예시

```tsx
<SeasonalTrend
  data={[
    {
      season: 'Spring',
      salesCount: 25,
      revenue: 1850000,
      topCategories: ['Beauty', 'Fashion'],
    },
    {
      season: 'Summer',
      salesCount: 18,
      revenue: 1350000,
      topCategories: ['Fashion'],
    },
    // ... Fall, Winter
  ]}
  height={400}
  title="시즌별 판매 트렌드"
  dataKeys={['salesCount', 'revenue']}
  showLegend={true}
/>
```

---

### 3.4 RevenueForecast

**파일**: `src/components/charts/revenue-forecast.tsx`

#### TypeScript Props

```typescript
import type { RevenuePrediction } from '@/types';

/**
 * RevenueForecast 컴포넌트 Props
 */
export interface RevenueForecastProps {
  /**
   * 매출 예측 데이터
   */
  data: RevenuePrediction;

  /**
   * 차트 높이 (px)
   * @default 300
   */
  height?: number;

  /**
   * 차트 제목
   * @optional
   */
  title?: string;

  /**
   * 로딩 상태
   * @default false
   */
  loading?: boolean;

  /**
   * 추가 CSS 클래스
   * @optional
   */
  className?: string;
}
```

#### 내부 상태

없음 (props 기반 렌더링)

#### 이벤트 핸들러

```typescript
/**
 * Tooltip 포맷터
 */
const formatTooltip = (value: number) => {
  return `${(value / 10000).toFixed(0)}만원`;
};
```

#### 접근성

- `role="img"`, `aria-label="예상 매출 범위 차트"`
- 범위 정보: `aria-describedby="forecast-description"`
- 설명 텍스트: "최소 105만원, 예상 135만원, 최대 165만원"

#### 반응형

- **Desktop**: 넓은 범위 바
- **Tablet/Mobile**: 축소된 범위 바, 세로 레이블

#### 차트 구조

```
[==== min ====|==== expected ====|==== max ====]
     105만원         135만원            165만원
```

- 최소~예상: 연한 파란색
- 예상~최대: 연한 초록색
- 예상값: 굵은 선 표시

#### 테스트 시나리오

```typescript
describe('RevenueForecast', () => {
  it('should render range chart with min/expected/max', () => {});
  it('should color code ranges appropriately', () => {});
  it('should show tooltip on hover', () => {});
  it('should format revenue values in Korean (만원)', () => {});
});
```

#### 사용 예시

```tsx
<RevenueForecast
  data={{
    productId: 'product-001',
    creatorId: 'creator-001',
    predictedRevenue: 1350000,
    confidenceInterval: {
      min: 1050000,
      max: 1650000,
    },
    factors: ['과거 평균 전환율 4.2%', '봄 시즌 증가 패턴'],
  }}
  height={300}
  title="예상 매출 범위"
/>
```

---

### 3.5 MatchScoreGauge

**파일**: `src/components/charts/match-score-gauge.tsx`

#### TypeScript Props

```typescript
/**
 * MatchScoreGauge 컴포넌트 Props
 */
export interface MatchScoreGaugeProps {
  /**
   * 매칭 점수 (0~100)
   */
  score: number;

  /**
   * 게이지 크기
   * @default "md"
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * 레이블 표시 여부
   * @default true
   */
  showLabel?: boolean;

  /**
   * 애니메이션 활성화
   * @default true
   */
  animated?: boolean;

  /**
   * 추가 CSS 클래스
   * @optional
   */
  className?: string;
}
```

#### 내부 상태

```typescript
const [animatedScore, setAnimatedScore] = useState(0);
```

#### 이벤트 핸들러

```typescript
/**
 * 애니메이션 효과
 */
useEffect(() => {
  if (!animated) {
    setAnimatedScore(score);
    return;
  }

  let frame = 0;
  const totalFrames = 60;
  const increment = score / totalFrames;

  const animate = () => {
    frame++;
    setAnimatedScore(Math.min(score, frame * increment));
    if (frame < totalFrames) {
      requestAnimationFrame(animate);
    }
  };

  requestAnimationFrame(animate);
}, [score, animated]);
```

#### 접근성

- `role="img"`, `aria-label="매칭 점수 ${score}점"`
- 색상에만 의존하지 않고 텍스트로도 점수 표시
- 점수 범위별 레이블: "낮음", "보통", "높음", "매우 높음"

#### 색상 범위

```typescript
const getColor = (score: number): string => {
  if (score >= 70) return '#10b981'; // green-500
  if (score >= 40) return '#f59e0b'; // yellow-500
  return '#ef4444'; // red-500
};

const getLabel = (score: number): string => {
  if (score >= 90) return '매우 높음';
  if (score >= 70) return '높음';
  if (score >= 40) return '보통';
  return '낮음';
};
```

#### 크기

```typescript
const sizeClasses = {
  sm: 'h-24 w-24',
  md: 'h-32 w-32',
  lg: 'h-48 w-48',
};
```

#### 테스트 시나리오

```typescript
describe('MatchScoreGauge', () => {
  it('should render gauge with score', () => {});
  it('should apply correct color based on score', () => {});
  it('should animate score from 0 to target', () => {});
  it('should render in different sizes', () => {});
  it('should show/hide label based on prop', () => {});
});
```

#### 사용 예시

```tsx
<MatchScoreGauge score={87} size="md" showLabel={true} animated={true} />

{/* 작은 크기 (리스트용) */}
<MatchScoreGauge score={65} size="sm" showLabel={false} />

{/* 큰 크기 (상세 페이지용) */}
<MatchScoreGauge score={92} size="lg" showLabel={true} />
```

---

## 4. 크리에이터 컴포넌트 (creator/)

### 4.1 CreatorCard

**파일**: `src/components/creator/creator-card.tsx`

#### TypeScript Props

```typescript
import type { Creator } from '@/types';

/**
 * CreatorCard 컴포넌트 Props
 */
export interface CreatorCardProps {
  /**
   * 크리에이터 정보
   */
  creator: Creator;

  /**
   * 추가 통계 정보 (선택)
   * @optional
   */
  stats?: {
    totalRevenue: number;
    avgConversionRate: number;
    totalSales: number;
  };

  /**
   * 카드 클릭 시 콜백
   * @optional
   */
  onClick?: (creator: Creator) => void;

  /**
   * 호버 효과 활성화
   * @default true
   */
  hoverable?: boolean;

  /**
   * 추가 CSS 클래스
   * @optional
   */
  className?: string;
}
```

#### 내부 상태

```typescript
const [imageError, setImageError] = useState(false);
const [isHovered, setIsHovered] = useState(false);
```

#### 이벤트 핸들러

```typescript
/**
 * 이미지 로딩 실패 핸들러
 */
const handleImageError = () => {
  setImageError(true);
};

/**
 * 카드 클릭 핸들러
 */
const handleClick = () => {
  onClick?.(creator);
};

/**
 * 키보드 핸들러
 */
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    handleClick();
  }
};
```

#### 접근성

- `role="button"`, `tabIndex={0}`
- `aria-label="${creator.name} 크리에이터 카드, ${creator.platform} 플랫폼, 팔로워 ${formatNumber(creator.followerCount)}명"`
- 키보드: Enter/Space로 클릭 가능
- Focus 스타일 명확하게 표시

#### 반응형

- **Desktop**: 카드 너비 320px, 3개 그리드
- **Tablet**: 카드 너비 280px, 2개 그리드
- **Mobile**: 전체 너비, 1개 컬럼

#### 호버 효과

```css
/* hover 시 */
transform: translateY(-4px);
box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
```

#### 테스트 시나리오

```typescript
describe('CreatorCard', () => {
  it('should render creator info', () => {});
  it('should display profile image with fallback', () => {});
  it('should render platform badge', () => {});
  it('should render category badges', () => {});
  it('should call onClick on card click', () => {});
  it('should navigate on Enter key press', () => {});
  it('should format follower count (250,000 → 25만)', () => {});
  it('should show hover effect when hoverable', () => {});
});
```

#### 사용 예시

```tsx
<CreatorCard
  creator={{
    id: 'creator-001',
    name: '김지은',
    platform: 'Instagram',
    followerCount: 250000,
    categories: ['Beauty', 'Fashion'],
    email: 'jieun@example.com',
    joinedAt: '2025-01-15T09:00:00Z',
  }}
  stats={{
    totalRevenue: 5650000,
    avgConversionRate: 3.8,
    totalSales: 77,
  }}
  onClick={(creator) => router.push(`/creators/${creator.id}`)}
  hoverable={true}
/>
```

---

### 4.2 CreatorProfile

**파일**: `src/components/creator/creator-profile.tsx`

#### TypeScript Props

```typescript
import type { Creator } from '@/types';

/**
 * CreatorProfile 컴포넌트 Props
 */
export interface CreatorProfileProps {
  /**
   * 크리에이터 정보
   */
  creator: Creator;

  /**
   * 통계 정보
   */
  stats: {
    totalRevenue: number;
    avgConversionRate: number;
    totalSales: number;
    topCategory: string;
  };

  /**
   * 추가 액션 버튼
   * @optional
   */
  actions?: React.ReactNode;

  /**
   * 추가 CSS 클래스
   * @optional
   */
  className?: string;
}
```

#### 내부 상태

```typescript
const [imageLoaded, setImageLoaded] = useState(false);
```

#### 이벤트 핸들러

```typescript
/**
 * 이미지 로딩 완료 핸들러
 */
const handleImageLoad = () => {
  setImageLoaded(true);
};
```

#### 접근성

- `<header>` 태그 사용
- 프로필 이미지: `alt="${creator.name} 프로필 사진"`
- 통계 항목: `aria-label="총 매출 565만원"`

#### 반응형

- **Desktop**: 프로필 이미지 128px, 정보 우측 배치
- **Tablet**: 프로필 이미지 96px
- **Mobile**: 프로필 이미지 80px, 중앙 배치, 정보 하단

#### 레이아웃

```
┌────────────────────────────────────────┐
│  [이미지]  김지은                       │
│           Instagram • 25만 팔로워       │
│           Beauty, Fashion              │
│                                        │
│  [총 매출] [평균 전환율] [판매 건수]    │
│   565만원      3.8%         77건      │
│                                    [버튼]│
└────────────────────────────────────────┘
```

#### 테스트 시나리오

```typescript
describe('CreatorProfile', () => {
  it('should render large profile header', () => {});
  it('should display platform icon and follower count', () => {});
  it('should render category badges', () => {});
  it('should display statistics cards', () => {});
  it('should render action buttons', () => {});
  it('should show loading skeleton for image', () => {});
});
```

#### 사용 예시

```tsx
<CreatorProfile
  creator={creator}
  stats={{
    totalRevenue: 5650000,
    avgConversionRate: 3.8,
    totalSales: 77,
    topCategory: 'Beauty',
  }}
  actions={
    <>
      <Button variant="outline">공유하기</Button>
      <Button>분석 요청</Button>
    </>
  }
/>
```

---

### 4.3 SalesTable

**파일**: `src/components/creator/sales-table.tsx`

#### TypeScript Props

```typescript
import type { SaleRecord } from '@/types';

/**
 * SalesTable 컴포넌트 Props
 */
export interface SalesTableProps {
  /**
   * 판매 이력 데이터
   */
  data: SaleRecord[];

  /**
   * 제품 정보 맵 (productId → Product)
   * @optional
   */
  products?: Record<string, { name: string; imageUrl: string }>;

  /**
   * 정렬 기본값
   * @default { key: "soldAt", direction: "desc" }
   */
  defaultSort?: {
    key: keyof SaleRecord;
    direction: 'asc' | 'desc';
  };

  /**
   * 페이지당 항목 수
   * @default 10
   */
  pageSize?: number;

  /**
   * 행 클릭 시 콜백
   * @optional
   */
  onRowClick?: (sale: SaleRecord) => void;

  /**
   * 로딩 상태
   * @default false
   */
  loading?: boolean;

  /**
   * 추가 CSS 클래스
   * @optional
   */
  className?: string;
}
```

#### 내부 상태

```typescript
const [sortKey, setSortKey] = useState<keyof SaleRecord>('soldAt');
const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
const [currentPage, setCurrentPage] = useState(1);
```

#### 이벤트 핸들러

```typescript
/**
 * 정렬 변경 핸들러
 */
const handleSort = (key: keyof SaleRecord) => {
  if (sortKey === key) {
    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  } else {
    setSortKey(key);
    setSortDirection('desc');
  }
};

/**
 * 페이지 변경 핸들러
 */
const handlePageChange = (page: number) => {
  setCurrentPage(page);
};

/**
 * 데이터 정렬
 */
const sortedData = useMemo(() => {
  return [...data].sort((a, b) => {
    const aValue = a[sortKey];
    const bValue = b[sortKey];
    const multiplier = sortDirection === 'asc' ? 1 : -1;

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return (aValue - bValue) * multiplier;
    }

    return String(aValue).localeCompare(String(bValue)) * multiplier;
  });
}, [data, sortKey, sortDirection]);

/**
 * 페이지네이션
 */
const paginatedData = useMemo(() => {
  const start = (currentPage - 1) * pageSize;
  return sortedData.slice(start, start + pageSize);
}, [sortedData, currentPage, pageSize]);
```

#### 접근성

- `<table>` 태그 사용, `aria-label="판매 이력 테이블"`
- 정렬 가능한 헤더: `role="button"`, `aria-sort="${sortDirection}"`
- 키보드: Tab으로 네비게이션, Enter로 정렬 변경
- 페이지네이션: `aria-label="페이지 네비게이션"`

#### 반응형

- **Desktop**: 전체 컬럼 표시
- **Tablet**: 일부 컬럼 숨김 (clickCount, commission)
- **Mobile**: 카드 형태로 전환, 스크롤 가능

#### 컬럼 정의

| 컬럼 | 정렬 | 포맷 | 설명 |
|------|------|------|------|
| soldAt | ✓ | 2025-08-15 | 판매 일시 |
| productName | ✓ | 글로우 세럼 | 제품명 |
| quantity | ✓ | 5개 | 수량 |
| revenue | ✓ | 22.5만원 | 매출 |
| commission | ✓ | 3.4만원 | 수수료 |
| clickCount | ✓ | 620회 | 클릭 수 |
| conversionRate | ✓ | 4.2% | 전환율 |

#### 테스트 시나리오

```typescript
describe('SalesTable', () => {
  it('should render table with data', () => {});
  it('should sort data on column header click', () => {});
  it('should toggle sort direction', () => {});
  it('should paginate data', () => {});
  it('should navigate pages', () => {});
  it('should format date (2025-08-15)', () => {});
  it('should format revenue (22.5만원)', () => {});
  it('should call onRowClick on row click', () => {});
  it('should show loading skeleton when loading', () => {});
  it('should show empty state when no data', () => {});
});
```

#### 사용 예시

```tsx
<SalesTable
  data={salesHistory}
  products={productMap}
  defaultSort={{ key: 'revenue', direction: 'desc' }}
  pageSize={10}
  onRowClick={(sale) => router.push(`/sales/${sale.id}`)}
  loading={false}
/>
```

---

### 4.4 InsightSummary

**파일**: `src/components/creator/insight-summary.tsx`

#### TypeScript Props

```typescript
import type { CreatorInsight } from '@/types';

/**
 * InsightSummary 컴포넌트 Props
 */
export interface InsightSummaryProps {
  /**
   * 크리에이터 인사이트 데이터
   */
  insight: CreatorInsight;

  /**
   * 추가 CSS 클래스
   * @optional
   */
  className?: string;
}
```

#### 내부 상태

없음 (props 기반 렌더링)

#### 접근성

- `<article>` 태그 사용, `aria-label="AI 분석 요약"`
- 인사이트 아이콘: `aria-hidden="true"` (장식용)
- 불릿 포인트: `<ul>` 리스트 사용

#### 반응형

- **Desktop**: 2컬럼 그리드
- **Tablet/Mobile**: 1컬럼

#### 디자인

```
┌────────────────────────────────────────┐
│  [아이콘] AI 분석 인사이트               │
│  ────────────────────────────────────  │
│  • Beauty 카테고리에서 88점으로 최고 성과│
│  • 3만~5만원 가격대에서 28건 판매      │
│  • 봄 시즌에 185만원 매출 (최고)       │
│  • 평균 전환율 3.8% (업계 평균 대비 +20%)│
│                                        │
│  분석 일시: 2026-02-04 10:00           │
└────────────────────────────────────────┘
```

- 배경: 그라데이션 (zvzo-primary → zvzo-secondary)
- 텍스트: 흰색
- 아이콘: Sparkles (lucide-react)

#### 인사이트 생성 로직

```typescript
/**
 * 인사이트 요약 생성
 */
const generateSummary = (insight: CreatorInsight): string[] => {
  const summary: string[] = [];

  // 최고 성과 카테고리
  const topCategory = insight.categoryScores.sort((a, b) => b.score - a.score)[0];
  if (topCategory) {
    summary.push(
      `${topCategory.category} 카테고리에서 ${topCategory.score}점으로 최고 성과`
    );
  }

  // 최다 판매 가격대
  const topBucket = insight.priceBuckets.sort((a, b) => b.count - a.count)[0];
  if (topBucket) {
    summary.push(
      `${formatPriceRange(topBucket.range)} 가격대에서 ${topBucket.count}건 판매`
    );
  }

  // 최고 시즌
  const topSeason = insight.seasonalData.sort((a, b) => b.revenue - a.revenue)[0];
  if (topSeason) {
    summary.push(
      `${formatSeason(topSeason.season)} 시즌에 ${formatRevenue(
        topSeason.revenue
      )} 매출 (최고)`
    );
  }

  // 평균 전환율 비교
  const industryAvg = 3.0; // 업계 평균 (하드코딩)
  const diff = ((insight.averageConversionRate - industryAvg) / industryAvg) * 100;
  if (Math.abs(diff) > 10) {
    summary.push(
      `평균 전환율 ${insight.averageConversionRate.toFixed(1)}% (업계 평균 대비 ${
        diff > 0 ? '+' : ''
      }${diff.toFixed(0)}%)`
    );
  }

  return summary;
};
```

#### 테스트 시나리오

```typescript
describe('InsightSummary', () => {
  it('should render AI insight summary', () => {});
  it('should generate bullet points from insight data', () => {});
  it('should display analyzed timestamp', () => {});
  it('should apply gradient background', () => {});
});
```

#### 사용 예시

```tsx
<InsightSummary
  insight={{
    creatorId: 'creator-001',
    categoryScores: [
      /* ... */
    ],
    priceBuckets: [
      /* ... */
    ],
    seasonalData: [
      /* ... */
    ],
    topProducts: [
      /* ... */
    ],
    averageConversionRate: 3.8,
    totalRevenue: 5650000,
    analyzedAt: '2026-02-04T10:00:00Z',
  }}
/>
```

---

### 4.5 AnalyzeButton

**파일**: `src/components/creator/analyze-button.tsx`

#### TypeScript Props

```typescript
import type { Creator } from '@/types';

/**
 * AnalyzeButton 컴포넌트 Props
 */
export interface AnalyzeButtonProps {
  /**
   * 분석 대상 크리에이터 ID
   */
  creatorId: string;

  /**
   * 분석 완료 시 콜백
   * @param insight - 생성된 인사이트 데이터
   */
  onComplete: (insight: CreatorInsight) => void;

  /**
   * 분석 실패 시 콜백
   * @param error - 에러 메시지
   * @optional
   */
  onError?: (error: string) => void;

  /**
   * 버튼 텍스트
   * @default "AI 분석 시작"
   */
  label?: string;

  /**
   * 버튼 변형
   * @default "default"
   */
  variant?: 'default' | 'outline' | 'ghost';

  /**
   * 추가 CSS 클래스
   * @optional
   */
  className?: string;
}
```

#### 내부 상태 (State Machine)

```typescript
type AnalyzeState = 'idle' | 'loading' | 'success' | 'error';

const [state, setState] = useState<AnalyzeState>('idle');
const [progress, setProgress] = useState(0);
const [errorMessage, setErrorMessage] = useState<string | null>(null);
```

#### 이벤트 핸들러

```typescript
/**
 * 분석 시작 핸들러
 */
const handleAnalyze = async () => {
  setState('loading');
  setProgress(0);
  setErrorMessage(null);

  try {
    // 진행 상황 시뮬레이션
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 10, 90));
    }, 500);

    // API 호출
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creatorId }),
    });

    clearInterval(progressInterval);

    if (!response.ok) {
      throw new Error(`분석 실패: ${response.statusText}`);
    }

    const { data: insight } = await response.json();

    setProgress(100);
    setState('success');
    onComplete(insight);

    // 2초 후 idle 상태로 복귀
    setTimeout(() => {
      setState('idle');
      setProgress(0);
    }, 2000);
  } catch (error) {
    setState('error');
    const message = error instanceof Error ? error.message : '알 수 없는 오류';
    setErrorMessage(message);
    onError?.(message);

    // 3초 후 idle 상태로 복귀
    setTimeout(() => {
      setState('idle');
      setErrorMessage(null);
    }, 3000);
  }
};
```

#### 접근성

- 버튼: `aria-label="AI 분석 시작"`, `aria-busy={state === 'loading'}`
- 로딩 상태: `aria-live="polite"`, `aria-atomic="true"`
- 진행률: `role="progressbar"`, `aria-valuenow={progress}`, `aria-valuemin="0"`, `aria-valuemax="100"`
- 에러 메시지: `role="alert"`

#### 상태별 UI

```typescript
const renderButtonContent = () => {
  switch (state) {
    case 'idle':
      return (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          {label}
        </>
      );

    case 'loading':
      return (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          분석 중... {progress}%
        </>
      );

    case 'success':
      return (
        <>
          <CheckCircle className="mr-2 h-4 w-4" />
          분석 완료!
        </>
      );

    case 'error':
      return (
        <>
          <XCircle className="mr-2 h-4 w-4" />
          분석 실패
        </>
      );
  }
};
```

#### 테스트 시나리오

```typescript
describe('AnalyzeButton', () => {
  it('should render button in idle state', () => {});
  it('should call API on button click', () => {});
  it('should show loading state with progress', () => {});
  it('should call onComplete with insight data on success', () => {});
  it('should show success state briefly', () => {});
  it('should show error state on failure', () => {});
  it('should call onError with error message', () => {});
  it('should reset to idle after success/error', () => {});
  it('should be disabled during loading', () => {});
});
```

#### 사용 예시

```tsx
<AnalyzeButton
  creatorId="creator-001"
  onComplete={(insight) => {
    console.log('분석 완료:', insight);
    // 인사이트 데이터를 상태에 저장하거나 페이지 새로고침
  }}
  onError={(error) => {
    console.error('분석 실패:', error);
    toast.error(error);
  }}
  label="AI 분석 시작"
  variant="default"
/>
```

---

## 5. 매칭 컴포넌트 (match/)

### 5.1 MatchCard

**파일**: `src/components/match/match-card.tsx`

#### TypeScript Props

```typescript
import type { ProductMatch, Product } from '@/types';

/**
 * MatchCard 컴포넌트 Props
 */
export interface MatchCardProps {
  /**
   * 매칭 데이터
   */
  match: ProductMatch;

  /**
   * 제품 정보
   */
  product: Product;

  /**
   * 카드 확장 가능 여부
   * @default true
   */
  expandable?: boolean;

  /**
   * 카드 클릭 시 콜백
   * @optional
   */
  onClick?: (match: ProductMatch) => void;

  /**
   * 추가 CSS 클래스
   * @optional
   */
  className?: string;
}
```

#### 내부 상태

```typescript
const [expanded, setExpanded] = useState(false);
```

#### 이벤트 핸들러

```typescript
/**
 * 확장/축소 토글
 */
const handleToggle = () => {
  if (expandable) {
    setExpanded((prev) => !prev);
  }
};

/**
 * 카드 클릭 핸들러
 */
const handleClick = (e: React.MouseEvent) => {
  // 토글 버튼 클릭 시 카드 클릭 이벤트 무시
  if ((e.target as HTMLElement).closest('[data-toggle]')) {
    return;
  }
  onClick?.(match);
};
```

#### 접근성

- `role="article"`, `aria-label="${product.name} 매칭 카드, 점수 ${match.matchScore}점"`
- 확장 버튼: `aria-expanded={expanded}`, `aria-label="상세 정보 ${expanded ? '숨기기' : '보기'}"`
- 키보드: Tab으로 네비게이션, Enter로 확장/축소

#### 반응형

- **Desktop**: 카드 너비 400px
- **Tablet/Mobile**: 전체 너비

#### 레이아웃

```
┌────────────────────────────────────────┐
│  [제품 이미지]  글로우 세럼              │
│                뷰티 • 4.5만원           │
│                                        │
│  매칭 점수: 87점 [게이지]               │
│                                        │
│  [추천 이유 텍스트 (3줄 요약)]          │
│                                        │
│  예상 매출: 175만원                     │
│                                    [▼] │
└────────────────────────────────────────┘

[확장 시]
┌────────────────────────────────────────┐
│  [제품 이미지]  글로우 세럼              │
│                뷰티 • 4.5만원           │
│                                        │
│  매칭 점수: 87점 [게이지]               │
│                                        │
│  [추천 이유 전체 텍스트]                │
│                                        │
│  예상 매출: 175만원                     │
│  신뢰도: 높음 [Badge]                  │
│                                        │
│  [매칭 점수 상세 분해도 차트]           │
│                                        │
│  [예상 매출 범위 차트]                  │
│                                    [▲] │
└────────────────────────────────────────┘
```

#### 테스트 시나리오

```typescript
describe('MatchCard', () => {
  it('should render match info', () => {});
  it('should display product image and details', () => {});
  it('should render match score gauge', () => {});
  it('should show truncated reason text', () => {});
  it('should expand on toggle button click', () => {});
  it('should show detailed charts when expanded', () => {});
  it('should call onClick on card click', () => {});
  it('should format expected revenue', () => {});
});
```

#### 사용 예시

```tsx
<MatchCard
  match={{
    productId: 'product-023',
    creatorId: 'creator-002',
    matchScore: 92,
    reason: '박준호님은 Tech 카테고리에서 평균 2.5%의 전환율을 기록 중이며...',
    expectedRevenue: 1750000,
    confidenceLevel: 'High',
  }}
  product={{
    id: 'product-023',
    name: '블루투스 이어폰',
    category: 'Tech',
    price: 125000,
    brandName: '사운드프로',
    imageUrl: '/images/bt-earphone.jpg',
    description: '노이즈 캔슬링 지원 무선 이어폰',
  }}
  expandable={true}
  onClick={(match) => router.push(`/matches/${match.productId}`)}
/>
```

---

### 5.2 MatchScoreBreakdown

**파일**: `src/components/match/match-score-breakdown.tsx`

#### TypeScript Props

```typescript
/**
 * 매칭 점수 세부 항목
 */
export interface ScoreBreakdownItem {
  /**
   * 항목명
   */
  label: string;

  /**
   * 점수 (0~100)
   */
  score: number;

  /**
   * 가중치 (0~1)
   */
  weight: number;

  /**
   * 설명
   * @optional
   */
  description?: string;
}

/**
 * MatchScoreBreakdown 컴포넌트 Props
 */
export interface MatchScoreBreakdownProps {
  /**
   * 세부 항목 목록
   * @remarks
   * 일반적으로 4개 항목:
   * - 카테고리 적합도
   * - 가격대 적합도
   * - 시즌 트렌드
   * - 타겟 오디언스 일치도
   */
  items: ScoreBreakdownItem[];

  /**
   * 차트 높이 (px)
   * @default 300
   */
  height?: number;

  /**
   * 추가 CSS 클래스
   * @optional
   */
  className?: string;
}
```

#### 내부 상태

```typescript
const [hoveredItem, setHoveredItem] = useState<string | null>(null);
```

#### 이벤트 핸들러

```typescript
/**
 * 항목 호버 핸들러
 */
const handleMouseEnter = (label: string) => {
  setHoveredItem(label);
};

const handleMouseLeave = () => {
  setHoveredItem(null);
};
```

#### 접근성

- `role="img"`, `aria-label="매칭 점수 상세 분석"`
- 각 바: `aria-label="${item.label} 점수 ${item.score}점, 가중치 ${item.weight * 100}%"`
- Tooltip: `aria-live="polite"`

#### 반응형

- **Desktop**: 4개 바 세로 배열
- **Tablet/Mobile**: 바 높이 축소

#### 차트 구조

```
카테고리 적합도  [████████████████░░] 88점 (40%)
가격대 적합도    [██████████████░░░░] 75점 (30%)
시즌 트렌드      [██████████████████] 95점 (20%)
타겟 오디언스    [████████████░░░░░░] 65점 (10%)
```

- 바 색상: 점수에 따라 그라데이션
- 가중치: 괄호 안에 백분율로 표시
- 호버 시: 툴팁에 설명 표시

#### 가중치 계산

```typescript
/**
 * 전체 매칭 점수 계산
 */
const calculateTotalScore = (items: ScoreBreakdownItem[]): number => {
  return items.reduce((sum, item) => sum + item.score * item.weight, 0);
};
```

#### 테스트 시나리오

```typescript
describe('MatchScoreBreakdown', () => {
  it('should render 4 horizontal bars', () => {});
  it('should display score and weight for each item', () => {});
  it('should show tooltip on hover', () => {});
  it('should calculate total score correctly', () => {});
  it('should color bars based on score', () => {});
});
```

#### 사용 예시

```tsx
<MatchScoreBreakdown
  items={[
    {
      label: '카테고리 적합도',
      score: 88,
      weight: 0.4,
      description: 'Beauty 카테고리에서 높은 성과',
    },
    {
      label: '가격대 적합도',
      score: 75,
      weight: 0.3,
      description: '3만~5만원 가격대 선호',
    },
    {
      label: '시즌 트렌드',
      score: 95,
      weight: 0.2,
      description: '봄 시즌 뷰티 제품 판매 증가',
    },
    {
      label: '타겟 오디언스',
      score: 65,
      weight: 0.1,
      description: '팔로워 연령대 일치',
    },
  ]}
  height={300}
/>
```

---

### 5.3 RevenuePredictionBar

**파일**: `src/components/match/revenue-prediction-bar.tsx`

#### TypeScript Props

```typescript
/**
 * RevenuePredictionBar 컴포넌트 Props
 */
export interface RevenuePredictionBarProps {
  /**
   * 최소 예상 매출 (KRW)
   */
  min: number;

  /**
   * 예상 매출 (KRW)
   */
  expected: number;

  /**
   * 최대 예상 매출 (KRW)
   */
  max: number;

  /**
   * 바 높이 (px)
   * @default 40
   */
  height?: number;

  /**
   * 레이블 표시 위치
   * @default "bottom"
   */
  labelPosition?: 'top' | 'bottom' | 'none';

  /**
   * 추가 CSS 클래스
   * @optional
   */
  className?: string;
}
```

#### 내부 상태

```typescript
const [hovered, setHovered] = useState(false);
```

#### 접근성

- `role="img"`, `aria-label="예상 매출 범위 최소 ${formatRevenue(min)}, 예상 ${formatRevenue(expected)}, 최대 ${formatRevenue(max)}"`
- 레이블: 명확한 금액 표시

#### 반응형

- **Desktop**: 전체 너비
- **Tablet/Mobile**: 레이블 하단 배치

#### 차트 구조

```
[====== min ======|====== expected ======|====== max ======]
     105만원              135만원                165만원
     ▲                    ▲                      ▲
    (worst)            (likely)                (best)
```

- min~expected: 연한 빨간색 (#fecaca)
- expected~max: 연한 초록색 (#bbf7d0)
- expected 위치: 굵은 세로선 표시

#### 포맷팅

```typescript
/**
 * 금액 포맷 (만원 단위)
 */
const formatRevenue = (amount: number): string => {
  return `${(amount / 10000).toFixed(0)}만원`;
};
```

#### 테스트 시나리오

```typescript
describe('RevenuePredictionBar', () => {
  it('should render range bar with min/expected/max', () => {});
  it('should color code ranges appropriately', () => {});
  it('should show expected value marker', () => {});
  it('should format amounts in Korean (만원)', () => {});
  it('should display labels at specified position', () => {});
});
```

#### 사용 예시

```tsx
<RevenuePredictionBar
  min={1050000}
  expected={1350000}
  max={1650000}
  height={40}
  labelPosition="bottom"
/>
```

---

### 5.4 CompareModal

**파일**: `src/components/match/compare-modal.tsx`

#### TypeScript Props

```typescript
import type { ProductMatch, Product } from '@/types';

/**
 * CompareModal 컴포넌트 Props
 */
export interface CompareModalProps {
  /**
   * 모달 열림 상태
   */
  open: boolean;

  /**
   * 모달 닫기 핸들러
   */
  onClose: () => void;

  /**
   * 비교할 매칭 목록 (최대 3개)
   */
  matches: Array<{
    match: ProductMatch;
    product: Product;
  }>;

  /**
   * 추가 CSS 클래스
   * @optional
   */
  className?: string;
}
```

#### 내부 상태

```typescript
const [compareKey, setCompareKey] = useState<'score' | 'revenue'>('score');
```

#### 이벤트 핸들러

```typescript
/**
 * 비교 키 변경 핸들러
 */
const handleKeyChange = (key: 'score' | 'revenue') => {
  setCompareKey(key);
};

/**
 * ESC 키로 모달 닫기
 */
useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && open) {
      onClose();
    }
  };
  window.addEventListener('keydown', handleEscape);
  return () => window.removeEventListener('keydown', handleEscape);
}, [open, onClose]);
```

#### 접근성

- Dialog 컴포넌트 사용 (shadcn/ui)
- `aria-label="제품 비교 모달"`
- 포커스 트랩: 모달 열릴 때 첫 번째 요소로 포커스 이동
- ESC 키로 닫기
- 배경 클릭으로 닫기

#### 반응형

- **Desktop**: 최대 너비 1200px, 3개 컬럼
- **Tablet**: 최대 너비 800px, 2개 컬럼
- **Mobile**: 전체 너비, 1개 컬럼 스크롤

#### 레이아웃

```
┌─────────────────────────────────────────────────────────────┐
│  제품 비교                                     [비교 기준: ▼] │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  [제품 1]       [제품 2]       [제품 3]                       │
│  이미지         이미지         이미지                         │
│  이름           이름           이름                           │
│  카테고리       카테고리       카테고리                       │
│  가격           가격           가격                           │
│                                                               │
│  [매칭 점수 바 차트 비교]                                     │
│  87점           92점           75점                           │
│                                                               │
│  [예상 매출 바 차트 비교]                                     │
│  175만원        185만원        150만원                        │
│                                                               │
│  신뢰도         신뢰도         신뢰도                         │
│  높음           높음           중간                           │
│                                                               │
│                                             [닫기]            │
└─────────────────────────────────────────────────────────────┘
```

#### 비교 차트

```typescript
/**
 * 매칭 점수 비교 차트
 */
const renderScoreChart = () => {
  const maxScore = Math.max(...matches.map((m) => m.match.matchScore));

  return (
    <div className="space-y-2">
      {matches.map(({ match, product }) => (
        <div key={match.productId} className="flex items-center gap-2">
          <span className="w-24 truncate text-sm">{product.name}</span>
          <div className="flex-1 h-8 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-zvzo-primary"
              style={{ width: `${(match.matchScore / maxScore) * 100}%` }}
            />
          </div>
          <span className="w-12 text-right text-sm font-semibold">
            {match.matchScore}점
          </span>
        </div>
      ))}
    </div>
  );
};
```

#### 테스트 시나리오

```typescript
describe('CompareModal', () => {
  it('should render modal when open', () => {});
  it('should display up to 3 products side by side', () => {});
  it('should show comparison chart based on selected key', () => {});
  it('should toggle between score and revenue comparison', () => {});
  it('should close on ESC key press', () => {});
  it('should close on background click', () => {});
  it('should close on close button click', () => {});
  it('should trap focus within modal', () => {});
});
```

#### 사용 예시

```tsx
const [compareOpen, setCompareOpen] = useState(false);
const [selectedMatches, setSelectedMatches] = useState<CompareModalProps['matches']>(
  []
);

// 제품 선택 (최대 3개)
const handleSelectMatch = (match: ProductMatch, product: Product) => {
  if (selectedMatches.length >= 3) {
    toast.error('최대 3개까지 비교할 수 있습니다');
    return;
  }
  setSelectedMatches([...selectedMatches, { match, product }]);
};

// 비교 모달 열기
const handleCompare = () => {
  if (selectedMatches.length < 2) {
    toast.error('최소 2개 제품을 선택하세요');
    return;
  }
  setCompareOpen(true);
};

<CompareModal
  open={compareOpen}
  onClose={() => setCompareOpen(false)}
  matches={selectedMatches}
/>;
```

---

### 5.5 ReasoningText

**파일**: `src/components/match/reasoning-text.tsx`

#### TypeScript Props

```typescript
/**
 * ReasoningText 컴포넌트 Props
 */
export interface ReasoningTextProps {
  /**
   * AI 추천 이유 텍스트
   */
  text: string;

  /**
   * 표시할 최대 줄 수 (truncate)
   * @default undefined (전체 표시)
   */
  maxLines?: number;

  /**
   * "더 보기" 버튼 표시 여부
   * @default true
   */
  expandable?: boolean;

  /**
   * 아이콘 표시 여부
   * @default true
   */
  showIcon?: boolean;

  /**
   * 추가 CSS 클래스
   * @optional
   */
  className?: string;
}
```

#### 내부 상태

```typescript
const [expanded, setExpanded] = useState(false);
const [isTruncated, setIsTruncated] = useState(false);
const textRef = useRef<HTMLParagraphElement>(null);
```

#### 이벤트 핸들러

```typescript
/**
 * 텍스트 말줄임 확인
 */
useEffect(() => {
  if (!textRef.current || !maxLines) return;

  const lineHeight = parseInt(
    getComputedStyle(textRef.current).lineHeight
  );
  const maxHeight = lineHeight * maxLines;

  setIsTruncated(textRef.current.scrollHeight > maxHeight);
}, [maxLines, text]);

/**
 * 확장/축소 토글
 */
const handleToggle = () => {
  setExpanded((prev) => !prev);
};
```

#### 접근성

- `<blockquote>` 태그 사용
- 아이콘: `aria-hidden="true"` (장식용)
- 확장 버튼: `aria-expanded={expanded}`, `aria-label="추천 이유 전체 보기"`

#### 반응형

- **Desktop**: 폰트 크기 16px, 줄 간격 1.6
- **Tablet/Mobile**: 폰트 크기 14px

#### 디자인

```
┌────────────────────────────────────────┐
│  [아이콘] 박준호님은 Tech 카테고리에서   │
│  평균 2.5%의 전환율을 기록 중이며,      │
│  80,000~150,000원 가격대 제품에서...   │
│                          [더 보기 ▼]   │
└────────────────────────────────────────┘
```

- 배경: 연한 회색 (#f9fafb)
- 테두리: 좌측 강조선 (zvzo-primary)
- 아이콘: Lightbulb (lucide-react)
- 폰트: 약간 기울임꼴 (italic)

#### 테스트 시나리오

```typescript
describe('ReasoningText', () => {
  it('should render text with icon', () => {});
  it('should truncate text to max lines', () => {});
  it('should show "더 보기" button when truncated', () => {});
  it('should expand on button click', () => {});
  it('should hide icon when showIcon is false', () => {});
  it('should not truncate when maxLines is undefined', () => {});
});
```

#### 사용 예시

```tsx
<ReasoningText
  text="박준호님은 Tech 카테고리에서 평균 2.5%의 전환율을 기록 중이며, 80,000~150,000원 가격대 제품에서 강세를 보입니다. 이 블루투스 이어폰은 해당 가격대에 속하며, 겨울 시즌 테크 제품 판매가 30% 증가하는 패턴과 일치합니다. 팔로워 58만명의 높은 참여율(4.1%)을 고려할 때 월 평균 35개 이상의 판매가 예상됩니다."
  maxLines={3}
  expandable={true}
  showIcon={true}
/>
```

---

## 6. 공통 컴포넌트 (common/)

### 6.1 StatCard

**파일**: `src/components/common/stat-card.tsx`

#### TypeScript Props

```typescript
/**
 * StatCard 컴포넌트 Props
 */
export interface StatCardProps {
  /**
   * 통계 레이블
   */
  label: string;

  /**
   * 통계 값 (숫자 또는 문자열)
   */
  value: string | number;

  /**
   * 아이콘 (lucide-react)
   * @optional
   */
  icon?: React.ComponentType<{ className?: string }>;

  /**
   * 증감률 (%)
   * @optional
   */
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };

  /**
   * 값 포맷터
   * @optional
   */
  formatter?: (value: string | number) => string;

  /**
   * 추가 CSS 클래스
   * @optional
   */
  className?: string;
}
```

#### 내부 상태

없음 (props 기반 렌더링)

#### 접근성

- `role="article"`, `aria-label="${label} ${formattedValue}${trend ? `, ${trend.direction === 'up' ? '증가' : '감소'} ${trend.value}%` : ''}"`
- 아이콘: `aria-hidden="true"`

#### 반응형

- **Desktop**: 카드 너비 자동, 4개 그리드
- **Tablet**: 2개 그리드
- **Mobile**: 1개 컬럼

#### 컬러 코딩

```typescript
/**
 * 증감률 색상
 */
const getTrendColor = (direction: 'up' | 'down'): string => {
  return direction === 'up' ? 'text-green-600' : 'text-red-600';
};

/**
 * 증감률 아이콘
 */
const getTrendIcon = (direction: 'up' | 'down') => {
  return direction === 'up' ? <TrendingUp /> : <TrendingDown />;
};
```

#### 테스트 시나리오

```typescript
describe('StatCard', () => {
  it('should render label and value', () => {});
  it('should render icon when provided', () => {});
  it('should format value using formatter', () => {});
  it('should show trend with correct color', () => {});
  it('should show up/down icon based on trend', () => {});
});
```

#### 사용 예시

```tsx
<StatCard
  label="총 매출"
  value={5650000}
  icon={DollarSign}
  trend={{ value: 12.5, direction: 'up' }}
  formatter={(v) => `${(Number(v) / 10000).toFixed(0)}만원`}
/>

<StatCard
  label="평균 전환율"
  value={3.8}
  icon={Percent}
  trend={{ value: 0.3, direction: 'down' }}
  formatter={(v) => `${v}%`}
/>

<StatCard label="판매 건수" value={77} icon={ShoppingCart} />
```

---

### 6.2 SearchBar

**파일**: `src/components/common/search-bar.tsx`

#### TypeScript Props

```typescript
/**
 * SearchBar 컴포넌트 Props
 */
export interface SearchBarProps {
  /**
   * 입력값
   */
  value: string;

  /**
   * 입력값 변경 핸들러
   */
  onChange: (value: string) => void;

  /**
   * 검색 실행 핸들러 (Enter 키 또는 검색 버튼)
   * @optional
   */
  onSearch?: (value: string) => void;

  /**
   * Placeholder 텍스트
   * @default "검색..."
   */
  placeholder?: string;

  /**
   * Debounce 딜레이 (ms)
   * @default 300
   */
  debounce?: number;

  /**
   * 클리어 버튼 표시 여부
   * @default true
   */
  showClear?: boolean;

  /**
   * 추가 CSS 클래스
   * @optional
   */
  className?: string;
}
```

#### 내부 상태

```typescript
const [localValue, setLocalValue] = useState(value);
const debouncedOnChange = useDebounce(onChange, debounce);
```

#### 이벤트 핸들러

```typescript
/**
 * 입력 변경 핸들러
 */
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const newValue = e.target.value;
  setLocalValue(newValue);
  debouncedOnChange(newValue);
};

/**
 * 클리어 핸들러
 */
const handleClear = () => {
  setLocalValue('');
  onChange('');
};

/**
 * Enter 키 핸들러
 */
const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === 'Enter') {
    onSearch?.(localValue);
  }
};
```

#### Debounce Hook

```typescript
/**
 * useDebounce Hook
 */
function useDebounce<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    ((...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T,
    [callback, delay]
  );
}
```

#### 접근성

- `<input>` 태그: `type="search"`, `aria-label="검색"`, `role="searchbox"`
- 클리어 버튼: `aria-label="검색어 지우기"`
- 검색 아이콘: `aria-hidden="true"` (장식용)

#### 반응형

- **Desktop**: 최대 너비 600px
- **Tablet/Mobile**: 전체 너비

#### 테스트 시나리오

```typescript
describe('SearchBar', () => {
  it('should render input with placeholder', () => {});
  it('should update local value on input', () => {});
  it('should debounce onChange calls', () => {});
  it('should call onSearch on Enter key', () => {});
  it('should show clear button when value is not empty', () => {});
  it('should clear value on clear button click', () => {});
  it('should sync with external value prop', () => {});
});
```

#### 사용 예시

```tsx
const [searchQuery, setSearchQuery] = useState('');

<SearchBar
  value={searchQuery}
  onChange={(value) => setSearchQuery(value)}
  onSearch={(value) => {
    console.log('검색 실행:', value);
    // API 호출 등
  }}
  placeholder="크리에이터 이름 또는 카테고리 검색..."
  debounce={300}
  showClear={true}
/>;
```

---

### 6.3 FilterDropdown

**파일**: `src/components/common/filter-dropdown.tsx`

#### TypeScript Props

```typescript
/**
 * 필터 옵션
 */
export interface FilterOption {
  /**
   * 옵션 값
   */
  value: string;

  /**
   * 옵션 레이블
   */
  label: string;

  /**
   * 옵션 아이콘 (선택)
   * @optional
   */
  icon?: React.ComponentType<{ className?: string }>;
}

/**
 * FilterDropdown 컴포넌트 Props
 */
export interface FilterDropdownProps {
  /**
   * 필터 레이블
   */
  label: string;

  /**
   * 필터 옵션 목록
   */
  options: FilterOption[];

  /**
   * 선택된 값 목록
   */
  value: string[];

  /**
   * 값 변경 핸들러
   */
  onChange: (value: string[]) => void;

  /**
   * 다중 선택 가능 여부
   * @default true
   */
  multiple?: boolean;

  /**
   * 초기화 버튼 표시 여부
   * @default true
   */
  showReset?: boolean;

  /**
   * 추가 CSS 클래스
   * @optional
   */
  className?: string;
}
```

#### 내부 상태

```typescript
const [open, setOpen] = useState(false);
```

#### 이벤트 핸들러

```typescript
/**
 * 옵션 선택 핸들러
 */
const handleSelect = (optionValue: string) => {
  if (multiple) {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  } else {
    onChange([optionValue]);
    setOpen(false);
  }
};

/**
 * 초기화 핸들러
 */
const handleReset = () => {
  onChange([]);
  setOpen(false);
};

/**
 * 외부 클릭 감지
 */
useEffect(() => {
  const handleClickOutside = (e: MouseEvent) => {
    if (
      open &&
      dropdownRef.current &&
      !dropdownRef.current.contains(e.target as Node)
    ) {
      setOpen(false);
    }
  };
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, [open]);
```

#### 접근성

- 버튼: `aria-haspopup="listbox"`, `aria-expanded={open}`, `aria-label="${label} 필터"`
- 옵션 리스트: `role="listbox"`, `aria-multiselectable={multiple}`
- 옵션: `role="option"`, `aria-selected={selected}`
- 키보드: Arrow keys로 네비게이션, Enter/Space로 선택

#### 반응형

- **Desktop**: 드롭다운 너비 300px
- **Tablet/Mobile**: 전체 너비, 하단 시트 스타일

#### Badge Count

```typescript
/**
 * 선택된 개수 Badge
 */
{
  value.length > 0 && (
    <Badge variant="secondary" className="ml-2">
      {value.length}
    </Badge>
  );
}
```

#### 테스트 시나리오

```typescript
describe('FilterDropdown', () => {
  it('should render button with label', () => {});
  it('should open dropdown on button click', () => {});
  it('should close dropdown on outside click', () => {});
  it('should toggle option selection (multiple)', () => {});
  it('should close after selection (single)', () => {});
  it('should show badge with selected count', () => {});
  it('should reset all selections on reset button click', () => {});
  it('should navigate options with arrow keys', () => {});
});
```

#### 사용 예시

```tsx
const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

<FilterDropdown
  label="카테고리"
  options={[
    { value: 'Beauty', label: '뷰티' },
    { value: 'Fashion', label: '패션' },
    { value: 'Tech', label: '테크' },
    { value: 'Food', label: '식품' },
  ]}
  value={selectedCategories}
  onChange={setSelectedCategories}
  multiple={true}
  showReset={true}
/>;
```

---

### 6.4 PlatformBadge

**파일**: `src/components/common/platform-badge.tsx`

#### TypeScript Props

```typescript
import type { Platform } from '@/types';

/**
 * PlatformBadge 컴포넌트 Props
 */
export interface PlatformBadgeProps {
  /**
   * 플랫폼
   */
  platform: Platform;

  /**
   * 아이콘 표시 여부
   * @default true
   */
  showIcon?: boolean;

  /**
   * 크기
   * @default "md"
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * 추가 CSS 클래스
   * @optional
   */
  className?: string;
}
```

#### 내부 상태

없음 (props 기반 렌더링)

#### 플랫폼 스타일 맵

```typescript
/**
 * 플랫폼별 스타일 정의
 */
const platformStyles: Record<
  Platform,
  {
    bg: string;
    text: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  Instagram: {
    bg: 'bg-pink-100',
    text: 'text-pink-700',
    icon: Instagram, // lucide-react
  },
  YouTube: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    icon: Youtube,
  },
  TikTok: {
    bg: 'bg-gray-900',
    text: 'text-white',
    icon: Music, // TikTok 대용
  },
  Blog: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    icon: FileText,
  },
};
```

#### 크기

```typescript
const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-3 py-1',
  lg: 'text-base px-4 py-1.5',
};

const iconSizes = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};
```

#### 접근성

- `<span>` 태그, `role="status"`, `aria-label="${platform} 플랫폼"`
- 아이콘: `aria-hidden="true"`

#### 테스트 시나리오

```typescript
describe('PlatformBadge', () => {
  it('should render badge with platform name', () => {});
  it('should apply correct color for each platform', () => {});
  it('should render icon when showIcon is true', () => {});
  it('should render in different sizes', () => {});
  it('should have accessible label', () => {});
});
```

#### 사용 예시

```tsx
<PlatformBadge platform="Instagram" showIcon={true} size="md" />
<PlatformBadge platform="YouTube" showIcon={true} size="sm" />
<PlatformBadge platform="TikTok" showIcon={false} size="lg" />
```

---

### 6.5 ConfidenceBadge

**파일**: `src/components/common/confidence-badge.tsx`

#### TypeScript Props

```typescript
/**
 * ConfidenceBadge 컴포넌트 Props
 */
export interface ConfidenceBadgeProps {
  /**
   * 신뢰도 수준
   */
  level: 'High' | 'Medium' | 'Low';

  /**
   * 크기
   * @default "md"
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * 추가 CSS 클래스
   * @optional
   */
  className?: string;
}
```

#### 내부 상태

없음 (props 기반 렌더링)

#### 신뢰도 스타일 맵

```typescript
/**
 * 신뢰도별 스타일 정의
 */
const confidenceStyles: Record<
  'High' | 'Medium' | 'Low',
  {
    bg: string;
    text: string;
    label: string;
  }
> = {
  High: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    label: '높음',
  },
  Medium: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-700',
    label: '중간',
  },
  Low: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    label: '낮음',
  },
};
```

#### 접근성

- `<span>` 태그, `role="status"`, `aria-label="신뢰도 ${label}"`

#### 테스트 시나리오

```typescript
describe('ConfidenceBadge', () => {
  it('should render badge with Korean label', () => {});
  it('should apply correct color for each level', () => {});
  it('should render in different sizes', () => {});
  it('should have accessible label', () => {});
});
```

#### 사용 예시

```tsx
<ConfidenceBadge level="High" size="md" />
<ConfidenceBadge level="Medium" size="sm" />
<ConfidenceBadge level="Low" size="lg" />
```

---

### 6.6 EmptyState

**파일**: `src/components/common/empty-state.tsx`

#### TypeScript Props

```typescript
/**
 * EmptyState 컴포넌트 Props
 */
export interface EmptyStateProps {
  /**
   * 제목
   */
  title: string;

  /**
   * 설명
   * @optional
   */
  description?: string;

  /**
   * 일러스트 아이콘 (lucide-react)
   * @optional
   * @default Inbox
   */
  icon?: React.ComponentType<{ className?: string }>;

  /**
   * CTA 버튼
   * @optional
   */
  action?: {
    label: string;
    onClick: () => void;
  };

  /**
   * 추가 CSS 클래스
   * @optional
   */
  className?: string;
}
```

#### 내부 상태

없음 (props 기반 렌더링)

#### 접근성

- `<div>` 컨테이너: `role="status"`, `aria-label="데이터 없음"`
- 아이콘: `aria-hidden="true"`
- CTA 버튼: 명확한 레이블

#### 반응형

- **All Devices**: 중앙 정렬, 수직 레이아웃

#### 디자인

```
┌────────────────────────────────────────┐
│                                        │
│           [아이콘 (크게)]              │
│                                        │
│           데이터 없음                  │
│                                        │
│     아직 분석된 데이터가 없습니다.     │
│     지금 바로 분석을 시작해보세요!     │
│                                        │
│           [분석 시작하기]              │
│                                        │
└────────────────────────────────────────┘
```

#### 테스트 시나리오

```typescript
describe('EmptyState', () => {
  it('should render title and description', () => {});
  it('should render icon', () => {});
  it('should render CTA button when provided', () => {});
  it('should call action onClick', () => {});
  it('should center content', () => {});
});
```

#### 사용 예시

```tsx
<EmptyState
  title="데이터 없음"
  description="아직 분석된 데이터가 없습니다. 지금 바로 분석을 시작해보세요!"
  icon={Inbox}
  action={{
    label: '분석 시작하기',
    onClick: () => router.push('/analyze'),
  }}
/>
```

---

### 6.7 ErrorState

**파일**: `src/components/common/error-state.tsx`

#### TypeScript Props

```typescript
/**
 * ErrorState 컴포넌트 Props
 */
export interface ErrorStateProps {
  /**
   * 에러 제목
   * @default "오류가 발생했습니다"
   */
  title?: string;

  /**
   * 에러 메시지
   * @optional
   */
  message?: string;

  /**
   * 재시도 핸들러
   * @optional
   */
  onRetry?: () => void;

  /**
   * 재시도 버튼 레이블
   * @default "다시 시도"
   */
  retryLabel?: string;

  /**
   * 추가 CSS 클래스
   * @optional
   */
  className?: string;
}
```

#### 내부 상태

```typescript
const [retrying, setRetrying] = useState(false);
```

#### 이벤트 핸들러

```typescript
/**
 * 재시도 핸들러
 */
const handleRetry = async () => {
  if (!onRetry) return;

  setRetrying(true);
  try {
    await onRetry();
  } finally {
    setTimeout(() => setRetrying(false), 1000);
  }
};
```

#### 접근성

- `<div>` 컨테이너: `role="alert"`, `aria-live="assertive"`
- 아이콘: `aria-hidden="true"`
- 재시도 버튼: `aria-busy={retrying}`

#### 반응형

- **All Devices**: 중앙 정렬, 수직 레이아웃

#### 디자인

```
┌────────────────────────────────────────┐
│                                        │
│        [에러 아이콘 (빨간색)]          │
│                                        │
│         오류가 발생했습니다            │
│                                        │
│   데이터를 불러오는 중 문제가 발생했습니다. │
│   잠시 후 다시 시도해주세요.           │
│                                        │
│          [다시 시도]                   │
│                                        │
└────────────────────────────────────────┘
```

#### 테스트 시나리오

```typescript
describe('ErrorState', () => {
  it('should render title and message', () => {});
  it('should render error icon', () => {});
  it('should render retry button when onRetry provided', () => {});
  it('should call onRetry on button click', () => {});
  it('should show loading state while retrying', () => {});
  it('should have alert role', () => {});
});
```

#### 사용 예시

```tsx
<ErrorState
  title="데이터 로딩 실패"
  message="네트워크 연결을 확인하고 다시 시도해주세요."
  onRetry={() => {
    refetch();
  }}
  retryLabel="다시 시도"
/>
```

---

## 7. UI 컴포넌트 (ui/)

UI 컴포넌트는 shadcn/ui를 통해 설치되며, 프로젝트 요구사항에 맞게 커스터마이징할 수 있습니다.

### 7.1 설치된 shadcn/ui 컴포넌트

| 컴포넌트 | 용도 | 파일 |
|---------|------|------|
| Button | 버튼 (primary, secondary, outline, ghost) | `button.tsx` |
| Card | 카드 레이아웃 (header, content, footer) | `card.tsx` |
| Input | 텍스트 입력 | `input.tsx` |
| Label | 폼 레이블 | `label.tsx` |
| Select | 드롭다운 선택 | `select.tsx` |
| Table | 테이블 (thead, tbody, tr, td) | `table.tsx` |
| Tabs | 탭 네비게이션 | `tabs.tsx` |
| Toast | 토스트 알림 | `toast.tsx` |
| Dialog | 모달 다이얼로그 | `dialog.tsx` |
| Badge | 뱃지 (status, count) | `badge.tsx` |
| Skeleton | 로딩 스켈레톤 | `skeleton.tsx` |
| DropdownMenu | 드롭다운 메뉴 | `dropdown-menu.tsx` |

### 7.2 shadcn/ui 커스터마이징 예시

#### Button Variants

```typescript
// src/components/ui/button.tsx (일부)
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        // 커스텀 variant 추가
        zvzo: 'bg-zvzo-primary text-white hover:bg-zvzo-600',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);
```

#### Card 사용 예시

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>크리에이터 성과</CardTitle>
    <CardDescription>최근 6개월 판매 데이터</CardDescription>
  </CardHeader>
  <CardContent>
    {/* 차트 또는 데이터 표시 */}
  </CardContent>
  <CardFooter>
    <Button>상세 보기</Button>
  </CardFooter>
</Card>
```

---

## 8. 접근성 가이드

### 8.1 전역 접근성 규칙

#### 키보드 네비게이션
- 모든 인터랙티브 요소는 Tab 키로 접근 가능
- Focus 순서는 논리적 순서 (상단→하단, 좌→우)
- Focus 스타일 명확하게 표시 (`focus-visible:ring-2`)
- Escape 키로 모달/드롭다운 닫기

#### 스크린 리더
- 모든 이미지에 `alt` 텍스트
- 장식용 아이콘: `aria-hidden="true"`
- 인터랙티브 요소: 명확한 `aria-label`
- 동적 콘텐츠: `aria-live="polite"` 또는 `aria-live="assertive"`

#### 색상 대비
- WCAG 2.1 Level AA 준수 (대비비 4.5:1 이상)
- 정보 전달 시 색상에만 의존하지 않음 (텍스트/아이콘 병행)

#### 폼 접근성
- 모든 `<input>`에 `<label>` 연결 (`htmlFor`)
- 에러 메시지: `aria-invalid`, `aria-describedby`
- Required 필드: `aria-required="true"` 또는 `required` 속성

### 8.2 컴포넌트별 접근성 체크리스트

```typescript
/**
 * 접근성 체크리스트 (모든 컴포넌트)
 */
const a11yChecklist = {
  semantic: [
    '✓ 적절한 HTML 태그 사용 (<button>, <nav>, <main>, etc.)',
    '✓ Heading 계층 구조 (<h1> → <h2> → <h3>)',
  ],
  keyboard: [
    '✓ Tab 키로 모든 요소 접근 가능',
    '✓ Enter/Space로 버튼 활성화',
    '✓ Escape로 모달/드롭다운 닫기',
    '✓ Arrow keys로 리스트/메뉴 네비게이션',
  ],
  aria: [
    '✓ role 속성 적절히 사용',
    '✓ aria-label, aria-labelledby 제공',
    '✓ aria-expanded, aria-selected 상태 반영',
    '✓ aria-live로 동적 업데이트 알림',
  ],
  screenReader: [
    '✓ 이미지에 alt 텍스트',
    '✓ 아이콘에 aria-label 또는 aria-hidden',
    '✓ 링크/버튼에 명확한 텍스트',
  ],
  visual: [
    '✓ 색상 대비비 4.5:1 이상',
    '✓ Focus 스타일 명확',
    '✓ 색상 외 정보 전달 수단 (아이콘, 텍스트)',
  ],
};
```

---

## 9. 테스트 전략

### 9.1 테스트 도구

- **단위 테스트**: Vitest + Testing Library
- **컴포넌트 테스트**: React Testing Library
- **시각적 테스트**: (선택) Storybook
- **E2E 테스트**: (선택) Playwright

### 9.2 테스트 우선순위

| 우선순위 | 컴포넌트 유형 | 테스트 범위 |
|---------|-------------|-----------|
| **P0** | 공통 컴포넌트 (common/) | 필수, 100% 커버리지 |
| **P1** | 레이아웃 (layout/), UI (ui/) | 주요 기능, 80% 커버리지 |
| **P2** | 차트 (charts/), 매칭 (match/) | 핵심 로직, 60% 커버리지 |
| **P3** | 크리에이터 (creator/) | 주요 흐름, 50% 커버리지 |

### 9.3 테스트 템플릿

```typescript
// src/__tests__/components/common/stat-card.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StatCard from '@/components/common/stat-card';

describe('StatCard', () => {
  it('should render label and value', () => {
    render(<StatCard label="총 매출" value={5650000} />);
    expect(screen.getByText('총 매출')).toBeInTheDocument();
    expect(screen.getByText(/565만원/)).toBeInTheDocument();
  });

  it('should format value using formatter', () => {
    render(
      <StatCard
        label="전환율"
        value={3.8}
        formatter={(v) => `${v}%`}
      />
    );
    expect(screen.getByText('3.8%')).toBeInTheDocument();
  });

  it('should show trend with correct color', () => {
    render(
      <StatCard
        label="매출"
        value={1000}
        trend={{ value: 12.5, direction: 'up' }}
      />
    );
    const trendElement = screen.getByText(/12.5%/);
    expect(trendElement).toHaveClass('text-green-600');
  });

  it('should render icon when provided', () => {
    const { container } = render(
      <StatCard label="판매" value={100} icon={ShoppingCart} />
    );
    // 아이콘 SVG 존재 확인
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
```

### 9.4 통합 테스트 예시

```typescript
// src/__tests__/components/creator/creator-card.integration.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreatorCard from '@/components/creator/creator-card';
import { mockCreator } from '@/__tests__/fixtures/creators';

describe('CreatorCard Integration', () => {
  it('should navigate to detail page on click', async () => {
    const user = userEvent.setup();
    const mockRouter = { push: vi.fn() };

    render(
      <CreatorCard
        creator={mockCreator}
        onClick={(creator) => mockRouter.push(`/creators/${creator.id}`)}
      />
    );

    const card = screen.getByRole('button', { name: /김지은/ });
    await user.click(card);

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/creators/creator-001');
    });
  });

  it('should handle keyboard navigation', async () => {
    const user = userEvent.setup();
    const mockOnClick = vi.fn();

    render(<CreatorCard creator={mockCreator} onClick={mockOnClick} />);

    const card = screen.getByRole('button', { name: /김지은/ });
    card.focus();

    await user.keyboard('{Enter}');
    expect(mockOnClick).toHaveBeenCalledWith(mockCreator);

    await user.keyboard(' ');
    expect(mockOnClick).toHaveBeenCalledTimes(2);
  });
});
```

---

## 10. 버전 관리 및 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0.0 | 2026-02-04 | 초기 버전 작성 |

---

**문서 작성**: 2026-02-04
**다음 단계**: API 라우트 구현 (07-api-routes.md)
