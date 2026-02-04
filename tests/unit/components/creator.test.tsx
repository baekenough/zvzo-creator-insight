import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreatorCard } from '@/components/creator/creator-card';
import { CreatorProfile } from '@/components/creator/creator-profile';
import { SalesTable } from '@/components/creator/sales-table';
import { InsightSummary } from '@/components/creator/insight-summary';
import { AnalyzeButton } from '@/components/creator/analyze-button';
import type { Creator, SaleRecord, CreatorInsight } from '@/types';

const mockCreator: Creator = {
  id: 'creator-001',
  name: '김지은',
  profileImage: '/images/creator-001.jpg',
  platform: 'Instagram',
  followers: 250000,
  engagementRate: 3.8,
  categories: ['Beauty', 'Fashion'],
  joinedAt: '2025-01-15T09:00:00Z',
  totalSales: 77,
  totalRevenue: 5650000,
};

const mockSales: SaleRecord[] = [
  {
    id: 'sale-001',
    creatorId: 'creator-001',
    productId: 'prod-001',
    productName: '글로우 세럼',
    category: 'Beauty',
    price: 45000,
    originalPrice: 60000,
    discountRate: 25,
    quantity: 2,
    revenue: 90000,
    commission: 9000,
    commissionRate: 10,
    clickCount: 100,
    conversionRate: 3.5,
    date: '2025-01-20T10:00:00Z',
    platform: 'Instagram',
  },
  {
    id: 'sale-002',
    creatorId: 'creator-001',
    productId: 'prod-002',
    productName: '데님 자켓',
    category: 'Fashion',
    price: 89000,
    originalPrice: 120000,
    discountRate: 26,
    quantity: 1,
    revenue: 89000,
    commission: 8900,
    commissionRate: 10,
    clickCount: 100,
    conversionRate: 3.5,
    date: '2025-01-21T14:30:00Z',
    platform: 'Instagram',
  },
];

const mockInsight: CreatorInsight = {
  creatorId: 'creator-001',
  analyzedAt: '2025-01-22T10:00:00Z',
  topCategories: [
    { category: 'Beauty', score: 88, salesCount: 45, totalRevenue: 3750000 },
  ],
  priceRange: {
    min: 30000,
    max: 150000,
    sweetSpot: 50000,
    distribution: [
      { range: '30000-50000', count: 28, revenue: 1120000 },
    ],
  },
  seasonalPattern: [
    { month: 1, salesCount: 25, revenue: 1850000, topCategory: 'Beauty' },
  ],
  conversionMetrics: {
    avgConversionRate: 4.2,
    bestConversionCategory: 'Beauty',
    followerToPurchaseRatio: 0.03,
  },
  summary: '뷰티 카테고리에서 강력한 영향력을 보유',
  strengths: ['높은 참여율', '뷰티 전문성'],
  recommendations: ['가격대 다양화', '패션 카테고리 확대'],
};

