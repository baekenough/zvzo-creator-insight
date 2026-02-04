import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MatchSection } from '@/components/match/match-section';
import type { Creator, ProductMatch } from '@/types';

// Mock child components
vi.mock('@/components/match/match-card', () => ({
  MatchCard: ({ match, expandable }: any) => (
    <div data-testid={`match-card-${match.product.id}`}>
      <h3>{match.product.name}</h3>
      <span>Score: {match.matchScore}</span>
      {expandable && <span>Expandable</span>}
    </div>
  ),
}));

vi.mock('@/components/match/compare-modal', () => ({
  CompareModal: ({ matches, open, onClose }: any) =>
    open ? (
      <div data-testid="compare-modal">
        <button onClick={onClose}>Close</button>
        <div>Comparing {matches.length} products</div>
      </div>
    ) : null,
}));

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('MatchSection', () => {
  const mockCreator: Creator = {
    id: 'creator-123',
    name: 'Alice Kim',
    profileImage: '/alice.jpg',
    platform: 'instagram' as const,
    followers: 50000,
    engagementRate: 3.5,
    categories: ['Beauty', 'Fashion', 'Lifestyle'],
    joinedAt: '2023-01-01',
    totalSales: 100,
    totalRevenue: 5000000,
  };

  const mockMatches: ProductMatch[] = [
    {
      product: {
        id: 'product-1',
        name: 'Lipstick A',
        brand: 'Brand A',
        category: 'Beauty',
        subcategory: 'Makeup',
        price: 25000,
        originalPrice: 30000,
        description: 'Test product 1',
        imageUrl: '/product1.jpg',
        tags: ['vegan', 'cruelty-free'],
        targetAudience: ['women', '20-30'],
        seasonality: ['all'],
        avgCommissionRate: 10,
      },
      matchScore: 92,
      matchBreakdown: {
        categoryFit: 95,
        priceFit: 90,
        seasonFit: 88,
        audienceFit: 95,
      },
      predictedRevenue: {
        minimum: 1000000,
        expected: 1500000,
        maximum: 2000000,
        predictedQuantity: 60,
        predictedCommission: 150000,
        basis: 'Historical data',
      },
      reasoning: 'Great match for beauty category',
      confidence: 85,
    },
    {
      product: {
        id: 'product-2',
        name: 'Sunscreen B',
        brand: 'Brand B',
        category: 'Beauty',
        subcategory: 'Skincare',
        price: 30000,
        originalPrice: 35000,
        description: 'Test product 2',
        imageUrl: '/product2.jpg',
        tags: ['SPF50', 'waterproof'],
        targetAudience: ['women', '20-40'],
        seasonality: ['summer'],
        avgCommissionRate: 12,
      },
      matchScore: 88,
      matchBreakdown: {
        categoryFit: 92,
        priceFit: 85,
        seasonFit: 90,
        audienceFit: 85,
      },
      predictedRevenue: {
        minimum: 900000,
        expected: 1300000,
        maximum: 1800000,
        predictedQuantity: 45,
        predictedCommission: 135000,
        basis: 'AI prediction',
      },
      reasoning: 'Good seasonal product',
      confidence: 80,
    },
    {
      product: {
        id: 'product-3',
        name: 'Face Mask C',
        brand: 'Brand C',
        category: 'Beauty',
        subcategory: 'Skincare',
        price: 15000,
        originalPrice: 18000,
        description: 'Test product 3',
        imageUrl: '/product3.jpg',
        tags: ['hydrating', 'sheet-mask'],
        targetAudience: ['women', '20-30'],
        seasonality: ['all'],
        avgCommissionRate: 8,
      },
      matchScore: 85,
      matchBreakdown: {
        categoryFit: 88,
        priceFit: 82,
        seasonFit: 85,
        audienceFit: 85,
      },
      predictedRevenue: {
        minimum: 700000,
        expected: 1000000,
        maximum: 1400000,
        predictedQuantity: 65,
        predictedCommission: 80000,
        basis: 'Similar creators',
      },
      reasoning: 'Affordable price point',
      confidence: 75,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: mockMatches,
      }),
    });
  });

  describe('Initial Loading State', () => {
    it('should show loading spinner on mount', () => {
      render(<MatchSection creator={mockCreator} />);

      expect(screen.getByText('AI가 최적의 제품을 찾고 있습니다...')).toBeInTheDocument();
    });

    it('should show loading message', () => {
      render(<MatchSection creator={mockCreator} />);

      expect(screen.getByText('잠시만 기다려주세요')).toBeInTheDocument();
    });

    it('should call fetch on mount', async () => {
      render(<MatchSection creator={mockCreator} />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ creatorId: mockCreator.id }),
        });
      });
    });
  });

  describe('Success State', () => {
    it('should render match cards after successful fetch', async () => {
      render(<MatchSection creator={mockCreator} />);

      await waitFor(() => {
        expect(screen.getByTestId('match-card-product-1')).toBeInTheDocument();
        expect(screen.getByTestId('match-card-product-2')).toBeInTheDocument();
        expect(screen.getByTestId('match-card-product-3')).toBeInTheDocument();
      });
    });

    it('should show creator summary sidebar', async () => {
      render(<MatchSection creator={mockCreator} />);

      await waitFor(() => {
        expect(screen.getByText('크리에이터 요약')).toBeInTheDocument();
        expect(screen.getByText('Alice Kim')).toBeInTheDocument();
      });
    });

    it('should display top 3 categories', async () => {
      render(<MatchSection creator={mockCreator} />);

      await waitFor(() => {
        expect(screen.getByText('강점 카테고리')).toBeInTheDocument();
        expect(screen.getByText('Beauty')).toBeInTheDocument();
        expect(screen.getByText('Fashion')).toBeInTheDocument();
        expect(screen.getByText('Lifestyle')).toBeInTheDocument();
      });
    });

    it('should render page title and description', async () => {
      render(<MatchSection creator={mockCreator} />);

      await waitFor(() => {
        expect(screen.getByText('AI 제품 매칭')).toBeInTheDocument();
        expect(screen.getByText(/Alice Kim님에게 최적화된 제품을 AI가 추천합니다/)).toBeInTheDocument();
      });
    });

    it('should render back link to creator detail', async () => {
      render(<MatchSection creator={mockCreator} />);

      await waitFor(() => {
        const backLink = screen.getByText('크리에이터 상세로 돌아가기');
        expect(backLink).toBeInTheDocument();
        expect(backLink.closest('a')).toHaveAttribute('href', `/creator/${mockCreator.id}`);
      });
    });

    it('should render checkboxes for each product', async () => {
      render(<MatchSection creator={mockCreator} />);

      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes).toHaveLength(3);
      });
    });

    it('should limit to 5 match cards', async () => {
      const manyMatches = Array.from({ length: 10 }, (_, i) => ({
        ...mockMatches[0],
        product: { ...mockMatches[0].product, id: `product-${i}` },
      }));

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: manyMatches,
        }),
      });

      render(<MatchSection creator={mockCreator} />);

      await waitFor(() => {
        const cards = screen.getAllByTestId(/match-card-/);
        expect(cards.length).toBe(5);
      });
    });
  });

  describe('Error State', () => {
    it('should show error message on fetch failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ success: false, error: 'Server error' }),
      });

      render(<MatchSection creator={mockCreator} />);

      await waitFor(() => {
        expect(screen.getByText('매칭 실패')).toBeInTheDocument();
        expect(screen.getByText(/API request failed: 500/)).toBeInTheDocument();
      });
    });

    it('should show retry button on error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ success: false }),
      });

      render(<MatchSection creator={mockCreator} />);

      await waitFor(() => {
        expect(screen.getByText('다시 시도')).toBeInTheDocument();
      });
    });

    it('should retry fetch when retry button clicked', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({ success: false }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ success: true, data: mockMatches }),
        });

      render(<MatchSection creator={mockCreator} />);

      await waitFor(() => {
        expect(screen.getByText('다시 시도')).toBeInTheDocument();
      });

      const retryButton = screen.getByText('다시 시도');
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.getByTestId('match-card-product-1')).toBeInTheDocument();
      });
    });

    it('should handle API response with success:false', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: false,
          error: 'Custom error message',
        }),
      });

      render(<MatchSection creator={mockCreator} />);

      await waitFor(() => {
        expect(screen.getByText('Custom error message')).toBeInTheDocument();
      });
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      render(<MatchSection creator={mockCreator} />);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    it('should show default error message when success:false without error property', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: false,
          // No error property
        }),
      });

      render(<MatchSection creator={mockCreator} />);

      await waitFor(() => {
        expect(screen.getByText('Failed to fetch matches')).toBeInTheDocument();
      });
    });

    it('should handle non-Error exceptions', async () => {
      mockFetch.mockRejectedValueOnce('String error');

      render(<MatchSection creator={mockCreator} />);

      await waitFor(() => {
        expect(screen.getByText('Unknown error occurred')).toBeInTheDocument();
      });
    });
  });

  describe('Empty Results', () => {
    it('should show no results message when matches array is empty', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: [],
        }),
      });

      render(<MatchSection creator={mockCreator} />);

      await waitFor(() => {
        expect(screen.getByText('매칭된 제품이 없습니다')).toBeInTheDocument();
      });
    });
  });

  describe('Product Selection', () => {
    it('should select product when checkbox clicked', async () => {
      render(<MatchSection creator={mockCreator} />);

      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        fireEvent.click(checkboxes[0]);
        expect(checkboxes[0]).toBeChecked();
      });
    });

    it('should deselect product when checkbox clicked again', async () => {
      render(<MatchSection creator={mockCreator} />);

      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        fireEvent.click(checkboxes[0]);
        fireEvent.click(checkboxes[0]);
        expect(checkboxes[0]).not.toBeChecked();
      });
    });

    it('should show selection count', async () => {
      render(<MatchSection creator={mockCreator} />);

      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        fireEvent.click(checkboxes[0]);
        fireEvent.click(checkboxes[1]);
      });

      await waitFor(() => {
        expect(screen.getByText('2개 상품 선택됨')).toBeInTheDocument();
      });
    });

    it('should show compare bar when products are selected', async () => {
      render(<MatchSection creator={mockCreator} />);

      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        fireEvent.click(checkboxes[0]);
      });

      await waitFor(() => {
        expect(screen.getByText('비교하기')).toBeInTheDocument();
      });
    });

    it('should hide compare bar when no products selected', async () => {
      render(<MatchSection creator={mockCreator} />);

      await waitFor(() => {
        expect(screen.queryByText('비교하기')).not.toBeInTheDocument();
      });
    });
  });

  describe('Compare Functionality', () => {
    it('should disable compare button when less than 2 products selected', async () => {
      render(<MatchSection creator={mockCreator} />);

      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        fireEvent.click(checkboxes[0]);
      });

      await waitFor(() => {
        const compareButton = screen.getByText('비교하기');
        expect(compareButton).toBeDisabled();
      });
    });

    it('should enable compare button when 2 products selected', async () => {
      render(<MatchSection creator={mockCreator} />);

      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        fireEvent.click(checkboxes[0]);
        fireEvent.click(checkboxes[1]);
      });

      await waitFor(() => {
        const compareButton = screen.getByText('비교하기');
        expect(compareButton).not.toBeDisabled();
      });
    });

    it('should enable compare button when 3 products selected', async () => {
      render(<MatchSection creator={mockCreator} />);

      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        fireEvent.click(checkboxes[0]);
        fireEvent.click(checkboxes[1]);
        fireEvent.click(checkboxes[2]);
      });

      await waitFor(() => {
        const compareButton = screen.getByText('비교하기');
        expect(compareButton).not.toBeDisabled();
      });
    });

    it('should show helper text when wrong number of products selected', async () => {
      render(<MatchSection creator={mockCreator} />);

      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        fireEvent.click(checkboxes[0]);
      });

      await waitFor(() => {
        expect(screen.getByText('2~3개의 상품을 선택해주세요')).toBeInTheDocument();
      });
    });

    it('should open compare modal when compare button clicked', async () => {
      render(<MatchSection creator={mockCreator} />);

      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        fireEvent.click(checkboxes[0]);
        fireEvent.click(checkboxes[1]);
      });

      const compareButton = screen.getByText('비교하기');
      fireEvent.click(compareButton);

      await waitFor(() => {
        expect(screen.getByTestId('compare-modal')).toBeInTheDocument();
      });
    });

    it('should pass selected matches to compare modal', async () => {
      render(<MatchSection creator={mockCreator} />);

      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        fireEvent.click(checkboxes[0]);
        fireEvent.click(checkboxes[1]);
      });

      const compareButton = screen.getByText('비교하기');
      fireEvent.click(compareButton);

      await waitFor(() => {
        expect(screen.getByText('Comparing 2 products')).toBeInTheDocument();
      });
    });

    it('should close modal when close button clicked', async () => {
      render(<MatchSection creator={mockCreator} />);

      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        fireEvent.click(checkboxes[0]);
        fireEvent.click(checkboxes[1]);
      });

      const compareButton = screen.getByText('비교하기');
      fireEvent.click(compareButton);

      await waitFor(() => {
        const closeButton = screen.getByText('Close');
        fireEvent.click(closeButton);
      });

      await waitFor(() => {
        expect(screen.queryByTestId('compare-modal')).not.toBeInTheDocument();
      });
    });
  });

  describe('Multiple Selections', () => {
    it('should handle selecting all products', async () => {
      render(<MatchSection creator={mockCreator} />);

      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        checkboxes.forEach((checkbox) => fireEvent.click(checkbox));
      });

      await waitFor(() => {
        expect(screen.getByText('3개 상품 선택됨')).toBeInTheDocument();
      });
    });

    it('should track selection state independently', async () => {
      render(<MatchSection creator={mockCreator} />);

      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        fireEvent.click(checkboxes[0]);
        fireEvent.click(checkboxes[2]);
      });

      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes[0]).toBeChecked();
        expect(checkboxes[1]).not.toBeChecked();
        expect(checkboxes[2]).toBeChecked();
      });
    });
  });

  describe('Re-fetch on creator change', () => {
    it('should fetch new matches when creator id changes', async () => {
      const { rerender } = render(<MatchSection creator={mockCreator} />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      const newCreator = { ...mockCreator, id: 'creator-456' };
      rerender(<MatchSection creator={newCreator} />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2);
        expect(mockFetch).toHaveBeenLastCalledWith('/api/match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ creatorId: 'creator-456' }),
        });
      });
    });
  });
});
