import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MatchCard } from '@/components/match/match-card';
import { MatchScoreBreakdown } from '@/components/match/match-score-breakdown';
import { RevenuePredictionBar } from '@/components/match/revenue-prediction-bar';
import { CompareModal } from '@/components/match/compare-modal';
import { ReasoningText } from '@/components/match/reasoning-text';
import type { ProductMatch, Product } from '@/types';

// Mock Recharts for MatchCard (which uses MatchScoreGauge)
vi.mock('recharts', () => ({
  RadialBarChart: ({ children }: any) => <div data-testid="radial-chart">{children}</div>,
  RadialBar: () => <div data-testid="radial-bar" />,
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}));

const mockProduct: Product = {
  id: 'product-001',
  name: '글로우 세럼',
  brand: '뷰티브랜드',
  category: 'Beauty',
  subcategory: 'Skincare',
  price: 45000,
  originalPrice: 60000,
  description: '피부에 생기를 더하는 세럼',
  imageUrl: '/images/product-001.jpg',
  tags: ['hydrating', 'glow'],
  targetAudience: ['20s', '30s'],
  seasonality: ['spring', 'summer'],
  avgCommissionRate: 10,
};

const mockMatch: ProductMatch = {
  product: mockProduct,
  matchScore: 87,
  matchBreakdown: {
    categoryFit: 92,
    priceFit: 85,
    seasonFit: 78,
    audienceFit: 90,
  },
  predictedRevenue: {
    minimum: 1050000,
    expected: 1350000,
    maximum: 1650000,
    predictedQuantity: 15,
    predictedCommission: 135000,
    basis: '과거 평균 전환율 4.2%',
  },
  reasoning: '이 크리에이터는 뷰티 카테고리에서 높은 전환율을 기록하고 있으며, 가격대도 적합합니다.',
  confidence: 85,
};

