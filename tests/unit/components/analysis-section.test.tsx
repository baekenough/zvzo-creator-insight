import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AnalysisSection } from '@/components/creator/analysis-section';
import type { CreatorInsight } from '@/types';

// Mock child components
vi.mock('@/components/creator/analyze-button', () => ({
  AnalyzeButton: ({ creatorId, onComplete }: any) => (
    <button
      data-testid="analyze-button"
      onClick={() => {
        const mockInsight: CreatorInsight = {
          creatorId,
          analyzedAt: '2024-01-01',
          topCategories: [
            { category: 'Beauty', score: 85, salesCount: 100, totalRevenue: 5000000 },
            { category: 'Fashion', score: 75, salesCount: 80, totalRevenue: 4000000 },
          ],
          priceRange: {
            min: 10000,
            max: 100000,
            sweetSpot: 50000,
            distribution: [
              { range: '0-30k', count: 30, revenue: 600000 },
              { range: '30-50k', count: 50, revenue: 2000000 },
              { range: '50k+', count: 20, revenue: 1500000 },
            ],
          },
          seasonalPattern: [
            { month: 1, salesCount: 50, revenue: 2500000, topCategory: 'Beauty' },
            { month: 2, salesCount: 60, revenue: 3000000, topCategory: 'Fashion' },
          ],
          conversionMetrics: {
            avgConversionRate: 3.5,
            bestConversionCategory: 'Beauty',
            followerToPurchaseRatio: 2.5,
          },
          summary: 'Test summary',
          strengths: ['Strong in Beauty', 'High engagement'],
          recommendations: ['Try Fashion products', 'Focus on mid-price range'],
        };
        onComplete(mockInsight);
      }}
    >
      분석 시작
    </button>
  ),
}));

vi.mock('@/components/creator/insight-summary', () => ({
  InsightSummary: ({ insight }: any) => (
    <div data-testid="insight-summary">
      <div>Summary: {insight.summary}</div>
      <div>Strengths: {insight.strengths.join(', ')}</div>
      <div>Recommendations: {insight.recommendations.join(', ')}</div>
    </div>
  ),
}));

vi.mock('@/components/charts/category-chart', () => ({
  CategoryChart: ({ data }: any) => (
    <div data-testid="category-chart">
      {data.map((item: any) => (
        <div key={item.category}>
          {item.category}: {item.score}
        </div>
      ))}
    </div>
  ),
}));

vi.mock('@/components/charts/price-distribution', () => ({
  PriceDistribution: ({ data }: any) => (
    <div data-testid="price-distribution">
      {data.map((item: any) => (
        <div key={item.range}>
          {item.range}: {item.count}
        </div>
      ))}
    </div>
  ),
}));

vi.mock('@/components/charts/seasonal-trend', () => ({
  SeasonalTrend: ({ data }: any) => (
    <div data-testid="seasonal-trend">
      {data.map((item: any) => (
        <div key={item.month}>
          Month {item.month}: {item.salesCount}
        </div>
      ))}
    </div>
  ),
}));

