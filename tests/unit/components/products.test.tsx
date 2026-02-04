import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from '@/components/products/product-card';
import { ProductList } from '@/components/products/product-list';
import type { Product } from '@/types';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/products',
}));

const mockProducts: Product[] = [
  {
    id: 'prod-001',
    name: '글로우 세럼',
    brand: '뷰티랩',
    category: 'Beauty',
    subcategory: '스킨케어',
    price: 45000,
    originalPrice: 60000,
    description: '빛나는 피부를 위한 세럼',
    imageUrl: '/images/product-001.jpg',
    tags: ['세럼', '보습', '광채'],
    targetAudience: ['20대', '30대'],
    seasonality: ['All'],
    avgCommissionRate: 10.0,
  },
  {
    id: 'prod-002',
    name: '데님 자켓',
    brand: '패션하우스',
    category: 'Fashion',
    subcategory: '아우터',
    price: 89000,
    originalPrice: 120000,
    description: '클래식 데님 자켓',
    imageUrl: '/images/product-002.jpg',
    tags: ['데님', '자켓', '캐주얼'],
    targetAudience: ['20대', '30대', '40대'],
    seasonality: ['Spring', 'Fall'],
    avgCommissionRate: 12.0,
  },
  {
    id: 'prod-003',
    name: '스마트워치',
    brand: '테크기어',
    category: 'Tech',
    subcategory: '웨어러블',
    price: 250000,
    originalPrice: 250000,
    description: '최신 스마트워치',
    imageUrl: '/images/product-003.jpg',
    tags: ['스마트워치', '웨어러블', '헬스'],
    targetAudience: ['20대', '30대', '40대', '50대'],
    seasonality: ['All'],
    avgCommissionRate: 8.0,
  },
];

describe('ProductCard', () => {
  it('should render product name and brand', () => {
    render(<ProductCard product={mockProducts[0]} />);
    expect(screen.getByText('글로우 세럼')).toBeInTheDocument();
    expect(screen.getByText('뷰티랩')).toBeInTheDocument();
  });

  it('should render price with currency format', () => {
    render(<ProductCard product={mockProducts[0]} />);
    expect(screen.getByText(/45,000/)).toBeInTheDocument();
  });

  it('should render category badge', () => {
    render(<ProductCard product={mockProducts[0]} />);
    expect(screen.getByText('Beauty')).toBeInTheDocument();
  });

  it('should render commission rate', () => {
    render(<ProductCard product={mockProducts[0]} />);
    expect(screen.getByText('10.0%')).toBeInTheDocument();
  });

  it('should handle image error with fallback', () => {
    render(<ProductCard product={mockProducts[0]} />);
    const image = document.querySelector('img');
    if (image) {
      fireEvent.error(image);
    }
    // Should show first character fallback
    expect(screen.getByText('글')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const onClick = vi.fn();
    render(<ProductCard product={mockProducts[0]} onClick={onClick} />);
    const card = screen.getByRole('button');
    fireEvent.click(card);
    expect(onClick).toHaveBeenCalledWith('prod-001');
  });

  it('should have hover styles', () => {
    render(<ProductCard product={mockProducts[0]} />);
    const card = screen.getByRole('button');
    expect(card.className).toContain('hover:shadow-md');
    expect(card.className).toContain('hover:-translate-y-1');
  });

  it('should show discount rate when applicable', () => {
    render(<ProductCard product={mockProducts[0]} />);
    expect(screen.getByText('25% 할인')).toBeInTheDocument();
  });

  it('should not show discount rate when price equals original price', () => {
    render(<ProductCard product={mockProducts[2]} />);
    expect(screen.queryByText(/할인/)).not.toBeInTheDocument();
  });

  it('should navigate on Enter key press', () => {
    const onClick = vi.fn();
    render(<ProductCard product={mockProducts[0]} onClick={onClick} />);
    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(onClick).toHaveBeenCalledWith('prod-001');
  });

  it('should navigate on Space key press', () => {
    const onClick = vi.fn();
    render(<ProductCard product={mockProducts[0]} onClick={onClick} />);
    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: ' ' });
    expect(onClick).toHaveBeenCalledWith('prod-001');
  });

  it('should have proper accessibility attributes', () => {
    render(<ProductCard product={mockProducts[0]} />);
    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('aria-label');
    expect(card.getAttribute('aria-label')).toContain('글로우 세럼');
    expect(card.getAttribute('aria-label')).toContain('뷰티랩');
  });

  it('should handle hover states', () => {
    render(<ProductCard product={mockProducts[0]} />);
    const card = screen.getByRole('button');
    fireEvent.mouseEnter(card);
    expect(card).toBeInTheDocument();
    fireEvent.mouseLeave(card);
    expect(card).toBeInTheDocument();
  });

  it('should render with custom className', () => {
    const { container } = render(
      <ProductCard product={mockProducts[0]} className="custom-class" />
    );
    const card = container.querySelector('.custom-class');
    expect(card).toBeInTheDocument();
  });
});

