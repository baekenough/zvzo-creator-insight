import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ShoppingBag } from 'lucide-react';
import { StatCard } from '@/components/common/stat-card';
import { SearchBar } from '@/components/common/search-bar';
import { FilterDropdown } from '@/components/common/filter-dropdown';
import { PlatformBadge } from '@/components/common/platform-badge';
import { ConfidenceBadge } from '@/components/common/confidence-badge';
import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';
import { LoadingSpinner } from '@/components/common/loading-spinner';

describe('StatCard', () => {
  it('should render label and value', () => {
    render(<StatCard label="Total Sales" value="1,234" />);

    expect(screen.getByText('Total Sales')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
  });

  it('should render icon when provided', () => {
    const { container } = render(
      <StatCard label="Products" value="42" icon={ShoppingBag} />
    );

    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('should render positive trend', () => {
    render(
      <StatCard
        label="Revenue"
        value="$10,000"
        trend={{ value: 12.5, direction: 'up' }}
      />
    );

    expect(screen.getByText('12.5%')).toBeInTheDocument();
  });

  it('should render negative trend', () => {
    render(
      <StatCard
        label="Orders"
        value="50"
        trend={{ value: 5.2, direction: 'down' }}
      />
    );

    expect(screen.getByText('5.2%')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <StatCard label="Test" value="100" className="custom-class" />
    );

    const card = container.querySelector('.custom-class');
    expect(card).toBeInTheDocument();
  });
});

describe('SearchBar', () => {
  it('should render with placeholder', () => {
    const onChange = vi.fn();
    render(<SearchBar value="" onChange={onChange} placeholder="Search creators..." />);

    const input = screen.getByPlaceholderText('Search creators...');
    expect(input).toBeInTheDocument();
  });

  it('should call onChange when typing', () => {
    const onChange = vi.fn();
    render(<SearchBar value="" onChange={onChange} />);

    const input = screen.getByLabelText('Search');
    fireEvent.change(input, { target: { value: 'test query' } });

    expect(onChange).toHaveBeenCalledWith('test query');
  });

  it('should show clear button when value is present', () => {
    const onChange = vi.fn();
    render(<SearchBar value="test" onChange={onChange} />);

    const clearButton = screen.getByLabelText('Clear search');
    expect(clearButton).toBeInTheDocument();
  });

  it('should hide clear button when value is empty', () => {
    const onChange = vi.fn();
    render(<SearchBar value="" onChange={onChange} />);

    const clearButton = screen.queryByLabelText('Clear search');
    expect(clearButton).not.toBeInTheDocument();
  });

  it('should clear value when clear button is clicked', () => {
    const onChange = vi.fn();
    render(<SearchBar value="test" onChange={onChange} />);

    const clearButton = screen.getByLabelText('Clear search');
    fireEvent.click(clearButton);

    expect(onChange).toHaveBeenCalledWith('');
  });

  it('should render search icon', () => {
    const { container } = render(<SearchBar value="" onChange={vi.fn()} />);

    const searchIcon = container.querySelector('svg');
    expect(searchIcon).toBeInTheDocument();
  });
});

describe('FilterDropdown', () => {
  const options = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
  ];

  it('should render label', () => {
    render(
      <FilterDropdown
        label="Status"
        options={options}
        value="all"
        onChange={vi.fn()}
      />
    );

    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('should render all options', () => {
    render(
      <FilterDropdown
        label="Status"
        options={options}
        value="all"
        onChange={vi.fn()}
      />
    );

    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('should call onChange when value changes', () => {
    const onChange = vi.fn();
    render(
      <FilterDropdown
        label="Status"
        options={options}
        value="all"
        onChange={onChange}
      />
    );

    const select = screen.getByLabelText('Status');
    fireEvent.change(select, { target: { value: 'active' } });

    expect(onChange).toHaveBeenCalledWith('active');
  });

  it('should have correct selected value', () => {
    render(
      <FilterDropdown
        label="Status"
        options={options}
        value="active"
        onChange={vi.fn()}
      />
    );

    const select = screen.getByLabelText('Status') as HTMLSelectElement;
    expect(select.value).toBe('active');
  });
});

describe('PlatformBadge', () => {
  it('should render Instagram badge', () => {
    render(<PlatformBadge platform="instagram" />);
    expect(screen.getByText('Instagram')).toBeInTheDocument();
  });

  it('should render YouTube badge', () => {
    render(<PlatformBadge platform="youtube" />);
    expect(screen.getByText('YouTube')).toBeInTheDocument();
  });

  it('should render TikTok badge', () => {
    render(<PlatformBadge platform="tiktok" />);
    expect(screen.getByText('TikTok')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <PlatformBadge platform="instagram" className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});

describe('ConfidenceBadge', () => {
  it('should render high confidence badge', () => {
    render(<ConfidenceBadge confidence={85} />);
    expect(screen.getByText('High (85%)')).toBeInTheDocument();
  });

  it('should render medium confidence badge', () => {
    render(<ConfidenceBadge confidence={55} />);
    expect(screen.getByText('Medium (55%)')).toBeInTheDocument();
  });

  it('should render low confidence badge', () => {
    render(<ConfidenceBadge confidence={25} />);
    expect(screen.getByText('Low (25%)')).toBeInTheDocument();
  });

  it('should apply correct color classes for high confidence', () => {
    const { container } = render(<ConfidenceBadge confidence={90} />);
    expect(container.firstChild).toHaveClass('bg-green-100', 'text-green-800');
  });

  it('should apply correct color classes for medium confidence', () => {
    const { container } = render(<ConfidenceBadge confidence={60} />);
    expect(container.firstChild).toHaveClass('bg-yellow-100', 'text-yellow-800');
  });

  it('should apply correct color classes for low confidence', () => {
    const { container } = render(<ConfidenceBadge confidence={30} />);
    expect(container.firstChild).toHaveClass('bg-red-100', 'text-red-800');
  });
});

describe('EmptyState', () => {
  it('should render message', () => {
    render(<EmptyState message="No creators found" />);
    expect(screen.getByText('No creators found')).toBeInTheDocument();
  });

  it('should render default heading', () => {
    render(<EmptyState message="No data" />);
    expect(screen.getByText('No data found')).toBeInTheDocument();
  });

  it('should render action button when provided', () => {
    const onAction = vi.fn();
    render(
      <EmptyState
        message="No items"
        actionLabel="Add Item"
        onAction={onAction}
      />
    );

    const button = screen.getByText('Add Item');
    expect(button).toBeInTheDocument();
  });

  it('should call onAction when button is clicked', () => {
    const onAction = vi.fn();
    render(
      <EmptyState
        message="No items"
        actionLabel="Add Item"
        onAction={onAction}
      />
    );

    const button = screen.getByText('Add Item');
    fireEvent.click(button);

    expect(onAction).toHaveBeenCalled();
  });

  it('should not render button when action is not provided', () => {
    render(<EmptyState message="No data" />);

    const button = screen.queryByRole('button');
    expect(button).not.toBeInTheDocument();
  });

  it('should render icon', () => {
    const { container } = render(<EmptyState message="No data" />);

    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });
});

describe('ErrorState', () => {
  it('should render message', () => {
    render(<ErrorState message="Failed to load data" />);
    expect(screen.getByText('Failed to load data')).toBeInTheDocument();
  });

  it('should render default heading', () => {
    render(<ErrorState message="Error occurred" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should render retry button when onRetry is provided', () => {
    const onRetry = vi.fn();
    render(<ErrorState message="Error" onRetry={onRetry} />);

    const button = screen.getByText('Try Again');
    expect(button).toBeInTheDocument();
  });

  it('should call onRetry when button is clicked', () => {
    const onRetry = vi.fn();
    render(<ErrorState message="Error" onRetry={onRetry} />);

    const button = screen.getByText('Try Again');
    fireEvent.click(button);

    expect(onRetry).toHaveBeenCalled();
  });

  it('should not render button when onRetry is not provided', () => {
    render(<ErrorState message="Error" />);

    const button = screen.queryByText('Try Again');
    expect(button).not.toBeInTheDocument();
  });

  it('should render error icon', () => {
    const { container } = render(<ErrorState message="Error" />);

    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });
});

describe('LoadingSpinner', () => {
  it('should render loading spinner', () => {
    const { container } = render(<LoadingSpinner />);

    const spinner = container.querySelector('svg');
    expect(spinner).toBeInTheDocument();
  });

  it('should have animation class', () => {
    const { container } = render(<LoadingSpinner />);

    const spinner = container.querySelector('svg');
    expect(spinner).toHaveClass('animate-spin');
  });

  it('should apply default size', () => {
    const { container } = render(<LoadingSpinner />);

    const spinner = container.querySelector('svg');
    expect(spinner).toHaveClass('h-8', 'w-8');
  });

  it('should apply small size', () => {
    const { container } = render(<LoadingSpinner size="sm" />);

    const spinner = container.querySelector('svg');
    expect(spinner).toHaveClass('h-4', 'w-4');
  });

  it('should apply large size', () => {
    const { container } = render(<LoadingSpinner size="lg" />);

    const spinner = container.querySelector('svg');
    expect(spinner).toHaveClass('h-12', 'w-12');
  });

  it('should have aria-label', () => {
    const { container } = render(<LoadingSpinner />);

    const spinner = container.querySelector('[aria-label="Loading"]');
    expect(spinner).toBeInTheDocument();
  });
});
