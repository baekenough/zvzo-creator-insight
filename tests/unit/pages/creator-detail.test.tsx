import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import CreatorPage from '@/app/creator/[id]/page';
import type { Creator, SaleRecord } from '@/types';
import * as data from '@/data';

// Mock next/navigation
const mockNotFound = vi.fn();
vi.mock('next/navigation', () => ({
  notFound: () => mockNotFound(),
}));

// Mock data functions
vi.mock('@/data', () => ({
  getCreatorById: vi.fn(),
  getSalesByCreator: vi.fn(),
}));

// Mock components
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

vi.mock('@/components/creator/creator-profile', () => ({
  CreatorProfile: ({ creator }: { creator: Creator }) => (
    <div data-testid="mock-creator-profile">
      Profile: {creator.name}
    </div>
  ),
}));

vi.mock('@/components/creator/sales-table', () => ({
  SalesTable: ({ sales }: { sales: SaleRecord[] }) => (
    <div data-testid="mock-sales-table">
      Sales count: {sales.length}
    </div>
  ),
}));

vi.mock('@/components/creator/analysis-section', () => ({
  AnalysisSection: ({ creatorId }: { creatorId: string }) => (
    <div data-testid="mock-analysis-section">
      Analysis for: {creatorId}
    </div>
  ),
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock lucide-react
vi.mock('lucide-react', () => ({
  ArrowRight: () => <div>ArrowRight Icon</div>,
}));

const mockCreator: Creator = {
  id: 'creator-001',
  name: '김지은',
  profileImage: '/images/creator-001.jpg',
  platform: 'instagram',
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
    date: '2025-01-20T10:00:00Z',
    platform: 'instagram',
  },
  {
    id: 'sale-002',
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
    date: '2025-01-21T14:30:00Z',
    platform: 'instagram',
  },
];

describe('CreatorPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNotFound.mockImplementation(() => {
      throw new Error('Not Found');
    });
  });

  it('should render page layout components when creator exists', () => {
    vi.mocked(data.getCreatorById).mockReturnValue(mockCreator);
    vi.mocked(data.getSalesByCreator).mockReturnValue(mockSales);

    render(<CreatorPage params={{ id: 'creator-001' }} />);

    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
    expect(screen.getByTestId('mock-page-container')).toBeInTheDocument();
  });

  it('should call notFound when creator does not exist', () => {
    vi.mocked(data.getCreatorById).mockReturnValue(null);

    // Suppress console.error for this test since notFound throws
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<CreatorPage params={{ id: 'non-existent' }} />);
    }).toThrow('Not Found');

    expect(mockNotFound).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('should display back to dashboard link', () => {
    vi.mocked(data.getCreatorById).mockReturnValue(mockCreator);
    vi.mocked(data.getSalesByCreator).mockReturnValue(mockSales);

    render(<CreatorPage params={{ id: 'creator-001' }} />);

    const link = screen.getByText('← 대시보드로 돌아가기');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', '/dashboard');
  });

  it('should render CreatorProfile component', () => {
    vi.mocked(data.getCreatorById).mockReturnValue(mockCreator);
    vi.mocked(data.getSalesByCreator).mockReturnValue(mockSales);

    render(<CreatorPage params={{ id: 'creator-001' }} />);

    const profile = screen.getByTestId('mock-creator-profile');
    expect(profile).toBeInTheDocument();
    expect(profile).toHaveTextContent('Profile: 김지은');
  });

  it('should render AnalysisSection component', () => {
    vi.mocked(data.getCreatorById).mockReturnValue(mockCreator);
    vi.mocked(data.getSalesByCreator).mockReturnValue(mockSales);

    render(<CreatorPage params={{ id: 'creator-001' }} />);

    const analysis = screen.getByTestId('mock-analysis-section');
    expect(analysis).toBeInTheDocument();
    expect(analysis).toHaveTextContent('Analysis for: creator-001');
  });

  it('should display sales history section with count', () => {
    vi.mocked(data.getCreatorById).mockReturnValue(mockCreator);
    vi.mocked(data.getSalesByCreator).mockReturnValue(mockSales);

    render(<CreatorPage params={{ id: 'creator-001' }} />);

    expect(screen.getByText('판매 내역')).toBeInTheDocument();
    // Check for the sales count in the specific section
    const salesCountSection = screen.getByText('판매 내역').parentElement;
    expect(salesCountSection).toHaveTextContent('총');
    expect(salesCountSection).toHaveTextContent('2');
    expect(salesCountSection).toHaveTextContent('건');
  });

  it('should render SalesTable when sales exist', () => {
    vi.mocked(data.getCreatorById).mockReturnValue(mockCreator);
    vi.mocked(data.getSalesByCreator).mockReturnValue(mockSales);

    render(<CreatorPage params={{ id: 'creator-001' }} />);

    const salesTable = screen.getByTestId('mock-sales-table');
    expect(salesTable).toBeInTheDocument();
    expect(salesTable).toHaveTextContent('Sales count: 2');
  });

  it('should display empty state when no sales', () => {
    vi.mocked(data.getCreatorById).mockReturnValue(mockCreator);
    vi.mocked(data.getSalesByCreator).mockReturnValue([]);

    render(<CreatorPage params={{ id: 'creator-001' }} />);

    expect(screen.queryByTestId('mock-sales-table')).not.toBeInTheDocument();
    expect(screen.getByText('아직 판매 내역이 없습니다.')).toBeInTheDocument();
  });

  it('should display product matching CTA section', () => {
    vi.mocked(data.getCreatorById).mockReturnValue(mockCreator);
    vi.mocked(data.getSalesByCreator).mockReturnValue(mockSales);

    render(<CreatorPage params={{ id: 'creator-001' }} />);

    expect(screen.getByText('AI 제품 매칭')).toBeInTheDocument();
    expect(screen.getByText(/김지은님에게 최적화된 제품을 AI가 추천해드립니다/)).toBeInTheDocument();
  });

  it('should display link to match page', () => {
    vi.mocked(data.getCreatorById).mockReturnValue(mockCreator);
    vi.mocked(data.getSalesByCreator).mockReturnValue(mockSales);

    render(<CreatorPage params={{ id: 'creator-001' }} />);

    const matchLink = screen.getByText('제품 매칭 시작하기');
    expect(matchLink).toBeInTheDocument();
    expect(matchLink.closest('a')).toHaveAttribute('href', '/creator/creator-001/match');
  });

  it('should fetch sales using correct creator ID', () => {
    vi.mocked(data.getCreatorById).mockReturnValue(mockCreator);
    vi.mocked(data.getSalesByCreator).mockReturnValue(mockSales);

    render(<CreatorPage params={{ id: 'creator-001' }} />);

    expect(data.getSalesByCreator).toHaveBeenCalledWith('creator-001');
  });

  it('should fetch creator using params ID', () => {
    vi.mocked(data.getCreatorById).mockReturnValue(mockCreator);
    vi.mocked(data.getSalesByCreator).mockReturnValue(mockSales);

    render(<CreatorPage params={{ id: 'creator-123' }} />);

    expect(data.getCreatorById).toHaveBeenCalledWith('creator-123');
  });

  it('should have proper page structure with main element', () => {
    vi.mocked(data.getCreatorById).mockReturnValue(mockCreator);
    vi.mocked(data.getSalesByCreator).mockReturnValue(mockSales);

    const { container } = render(<CreatorPage params={{ id: 'creator-001' }} />);

    const mainElement = container.querySelector('main');
    expect(mainElement).toBeInTheDocument();
    expect(mainElement).toHaveClass('flex-1');
  });

  it('should display sales count of 0 when no sales', () => {
    vi.mocked(data.getCreatorById).mockReturnValue(mockCreator);
    vi.mocked(data.getSalesByCreator).mockReturnValue([]);

    render(<CreatorPage params={{ id: 'creator-001' }} />);

    expect(screen.getByText(/총/)).toBeInTheDocument();
    expect(screen.getByText(/^0$/)).toBeInTheDocument();
  });
});
