import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreatorMatchCard } from '@/components/match/creator-match-card';
import { CreatorMatchSection } from '@/components/match/creator-match-section';
import type { CreatorMatch, Product } from '@/types';

// Mock Recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  RadialBarChart: ({ children }: any) => <div data-testid="radial-chart">{children}</div>,
  RadialBar: () => <div data-testid="radial-bar" />,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Cell: () => <div data-testid="cell" />,
}));

// Mock child components
vi.mock('@/components/charts/match-score-gauge', () => ({
  MatchScoreGauge: ({ score }: { score: number }) => (
    <div data-testid="match-score-gauge">Score: {score}</div>
  ),
}));

vi.mock('@/components/match/match-score-breakdown', () => ({
  MatchScoreBreakdown: ({ breakdown }: any) => (
    <div data-testid="match-score-breakdown">
      Category: {breakdown.categoryFit}%, Price: {breakdown.priceFit}%
    </div>
  ),
}));

vi.mock('@/components/match/revenue-prediction-bar', () => ({
  RevenuePredictionBar: ({ prediction }: any) => (
    <div data-testid="revenue-prediction-bar">
      Expected: {prediction.expected}
    </div>
  ),
}));

vi.mock('@/components/common/confidence-badge', () => ({
  ConfidenceBadge: ({ confidence }: { confidence: number }) => (
    <div data-testid="confidence-badge">{confidence}%</div>
  ),
}));