describe('AnalysisSection', () => {
  const creatorId = 'creator-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State (No Analysis)', () => {
    it('should render section header', () => {
      render(<AnalysisSection creatorId={creatorId} />);

      expect(screen.getByText('AI 성과 분석')).toBeInTheDocument();
    });

    it('should render analyze button in header when no insight', () => {
      render(<AnalysisSection creatorId={creatorId} />);

      const buttons = screen.getAllByTestId('analyze-button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should show empty state with description', () => {
      render(<AnalysisSection creatorId={creatorId} />);

      expect(screen.getByText('AI 분석을 시작하세요')).toBeInTheDocument();
      expect(
        screen.getByText(/크리에이터의 판매 데이터를 AI가 분석하여/)
      ).toBeInTheDocument();
    });

    it('should render analyze button in empty state', () => {
      render(<AnalysisSection creatorId={creatorId} />);

      const buttons = screen.getAllByTestId('analyze-button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should have gradient background in empty state', () => {
      const { container } = render(<AnalysisSection creatorId={creatorId} />);

      const gradientDiv = container.querySelector('.bg-gradient-to-br.from-blue-50');
      expect(gradientDiv).toBeInTheDocument();
    });
  });

  describe('After Analysis', () => {
    it('should show insight summary after analysis', () => {
      render(<AnalysisSection creatorId={creatorId} />);

      const analyzeButton = screen.getAllByTestId('analyze-button')[0];
      fireEvent.click(analyzeButton);

      expect(screen.getByTestId('insight-summary')).toBeInTheDocument();
      expect(screen.getByText(/Summary: Test summary/)).toBeInTheDocument();
    });

    it('should show category chart', () => {
      render(<AnalysisSection creatorId={creatorId} />);

      const analyzeButton = screen.getAllByTestId('analyze-button')[0];
      fireEvent.click(analyzeButton);

      expect(screen.getByTestId('category-chart')).toBeInTheDocument();
      expect(screen.getByText(/Beauty: 85/)).toBeInTheDocument();
      expect(screen.getByText(/Fashion: 75/)).toBeInTheDocument();
    });

    it('should show price distribution chart', () => {
      render(<AnalysisSection creatorId={creatorId} />);

      const analyzeButton = screen.getAllByTestId('analyze-button')[0];
      fireEvent.click(analyzeButton);

      expect(screen.getByTestId('price-distribution')).toBeInTheDocument();
      expect(screen.getByText(/30-50k: 50/)).toBeInTheDocument();
    });

    it('should show seasonal trend chart', () => {
      render(<AnalysisSection creatorId={creatorId} />);

      const analyzeButton = screen.getAllByTestId('analyze-button')[0];
      fireEvent.click(analyzeButton);

      expect(screen.getByTestId('seasonal-trend')).toBeInTheDocument();
      expect(screen.getByText(/Month 1: 50/)).toBeInTheDocument();
      expect(screen.getByText(/Month 2: 60/)).toBeInTheDocument();
    });

    it('should display conversion metrics', () => {
      render(<AnalysisSection creatorId={creatorId} />);

      const analyzeButton = screen.getAllByTestId('analyze-button')[0];
      fireEvent.click(analyzeButton);

      expect(screen.getByText('전환 지표')).toBeInTheDocument();
      expect(screen.getByText('평균 전환율')).toBeInTheDocument();
      expect(screen.getByText('3.50%')).toBeInTheDocument();
      expect(screen.getByText('최고 전환 카테고리')).toBeInTheDocument();
      expect(screen.getByText('Beauty')).toBeInTheDocument();
      expect(screen.getByText('팔로워당 구매 비율')).toBeInTheDocument();
      expect(screen.getByText('2.50%')).toBeInTheDocument();
    });

    it('should show re-analyze button after analysis', () => {
      render(<AnalysisSection creatorId={creatorId} />);

      const analyzeButton = screen.getAllByTestId('analyze-button')[0];
      fireEvent.click(analyzeButton);

      expect(screen.getByText('다시 분석하기')).toBeInTheDocument();
    });

    it('should hide analyze button in header after analysis', () => {
      render(<AnalysisSection creatorId={creatorId} />);

      const analyzeButton = screen.getAllByTestId('analyze-button')[0];
      fireEvent.click(analyzeButton);

      // The analyze button should no longer be in the header
      expect(screen.queryByTestId('analyze-button')).not.toBeInTheDocument();
    });

    it('should have chart titles', () => {
      render(<AnalysisSection creatorId={creatorId} />);

      const analyzeButton = screen.getAllByTestId('analyze-button')[0];
      fireEvent.click(analyzeButton);

      expect(screen.getByText('카테고리별 성과')).toBeInTheDocument();
      expect(screen.getByText('가격대별 판매 분포')).toBeInTheDocument();
      expect(screen.getByText('시즌별 판매 트렌드')).toBeInTheDocument();
    });
  });

  describe('Re-analyze', () => {
    it('should reset to empty state when re-analyze clicked', () => {
      render(<AnalysisSection creatorId={creatorId} />);

      const analyzeButton = screen.getAllByTestId('analyze-button')[0];
      fireEvent.click(analyzeButton);

      const reAnalyzeButton = screen.getByText('다시 분석하기');
      fireEvent.click(reAnalyzeButton);

      expect(screen.queryByTestId('insight-summary')).not.toBeInTheDocument();
      expect(screen.getByText('AI 분석을 시작하세요')).toBeInTheDocument();
    });

    it('should show analyze button again after reset', () => {
      render(<AnalysisSection creatorId={creatorId} />);

      const analyzeButton = screen.getAllByTestId('analyze-button')[0];
      fireEvent.click(analyzeButton);

      const reAnalyzeButton = screen.getByText('다시 분석하기');
      fireEvent.click(reAnalyzeButton);

      expect(screen.getAllByTestId('analyze-button').length).toBeGreaterThan(0);
    });

    it('should hide charts after reset', () => {
      render(<AnalysisSection creatorId={creatorId} />);

      const analyzeButton = screen.getAllByTestId('analyze-button')[0];
      fireEvent.click(analyzeButton);

      const reAnalyzeButton = screen.getByText('다시 분석하기');
      fireEvent.click(reAnalyzeButton);

      expect(screen.queryByTestId('category-chart')).not.toBeInTheDocument();
      expect(screen.queryByTestId('price-distribution')).not.toBeInTheDocument();
      expect(screen.queryByTestId('seasonal-trend')).not.toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('should use grid layout for charts', () => {
      render(<AnalysisSection creatorId={creatorId} />);

      const analyzeButton = screen.getAllByTestId('analyze-button')[0];
      fireEvent.click(analyzeButton);

      const { container } = render(<AnalysisSection creatorId={creatorId} />);
      const analyzeBtn = container.querySelectorAll('[data-testid="analyze-button"]')[0];
      fireEvent.click(analyzeBtn);

      const gridContainer = container.querySelector('.grid.grid-cols-1.lg\\:grid-cols-2');
      expect(gridContainer).toBeInTheDocument();
    });

    it('should have proper spacing', () => {
      const { container } = render(<AnalysisSection creatorId={creatorId} />);

      expect(container.firstChild).toHaveClass('space-y-6');
    });
  });

  describe('Custom className', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <AnalysisSection creatorId={creatorId} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('should preserve default classes when custom className applied', () => {
      const { container } = render(
        <AnalysisSection creatorId={creatorId} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('space-y-6');
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Icons', () => {
    it('should render Sparkles icon in header', () => {
      const { container } = render(<AnalysisSection creatorId={creatorId} />);

      const sparklesIcon = container.querySelector('svg');
      expect(sparklesIcon).toBeInTheDocument();
    });

    it('should render Sparkles icon in empty state', () => {
      render(<AnalysisSection creatorId={creatorId} />);

      const emptyStateContainer = screen.getByText('AI 분석을 시작하세요').closest('div');
      expect(emptyStateContainer).toBeInTheDocument();
    });
  });

  describe('Conversion Metrics Display', () => {
    it('should display metrics with correct formatting', () => {
      render(<AnalysisSection creatorId={creatorId} />);

      const analyzeButton = screen.getAllByTestId('analyze-button')[0];
      fireEvent.click(analyzeButton);

      // Check decimal formatting
      expect(screen.getByText('3.50%')).toBeInTheDocument();
      expect(screen.getByText('2.50%')).toBeInTheDocument();
    });

    it('should have colored backgrounds for metrics', () => {
      const { container } = render(<AnalysisSection creatorId={creatorId} />);

      const analyzeButton = screen.getAllByTestId('analyze-button')[0];
      fireEvent.click(analyzeButton);

      const blueMetric = container.querySelector('.bg-blue-50');
      const greenMetric = container.querySelector('.bg-green-50');
      const purpleMetric = container.querySelector('.bg-purple-50');

      expect(blueMetric).toBeInTheDocument();
      expect(greenMetric).toBeInTheDocument();
      expect(purpleMetric).toBeInTheDocument();
    });
  });
});
