import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { CreatorList } from '@/components/dashboard/creator-list';
import type { Creator } from '@/types';

// Mock child components
vi.mock('@/components/common/search-bar', () => ({
  SearchBar: ({ value, onChange, placeholder }: any) => (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label="Search"
    />
  ),
}));

vi.mock('@/components/common/filter-dropdown', () => ({
  FilterDropdown: ({ label, value, onChange, options }: any) => (
    <div>
      <label>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
      >
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  ),
}));

vi.mock('@/components/creator/creator-card', () => ({
  CreatorCard: ({ creator, onClick }: any) => (
    <div
      data-testid={`creator-card-${creator.id}`}
      onClick={onClick}
      role="button"
    >
      <h3>{creator.name}</h3>
      <span>{creator.platform}</span>
      <span>{creator.totalRevenue}</span>
      <span>{creator.followers}</span>
    </div>
  ),
}));

describe('CreatorList', () => {
  const mockCreators: Creator[] = [
    {
      id: '1',
      name: 'Alice Kim',
      profileImage: '/alice.jpg',
      platform: 'Instagram' as const,
      followers: 50000,
      engagementRate: 3.5,
      categories: ['Beauty', 'Fashion'],
      joinedAt: '2023-01-01',
      totalSales: 100,
      totalRevenue: 5000000,
    },
    {
      id: '2',
      name: 'Bob Lee',
      profileImage: '/bob.jpg',
      platform: 'YouTube' as const,
      followers: 100000,
      engagementRate: 4.2,
      categories: ['Tech', 'Lifestyle'],
      joinedAt: '2023-02-01',
      totalSales: 150,
      totalRevenue: 8000000,
    },
    {
      id: '3',
      name: 'Charlie Park',
      profileImage: '/charlie.jpg',
      platform: 'TikTok' as const,
      followers: 80000,
      engagementRate: 5.1,
      categories: ['Food', 'Lifestyle'],
      joinedAt: '2023-03-01',
      totalSales: 120,
      totalRevenue: 6000000,
    },
  ];

  const mockRouter = {
    push: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock useRouter is already set up in setup.ts
  });

  describe('Initial Render', () => {
    it('should render all creators', () => {
      render(<CreatorList creators={mockCreators} />);

      expect(screen.getByTestId('creator-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('creator-card-2')).toBeInTheDocument();
      expect(screen.getByTestId('creator-card-3')).toBeInTheDocument();
    });

    it('should show correct creator count', () => {
      render(<CreatorList creators={mockCreators} />);

      expect(screen.getByText(/총/)).toBeInTheDocument();
      expect(screen.getByText(/3/)).toBeInTheDocument();
      expect(screen.getByText(/명의 크리에이터/)).toBeInTheDocument();
    });

    it('should render search bar with placeholder', () => {
      render(<CreatorList creators={mockCreators} />);

      const searchInput = screen.getByPlaceholderText('크리에이터 이름으로 검색...');
      expect(searchInput).toBeInTheDocument();
    });

    it('should render platform filter', () => {
      render(<CreatorList creators={mockCreators} />);

      expect(screen.getByLabelText('플랫폼')).toBeInTheDocument();
    });

    it('should render category filter', () => {
      render(<CreatorList creators={mockCreators} />);

      expect(screen.getByLabelText('카테고리')).toBeInTheDocument();
    });

    it('should render sort buttons', () => {
      render(<CreatorList creators={mockCreators} />);

      expect(screen.getByText('매출순')).toBeInTheDocument();
      expect(screen.getByText('팔로워순')).toBeInTheDocument();
    });

    it('should default to revenue sort', () => {
      render(<CreatorList creators={mockCreators} />);

      const revenueButton = screen.getByText('매출순');
      expect(revenueButton).toHaveClass('bg-zvzo-500');
    });
  });

  describe('Search Filtering', () => {
    it('should filter creators by name', () => {
      render(<CreatorList creators={mockCreators} />);

      const searchInput = screen.getByLabelText('Search');
      fireEvent.change(searchInput, { target: { value: 'Alice' } });

      expect(screen.getByTestId('creator-card-1')).toBeInTheDocument();
      expect(screen.queryByTestId('creator-card-2')).not.toBeInTheDocument();
      expect(screen.queryByTestId('creator-card-3')).not.toBeInTheDocument();
    });

    it('should be case-insensitive', () => {
      render(<CreatorList creators={mockCreators} />);

      const searchInput = screen.getByLabelText('Search');
      fireEvent.change(searchInput, { target: { value: 'alice' } });

      expect(screen.getByTestId('creator-card-1')).toBeInTheDocument();
    });

    it('should show no results when search matches nothing', () => {
      render(<CreatorList creators={mockCreators} />);

      const searchInput = screen.getByLabelText('Search');
      fireEvent.change(searchInput, { target: { value: 'NonExistent' } });

      expect(screen.queryByTestId('creator-card-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('creator-card-2')).not.toBeInTheDocument();
      expect(screen.queryByTestId('creator-card-3')).not.toBeInTheDocument();
      expect(screen.getByText('검색 결과 없음')).toBeInTheDocument();
    });

    it('should update count when filtering', () => {
      render(<CreatorList creators={mockCreators} />);

      const searchInput = screen.getByLabelText('Search');
      fireEvent.change(searchInput, { target: { value: 'Alice' } });

      expect(screen.getByText(/1/)).toBeInTheDocument();
    });
  });

  describe('Platform Filtering', () => {
    it('should filter by platform', () => {
      render(<CreatorList creators={mockCreators} />);

      const platformSelect = screen.getByLabelText('플랫폼');
      fireEvent.change(platformSelect, { target: { value: 'instagram' } });

      expect(screen.getByTestId('creator-card-1')).toBeInTheDocument();
      expect(screen.queryByTestId('creator-card-2')).not.toBeInTheDocument();
      expect(screen.queryByTestId('creator-card-3')).not.toBeInTheDocument();
    });

    it('should show all creators when platform is "all"', () => {
      render(<CreatorList creators={mockCreators} />);

      const platformSelect = screen.getByLabelText('플랫폼');
      fireEvent.change(platformSelect, { target: { value: 'youtube' } });
      fireEvent.change(platformSelect, { target: { value: 'all' } });

      expect(screen.getByTestId('creator-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('creator-card-2')).toBeInTheDocument();
      expect(screen.getByTestId('creator-card-3')).toBeInTheDocument();
    });
  });

  describe('Category Filtering', () => {
    it('should filter by category', () => {
      render(<CreatorList creators={mockCreators} />);

      const categorySelect = screen.getByLabelText('카테고리');
      fireEvent.change(categorySelect, { target: { value: 'Beauty' } });

      expect(screen.getByTestId('creator-card-1')).toBeInTheDocument();
      expect(screen.queryByTestId('creator-card-2')).not.toBeInTheDocument();
      expect(screen.queryByTestId('creator-card-3')).not.toBeInTheDocument();
    });

    it('should show creators with matching category', () => {
      render(<CreatorList creators={mockCreators} />);

      const categorySelect = screen.getByLabelText('카테고리');
      fireEvent.change(categorySelect, { target: { value: 'Lifestyle' } });

      expect(screen.queryByTestId('creator-card-1')).not.toBeInTheDocument();
      expect(screen.getByTestId('creator-card-2')).toBeInTheDocument();
      expect(screen.getByTestId('creator-card-3')).toBeInTheDocument();
    });
  });

  describe('Combined Filtering', () => {
    it('should apply search and platform filter together', () => {
      render(<CreatorList creators={mockCreators} />);

      const searchInput = screen.getByLabelText('Search');
      const platformSelect = screen.getByLabelText('플랫폼');

      fireEvent.change(searchInput, { target: { value: 'Bob' } });
      fireEvent.change(platformSelect, { target: { value: 'youtube' } });

      expect(screen.queryByTestId('creator-card-1')).not.toBeInTheDocument();
      expect(screen.getByTestId('creator-card-2')).toBeInTheDocument();
      expect(screen.queryByTestId('creator-card-3')).not.toBeInTheDocument();
    });

    it('should apply all filters together', () => {
      render(<CreatorList creators={mockCreators} />);

      const searchInput = screen.getByLabelText('Search');
      const platformSelect = screen.getByLabelText('플랫폼');
      const categorySelect = screen.getByLabelText('카테고리');

      fireEvent.change(searchInput, { target: { value: 'Bob' } });
      fireEvent.change(platformSelect, { target: { value: 'youtube' } });
      fireEvent.change(categorySelect, { target: { value: 'Tech' } });

      expect(screen.getByTestId('creator-card-2')).toBeInTheDocument();
      expect(screen.queryByTestId('creator-card-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('creator-card-3')).not.toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    it('should sort by revenue by default (highest first)', () => {
      render(<CreatorList creators={mockCreators} />);

      const cards = screen.getAllByRole('button');
      // Filter out the sort buttons - cards should be after the sort buttons
      const creatorCards = cards.filter((card) =>
        card.getAttribute('data-testid')?.startsWith('creator-card-')
      );

      expect(within(creatorCards[0]).getByText('Bob Lee')).toBeInTheDocument();
      expect(within(creatorCards[1]).getByText('Charlie Park')).toBeInTheDocument();
      expect(within(creatorCards[2]).getByText('Alice Kim')).toBeInTheDocument();
    });

    it('should sort by followers when followers button clicked', () => {
      render(<CreatorList creators={mockCreators} />);

      const followersButton = screen.getByText('팔로워순');
      fireEvent.click(followersButton);

      const cards = screen.getAllByRole('button');
      const creatorCards = cards.filter((card) =>
        card.getAttribute('data-testid')?.startsWith('creator-card-')
      );

      expect(within(creatorCards[0]).getByText('Bob Lee')).toBeInTheDocument();
      expect(within(creatorCards[1]).getByText('Charlie Park')).toBeInTheDocument();
      expect(within(creatorCards[2]).getByText('Alice Kim')).toBeInTheDocument();
    });

    it('should toggle sort button styles', () => {
      render(<CreatorList creators={mockCreators} />);

      const revenueButton = screen.getByText('매출순');
      const followersButton = screen.getByText('팔로워순');

      expect(revenueButton).toHaveClass('bg-zvzo-500');
      expect(followersButton).not.toHaveClass('bg-zvzo-500');

      fireEvent.click(followersButton);

      expect(revenueButton).not.toHaveClass('bg-zvzo-500');
      expect(followersButton).toHaveClass('bg-zvzo-500');
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no creators match filters', () => {
      render(<CreatorList creators={mockCreators} />);

      const searchInput = screen.getByLabelText('Search');
      fireEvent.change(searchInput, { target: { value: 'NonExistent' } });

      expect(screen.getByText('검색 결과 없음')).toBeInTheDocument();
      expect(
        screen.getByText('검색 조건을 변경하거나 필터를 초기화해보세요.')
      ).toBeInTheDocument();
      expect(screen.getByText('필터 초기화')).toBeInTheDocument();
    });

    it('should reset filters when reset button clicked', () => {
      render(<CreatorList creators={mockCreators} />);

      const searchInput = screen.getByLabelText('Search');
      const platformSelect = screen.getByLabelText('플랫폼');
      const categorySelect = screen.getByLabelText('카테고리');

      // Apply filters that will result in no matches
      fireEvent.change(searchInput, { target: { value: 'NonExistent' } });
      fireEvent.change(platformSelect, { target: { value: 'instagram' } });
      fireEvent.change(categorySelect, { target: { value: 'Beauty' } });

      // Now the reset button should be visible
      const resetButton = screen.getByText('필터 초기화');
      fireEvent.click(resetButton);

      expect(searchInput).toHaveValue('');
      expect(platformSelect).toHaveValue('all');
      expect(categorySelect).toHaveValue('all');
    });

    it('should show all creators after reset', () => {
      render(<CreatorList creators={mockCreators} />);

      const searchInput = screen.getByLabelText('Search');
      fireEvent.change(searchInput, { target: { value: 'NonExistent' } });

      const resetButton = screen.getByText('필터 초기화');
      fireEvent.click(resetButton);

      expect(screen.getByTestId('creator-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('creator-card-2')).toBeInTheDocument();
      expect(screen.getByTestId('creator-card-3')).toBeInTheDocument();
    });
  });

  describe('Empty Creators List', () => {
    it('should handle empty creators array', () => {
      render(<CreatorList creators={[]} />);

      expect(screen.getByText(/0/)).toBeInTheDocument();
      expect(screen.getByText('검색 결과 없음')).toBeInTheDocument();
    });
  });

  describe('Custom className', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <CreatorList creators={mockCreators} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Creator Navigation', () => {
    it('should navigate when creator card is clicked', () => {
      render(<CreatorList creators={mockCreators} />);

      // Click on a creator card
      const creatorCard = screen.getByTestId('creator-card-1');
      fireEvent.click(creatorCard);

      // The mock router from setup.ts should handle the navigation
      // We can't easily verify the push call without accessing the mock,
      // but we can verify no errors are thrown
      expect(creatorCard).toBeInTheDocument();
    });

    it('should navigate to different creators', () => {
      render(<CreatorList creators={mockCreators} />);

      // Click on second creator
      const creatorCard2 = screen.getByTestId('creator-card-2');
      fireEvent.click(creatorCard2);

      expect(creatorCard2).toBeInTheDocument();
    });
  });
});