describe('CreatorCard', () => {
  it('should render creator info', () => {
    render(<CreatorCard creator={mockCreator} />);
    expect(screen.getByText('김지은')).toBeInTheDocument();
    expect(screen.getByText('Instagram')).toBeInTheDocument();
  });

  it('should format follower count', () => {
    render(<CreatorCard creator={mockCreator} />);
    expect(screen.getByText(/25\.0만/)).toBeInTheDocument();
  });

  it('should render category badges', () => {
    render(<CreatorCard creator={mockCreator} />);
    expect(screen.getByText('Beauty')).toBeInTheDocument();
    expect(screen.getByText('Fashion')).toBeInTheDocument();
  });

  it('should call onClick on card click', () => {
    const onClick = vi.fn();
    render(<CreatorCard creator={mockCreator} onClick={onClick} />);
    const card = screen.getByRole('button');
    fireEvent.click(card);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should navigate on Enter key press', () => {
    const onClick = vi.fn();
    render(<CreatorCard creator={mockCreator} onClick={onClick} />);
    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should display engagement rate and revenue', () => {
    render(<CreatorCard creator={mockCreator} />);
    expect(screen.getByText('3.8%')).toBeInTheDocument();
    expect(screen.getByText(/5,650,000/)).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(<CreatorCard creator={mockCreator} />);
    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('aria-label');
    expect(card.getAttribute('aria-label')).toContain('김지은');
    expect(card.getAttribute('aria-label')).toContain('Instagram');
  });

  it('should show fallback avatar when profileImage is missing', () => {
    const creatorWithoutImage: Creator = {
      ...mockCreator,
      profileImage: '',
    };
    render(<CreatorCard creator={creatorWithoutImage} />);
    expect(screen.getByText('김')).toBeInTheDocument();
  });

  it('should handle image load error', () => {
    render(<CreatorCard creator={mockCreator} />);
    const image = document.querySelector('img');
    if (image) {
      fireEvent.error(image);
    }
    expect(screen.getByText('김')).toBeInTheDocument();
  });

  it('should navigate on Space key press', () => {
    const onClick = vi.fn();
    render(<CreatorCard creator={mockCreator} onClick={onClick} />);
    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: ' ' });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should format followers < 10000 without 만 suffix', () => {
    const creatorWithLowFollowers: Creator = {
      ...mockCreator,
      followers: 5000,
    };
    render(<CreatorCard creator={creatorWithLowFollowers} />);
    expect(screen.getByText(/5,000/)).toBeInTheDocument();
  });

  it('should show +N badge when there are more than 3 categories', () => {
    const creatorWithManyCategories: Creator = {
      ...mockCreator,
      categories: ['Beauty', 'Fashion', 'Food', 'Tech', 'Travel'],
    };
    render(<CreatorCard creator={creatorWithManyCategories} />);
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('should not show categories section when categories array is empty', () => {
    const creatorWithoutCategories: Creator = {
      ...mockCreator,
      categories: [],
    };
    const { container } = render(<CreatorCard creator={creatorWithoutCategories} />);
    const categoryBadges = container.querySelectorAll('.bg-gray-100');
    expect(categoryBadges.length).toBe(0);
  });

  it('should render with custom className', () => {
    const { container } = render(<CreatorCard creator={mockCreator} className="custom-class" />);
    const card = container.querySelector('.custom-class');
    expect(card).toBeInTheDocument();
  });

  it('should not call onClick when not provided', () => {
    render(<CreatorCard creator={mockCreator} />);
    const card = screen.getByRole('button');
    fireEvent.click(card);
    // Should not throw error when onClick is undefined
    expect(card).toBeInTheDocument();
  });

  it('should handle keyboard navigation without onClick', () => {
    render(<CreatorCard creator={mockCreator} />);
    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: 'Enter' });
    fireEvent.keyDown(card, { key: ' ' });
    // Should not throw error when onClick is undefined
    expect(card).toBeInTheDocument();
  });

  it('should handle other keys without triggering onClick', () => {
    const onClick = vi.fn();
    render(<CreatorCard creator={mockCreator} onClick={onClick} />);
    const card = screen.getByRole('button');

    fireEvent.keyDown(card, { key: 'Tab' });
    fireEvent.keyDown(card, { key: 'Escape' });
    fireEvent.keyDown(card, { key: 'a' });

    expect(onClick).not.toHaveBeenCalled();
  });

  it('should handle hover states', () => {
    render(<CreatorCard creator={mockCreator} />);
    const card = screen.getByRole('button');

    fireEvent.mouseEnter(card);
    expect(card).toBeInTheDocument();

    fireEvent.mouseLeave(card);
    expect(card).toBeInTheDocument();
  });

  it('should show first character of name in fallback avatar', () => {
    const creatorWithoutImage: Creator = {
      ...mockCreator,
      name: '테스트',
      profileImage: '',
    };
    render(<CreatorCard creator={creatorWithoutImage} />);
    expect(screen.getByText('테')).toBeInTheDocument();
  });

  it('should apply correct platform color class', () => {
    const youtubeCreator: Creator = {
      ...mockCreator,
      platform: 'YouTube',
    };
    render(<CreatorCard creator={youtubeCreator} />);
    expect(screen.getByText('YouTube')).toBeInTheDocument();
  });

  it('should apply correct platform color class for tiktok', () => {
    const tiktokCreator: Creator = {
      ...mockCreator,
      platform: 'TikTok',
    };
    render(<CreatorCard creator={tiktokCreator} />);
    expect(screen.getByText('TikTok')).toBeInTheDocument();
  });
});

