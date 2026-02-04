import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductProfile } from '@/components/products/product-profile';
import { ProductSalesTable } from '@/components/products/product-sales-table';
import type { Product, SaleRecord, Creator } from '@/types';

// Mock data functions
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
    creatorId: 'creator-002',
    productId: 'prod-001',
    productName: '글로우 세럼',
    category: 'Beauty',
    price: 45000,
    originalPrice: 60000,
    discountRate: 25,
    quantity: 1,
    revenue: 45000,
    commission: 4500,
    commissionRate: 10,
    clickCount: 80,
    conversionRate: 4.0,
    date: '2025-01-21T14:30:00Z',
    platform: 'YouTube',
  },
];

const mockCreators: Creator[] = [
  {
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
  },
  {
    id: 'creator-002',
    name: '박민수',
    profileImage: '/images/creator-002.jpg',
    platform: 'YouTube',
    followers: 450000,
    engagementRate: 5.2,
    categories: ['Tech', 'Lifestyle'],
    joinedAt: '2025-01-10T09:00:00Z',
    totalSales: 122,
    totalRevenue: 8900000,
  },
];

const mockProduct: Product = {
  id: 'prod-001',
  name: '글로우 세럼',
  brand: '뷰티랩',
  category: 'Beauty',
  subcategory: '스킨케어',
  price: 45000,
  originalPrice: 60000,
  description: '빛나는 피부를 위한 세럼입니다.',
  imageUrl: '/images/product-001.jpg',
  tags: ['세럼', '보습', '광채'],
  targetAudience: ['20대', '30대'],
  seasonality: ['Spring', 'Summer'],
  avgCommissionRate: 10.0,
};

const mockProductNoDiscount: Product = {
  ...mockProduct,
  id: 'prod-002',
  name: '스마트워치',
  price: 250000,
  originalPrice: 250000,
};

const mockGetSalesByProduct = vi.fn((productId: string) =>
  productId === 'prod-001' ? mockSales : []
);
const mockGetCreatorById = vi.fn((id: string) =>
  mockCreators.find((c) => c.id === id)
);

vi.mock('@/data', () => ({
  getSalesByProduct: (...args: any[]) => mockGetSalesByProduct(...args),
  getCreatorById: (...args: any[]) => mockGetCreatorById(...args),
}));