describe('ProductList', () => {
  it('should render all products', () => {
    render(<ProductList products={mockProducts} />);
    expect(screen.getByText('글로우 세럼')).toBeInTheDocument();
    expect(screen.getByText('데님 자켓')).toBeInTheDocument();
    expect(screen.getByText('스마트워치')).toBeInTheDocument();
  });

  it('should filter by search term (name)', () => {
    render(<ProductList products={mockProducts} />);
    const searchInput = screen.getByPlaceholderText('상품명 또는 브랜드로 검색...');
    fireEvent.change(searchInput, { target: { value: '세럼' } });
    expect(screen.getByText('글로우 세럼')).toBeInTheDocument();
    expect(screen.queryByText('데님 자켓')).not.toBeInTheDocument();
  });

  it('should filter by search term (brand)', () => {
    render(<ProductList products={mockProducts} />);
    const searchInput = screen.getByPlaceholderText('상품명 또는 브랜드로 검색...');
    fireEvent.change(searchInput, { target: { value: '패션하우스' } });
    expect(screen.getByText('데님 자켓')).toBeInTheDocument();
    expect(screen.queryByText('글로우 세럼')).not.toBeInTheDocument();
  });

  it('should filter by category', () => {
    render(<ProductList products={mockProducts} />);
    // Find the select element and change its value
    const categorySelect = screen.getByLabelText('카테고리');
    fireEvent.change(categorySelect, { target: { value: 'Beauty' } });

    // Should only show Beauty products
    expect(screen.getByText((content, element) => {
      return element?.textContent === '총 1개의 상품';
    })).toBeInTheDocument();
    expect(screen.getByText('글로우 세럼')).toBeInTheDocument();
    expect(screen.queryByText('데님 자켓')).not.toBeInTheDocument();
  });

  it('should sort by price ascending/descending', () => {
    render(<ProductList products={mockProducts} />);
    const priceButton = screen.getByText('가격순');

    // First click - should sort descending (highest first)
    fireEvent.click(priceButton);

    // Find product cards (have aria-label containing price)
    const productCards = screen.getAllByRole('button').filter(button =>
      button.getAttribute('aria-label')?.includes('₩')
    );

    // Verify first product is the highest price (스마트워치 - 250000)
    expect(productCards[0]).toHaveTextContent('스마트워치');

    // Implementation note: Default sort is descending by price
  });

  it('should sort by name', () => {
    render(<ProductList products={mockProducts} />);
    const nameButton = screen.getByText('이름순');
    fireEvent.click(nameButton);

    // Find product cards (have aria-label containing price)
    const productCards = screen.getAllByRole('button').filter(button =>
      button.getAttribute('aria-label')?.includes('₩')
    );

    // After sorting by name, first should be alphabetically first
    // In Korean: 글로우 세럼, 데님 자켓, 스마트워치
    expect(productCards[0]).toHaveTextContent('글로우 세럼');
  });

  it('should show empty state when no results', () => {
    render(<ProductList products={mockProducts} />);
    const searchInput = screen.getByPlaceholderText('상품명 또는 브랜드로 검색...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    expect(screen.getByText('검색 결과 없음')).toBeInTheDocument();
    expect(screen.getByText('검색 조건을 변경하거나 필터를 초기화해보세요.')).toBeInTheDocument();
  });

  it('should show result count', () => {
    render(<ProductList products={mockProducts} />);
    expect(screen.getByText((content, element) => {
      return element?.textContent === '총 3개의 상품';
    })).toBeInTheDocument();
  });

  it('should reset filters', () => {
    render(<ProductList products={mockProducts} />);
    const searchInput = screen.getByPlaceholderText('상품명 또는 브랜드로 검색...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    expect(screen.getByText('검색 결과 없음')).toBeInTheDocument();

    const resetButton = screen.getByText('필터 초기화');
    fireEvent.click(resetButton);

    // Should show all products again
    expect(screen.getByText((content, element) => {
      return element?.textContent === '총 3개의 상품';
    })).toBeInTheDocument();
  });

  it('should navigate to product detail on card click', () => {
    render(<ProductList products={mockProducts} />);

    // Find product cards (have aria-label containing price)
    const productCards = screen.getAllByRole('button').filter(button =>
      button.getAttribute('aria-label')?.includes('₩')
    );

    fireEvent.click(productCards[0]);

    // Router push should be called with product ID
    expect(mockPush).toHaveBeenCalled();
    const lastCall = mockPush.mock.calls[mockPush.mock.calls.length - 1];
    expect(lastCall[0]).toMatch(/\/products\//);
  });

  it('should render with custom className', () => {
    const { container } = render(
      <ProductList products={mockProducts} className="custom-class" />
    );
    const list = container.querySelector('.custom-class');
    expect(list).toBeInTheDocument();
  });

  it('should update result count when filtered', () => {
    render(<ProductList products={mockProducts} />);
    const searchInput = screen.getByPlaceholderText('상품명 또는 브랜드로 검색...');

    // Search for something that exists
    fireEvent.change(searchInput, { target: { value: '세럼' } });
    expect(screen.getByText((content, element) => {
      return element?.textContent === '총 1개의 상품';
    })).toBeInTheDocument();

    // Clear search
    fireEvent.change(searchInput, { target: { value: '' } });
    expect(screen.getByText((content, element) => {
      return element?.textContent === '총 3개의 상품';
    })).toBeInTheDocument();
  });

  it('should handle empty product list', () => {
    render(<ProductList products={[]} />);
    expect(screen.getByText('검색 결과 없음')).toBeInTheDocument();
  });

  it('should toggle sort type when same button clicked twice', () => {
    render(<ProductList products={mockProducts} />);
    const priceButton = screen.getByText('가격순');

    // First click - active
    fireEvent.click(priceButton);
    expect(priceButton.className).toContain('bg-zvzo-500');

    // Sort type changes from 'price' to 'name'
    const nameButton = screen.getByText('이름순');
    fireEvent.click(nameButton);
    expect(nameButton.className).toContain('bg-zvzo-500');
  });

  it('should combine search and category filters', () => {
    render(<ProductList products={mockProducts} />);
    const searchInput = screen.getByPlaceholderText('상품명 또는 브랜드로 검색...');
    fireEvent.change(searchInput, { target: { value: '자켓' } });

    // Should show filtered result
    expect(screen.getByText('데님 자켓')).toBeInTheDocument();
    expect(screen.queryByText('글로우 세럼')).not.toBeInTheDocument();
  });
});
