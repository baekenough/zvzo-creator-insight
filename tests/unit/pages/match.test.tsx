import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import MatchPage from '@/app/creator/[id]/match/page';
import type { Creator } from '@/types';
import * as data from '@/data';

// Mock next/navigation
const mockNotFound = vi.fn();
vi.mock('next/navigation', () => ({
  notFound: () => mockNotFound(),
}));

// Mock data functions
vi.mock('@/data', () => ({
  getCreatorById: vi.fn(),
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

vi.mock('@/components/match/match-section', () => ({
  MatchSection: ({ creator }: { creator: Creator }) => (
    <div data-testid="mock-match-section">
      Match section for: {creator.name}
    </div>
  ),
}));

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

describe('MatchPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNotFound.mockImplementation(() => {
      throw new Error('Not Found');
    });
  });

  it('should render page layout components when creator exists', () => {
    vi.mocked(data.getCreatorById).mockReturnValue(mockCreator);

    render(<MatchPage params={{ id: 'creator-001' }} />);

    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
    expect(screen.getByTestId('mock-page-container')).toBeInTheDocument();
  });

  it('should call notFound when creator does not exist', () => {
    vi.mocked(data.getCreatorById).mockReturnValue(undefined);

    // Suppress console.error for this test since notFound throws
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<MatchPage params={{ id: 'non-existent' }} />);
    }).toThrow('Not Found');

    expect(mockNotFound).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('should render MatchSection component with creator', () => {
    vi.mocked(data.getCreatorById).mockReturnValue(mockCreator);

    render(<MatchPage params={{ id: 'creator-001' }} />);

    const matchSection = screen.getByTestId('mock-match-section');
    expect(matchSection).toBeInTheDocument();
    expect(matchSection).toHaveTextContent('Match section for: 김지은');
  });

  it('should fetch creator using params ID', () => {
    vi.mocked(data.getCreatorById).mockReturnValue(mockCreator);

    render(<MatchPage params={{ id: 'creator-123' }} />);

    expect(data.getCreatorById).toHaveBeenCalledWith('creator-123');
  });

  it('should have proper page structure with main element', () => {
    vi.mocked(data.getCreatorById).mockReturnValue(mockCreator);

    const { container } = render(<MatchPage params={{ id: 'creator-001' }} />);

    const mainElement = container.querySelector('main');
    expect(mainElement).toBeInTheDocument();
    expect(mainElement).toHaveClass('flex-1');
  });

  it('should pass correct creator data to MatchSection', () => {
    const customCreator: Creator = {
      ...mockCreator,
      id: 'creator-999',
      name: '테스트 크리에이터',
    };
    vi.mocked(data.getCreatorById).mockReturnValue(customCreator);

    render(<MatchPage params={{ id: 'creator-999' }} />);

    const matchSection = screen.getByTestId('mock-match-section');
    expect(matchSection).toHaveTextContent('Match section for: 테스트 크리에이터');
  });

  it('should not call notFound when creator exists', () => {
    vi.mocked(data.getCreatorById).mockReturnValue(mockCreator);

    render(<MatchPage params={{ id: 'creator-001' }} />);

    expect(mockNotFound).not.toHaveBeenCalled();
  });

  it('should handle different creator IDs correctly', () => {
    vi.mocked(data.getCreatorById).mockReturnValue(mockCreator);

    const { rerender } = render(<MatchPage params={{ id: 'creator-001' }} />);
    expect(data.getCreatorById).toHaveBeenCalledWith('creator-001');

    vi.mocked(data.getCreatorById).mockReturnValue({ ...mockCreator, id: 'creator-002' });
    rerender(<MatchPage params={{ id: 'creator-002' }} />);
    expect(data.getCreatorById).toHaveBeenCalledWith('creator-002');
  });

  it('should render minimal page structure without extra content', () => {
    vi.mocked(data.getCreatorById).mockReturnValue(mockCreator);

    const { container } = render(<MatchPage params={{ id: 'creator-001' }} />);

    // Should only have header, main with page container and match section, and footer
    expect(container.querySelector('div.flex.min-h-screen.flex-col')).toBeInTheDocument();
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-page-container')).toBeInTheDocument();
    expect(screen.getByTestId('mock-match-section')).toBeInTheDocument();
    expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
  });
});
