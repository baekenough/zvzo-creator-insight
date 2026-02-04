import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProductsPage from '@/app/products/page';
import ProductPage from '@/app/products/[id]/page';
import ProductMatchPage from '@/app/products/[id]/match/page';
import type { Product, SaleRecord } from '@/types';
import * as data from '@/data';
import { notFound } from 'next/navigation';

// Mock data functions
vi.mock('@/data', () => ({
  getProducts: vi.fn(),
  getProductById: vi.fn(),
  getSalesByProduct: vi.fn(),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
}));

// Mock layout components
vi.mock('@/components/layout/header', () => ({
  Header: () => <div data-testid="mock-header">Header</div>,
}));

vi.mock('@/components/layout/footer', () => ({
  Footer: () => <div data-testid="mock-footer">Footer</div>,
}));

vi.mock('@/components/layout/page-container', () => ({
  PageContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-page-container">{children}</div>
  ),
}));

// Mock product components
vi.mock('@/components/common/stat-card', () => ({
  StatCard: ({ label, value }: { label: string; value: string | number }) => (
    <div data-testid={`stat-card-${label}`}>
      <span>{label}</span>: <span>{value}</span>
    </div>
  ),
}));

vi.mock('@/components/products/product-list', () => ({
  ProductList: ({ products }: { products: Product[] }) => (
    <div data-testid="mock-product-list">Product count: {products.length}</div>
  ),
}));

vi.mock('@/components/products/product-profile', () => ({
  ProductProfile: ({ product }: { product: Product }) => (
    <div data-testid="mock-product-profile">{product.name}</div>
  ),
}));

vi.mock('@/components/products/product-sales-table', () => ({
  ProductSalesTable: ({ productId }: { productId: string }) => (
    <div data-testid="mock-product-sales-table">Sales for {productId}</div>
  ),
}));

vi.mock('@/components/match/creator-match-section', () => ({
  CreatorMatchSection: ({ product }: { product: Product }) => (
    <div data-testid="mock-creator-match-section">Matching for {product.name}</div>
  ),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Package: () => <div>Package Icon</div>,
  DollarSign: () => <div>DollarSign Icon</div>,
  Tag: () => <div>Tag Icon</div>,
  Percent: () => <div>Percent Icon</div>,
  ChevronLeft: () => <div>ChevronLeft Icon</div>,
  ArrowRight: () => <div>ArrowRight Icon</div>,
}));

const mockProducts: Product[] = [
  {
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
  },
  {
    id: 'prod-002',
    name: '데님 자켓',
    brand: 'FashionCo',
    category: 'Fashion',
    subcategory: 'Outerwear',
    price: 89000,
    originalPrice: 120000,
    description: '클래식 데님 자켓',
    imageUrl: '/images/products/denim-jacket.jpg',
    tags: ['casual', 'denim'],
    targetAudience: ['20대 남성', '30대 남성'],
    seasonality: ['봄', '가을'],
    avgCommissionRate: 12,
  },
];

const mockSales: SaleRecord[] = [
  {
    id: 'sale-001',
    creatorId: 'creator-001',
    productId: 'prod-001',
    productName: '글로우 세럼',
    category: 'Beauty',
    price: 65000,
    originalPrice: 85000,
    discountRate: 24,
    quantity: 2,
    revenue: 130000,
    commission: 19500,
    commissionRate: 15,
    date: '2025-01-20T10:00:00Z',
    platform: 'Instagram',
    clickCount: 100,
    conversionRate: 3.5,
  },
];

describe('ProductsPage (/products)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render page title "제품 카탈로그"', () => {
    vi.mocked(data.getProducts).mockReturnValue(mockProducts);

    render(<ProductsPage />);

    expect(screen.getByText('제품 카탈로그')).toBeInTheDocument();
  });

  it('should render description', () => {
    vi.mocked(data.getProducts).mockReturnValue(mockProducts);

    render(<ProductsPage />);

    expect(screen.getByText('AI 기반 제품 판매 성과 분석')).toBeInTheDocument();
  });

  it('should render stat cards (4 cards)', () => {
    vi.mocked(data.getProducts).mockReturnValue(mockProducts);

    render(<ProductsPage />);

    expect(screen.getByTestId('stat-card-총 제품 수')).toBeInTheDocument();
    expect(screen.getByTestId('stat-card-평균 가격')).toBeInTheDocument();
    expect(screen.getByTestId('stat-card-인기 카테고리')).toBeInTheDocument();
    expect(screen.getByTestId('stat-card-평균 수수료율')).toBeInTheDocument();
  });

  it('should calculate total products count', () => {
    vi.mocked(data.getProducts).mockReturnValue(mockProducts);

    render(<ProductsPage />);

    const statCard = screen.getByTestId('stat-card-총 제품 수');
    expect(statCard).toHaveTextContent('2');
  });

  it('should calculate average price', () => {
    vi.mocked(data.getProducts).mockReturnValue(mockProducts);

    render(<ProductsPage />);

    const statCard = screen.getByTestId('stat-card-평균 가격');
    // Avg: (65000 + 89000) / 2 = 77000
    expect(statCard).toHaveTextContent('77,000');
  });

  it('should calculate most popular category', () => {
    vi.mocked(data.getProducts).mockReturnValue(mockProducts);

    render(<ProductsPage />);

    const statCard = screen.getByTestId('stat-card-인기 카테고리');
    // Both Beauty and Fashion appear once, should pick one
    expect(statCard.textContent).toMatch(/Beauty|Fashion/);
  });

  it('should calculate average commission rate', () => {
    vi.mocked(data.getProducts).mockReturnValue(mockProducts);

    render(<ProductsPage />);

    const statCard = screen.getByTestId('stat-card-평균 수수료율');
    // Avg: (15 + 12) / 2 = 13.5
    expect(statCard).toHaveTextContent('13.5%');
  });

  it('should render product list', () => {
    vi.mocked(data.getProducts).mockReturnValue(mockProducts);

    render(<ProductsPage />);

    expect(screen.getByTestId('mock-product-list')).toBeInTheDocument();
    expect(screen.getByText('Product count: 2')).toBeInTheDocument();
  });

  it('should handle empty product list', () => {
    vi.mocked(data.getProducts).mockReturnValue([]);

    render(<ProductsPage />);

    const statCard = screen.getByTestId('stat-card-총 제품 수');
    expect(statCard).toHaveTextContent('0');

    const categoryCard = screen.getByTestId('stat-card-인기 카테고리');
    expect(categoryCard).toHaveTextContent('N/A');
  });
});