vi.mock('@/components/common/platform-badge', () => ({
  PlatformBadge: ({ platform }: { platform: string }) => (
    <span data-testid="platform-badge">{platform}</span>
  ),
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockCreatorMatch: CreatorMatch = {
  creator: {
    id: 'creator-001',
    name: '뷰티맘',
    profileImage: '/images/creators/creator-001.jpg',
    platform: 'Instagram',
    followers: 125000,
    engagementRate: 4.2,
    categories: ['Beauty', 'Lifestyle'],
    joinedAt: '2023-01-15',
    totalSales: 450,
    totalRevenue: 28500000,
  },
  matchScore: 88,
  matchBreakdown: { categoryFit: 95, priceFit: 85, seasonFit: 80, audienceFit: 90 },
  predictedRevenue: {
    minimum: 1260000,
    expected: 1800000,
    maximum: 2520000,
    predictedQuantity: 40,
    predictedCommission: 270000,
    basis: '월평균 38건 판매 기준',
  },
  reasoning: '뷰티맘님은 주력 카테고리(Beauty)에서 활동하며, 평균 주문 가치 63,333원으로 제품 가격대와 매우 유사합니다.',
  confidence: 82,
};

const mockProduct: Product = {
  id: 'prod-001',
  name: '글로우 세럼',
  brand: 'BeautyLab',
  category: 'Beauty',
  subcategory: 'Skincare',
  price: 65000,
  originalPrice: 85000,
  description: '피부에 빛을 더하는 세럼',
  imageUrl: '/images/products/glow-serum.jpg',
  tags: ['anti-aging', 'hydration'],
  targetAudience: ['20대 여성', '30대 여성'],
  seasonality: ['봄', '가을'],
  avgCommissionRate: 15,
};

describe('CreatorMatchCard', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('should render creator name and platform', () => {
    render(<CreatorMatchCard match={mockCreatorMatch} />);
    expect(screen.getByText('뷰티맘')).toBeInTheDocument();
    expect(screen.getByTestId('platform-badge')).toHaveTextContent(/instagram/i);
  });

  it('should render followers count', () => {
    render(<CreatorMatchCard match={mockCreatorMatch} />);
    expect(screen.getByText(/12\.5만/)).toBeInTheDocument();
  });

  it('should render engagement rate', () => {
    render(<CreatorMatchCard match={mockCreatorMatch} />);
    expect(screen.getByText(/참여율/)).toBeInTheDocument();
    expect(screen.getByText(/4\.2/)).toBeInTheDocument();
  });

  it('should render match score', () => {
    render(<CreatorMatchCard match={mockCreatorMatch} />);
    expect(screen.getByTestId('match-score-gauge')).toHaveTextContent('Score: 88');
  });

  it('should render reasoning text (truncated)', () => {
    render(<CreatorMatchCard match={mockCreatorMatch} />);
    expect(screen.getByText(/뷰티맘님은 주력 카테고리/)).toBeInTheDocument();
  });

  it('should render expected revenue', () => {
    render(<CreatorMatchCard match={mockCreatorMatch} />);
    expect(screen.getByText(/1,800,000/)).toBeInTheDocument();
  });

  it('should expand to show details', () => {
    render(<CreatorMatchCard match={mockCreatorMatch} />);

    // Initially collapsed
    expect(screen.queryByTestId('confidence-badge')).not.toBeInTheDocument();

    // Click expand button
    const toggleButton = screen.getByText(/상세보기/);
    fireEvent.click(toggleButton);

    // Now expanded
    expect(screen.getByTestId('confidence-badge')).toBeInTheDocument();
  });

  it('should show confidence badge when expanded', () => {
    render(<CreatorMatchCard match={mockCreatorMatch} />);

    const toggleButton = screen.getByText(/상세보기/);
    fireEvent.click(toggleButton);

    const confidenceBadge = screen.getByTestId('confidence-badge');
    expect(confidenceBadge).toHaveTextContent('82%');
  });

  it('should show score breakdown when expanded', () => {
    render(<CreatorMatchCard match={mockCreatorMatch} />);

    const toggleButton = screen.getByText(/상세보기/);
    fireEvent.click(toggleButton);

    const breakdown = screen.getByTestId('match-score-breakdown');
    expect(breakdown).toHaveTextContent('Category: 95%');
    expect(breakdown).toHaveTextContent('Price: 85%');
  });

  it('should toggle checkbox for selection', () => {
    const onSelect = vi.fn();
    render(<CreatorMatchCard match={mockCreatorMatch} selected={false} onSelect={onSelect} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);
    expect(onSelect).toHaveBeenCalledWith('creator-001');
  });

  it('should handle creator image error', () => {
    render(<CreatorMatchCard match={mockCreatorMatch} />);

    const image = document.querySelector('img');
    if (image) {
      fireEvent.error(image);
    }

    // Should show initials fallback in the avatar div
    const avatar = document.querySelector('.bg-gray-200');
    expect(avatar).toBeInTheDocument();
    expect(avatar?.textContent).toMatch(/뷰티/);
  });

  it('should show fallback initials when no image', () => {
    const matchWithoutImage: CreatorMatch = {
      ...mockCreatorMatch,
      creator: {
        ...mockCreatorMatch.creator,
        profileImage: '',
      },
    };
    render(<CreatorMatchCard match={matchWithoutImage} />);

    // Should show initials in the avatar div
    const avatar = document.querySelector('.bg-gray-200');
    expect(avatar).toBeInTheDocument();
    expect(avatar?.textContent).toMatch(/뷰티/);
  });

  it('should handle toggle button click', () => {
    render(<CreatorMatchCard match={mockCreatorMatch} />);

    const toggleButton = screen.getByText(/상세보기/);
    fireEvent.click(toggleButton);

    expect(screen.getByText(/접기/)).toBeInTheDocument();
  });

  it('should collapse expanded card', () => {
    render(<CreatorMatchCard match={mockCreatorMatch} />);

    const expandButton = screen.getByText(/상세보기/);
    fireEvent.click(expandButton);

    // Expanded
    expect(screen.getByTestId('confidence-badge')).toBeInTheDocument();

    const collapseButton = screen.getByText(/접기/);
    fireEvent.click(collapseButton);

    // Collapsed again
    expect(screen.queryByTestId('confidence-badge')).not.toBeInTheDocument();
  });
});

describe('CreatorMatchSection', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('should show loading state initially', () => {
    mockFetch.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({ success: true, data: [mockCreatorMatch] }),
              }),
            100
          )
        )
    );

    render(<CreatorMatchSection product={mockProduct} />);

    expect(screen.getByText(/AI가 최적의 크리에이터를 찾고 있습니다/)).toBeInTheDocument();
  });

  it('should show error state on API failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    render(<CreatorMatchSection product={mockProduct} />);

    await waitFor(() => {
      expect(screen.getByText('매칭 실패')).toBeInTheDocument();
    });
  });

  it('should show retry button on error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    render(<CreatorMatchSection product={mockProduct} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /다시 시도/ })).toBeInTheDocument();
    });
  });

  it('should retry API call when retry clicked', async () => {
    // First call fails
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    render(<CreatorMatchSection product={mockProduct} />);

    await waitFor(() => {
      expect(screen.getByText('매칭 실패')).toBeInTheDocument();
    });

    // Second call succeeds
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: [mockCreatorMatch] }),
    });

    const retryButton = screen.getByText(/다시 시도/);
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(screen.getByText('뷰티맘')).toBeInTheDocument();
    });
  });

  it('should display matched creators on success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: [mockCreatorMatch] }),
    });

    render(<CreatorMatchSection product={mockProduct} />);

    await waitFor(() => {
      expect(screen.getByText('뷰티맘')).toBeInTheDocument();
    });
  });

  it('should show product summary in sidebar', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: [mockCreatorMatch] }),
    });

    render(<CreatorMatchSection product={mockProduct} />);

    await waitFor(() => {
      expect(screen.getByText('상품 요약')).toBeInTheDocument();
      expect(screen.getByText('글로우 세럼')).toBeInTheDocument();
      expect(screen.getByText('Beauty')).toBeInTheDocument();
      expect(screen.getByText(/65,000/)).toBeInTheDocument();
    });
  });

  it('should enable compare when 2-3 creators selected', async () => {
    const match2: CreatorMatch = {
      ...mockCreatorMatch,
      creator: { ...mockCreatorMatch.creator, id: 'creator-002', name: '패션왕' },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: [mockCreatorMatch, match2] }),
    });

    render(<CreatorMatchSection product={mockProduct} />);

    await waitFor(() => {
      expect(screen.getByText('뷰티맘')).toBeInTheDocument();
    });

    // Select 2 creators
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[1]);

    const compareButton = screen.getByText('비교하기');
    expect(compareButton).not.toBeDisabled();
  });

  it('should disable compare when < 2 or > 3 selected', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: [mockCreatorMatch] }),
    });

    render(<CreatorMatchSection product={mockProduct} />);

    await waitFor(() => {
      expect(screen.getByText('뷰티맘')).toBeInTheDocument();
    });

    // Select 1 creator
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    const compareButton = screen.getByText('비교하기');
    expect(compareButton).toBeDisabled();
  });

  it('should show compare modal', async () => {
    const match2: CreatorMatch = {
      ...mockCreatorMatch,
      creator: { ...mockCreatorMatch.creator, id: 'creator-002', name: '패션왕' },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: [mockCreatorMatch, match2] }),
    });

    render(<CreatorMatchSection product={mockProduct} />);

    await waitFor(() => {
      expect(screen.getByText('뷰티맘')).toBeInTheDocument();
    });

    // Select 2 creators
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[1]);

    const compareButton = screen.getByText('비교하기');
    fireEvent.click(compareButton);

    expect(screen.getByText(/크리에이터 비교/)).toBeInTheDocument();
  });

  it('should close compare modal on backdrop click', async () => {
    const match2: CreatorMatch = {
      ...mockCreatorMatch,
      creator: { ...mockCreatorMatch.creator, id: 'creator-002', name: '패션왕' },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: [mockCreatorMatch, match2] }),
    });

    render(<CreatorMatchSection product={mockProduct} />);

    await waitFor(() => {
      expect(screen.getByText('뷰티맘')).toBeInTheDocument();
    });

    // Open modal
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[1]);

    const compareButton = screen.getByText('비교하기');
    fireEvent.click(compareButton);

    // Click backdrop
    const backdrop = screen.getByText(/크리에이터 비교/).closest('.fixed');
    if (backdrop) {
      fireEvent.click(backdrop);
    }

    await waitFor(() => {
      expect(screen.queryByText(/크리에이터 비교/)).not.toBeInTheDocument();
    });
  });

  it('should close compare modal on close button', async () => {
    const match2: CreatorMatch = {
      ...mockCreatorMatch,
      creator: { ...mockCreatorMatch.creator, id: 'creator-002', name: '패션왕' },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: [mockCreatorMatch, match2] }),
    });

    render(<CreatorMatchSection product={mockProduct} />);

    await waitFor(() => {
      expect(screen.getByText('뷰티맘')).toBeInTheDocument();
    });

    // Open modal
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[1]);

    const compareButton = screen.getByText('비교하기');
    fireEvent.click(compareButton);

    // Click close button
    const closeButtons = screen.getAllByRole('button', { name: '닫기' });
    fireEvent.click(closeButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText(/크리에이터 비교/)).not.toBeInTheDocument();
    });
  });

  it('should display comparison table with all metrics', async () => {
    const match2: CreatorMatch = {
      ...mockCreatorMatch,
      creator: { ...mockCreatorMatch.creator, id: 'creator-002', name: '패션왕' },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: [mockCreatorMatch, match2] }),
    });

    render(<CreatorMatchSection product={mockProduct} />);

    await waitFor(() => {
      expect(screen.getByText('뷰티맘')).toBeInTheDocument();
    });

    // Open modal
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[1]);

    const compareButton = screen.getByText('비교하기');
    fireEvent.click(compareButton);

    // Check table headers
    expect(screen.getByText('이름')).toBeInTheDocument();
    expect(screen.getByText('플랫폼')).toBeInTheDocument();
    expect(screen.getByText('팔로워')).toBeInTheDocument();
    expect(screen.getByText('참여율')).toBeInTheDocument();
    expect(screen.getByText('매칭 점수')).toBeInTheDocument();
    expect(screen.getAllByText('예상 매출').length).toBeGreaterThan(0);
    expect(screen.getByText('신뢰도')).toBeInTheDocument();
  });
});