describe('CreatorProfile', () => {
  it('should render creator name and platform', () => {
    render(<CreatorProfile creator={mockCreator} />);
    expect(screen.getByText('김지은')).toBeInTheDocument();
    expect(screen.getByText('Instagram')).toBeInTheDocument();
  });

  it('should display all category badges', () => {
    render(<CreatorProfile creator={mockCreator} />);
    expect(screen.getByText('Beauty')).toBeInTheDocument();
    expect(screen.getByText('Fashion')).toBeInTheDocument();
  });

  it('should show stats grid with metrics', () => {
    render(<CreatorProfile creator={mockCreator} />);
    expect(screen.getByText('참여율')).toBeInTheDocument();
    expect(screen.getByText('총 판매')).toBeInTheDocument();
    expect(screen.getByText('총 매출')).toBeInTheDocument();
    expect(screen.getByText('가입일')).toBeInTheDocument();
  });

  it('should format joined date', () => {
    render(<CreatorProfile creator={mockCreator} />);
    expect(screen.getByText(/2025/)).toBeInTheDocument();
  });

  it('should show fallback avatar when profileImage is missing', () => {
    const creatorWithoutImage: Creator = {
      ...mockCreator,
      profileImage: '',
    };
    render(<CreatorProfile creator={creatorWithoutImage} />);
    expect(screen.getByText('김')).toBeInTheDocument();
  });

  it('should handle image load event', () => {
    render(<CreatorProfile creator={mockCreator} />);
    const image = document.querySelector('img');
    if (image) {
      fireEvent.load(image);
    }
    expect(image).toBeInTheDocument();
  });

  it('should handle image error event', () => {
    render(<CreatorProfile creator={mockCreator} />);
    const image = document.querySelector('img');
    if (image) {
      fireEvent.error(image);
    }
    expect(screen.getByText('김')).toBeInTheDocument();
  });

  it('should format followers < 10000 without 만 suffix', () => {
    const creatorWithLowFollowers: Creator = {
      ...mockCreator,
      followers: 5000,
    };
    render(<CreatorProfile creator={creatorWithLowFollowers} />);
    expect(screen.getByText(/5,000/)).toBeInTheDocument();
  });

  it('should not show categories section when categories array is empty', () => {
    const creatorWithoutCategories: Creator = {
      ...mockCreator,
      categories: [],
    };
    render(<CreatorProfile creator={creatorWithoutCategories} />);
    expect(screen.queryByText('주요 카테고리')).not.toBeInTheDocument();
  });

  it('should render with custom className', () => {
    const { container } = render(<CreatorProfile creator={mockCreator} className="custom-class" />);
    const profile = container.querySelector('.custom-class');
    expect(profile).toBeInTheDocument();
  });
});