describe('ProductPage (/products/[id])', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render product profile', () => {
    vi.mocked(data.getProductById).mockReturnValue(mockProducts[0]);
    vi.mocked(data.getSalesByProduct).mockReturnValue(mockSales);

    render(<ProductPage params={{ id: 'prod-001' }} />);

    expect(screen.getByTestId('mock-product-profile')).toBeInTheDocument();
    expect(screen.getByText('글로우 세럼')).toBeInTheDocument();
  });

  it('should render sales history section', () => {
    vi.mocked(data.getProductById).mockReturnValue(mockProducts[0]);
    vi.mocked(data.getSalesByProduct).mockReturnValue(mockSales);

    render(<ProductPage params={{ id: 'prod-001' }} />);

    expect(screen.getByText('판매 이력')).toBeInTheDocument();
    expect(screen.getByTestId('mock-product-sales-table')).toBeInTheDocument();
  });

  it('should render CTA button "크리에이터 매칭 시작하기"', () => {
    vi.mocked(data.getProductById).mockReturnValue(mockProducts[0]);
    vi.mocked(data.getSalesByProduct).mockReturnValue(mockSales);

    render(<ProductPage params={{ id: 'prod-001' }} />);

    expect(screen.getByText('크리에이터 매칭 시작하기')).toBeInTheDocument();
  });

  it('should show back link to products', () => {
    vi.mocked(data.getProductById).mockReturnValue(mockProducts[0]);
    vi.mocked(data.getSalesByProduct).mockReturnValue(mockSales);

    render(<ProductPage params={{ id: 'prod-001' }} />);

    expect(screen.getByText('제품 목록으로')).toBeInTheDocument();
  });

  it('should show "아직 판매 이력이 없습니다" when no sales', () => {
    vi.mocked(data.getProductById).mockReturnValue(mockProducts[0]);
    vi.mocked(data.getSalesByProduct).mockReturnValue([]);

    render(<ProductPage params={{ id: 'prod-001' }} />);

    expect(screen.getByText('아직 판매 이력이 없습니다.')).toBeInTheDocument();
  });

  it('should call notFound when product not found', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    vi.mocked(data.getProductById).mockReturnValue(null);
    vi.mocked(notFound).mockImplementation(() => {
      throw new Error('NEXT_NOT_FOUND');
    });

    try {
      render(<ProductPage params={{ id: 'invalid-id' }} />);
    } catch {
      // Expected to throw
    }

    expect(notFound).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});

describe('ProductMatchPage (/products/[id]/match)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render page title "AI 크리에이터 매칭"', () => {
    vi.mocked(data.getProductById).mockReturnValue(mockProducts[0]);

    render(<ProductMatchPage params={{ id: 'prod-001' }} />);

    expect(screen.getByText('AI 크리에이터 매칭')).toBeInTheDocument();
  });

  it('should render creator match section', () => {
    vi.mocked(data.getProductById).mockReturnValue(mockProducts[0]);

    render(<ProductMatchPage params={{ id: 'prod-001' }} />);

    expect(screen.getByTestId('mock-creator-match-section')).toBeInTheDocument();
    expect(screen.getByText('Matching for 글로우 세럼')).toBeInTheDocument();
  });

  it('should show back link to product detail', () => {
    vi.mocked(data.getProductById).mockReturnValue(mockProducts[0]);

    render(<ProductMatchPage params={{ id: 'prod-001' }} />);

    expect(screen.getByText('제품 상세로')).toBeInTheDocument();
  });

  it('should call notFound when product not found', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    vi.mocked(data.getProductById).mockReturnValue(null);
    vi.mocked(notFound).mockImplementation(() => {
      throw new Error('NEXT_NOT_FOUND');
    });

    try {
      render(<ProductMatchPage params={{ id: 'invalid-id' }} />);
    } catch {
      // Expected to throw
    }

    expect(notFound).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
