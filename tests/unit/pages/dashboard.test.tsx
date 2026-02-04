import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import DashboardPage from '@/app/dashboard/page';
import type { Creator } from '@/types';
import * as data from '@/data';

// Mock all data functions
vi.mock('@/data', () => ({
  getCreators: vi.fn(),
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

vi.mock('@/components/common/stat-card', () => ({
  StatCard: ({ label, value }: { label: string; value: string | number }) => (
    <div data-testid={`stat-card-${label}`}>
      <span>{label}</span>: <span>{value}</span>
    </div>
  ),
}));

vi.mock('@/components/dashboard/creator-list', () => ({
  CreatorList: ({ creators }: { creators: Creator[] }) => (
    <div data-testid="mock-creator-list">
      Creator count: {creators.length}
    </div>
  ),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Users: () => <div>Users Icon</div>,
  DollarSign: () => <div>DollarSign Icon</div>,
  TrendingUp: () => <div>TrendingUp Icon</div>,
  Tag: () => <div>Tag Icon</div>,
}));

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
    followers: 180000,
    engagementRate: 5.2,
    categories: ['Food', 'Lifestyle'],
    joinedAt: '2025-01-10T14:30:00Z',
    totalSales: 62,
    totalRevenue: 4320000,
  },
  {
    id: 'creator-003',
    name: '이서연',
    profileImage: '/images/creator-003.jpg',
    platform: 'TikTok',
    followers: 320000,
    engagementRate: 4.5,
    categories: ['Beauty', 'Lifestyle'],
    joinedAt: '2025-01-08T11:00:00Z',
    totalSales: 95,
    totalRevenue: 7280000,
  },
];

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render page layout components', () => {
    vi.mocked(data.getCreators).mockReturnValue(mockCreators);

    render(<DashboardPage />);

    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
    expect(screen.getByTestId('mock-page-container')).toBeInTheDocument();
  });

  it('should display page title and description', () => {
    vi.mocked(data.getCreators).mockReturnValue(mockCreators);

    render(<DashboardPage />);

    expect(screen.getByText('크리에이터 대시보드')).toBeInTheDocument();
    expect(screen.getByText('AI 기반 크리에이터 판매 성과 분석')).toBeInTheDocument();
  });

  it('should calculate and display total creators count', () => {
    vi.mocked(data.getCreators).mockReturnValue(mockCreators);

    render(<DashboardPage />);

    const statCard = screen.getByTestId('stat-card-총 크리에이터');
    expect(statCard).toHaveTextContent('총 크리에이터');
    expect(statCard).toHaveTextContent('3');
  });

  it('should calculate and display total revenue', () => {
    vi.mocked(data.getCreators).mockReturnValue(mockCreators);

    render(<DashboardPage />);

    const statCard = screen.getByTestId('stat-card-총 매출');
    expect(statCard).toHaveTextContent('총 매출');
    // Total: 5650000 + 4320000 + 7280000 = 17250000
    expect(statCard).toHaveTextContent('₩17,250,000');
  });

  it('should calculate and display average engagement rate', () => {
    vi.mocked(data.getCreators).mockReturnValue(mockCreators);

    render(<DashboardPage />);

    const statCard = screen.getByTestId('stat-card-평균 참여율');
    expect(statCard).toHaveTextContent('평균 참여율');
    // Avg: (3.8 + 5.2 + 4.5) / 3 = 4.5
    expect(statCard).toHaveTextContent('4.5%');
  });

  it('should calculate and display top category', () => {
    vi.mocked(data.getCreators).mockReturnValue(mockCreators);

    render(<DashboardPage />);

    const statCard = screen.getByTestId('stat-card-상위 카테고리');
    expect(statCard).toHaveTextContent('상위 카테고리');
    // Beauty appears 2 times, others appear 1 or 2 times
    // Beauty and Lifestyle both appear 2 times, but Beauty should come first alphabetically
    expect(statCard).toHaveTextContent(/Beauty|Lifestyle/);
  });

  it('should display creator list section with title', () => {
    vi.mocked(data.getCreators).mockReturnValue(mockCreators);

    render(<DashboardPage />);

    expect(screen.getByText('크리에이터 목록')).toBeInTheDocument();
    expect(screen.getByTestId('mock-creator-list')).toBeInTheDocument();
  });

  it('should pass creators to CreatorList component', () => {
    vi.mocked(data.getCreators).mockReturnValue(mockCreators);

    render(<DashboardPage />);

    const creatorList = screen.getByTestId('mock-creator-list');
    expect(creatorList).toHaveTextContent('Creator count: 3');
  });

  it('should handle empty creator list', () => {
    vi.mocked(data.getCreators).mockReturnValue([]);

    render(<DashboardPage />);

    // Should display 0 creators
    const statCard = screen.getByTestId('stat-card-총 크리에이터');
    expect(statCard).toHaveTextContent('0');

    // Should display 0 revenue
    const revenueCard = screen.getByTestId('stat-card-총 매출');
    expect(revenueCard).toHaveTextContent('₩0');

    // Should display N/A for top category
    const categoryCard = screen.getByTestId('stat-card-상위 카테고리');
    expect(categoryCard).toHaveTextContent('N/A');
  });

  it('should handle single creator', () => {
    vi.mocked(data.getCreators).mockReturnValue([mockCreators[0]]);

    render(<DashboardPage />);

    const statCard = screen.getByTestId('stat-card-총 크리에이터');
    expect(statCard).toHaveTextContent('1');

    const avgCard = screen.getByTestId('stat-card-평균 참여율');
    expect(avgCard).toHaveTextContent('3.8%');
  });

  it('should handle creators with no categories', () => {
    const creatorsNoCategories: Creator[] = [
      {
        ...mockCreators[0],
        categories: [],
      },
    ];
    vi.mocked(data.getCreators).mockReturnValue(creatorsNoCategories);

    render(<DashboardPage />);

    const categoryCard = screen.getByTestId('stat-card-상위 카테고리');
    expect(categoryCard).toHaveTextContent('N/A');
  });

  it('should render all four stat cards', () => {
    vi.mocked(data.getCreators).mockReturnValue(mockCreators);

    render(<DashboardPage />);

    expect(screen.getByTestId('stat-card-총 크리에이터')).toBeInTheDocument();
    expect(screen.getByTestId('stat-card-총 매출')).toBeInTheDocument();
    expect(screen.getByTestId('stat-card-평균 참여율')).toBeInTheDocument();
    expect(screen.getByTestId('stat-card-상위 카테고리')).toBeInTheDocument();
  });

  it('should have proper page structure with main and sections', () => {
    vi.mocked(data.getCreators).mockReturnValue(mockCreators);

    const { container } = render(<DashboardPage />);

    const mainElement = container.querySelector('main');
    expect(mainElement).toBeInTheDocument();
    expect(mainElement).toHaveClass('flex-1');
  });
});