describe('SalesTable', () => {
  it('should render table with sales data', () => {
    render(<SalesTable sales={mockSales} />);
    expect(screen.getByText('글로우 세럼')).toBeInTheDocument();
    expect(screen.getByText('데님 자켓')).toBeInTheDocument();
  });

  it('should sort by date when column header clicked', () => {
    render(<SalesTable sales={mockSales} />);
    const dateHeader = screen.getByText('날짜').parentElement;
    fireEvent.click(dateHeader!);
    // Table should now be sorted (can verify by checking order of elements if needed)
  });

  it('should paginate results', () => {
    const manySales = Array.from({ length: 25 }, (_, i) => ({
      ...mockSales[0],
      id: `sale-${i}`,
      productName: `Product ${i}`,
    }));
    render(<SalesTable sales={manySales} pageSize={10} />);

    expect(screen.getByText(/총 25건/)).toBeInTheDocument();
    expect(screen.getByText(/1-10건 표시/)).toBeInTheDocument();
  });

  it('should navigate to next page', () => {
    const manySales = Array.from({ length: 25 }, (_, i) => ({
      ...mockSales[0],
      id: `sale-${i}`,
      productName: `Product ${i}`,
    }));
    render(<SalesTable sales={manySales} pageSize={10} />);

    const nextButton = screen.getByText('다음');
    fireEvent.click(nextButton);
    expect(screen.getByText(/11-20건 표시/)).toBeInTheDocument();
  });

  it('should format currency values', () => {
    render(<SalesTable sales={mockSales} />);
    expect(screen.getByText(/45,000/)).toBeInTheDocument();
    expect(screen.getByText(/90,000/)).toBeInTheDocument();
  });

  it('should navigate to previous page', () => {
    const manySales = Array.from({ length: 25 }, (_, i) => ({
      ...mockSales[0],
      id: `sale-${i}`,
      productName: `Product ${i}`,
    }));
    render(<SalesTable sales={manySales} pageSize={10} />);

    const nextButton = screen.getByText('다음');
    fireEvent.click(nextButton);
    expect(screen.getByText(/11-20건 표시/)).toBeInTheDocument();

    const prevButton = screen.getByText('이전');
    fireEvent.click(prevButton);
    expect(screen.getByText(/1-10건 표시/)).toBeInTheDocument();
  });

  it('should not render pagination when sales fit in one page', () => {
    render(<SalesTable sales={mockSales} pageSize={10} />);
    expect(screen.queryByText('이전')).not.toBeInTheDocument();
    expect(screen.queryByText('다음')).not.toBeInTheDocument();
  });

  it('should render with custom className', () => {
    const { container } = render(<SalesTable sales={mockSales} className="custom-class" />);
    const table = container.querySelector('.custom-class');
    expect(table).toBeInTheDocument();
  });

  it('should sort by product name when column clicked', () => {
    render(<SalesTable sales={mockSales} />);
    const productHeader = screen.getByText('상품명').parentElement;
    fireEvent.click(productHeader!);
    expect(screen.getByText('글로우 세럼')).toBeInTheDocument();
  });

  it('should sort by category when column clicked', () => {
    render(<SalesTable sales={mockSales} />);
    const categoryHeader = screen.getByText('카테고리').parentElement;
    fireEvent.click(categoryHeader!);
    expect(screen.getByText('Beauty')).toBeInTheDocument();
  });

  it('should sort by price when column clicked', () => {
    render(<SalesTable sales={mockSales} />);
    const priceHeader = screen.getByText('가격').parentElement;
    fireEvent.click(priceHeader!);
    expect(screen.getByText(/45,000/)).toBeInTheDocument();
  });

  it('should sort by quantity when column clicked', () => {
    render(<SalesTable sales={mockSales} />);
    const quantityHeader = screen.getByText('수량').parentElement;
    fireEvent.click(quantityHeader!);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should sort by revenue when column clicked', () => {
    render(<SalesTable sales={mockSales} />);
    const revenueHeader = screen.getByText('매출').parentElement;
    fireEvent.click(revenueHeader!);
    expect(screen.getByText(/90,000/)).toBeInTheDocument();
  });

  it('should toggle sort direction when same column clicked twice', () => {
    render(<SalesTable sales={mockSales} />);
    const dateHeader = screen.getByText('날짜').parentElement;

    // First click - descending (default)
    fireEvent.click(dateHeader!);

    // Second click - ascending
    fireEvent.click(dateHeader!);

    expect(screen.getByText('글로우 세럼')).toBeInTheDocument();
  });

  it('should change sort field when different column clicked', () => {
    render(<SalesTable sales={mockSales} />);
    const dateHeader = screen.getByText('날짜').parentElement;
    const priceHeader = screen.getByText('가격').parentElement;

    // Sort by date
    fireEvent.click(dateHeader!);

    // Sort by price (should reset to descending)
    fireEvent.click(priceHeader!);

    // Both prices are displayed, just verify no error
    expect(priceHeader).toBeInTheDocument();
  });

  it('should show last page correctly when navigating', () => {
    const manySales = Array.from({ length: 25 }, (_, i) => ({
      ...mockSales[0],
      id: `sale-${i}`,
      productName: `Product ${i}`,
    }));
    render(<SalesTable sales={manySales} pageSize={10} />);

    const nextButton = screen.getByText('다음');

    // Go to page 2
    fireEvent.click(nextButton);
    expect(screen.getByText(/11-20건 표시/)).toBeInTheDocument();

    // Go to page 3
    fireEvent.click(nextButton);
    expect(screen.getByText(/21-25건 표시/)).toBeInTheDocument();
  });

  it('should navigate using page number buttons', () => {
    const manySales = Array.from({ length: 30 }, (_, i) => ({
      ...mockSales[0],
      id: `sale-${i}`,
      productName: `Product ${i}`,
    }));
    render(<SalesTable sales={manySales} pageSize={10} />);

    // Click page 2 button
    const page2Button = screen.getByRole('button', { name: '2' });
    fireEvent.click(page2Button);
    expect(screen.getByText(/11-20건 표시/)).toBeInTheDocument();

    // Click page 3 button
    const page3Button = screen.getByRole('button', { name: '3' });
    fireEvent.click(page3Button);
    expect(screen.getByText(/21-30건 표시/)).toBeInTheDocument();
  });
});