describe('MatchCard', () => {
  it('should render match info', () => {
    render(<MatchCard match={mockMatch} />);
    expect(screen.getByText('글로우 세럼')).toBeInTheDocument();
    expect(screen.getByText('Beauty')).toBeInTheDocument();
  });

  it('should display product price', () => {
    render(<MatchCard match={mockMatch} />);
    expect(screen.getByText(/45,000/)).toBeInTheDocument();
  });

  it('should render match score gauge', () => {
    render(<MatchCard match={mockMatch} />);
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('should show truncated reason text', () => {
    const longReasoning = 'A'.repeat(200);
    const matchWithLongReason = { ...mockMatch, reasoning: longReasoning };
    render(<MatchCard match={matchWithLongReason} />);
    const reasonText = screen.getByText(/A+\.\.\./);
    expect(reasonText).toBeInTheDocument();
  });

  it('should expand on toggle button click', () => {
    render(<MatchCard match={mockMatch} expandable={true} />);
    const toggleButton = screen.getByRole('button', { name: /상세 정보 보기/ });
    fireEvent.click(toggleButton);

    expect(screen.getByText('신뢰도')).toBeInTheDocument();
    expect(screen.getByText('매칭 점수 상세')).toBeInTheDocument();
  });

  it('should show detailed charts when expanded', () => {
    render(<MatchCard match={mockMatch} expandable={true} />);
    const toggleButton = screen.getByRole('button', { name: /상세 정보 보기/ });
    fireEvent.click(toggleButton);

    expect(screen.getByText('카테고리 적합도')).toBeInTheDocument();
    expect(screen.getByText('예상 매출 범위')).toBeInTheDocument();
  });

  it('should call onClick on card click', () => {
    const onClick = vi.fn();
    render(<MatchCard match={mockMatch} onClick={onClick} />);
    const card = screen.getByRole('article');
    fireEvent.click(card);
    expect(onClick).toHaveBeenCalledWith(mockMatch);
  });

  it('should format expected revenue', () => {
    render(<MatchCard match={mockMatch} />);
    expect(screen.getByText(/1,350,000/)).toBeInTheDocument();
  });

  it('should display confidence badge when expanded', () => {
    render(<MatchCard match={mockMatch} expandable={true} />);
    const toggleButton = screen.getByRole('button', { name: /상세 정보 보기/ });
    fireEvent.click(toggleButton);

    expect(screen.getByText('신뢰도')).toBeInTheDocument();
    expect(screen.getByText((content, element) => {
      return element?.classList?.contains('rounded-full') && content.includes('높음');
    })).toBeInTheDocument();
  });

  it('should not call onClick when clicking toggle button', () => {
    const onClick = vi.fn();
    render(<MatchCard match={mockMatch} expandable={true} onClick={onClick} />);

    const toggleButton = screen.getByRole('button', { name: /상세 정보 보기/ });
    fireEvent.click(toggleButton);

    // onClick should not be called when clicking toggle button
    expect(onClick).not.toHaveBeenCalled();
  });

  it('should handle card click when not expandable', () => {
    const onClick = vi.fn();
    render(<MatchCard match={mockMatch} expandable={false} onClick={onClick} />);

    const card = screen.getByRole('article');
    fireEvent.click(card);

    expect(onClick).toHaveBeenCalledWith(mockMatch);
  });

  it('should not expand when expandable is false', () => {
    render(<MatchCard match={mockMatch} expandable={false} />);

    expect(screen.queryByRole('button', { name: /상세 정보/ })).not.toBeInTheDocument();
  });

  it('should show fallback image when imageUrl is missing', () => {
    const matchWithoutImage = {
      ...mockMatch,
      product: { ...mockProduct, imageUrl: undefined },
    };
    render(<MatchCard match={matchWithoutImage} />);

    expect(screen.getByText('이미지 없음')).toBeInTheDocument();
  });

  it('should handle image error', () => {
    render(<MatchCard match={mockMatch} />);

    const image = document.querySelector('img');
    if (image) {
      fireEvent.error(image);
    }

    expect(screen.getByText('이미지 없음')).toBeInTheDocument();
  });

  it('should display medium confidence badge', () => {
    const mediumConfidenceMatch = { ...mockMatch, confidence: 70 };
    render(<MatchCard match={mediumConfidenceMatch} expandable={true} />);

    const toggleButton = screen.getByRole('button', { name: /상세 정보 보기/ });
    fireEvent.click(toggleButton);

    expect(screen.getByText((content, element) => {
      return element?.classList?.contains('rounded-full') && content.includes('보통');
    })).toBeInTheDocument();
  });

  it('should display low confidence badge', () => {
    const lowConfidenceMatch = { ...mockMatch, confidence: 50 };
    render(<MatchCard match={lowConfidenceMatch} expandable={true} />);

    const toggleButton = screen.getByRole('button', { name: /상세 정보 보기/ });
    fireEvent.click(toggleButton);

    expect(screen.getByText((content, element) => {
      return element?.classList?.contains('rounded-full') && content.includes('낮음');
    })).toBeInTheDocument();
  });

  it('should truncate long reasoning text when not expanded', () => {
    const longReasoning = 'A'.repeat(200);
    const matchWithLongReason = { ...mockMatch, reasoning: longReasoning };
    render(<MatchCard match={matchWithLongReason} />);

    const reasonText = screen.getByText(/A+\.\.\./);
    expect(reasonText.textContent?.length).toBeLessThan(200);
  });

  it('should show full reasoning text when expanded', () => {
    const longReasoning = 'A'.repeat(200);
    const matchWithLongReason = { ...mockMatch, reasoning: longReasoning };
    render(<MatchCard match={matchWithLongReason} expandable={true} />);

    const toggleButton = screen.getByRole('button', { name: /상세 정보 보기/ });
    fireEvent.click(toggleButton);

    const reasonText = screen.getByText(longReasoning);
    expect(reasonText.textContent).toBe(longReasoning);
  });

  it('should not truncate short reasoning text', () => {
    const shortReasoning = 'Short reason';
    const matchWithShortReason = { ...mockMatch, reasoning: shortReasoning };
    render(<MatchCard match={matchWithShortReason} />);

    expect(screen.getByText(shortReasoning)).toBeInTheDocument();
  });
});

describe('MatchScoreBreakdown', () => {
  const mockBreakdown = {
    categoryFit: 92,
    priceFit: 85,
    seasonFit: 78,
    audienceFit: 90,
  };

  it('should render all score items', () => {
    render(<MatchScoreBreakdown breakdown={mockBreakdown} />);
    expect(screen.getByText('카테고리 적합도')).toBeInTheDocument();
    expect(screen.getByText('가격대 적합도')).toBeInTheDocument();
    expect(screen.getByText('시즌 적합도')).toBeInTheDocument();
    expect(screen.getByText('타겟 고객 적합도')).toBeInTheDocument();
  });

  it('should display score percentages', () => {
    render(<MatchScoreBreakdown breakdown={mockBreakdown} />);
    expect(screen.getByText('92%')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText('78%')).toBeInTheDocument();
    expect(screen.getByText('90%')).toBeInTheDocument();
  });

  it('should render progress bars with correct widths', () => {
    const { container } = render(<MatchScoreBreakdown breakdown={mockBreakdown} />);
    const progressBars = container.querySelectorAll('[style*="width"]');
    expect(progressBars.length).toBeGreaterThan(0);
  });

  it('should apply color based on score', () => {
    const { container } = render(<MatchScoreBreakdown breakdown={mockBreakdown} />);
    // High score (>70) should have green background
    const highScoreBar = container.querySelector('[style*="92%"]');
    expect(highScoreBar?.className).toContain('bg-green');
  });

  it('should apply yellow color for score >= 40 and < 70', () => {
    const mediumBreakdown = {
      categoryFit: 60,
      priceFit: 55,
      seasonFit: 50,
      audienceFit: 45,
    };
    const { container } = render(<MatchScoreBreakdown breakdown={mediumBreakdown} />);
    const bars = container.querySelectorAll('[class*="bg-yellow"]');
    expect(bars.length).toBeGreaterThan(0);
  });

  it('should apply red color for score < 40', () => {
    const lowBreakdown = {
      categoryFit: 30,
      priceFit: 25,
      seasonFit: 35,
      audienceFit: 20,
    };
    const { container } = render(<MatchScoreBreakdown breakdown={lowBreakdown} />);
    const bars = container.querySelectorAll('[class*="bg-red"]');
    expect(bars.length).toBeGreaterThan(0);
  });

  it('should apply green color for score exactly 70', () => {
    const boundaryBreakdown = {
      categoryFit: 70,
      priceFit: 70,
      seasonFit: 70,
      audienceFit: 70,
    };
    const { container } = render(<MatchScoreBreakdown breakdown={boundaryBreakdown} />);
    const bars = container.querySelectorAll('[class*="bg-green"]');
    expect(bars.length).toBeGreaterThan(0);
  });

  it('should apply yellow color for score exactly 40', () => {
    const boundaryBreakdown = {
      categoryFit: 40,
      priceFit: 40,
      seasonFit: 40,
      audienceFit: 40,
    };
    const { container } = render(<MatchScoreBreakdown breakdown={boundaryBreakdown} />);
    const bars = container.querySelectorAll('[class*="bg-yellow"]');
    expect(bars.length).toBeGreaterThan(0);
  });

  it('should apply red color for score exactly 39', () => {
    const boundaryBreakdown = {
      categoryFit: 39,
      priceFit: 39,
      seasonFit: 39,
      audienceFit: 39,
    };
    const { container } = render(<MatchScoreBreakdown breakdown={boundaryBreakdown} />);
    // All scores are 39%, so there should be multiple instances
    const bars = container.querySelectorAll('[class*="bg-red"]');
    expect(bars.length).toBeGreaterThan(0);
  });

  it('should render with custom className', () => {
    const { container } = render(<MatchScoreBreakdown breakdown={mockBreakdown} className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});

describe('RevenuePredictionBar', () => {
  const mockPrediction = {
    minimum: 1050000,
    expected: 1350000,
    maximum: 1650000,
    predictedQuantity: 15,
    predictedCommission: 135000,
    basis: '과거 평균 전환율 4.2%',
  };

  it('should render min/expected/max labels', () => {
    render(<RevenuePredictionBar prediction={mockPrediction} />);
    expect(screen.getByText('최소')).toBeInTheDocument();
    expect(screen.getByText('예상')).toBeInTheDocument();
    expect(screen.getByText('최대')).toBeInTheDocument();
  });

  it('should display formatted currency values', () => {
    render(<RevenuePredictionBar prediction={mockPrediction} />);
    expect(screen.getByText(/1,050,000/)).toBeInTheDocument();
    expect(screen.getByText(/1,350,000/)).toBeInTheDocument();
    expect(screen.getByText(/1,650,000/)).toBeInTheDocument();
  });

  it('should render range bar with gradients', () => {
    const { container } = render(<RevenuePredictionBar prediction={mockPrediction} />);
    const gradients = container.querySelectorAll('[class*="gradient"]');
    expect(gradients.length).toBeGreaterThan(0);
  });
});

describe('CompareModal', () => {
  const mockMatches: ProductMatch[] = [
    mockMatch,
    {
      ...mockMatch,
      product: { ...mockProduct, id: 'product-002', name: '다른 제품' },
      matchScore: 82,
    },
    {
      ...mockMatch,
      product: { ...mockProduct, id: 'product-003', name: '또 다른 제품' },
      matchScore: 79,
    },
  ];

  it('should not render when open is false', () => {
    render(<CompareModal matches={mockMatches} open={false} onClose={() => {}} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render when open is true', () => {
    render(<CompareModal matches={mockMatches} open={true} onClose={() => {}} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should display comparison table with products', () => {
    render(<CompareModal matches={mockMatches} open={true} onClose={() => {}} />);
    expect(screen.getByText('글로우 세럼')).toBeInTheDocument();
    expect(screen.getByText('다른 제품')).toBeInTheDocument();
    expect(screen.getByText('또 다른 제품')).toBeInTheDocument();
  });

  it('should limit to 3 products', () => {
    const manyMatches = [...mockMatches, { ...mockMatch, product: { ...mockProduct, id: 'product-004' } }];
    render(<CompareModal matches={manyMatches} open={true} onClose={() => {}} />);
    expect(screen.getByText('상품 비교 (3개)')).toBeInTheDocument();
  });

  it('should call onClose when close button clicked', () => {
    const onClose = vi.fn();
    render(<CompareModal matches={mockMatches} open={true} onClose={onClose} />);
    const closeButton = screen.getAllByRole('button', { name: '닫기' })[0];
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalled();
  });

  it('should call onClose when backdrop clicked', () => {
    const onClose = vi.fn();
    render(<CompareModal matches={mockMatches} open={true} onClose={onClose} />);
    const backdrop = screen.getByRole('dialog');
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalled();
  });

  it('should display all comparison metrics', () => {
    render(<CompareModal matches={mockMatches} open={true} onClose={() => {}} />);
    expect(screen.getByText('상품명')).toBeInTheDocument();
    expect(screen.getByText('카테고리')).toBeInTheDocument();
    expect(screen.getByText('가격')).toBeInTheDocument();
    expect(screen.getByText('매칭 점수')).toBeInTheDocument();
    expect(screen.getByText('예상 매출')).toBeInTheDocument();
  });

  it('should apply green style for high confidence (>= 80)', () => {
    const highConfMatches = [{ ...mockMatch, confidence: 85 }];
    const { container } = render(<CompareModal matches={highConfMatches} open={true} onClose={() => {}} />);
    // Find the confidence badge specifically in the confidence row
    const confCell = container.querySelector('td:has(> span.rounded-full)');
    const confBadge = confCell?.querySelector('span');
    expect(confBadge).toHaveClass('bg-green-100', 'text-green-700');
  });

  it('should apply yellow style for medium confidence (60-79)', () => {
    const medConfMatches = [{ ...mockMatch, confidence: 70 }];
    const { container } = render(<CompareModal matches={medConfMatches} open={true} onClose={() => {}} />);
    const confCell = container.querySelector('td:has(> span.rounded-full)');
    const confBadge = confCell?.querySelector('span');
    expect(confBadge).toHaveClass('bg-yellow-100', 'text-yellow-700');
  });

  it('should apply red style for low confidence (< 60)', () => {
    const lowConfMatches = [{ ...mockMatch, confidence: 50 }];
    const { container } = render(<CompareModal matches={lowConfMatches} open={true} onClose={() => {}} />);
    const confCell = container.querySelector('td:has(> span.rounded-full)');
    const confBadge = confCell?.querySelector('span');
    expect(confBadge).toHaveClass('bg-red-100', 'text-red-700');
  });
});

describe('ReasoningText', () => {
  const mockReasoning = '이 제품은 크리에이터의 스타일과 잘 어울립니다.';

  it('should render reasoning text', () => {
    render(<ReasoningText reasoning={mockReasoning} />);
    expect(screen.getByText(mockReasoning)).toBeInTheDocument();
  });

  it('should render with AI badge', () => {
    render(<ReasoningText reasoning={mockReasoning} />);
    expect(screen.getByText('AI 분석')).toBeInTheDocument();
  });

  it('should render as blockquote with gradient background', () => {
    const { container } = render(<ReasoningText reasoning={mockReasoning} />);
    const blockquote = container.querySelector('blockquote');
    expect(blockquote).toBeInTheDocument();
    expect(blockquote?.className).toContain('gradient');
  });

  it('should display sparkles icon', () => {
    const { container } = render(<ReasoningText reasoning={mockReasoning} />);
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('should render text in italic style', () => {
    const { container } = render(<ReasoningText reasoning={mockReasoning} />);
    const text = container.querySelector('.italic');
    expect(text).toBeInTheDocument();
  });
});