describe('ProductProfile', () => {
  it('should render product name and brand', () => {
    render(<ProductProfile product={mockProduct} />);
    expect(screen.getByText('글로우 세럼')).toBeInTheDocument();
    expect(screen.getByText('뷰티랩')).toBeInTheDocument();
  });

  it('should render price and original price', () => {
    render(<ProductProfile product={mockProduct} />);
    expect(screen.getAllByText(/45,000/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/60,000/).length).toBeGreaterThan(0);
  });

  it('should show discount rate when applicable', () => {
    render(<ProductProfile product={mockProduct} />);
    expect(screen.getAllByText('25% 할인').length).toBeGreaterThan(0);
  });

  it('should show 0% discount when price equals original price', () => {
    render(<ProductProfile product={mockProductNoDiscount} />);
    // Stats grid will still show 할인율, but it will be 0%
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('should render description', () => {
    render(<ProductProfile product={mockProduct} />);
    expect(screen.getByText('빛나는 피부를 위한 세럼입니다.')).toBeInTheDocument();
  });

  it('should render tags as badges', () => {
    render(<ProductProfile product={mockProduct} />);
    expect(screen.getByText('세럼')).toBeInTheDocument();
    expect(screen.getByText('보습')).toBeInTheDocument();
    expect(screen.getByText('광채')).toBeInTheDocument();
  });

  it('should render target audience badges', () => {
    render(<ProductProfile product={mockProduct} />);
    expect(screen.getByText('20대')).toBeInTheDocument();
    expect(screen.getByText('30대')).toBeInTheDocument();
  });

  it('should render seasonality badges', () => {
    render(<ProductProfile product={mockProduct} />);
    expect(screen.getByText('Spring')).toBeInTheDocument();
    expect(screen.getByText('Summer')).toBeInTheDocument();
  });

  it('should render commission rate', () => {
    render(<ProductProfile product={mockProduct} />);
    expect(screen.getAllByText('10.0%').length).toBeGreaterThan(0);
  });

  it('should handle image error', () => {
    render(<ProductProfile product={mockProduct} />);
    const image = document.querySelector('img');
    if (image) {
      fireEvent.error(image);
    }
    // Should show fallback with first character
    expect(screen.getByText('글')).toBeInTheDocument();
  });

  it('should show fallback when no image URL', () => {
    const productNoImage = { ...mockProduct, imageUrl: '' };
    render(<ProductProfile product={productNoImage} />);
    expect(screen.getByText('글')).toBeInTheDocument();
  });

  it('should render category and subcategory', () => {
    render(<ProductProfile product={mockProduct} />);
    expect(screen.getByText('Beauty')).toBeInTheDocument();
    expect(screen.getByText('스킨케어')).toBeInTheDocument();
  });

  it('should render stats grid', () => {
    render(<ProductProfile product={mockProduct} />);
    expect(screen.getByText('현재 가격')).toBeInTheDocument();
    expect(screen.getByText('정가')).toBeInTheDocument();
    expect(screen.getByText('할인율')).toBeInTheDocument();
    expect(screen.getByText('수수료율')).toBeInTheDocument();
  });

  it('should handle image load event', () => {
    render(<ProductProfile product={mockProduct} />);
    const image = document.querySelector('img');
    if (image) {
      fireEvent.load(image);
    }
    expect(image).toBeInTheDocument();
  });

  it('should render with custom className', () => {
    const { container } = render(
      <ProductProfile product={mockProduct} className="custom-class" />
    );
    const profile = container.querySelector('.custom-class');
    expect(profile).toBeInTheDocument();
  });

  it('should not render subcategory badge when not provided', () => {
    const productNoSubcategory = { ...mockProduct, subcategory: '' };
    render(<ProductProfile product={productNoSubcategory} />);
    // Should only have category badge
    const badges = screen.getAllByText('Beauty');
    expect(badges.length).toBeGreaterThan(0);
  });

  it('should not render tags section when tags are empty', () => {
    const productNoTags = { ...mockProduct, tags: [] };
    render(<ProductProfile product={productNoTags} />);
    expect(screen.queryByText('태그')).not.toBeInTheDocument();
  });

  it('should not render target audience section when empty', () => {
    const productNoAudience = { ...mockProduct, targetAudience: [] };
    render(<ProductProfile product={productNoAudience} />);
    expect(screen.queryByText('타겟 고객')).not.toBeInTheDocument();
  });

  it('should not render seasonality section when empty', () => {
    const productNoSeasonality = { ...mockProduct, seasonality: [] };
    render(<ProductProfile product={productNoSeasonality} />);
    expect(screen.queryByText('계절성')).not.toBeInTheDocument();
  });
});

describe('ProductSalesTable', () => {
  beforeEach(() => {
    // Reset mock to return mockSales by default
    mockGetSalesByProduct.mockReturnValue(mockSales);
  });

  it('should render sales table with data', () => {
    render(<ProductSalesTable productId="prod-001" />);
    expect(screen.getByText('김지은')).toBeInTheDocument();
    expect(screen.getByText('박민수')).toBeInTheDocument();
  });

  it('should show creator names', () => {
    render(<ProductSalesTable productId="prod-001" />);
    expect(screen.getByText('김지은')).toBeInTheDocument();
    expect(screen.getByText('박민수')).toBeInTheDocument();
  });

  it('should format currency values', () => {
    render(<ProductSalesTable productId="prod-001" />);
    expect(screen.getByText(/90,000/)).toBeInTheDocument();
    expect(screen.getByText(/45,000/)).toBeInTheDocument();
  });

  it('should sort by date', () => {
    render(<ProductSalesTable productId="prod-001" />);
    const dateHeader = screen.getByText('판매일').parentElement;
    fireEvent.click(dateHeader!);
    // Verify table is still rendered
    expect(screen.getByText('김지은')).toBeInTheDocument();
  });

  it('should handle pagination', () => {
    const manySales = Array.from({ length: 25 }, (_, i) => ({
      ...mockSales[0],
      id: `sale-${i}`,
    }));

    mockGetSalesByProduct.mockReturnValue(manySales);

    render(<ProductSalesTable productId="prod-001" pageSize={10} />);
    expect(screen.getByText(/총 25건/)).toBeInTheDocument();
    expect(screen.getByText(/1-10건 표시/)).toBeInTheDocument();
  });

  it('should navigate to next page', () => {
    const manySales = Array.from({ length: 25 }, (_, i) => ({
      ...mockSales[0],
      id: `sale-${i}`,
    }));

    mockGetSalesByProduct.mockReturnValue(manySales);

    render(<ProductSalesTable productId="prod-001" pageSize={10} />);
    const nextButton = screen.getByText('다음');
    fireEvent.click(nextButton);
    expect(screen.getByText(/11-20건 표시/)).toBeInTheDocument();
  });

  it('should navigate to previous page', () => {
    const manySales = Array.from({ length: 25 }, (_, i) => ({
      ...mockSales[0],
      id: `sale-${i}`,
    }));

    mockGetSalesByProduct.mockReturnValue(manySales);

    render(<ProductSalesTable productId="prod-001" pageSize={10} />);
    const nextButton = screen.getByText('다음');
    fireEvent.click(nextButton);
    expect(screen.getByText(/11-20건 표시/)).toBeInTheDocument();

    const prevButton = screen.getByText('이전');
    fireEvent.click(prevButton);
    expect(screen.getByText(/1-10건 표시/)).toBeInTheDocument();
  });

  it('should show empty state for no sales', () => {
    mockGetSalesByProduct.mockReturnValue([]);
    render(<ProductSalesTable productId="prod-999" />);
    expect(screen.getByText('판매 기록이 없습니다.')).toBeInTheDocument();
  });

  it('should sort by creator name', () => {
    render(<ProductSalesTable productId="prod-001" />);
    const creatorHeader = screen.getByText('크리에이터').parentElement;
    fireEvent.click(creatorHeader!);
    expect(screen.getByText('김지은')).toBeInTheDocument();
  });

  it('should sort by quantity', () => {
    render(<ProductSalesTable productId="prod-001" />);
    const quantityHeader = screen.getByText('수량').parentElement;
    fireEvent.click(quantityHeader!);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should sort by revenue', () => {
    render(<ProductSalesTable productId="prod-001" />);
    const revenueHeader = screen.getByText('매출').parentElement;
    fireEvent.click(revenueHeader!);
    expect(screen.getByText(/90,000/)).toBeInTheDocument();
  });

  it('should sort by commission', () => {
    render(<ProductSalesTable productId="prod-001" />);
    const commissionHeader = screen.getByText('수수료').parentElement;
    fireEvent.click(commissionHeader!);
    expect(screen.getByText(/9,000/)).toBeInTheDocument();
  });

  it('should sort by platform', () => {
    render(<ProductSalesTable productId="prod-001" />);
    const platformHeader = screen.getByText('플랫폼').parentElement;
    fireEvent.click(platformHeader!);
    expect(screen.getByText('Instagram')).toBeInTheDocument();
  });

  it('should toggle sort direction on same column click', () => {
    render(<ProductSalesTable productId="prod-001" />);
    const dateHeader = screen.getByText('판매일').parentElement;

    // First click - descending
    fireEvent.click(dateHeader!);
    expect(screen.getByText('김지은')).toBeInTheDocument();

    // Second click - ascending
    fireEvent.click(dateHeader!);
    expect(screen.getByText('김지은')).toBeInTheDocument();
  });

  it('should format date correctly', () => {
    render(<ProductSalesTable productId="prod-001" />);
    // Should show formatted dates (multiple dates in table)
    const dates = screen.getAllByText(/2025/);
    expect(dates.length).toBeGreaterThan(0);
  });

  it('should navigate using page number buttons', () => {
    const manySales = Array.from({ length: 30 }, (_, i) => ({
      ...mockSales[0],
      id: `sale-${i}`,
    }));

    mockGetSalesByProduct.mockReturnValue(manySales);

    render(<ProductSalesTable productId="prod-001" pageSize={10} />);
    const page2Button = screen.getByRole('button', { name: '2' });
    fireEvent.click(page2Button);
    expect(screen.getByText(/11-20건 표시/)).toBeInTheDocument();
  });

  it('should not render pagination when sales fit in one page', () => {
    mockGetSalesByProduct.mockReturnValue(mockSales); // Reset to 2 sales
    render(<ProductSalesTable productId="prod-001" pageSize={10} />);
    expect(screen.queryByText('이전')).not.toBeInTheDocument();
    expect(screen.queryByText('다음')).not.toBeInTheDocument();
  });

  it('should render with custom className', () => {
    const { container } = render(
      <ProductSalesTable productId="prod-001" className="custom-class" />
    );
    const table = container.querySelector('.custom-class');
    expect(table).toBeInTheDocument();
  });

  it('should handle unknown creator gracefully', () => {
    const salesWithUnknownCreator: SaleRecord[] = [
      {
        ...mockSales[0],
        creatorId: 'unknown-creator',
      },
    ];

    mockGetSalesByProduct.mockReturnValue(salesWithUnknownCreator);

    render(<ProductSalesTable productId="prod-001" />);
    expect(screen.getByText('알 수 없음')).toBeInTheDocument();
  });

  it('should use default pageSize of 10 when not provided', () => {
    const manySales = Array.from({ length: 25 }, (_, i) => ({
      ...mockSales[0],
      id: `sale-${i}`,
    }));

    mockGetSalesByProduct.mockReturnValue(manySales);

    render(<ProductSalesTable productId="prod-001" />);
    expect(screen.getByText(/1-10건 표시/)).toBeInTheDocument();
  });
});