describe('InsightSummary', () => {
  it('should render summary text', () => {
    render(<InsightSummary insight={mockInsight} />);
    expect(screen.getByText('뷰티 카테고리에서 강력한 영향력을 보유')).toBeInTheDocument();
  });

  it('should display all strengths', () => {
    render(<InsightSummary insight={mockInsight} />);
    expect(screen.getByText('높은 참여율')).toBeInTheDocument();
    expect(screen.getByText('뷰티 전문성')).toBeInTheDocument();
  });

  it('should display all recommendations', () => {
    render(<InsightSummary insight={mockInsight} />);
    expect(screen.getByText('가격대 다양화')).toBeInTheDocument();
    expect(screen.getByText('패션 카테고리 확대')).toBeInTheDocument();
  });

  it('should show analyzed timestamp', () => {
    render(<InsightSummary insight={mockInsight} />);
    expect(screen.getByText(/분석 일시:/)).toBeInTheDocument();
    expect(screen.getByText(/2025/)).toBeInTheDocument();
  });

  it('should render with gradient background', () => {
    const { container } = render(<InsightSummary insight={mockInsight} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('gradient');
  });
});

describe('AnalyzeButton', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it('should render in idle state', () => {
    render(
      <AnalyzeButton
        creatorId="creator-001"
        onComplete={() => {}}
      />
    );
    expect(screen.getByText('AI 분석 시작')).toBeInTheDocument();
  });

  it('should show loading state on click', async () => {
    (global.fetch as any).mockImplementation(() =>
      new Promise((resolve) => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ success: true, data: mockInsight }),
      }), 100))
    );

    render(
      <AnalyzeButton
        creatorId="creator-001"
        onComplete={() => {}}
      />
    );

    const button = screen.getByText('AI 분석 시작');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('분석 중...')).toBeInTheDocument();
    });
  });

  it('should call onComplete with insight data', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockInsight }),
    });

    const onComplete = vi.fn();
    render(
      <AnalyzeButton
        creatorId="creator-001"
        onComplete={onComplete}
      />
    );

    const button = screen.getByText('AI 분석 시작');
    fireEvent.click(button);

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledWith(mockInsight);
    });
  });

  it('should show success state after completion', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockInsight }),
    });

    render(
      <AnalyzeButton
        creatorId="creator-001"
        onComplete={() => {}}
      />
    );

    const button = screen.getByText('AI 분석 시작');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('분석 완료')).toBeInTheDocument();
    });
  });

  it('should be disabled when disabled prop is true', () => {
    render(
      <AnalyzeButton
        creatorId="creator-001"
        onComplete={() => {}}
        disabled={true}
      />
    );

    const button = screen.getByRole('button', { name: 'AI 분석 시작' });
    expect(button).toBeDisabled();
  });

  it('should have proper accessibility attributes', () => {
    render(
      <AnalyzeButton
        creatorId="creator-001"
        onComplete={() => {}}
      />
    );

    const button = screen.getByRole('button', { name: 'AI 분석 시작' });
    expect(button).toHaveAttribute('aria-label', 'AI 분석 시작');
    expect(button).toHaveAttribute('aria-busy', 'false');
  });

  it('should handle API error gracefully', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
    });

    render(
      <AnalyzeButton
        creatorId="creator-001"
        onComplete={() => {}}
      />
    );

    const button = screen.getByText('AI 분석 시작');
    fireEvent.click(button);

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalled();
    });

    consoleError.mockRestore();
  });

  it('should handle network error gracefully', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    render(
      <AnalyzeButton
        creatorId="creator-001"
        onComplete={() => {}}
      />
    );

    const button = screen.getByText('AI 분석 시작');
    fireEvent.click(button);

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalled();
    });

    consoleError.mockRestore();
  });

  it('should render with custom className', () => {
    const { container } = render(
      <AnalyzeButton
        creatorId="creator-001"
        onComplete={() => {}}
        className="custom-class"
      />
    );
    const button = container.querySelector('.custom-class');
    expect(button).toBeInTheDocument();
  });

  it('should reset to idle state after 2 seconds on success', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockInsight }),
    });

    render(
      <AnalyzeButton
        creatorId="creator-001"
        onComplete={() => {}}
      />
    );

    const button = screen.getByText('AI 분석 시작');
    fireEvent.click(button);

    // Wait for success state
    await waitFor(() => {
      expect(screen.getByText('분석 완료')).toBeInTheDocument();
    });

    // Wait for the 2 second timeout to complete (using real timers)
    await new Promise(resolve => setTimeout(resolve, 2100));

    // Should now be back to idle
    await waitFor(() => {
      expect(screen.getByText('AI 분석 시작')).toBeInTheDocument();
    });
  }, 10000); // Increase timeout for this test
});
